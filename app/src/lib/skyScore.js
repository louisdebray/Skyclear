/**
 * Sky quality score (0-100) for astrophotography, from weather + moon + light pollution.
 * Cloud cover still dominates (it's the hard blocker), but light pollution is weighted
 * heavily and non-linearly: Bortle 7-9 (city cores) crushes deep-sky visibility even under
 * a perfectly clear, moonless sky, so it shouldn't score as "excellent" just because it's clear.
 */
export function computeSkyScore({ cloudCoverPercent, moonIlluminationPercent, humidityPercent, windSpeedKmh, bortle }) {
  let score = 100
  const breakdown = {}

  breakdown.cloud = -clamp(cloudCoverPercent ?? 0, 0, 100) * 0.6
  breakdown.moon = -clamp(moonIlluminationPercent ?? 0, 0, 100) * 0.15

  const humidityOver = Math.max(0, (humidityPercent ?? 0) - 80)
  breakdown.humidity = -clamp(humidityOver * 0.4, 0, 8)

  const windOver = Math.max(0, (windSpeedKmh ?? 0) - 20)
  breakdown.wind = -clamp(windOver * 0.25, 0, 7)

  // Non-linear: going from Bortle 1 to 4 barely matters, 7 to 9 (city cores) is brutal.
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
export function describeConditions({ cloudCoverPercent, moonIlluminationPercent, bortle, rating }) {
  const cloudLabel =
    cloudCoverPercent <= 15 ? 'Ciel dégagé' : cloudCoverPercent <= 50 ? 'Ciel partiellement nuageux' : 'Ciel très nuageux'
  const moonLabel = `lune à ${Math.round(moonIlluminationPercent)}%`
  const bortleLabel = bortle ? `Bortle ${bortle}` : null
  const parts = [cloudLabel, moonLabel, bortleLabel].filter(Boolean)
  return `${parts.join(', ')} → conditions ${rating.label.toLowerCase()}`
}
