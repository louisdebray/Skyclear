import { getSunInfo } from './moon'

/**
 * The observable night window for a given date: astronomical dusk to the following astronomical dawn.
 * Falls back to sunset/sunrise when true astronomical night doesn't occur (e.g. high latitude summer).
 */
export function getNightWindow(date, latitude, longitude) {
  const today = getSunInfo(date, latitude, longitude)
  const tomorrow = getSunInfo(new Date(date.getTime() + 24 * 60 * 60 * 1000), latitude, longitude)

  const start = today.astronomicalDusk ?? today.sunset
  const end = tomorrow.astronomicalDawn ?? tomorrow.sunrise

  return { start, end }
}

/** Average cloud cover of a set of hourly readings that fall within [start, end). */
export function averageCloudCover(hourly, start, end) {
  const inWindow = hourly.filter((h) => h.time >= start && h.time < end)
  if (!inWindow.length) return null
  return inWindow.reduce((sum, h) => sum + h.cloudCover, 0) / inWindow.length
}

/** Finds the longest contiguous run of hours below a cloud-cover threshold inside the night window. */
export function bestClearWindow(hourly, start, end, cloudThreshold = 30) {
  const inWindow = hourly.filter((h) => h.time >= start && h.time < end).sort((a, b) => a.time - b.time)

  let bestRun = null
  let currentRun = []

  for (const hour of inWindow) {
    if (hour.cloudCover <= cloudThreshold) {
      currentRun.push(hour)
    } else {
      if (!bestRun || currentRun.length > bestRun.length) bestRun = currentRun
      currentRun = []
    }
  }
  if (!bestRun || currentRun.length > bestRun.length) bestRun = currentRun

  if (!bestRun || bestRun.length === 0) return null
  return { start: bestRun[0].time, end: new Date(bestRun[bestRun.length - 1].time.getTime() + 60 * 60 * 1000) }
}
