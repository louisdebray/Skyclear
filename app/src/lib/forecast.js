import { getMoonInfo, moonVisibleFraction } from './moon'
import { computeSkyScore } from './skyScore'
import { estimateBortle } from './bortle'
import { averageCloudCover, bestClearWindow, getNightWindow } from './nightWindow'

/**
 * Builds a per-night forecast (score, best clear window, moon) for each of the next `daysCount` nights,
 * using the hourly cloud-cover/humidity/wind data already fetched from Open-Meteo.
 */
export function computeForecast(weather, latitude, longitude, daysCount = 15, population = 0) {
  const nights = []
  const { bortle } = estimateBortle(latitude, longitude, population)

  for (let i = 0; i < daysCount; i++) {
    const date = new Date(weather.daily[0].date.getTime() + i * 24 * 60 * 60 * 1000)
    const { start, end } = getNightWindow(date, latitude, longitude)
    if (!start || !end) continue

    const avgCloud = averageCloudCover(weather.hourly, start, end)
    if (avgCloud == null) continue

    const nightHours = weather.hourly.filter((h) => h.time >= start && h.time < end)
    const avgHumidity = average(nightHours.map((h) => h.humidity))
    const avgWind = average(nightHours.map((h) => h.windSpeed))
    const moon = getMoonInfo(date, latitude, longitude)
    const clearWindow = bestClearWindow(weather.hourly, start, end)

    // A bright moon that's below the horizon all night shouldn't count against the score.
    const moonVisibleFrac = moonVisibleFraction(start, end, latitude, longitude)
    const effectiveMoonIllumination = moon.illuminationPercent * moonVisibleFrac

    const scoreResult = computeSkyScore({
      cloudCoverPercent: avgCloud,
      moonIlluminationPercent: effectiveMoonIllumination,
      humidityPercent: avgHumidity,
      windSpeedKmh: avgWind,
      bortle,
    })

    nights.push({
      date,
      nightStart: start,
      nightEnd: end,
      avgCloudCover: avgCloud,
      avgHumidity,
      avgWind,
      bortle,
      moon,
      clearWindow,
      ...scoreResult,
    })
  }

  return nights
}

function average(values) {
  if (!values.length) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
}
