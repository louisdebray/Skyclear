/**
 * Sky quality score (0-100) for astrophotography, from weather + moon + light pollution.
 *
 * Weights (max points deducted), reasoned from what actually blocks a shoot:
 * - Cloud cover (60): the hard blocker — no gaps, no photons, regardless of anything else.
 * - Light pollution (40, non-linear): dominant for deep-sky. Bortle 1→4 barely matters,
 *   7→9 (city cores) crushes faint targets even under a perfectly clear sky.
 * - Moon (25): only counts if the moon is actually above the horizon during the session —
 *   `moonIlluminationPercent` here is expected to already be scaled by moon visibility
 *   (0 when it's below the horizon), otherwise a bright moon that's set gets blamed for
 *   nothing. A moon that's up AND full is genuinely comparable to a couple of Bortle classes
 *   of added sky glow for broadband deep-sky targets.
 * - Humidity (8) / wind (7): logistics, not sky visibility — dew/fogging risk and mount
 *   stability — real but secondary, and only kick in past a threshold.
 */
export function computeSkyScore({ cloudCoverPercent, moonIlluminationPercent, humidityPercent, windSpeedKmh, bortle }) {
  let score = 100
  const breakdown = {}

  breakdown.cloud = -clamp(cloudCoverPercent ?? 0, 0, 100) * 0.6
  breakdown.moon = -clamp(moonIlluminationPercent ?? 0, 0, 100) * 0.25

  const humidityOver = Math.max(0, (humidityPercent ?? 0) - 80)
  breakdown.humidity = -clamp(humidityOver * 0.4, 0, 8)

  const windOver = Math.max(0, (windSpeedKmh ?? 0) - 20)
  breakdown.wind = -clamp(windOver * 0.25, 0, 7)

  breakdown.lightPollution = bortle ? -clamp(((bortle - 1) / 8) ** 1.5 * 40, 0, 40) : 0

  score += breakdown.cloud + breakdown.moon + breakdown.humidity + breakdown.wind + breakdown.lightPollution
  score = clamp(Math.round(score), 0, 100)

  return { score, breakdown, rating: ratingFor(score) }
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
export function describeConditions({ cloudCoverPercent, moonIlluminationPercent, moonVisible, bortle, rating }) {
  const cloudLabel =
    cloudCoverPercent <= 15 ? 'Ciel dégagé' : cloudCoverPercent <= 50 ? 'Ciel partiellement nuageux' : 'Ciel très nuageux'
  const moonLabel = moonVisible === false ? 'lune sous l\'horizon' : `lune à ${Math.round(moonIlluminationPercent)}%`
  const bortleLabel = bortle ? `Bortle ${bortle}` : null
  const parts = [cloudLabel, moonLabel, bortleLabel].filter(Boolean)
  return `${parts.join(', ')} → conditions ${rating.label.toLowerCase()}`
}
