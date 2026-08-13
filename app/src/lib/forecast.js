import { getMoonInfo, moonVisibleFraction, getMoonAltitudeDeg } from './moon'
import { computeSkyScore } from './skyScore'
import { estimateBortle } from './bortle'
import { averageCloudCover, bestClearWindow, getNightWindow, getEveningWindow } from './nightWindow'
import { getPlanetsVisibleDuring } from './planets'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

/**
 * Builds a per-night forecast (score, best window, moon) for each of the next `daysCount` nights,
 * using the hourly cloud-cover/humidity/wind/precipitation data already fetched from Open-Meteo.
 *
 * The relevant time window depends on the target, but every target still means "tonight" as one
 * specific evening/night — never the whole calendar day, or a moon that's only up in the afternoon
 * would wrongly score well for "tonight". Stars/planets need real darkness (astronomical night);
 * the moon target uses the wider sunset→sunrise span (no need for full darkness) and additionally
 * gates every hour on the moon actually being above the horizon then — if it's not up at all during
 * that evening/night, the score for that night bottoms out, regardless of when it was up otherwise.
 */
export function computeForecast(weather, latitude, longitude, daysCount = 15, population = 0, target = 'stars') {
  const nights = []
  const { bortle } = estimateBortle(latitude, longitude, population)

  for (let i = 0; i < daysCount; i++) {
    const date = new Date(weather.daily[0].date.getTime() + i * ONE_DAY_MS)
    const { start: nightStart, end: nightEnd } = getNightWindow(date, latitude, longitude)
    if (!nightStart || !nightEnd) continue

    const moon = getMoonInfo(date, latitude, longitude)
    const isMoonTarget = target === 'moon'

    const { start: eveningStart, end: eveningEnd } = isMoonTarget
      ? getEveningWindow(date, latitude, longitude)
      : { start: null, end: null }

    const windowStart = isMoonTarget ? eveningStart : nightStart
    const windowEnd = isMoonTarget ? eveningEnd : nightEnd
    const moonGate = isMoonTarget ? (h) => getMoonAltitudeDeg(h.time, latitude, longitude) > 0 : null

    const relevantHours = weather.hourly.filter(
      (h) => h.time >= windowStart && h.time < windowEnd && (!moonGate || moonGate(h))
    )

    // Moon target and the moon isn't up at all during this evening/night: nothing to shoot tonight.
    if (isMoonTarget && relevantHours.length === 0) {
      nights.push({
        date,
        nightStart: windowStart,
        nightEnd: windowEnd,
        avgCloudCover: null,
        avgHumidity: null,
        avgWind: null,
        maxRainProbability: 0,
        bortle,
        moon,
        clearWindow: null,
        ...computeSkyScore({ target, moonAboveHorizon: false, bortle }),
      })
      continue
    }

    const avgCloud = isMoonTarget ? average(relevantHours.map((h) => h.cloudCover)) : averageCloudCover(weather.hourly, nightStart, nightEnd)
    if (avgCloud == null) continue

    const avgHumidity = average(relevantHours.map((h) => h.humidity))
    const avgWind = average(relevantHours.map((h) => h.windSpeed))
    const maxRainProbability = Math.max(0, ...relevantHours.map((h) => h.precipitationProbability ?? 0))
    const clearWindow = bestClearWindow(weather.hourly, windowStart, windowEnd, 30, 40, moonGate)

    // A bright moon that's below the horizon all night shouldn't count against non-moon scores.
    const moonVisibleFrac = moonVisibleFraction(nightStart, nightEnd, latitude, longitude)
    const effectiveMoonIllumination = moon.illuminationPercent * moonVisibleFrac

    const scoreResult = computeSkyScore({
      cloudCoverPercent: avgCloud,
      moonIlluminationPercent: isMoonTarget ? moon.illuminationPercent : effectiveMoonIllumination,
      humidityPercent: avgHumidity,
      windSpeedKmh: avgWind,
      precipitationProbabilityPercent: maxRainProbability,
      bortle,
      target,
      isDaytime: false,
      moonAboveHorizon: isMoonTarget ? true : moonVisibleFrac > 0.05,
    })

    const visiblePlanets = target === 'planets' ? getPlanetsVisibleDuring(nightStart, nightEnd, latitude, longitude) : null

    nights.push({
      date,
      nightStart: isMoonTarget ? windowStart : nightStart,
      nightEnd: isMoonTarget ? windowEnd : nightEnd,
      avgCloudCover: avgCloud,
      avgHumidity,
      avgWind,
      maxRainProbability,
      bortle,
      moon,
      clearWindow,
      visiblePlanets,
      ...scoreResult,
    })
  }

  return nights
}

function average(values) {
  const finite = values.filter((v) => v != null)
  if (!finite.length) return null
  return finite.reduce((sum, v) => sum + v, 0) / finite.length
}
