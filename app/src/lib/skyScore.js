/**
 * Sky quality score (0-100) for astrophotography, from weather + moon + light pollution.
 * Cloud cover dominates (it's the hard blocker); moon illumination is the second biggest
 * factor for deep-sky work; humidity/wind/light pollution are secondary penalties.
 */
export function computeSkyScore({ cloudCoverPercent, moonIlluminationPercent, humidityPercent, windSpeedKmh, bortle }) {
  let score = 100
  const breakdown = {}

  breakdown.cloud = -clamp(cloudCoverPercent ?? 0, 0, 100) * 0.7
  breakdown.moon = -clamp(moonIlluminationPercent ?? 0, 0, 100) * 0.2

  const humidityOver = Math.max(0, (humidityPercent ?? 0) - 80)
  breakdown.humidity = -clamp(humidityOver * 0.5, 0, 10)

  const windOver = Math.max(0, (windSpeedKmh ?? 0) - 20)
  breakdown.wind = -clamp(windOver * 0.3, 0, 10)

  breakdown.lightPollution = bortle ? -clamp((bortle - 1) * 2, 0, 16) : 0

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
export function describeConditions({ cloudCoverPercent, moonIlluminationPercent, bortle, rating }) {
  const cloudLabel =
    cloudCoverPercent <= 15 ? 'Ciel dégagé' : cloudCoverPercent <= 50 ? 'Ciel partiellement nuageux' : 'Ciel très nuageux'
  const moonLabel = `lune à ${Math.round(moonIlluminationPercent)}%`
  const bortleLabel = bortle ? `Bortle ${bortle}` : null
  const parts = [cloudLabel, moonLabel, bortleLabel].filter(Boolean)
  return `${parts.join(', ')} → conditions ${rating.label.toLowerCase()}`
}
