/**
 * Sky quality score (0-100), from weather + moon + light pollution — but "good conditions"
 * means something different depending on what's being photographed, so every target gets its
 * own weight profile instead of one generic formula:
 *
 * - stars (deep-sky/Milky Way): cloud (60) and rain dominate as hard blockers; light pollution
 *   (40, non-linear) is the second-biggest factor — Bortle 7-9 crushes faint targets even under
 *   a clear sky; the moon (25) only counts while actually above the horizon, since a bright
 *   moon that's set can't wash out anything. Needs real darkness — daytime caps the score hard,
 *   there is nothing to see.
 * - moon: the moon is the light source, so illumination isn't a flat penalty — but a very thin
 *   crescent (near new moon) is genuinely harder to locate, low-contrast, and less rewarding to
 *   shoot, so low illumination gets its own penalty. Light pollution's weight scales *inversely*
 *   with illumination: a bright moon drowns out any city glow (barely matters), but a dim
 *   crescent has much less margin over a light-polluted sky (matters closer to normal). Still
 *   needs the moon above the horizon — score bottoms out if not. Works day or night otherwise.
 * - planets: bright enough to punch through moderate light pollution (half weight vs. deep-sky),
 *   largely unaffected by moon phase, but still needs a dark-ish sky and gets blocked the same
 *   way by cloud/rain.
 */
export function computeSkyScore({
  cloudCoverPercent,
  moonIlluminationPercent,
  humidityPercent,
  windSpeedKmh,
  precipitationProbabilityPercent,
  bortle,
  target = 'stars',
  isDaytime = false,
  moonAboveHorizon = true,
}) {
  const profile = PROFILES[target] ?? PROFILES.stars
  let score = 100
  const breakdown = {}

  breakdown.cloud = -clamp(cloudCoverPercent ?? 0, 0, 100) * profile.cloudWeight

  const humidityOver = Math.max(0, (humidityPercent ?? 0) - 80)
  breakdown.humidity = -clamp(humidityOver * 0.4, 0, 8)

  const windOver = Math.max(0, (windSpeedKmh ?? 0) - 20)
  breakdown.wind = -clamp(windOver * 0.25, 0, 7)

  breakdown.rain = -clamp(precipitationProbabilityPercent ?? 0, 0, 100) * 0.5

  if (target === 'moon') {
    const illum = clamp(moonIlluminationPercent ?? 0, 0, 100)
    // A thin crescent is harder to locate and lower-contrast — penalize below ~30% illumination.
    breakdown.moon = -clamp((30 - illum) * 0.6, 0, 18)
    // The dimmer the moon, the less it can drown out light pollution on its own.
    const lightPollutionScale = 1 - illum / 100
    breakdown.lightPollution = bortle
      ? -clamp(((bortle - 1) / 8) ** 1.5 * profile.lightPollutionMax * lightPollutionScale, 0, profile.lightPollutionMax)
      : 0
  } else {
    breakdown.moon = -clamp(moonIlluminationPercent ?? 0, 0, 100) * profile.moonWeight
    breakdown.lightPollution = bortle
      ? -clamp(((bortle - 1) / 8) ** 1.5 * profile.lightPollutionMax, 0, profile.lightPollutionMax)
      : 0
  }

  score += breakdown.cloud + breakdown.moon + breakdown.humidity + breakdown.wind + breakdown.lightPollution + breakdown.rain

  // Rain isn't a "minus a few points" factor once it's likely — cap the score outright.
  if ((precipitationProbabilityPercent ?? 0) >= 50) score = Math.min(score, 15)

  // Target-specific hard gates: no amount of clear sky helps if there's nothing to see.
  if (profile.requiresDark && isDaytime) score = Math.min(score, 5)
  if (profile.requiresMoonUp && !moonAboveHorizon) score = Math.min(score, 3)

  score = clamp(Math.round(score), 0, 100)

  return { score, breakdown, rating: ratingFor(score) }
}

const PROFILES = {
  stars: { cloudWeight: 0.6, moonWeight: 0.25, lightPollutionMax: 40, requiresDark: true, requiresMoonUp: false },
  moon: { cloudWeight: 0.6, moonWeight: 0, lightPollutionMax: 25, requiresDark: false, requiresMoonUp: true },
  planets: { cloudWeight: 0.6, moonWeight: 0.05, lightPollutionMax: 20, requiresDark: true, requiresMoonUp: false },
}

function ratingFor(score) {
  if (score >= 70) return { level: 'good', label: 'Excellentes', color: 'sky-good' }
  if (score >= 40) return { level: 'okay', label: 'Correctes', color: 'sky-okay' }
  return { level: 'bad', label: 'Défavorables', color: 'sky-bad' }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/** Short human-readable summary, e.g. "Ciel dégagé, lune à 12%, Bortle 4 → conditions excellentes". */
export function describeConditions({
  cloudCoverPercent,
  moonIlluminationPercent,
  moonVisible,
  bortle,
  isRaining,
  isDaytime,
  target = 'stars',
  rating,
}) {
  if (target === 'stars' && isDaytime) {
    return "Plein jour → le ciel profond n'est pas visible avant la nuit"
  }
  if (target === 'planets' && isDaytime) {
    return 'Plein jour → les planètes ne seront visibles qu\'à la nuit tombée'
  }
  if (target === 'moon' && moonVisible === false) {
    return 'Lune sous l\'horizon → rien à photographier pour le moment'
  }

  const cloudLabel = isRaining
    ? 'Pluie'
    : cloudCoverPercent <= 15
      ? 'Ciel dégagé'
      : cloudCoverPercent <= 50
        ? 'Ciel partiellement nuageux'
        : 'Ciel très nuageux'
  const moonLabel =
    target === 'moon'
      ? `lune à ${Math.round(moonIlluminationPercent)}% d'illumination`
      : moonVisible === false
        ? 'lune sous l\'horizon'
        : `lune à ${Math.round(moonIlluminationPercent)}%`
  const bortleLabel = target !== 'moon' && bortle ? `Bortle ${bortle}` : null
  const parts = [cloudLabel, moonLabel, bortleLabel].filter(Boolean)
  return `${parts.join(', ')} → conditions ${rating.label.toLowerCase()}`
}
