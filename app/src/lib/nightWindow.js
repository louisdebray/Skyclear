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

/**
 * The evening/night span for a date: sunset to the following sunrise. Used for the moon target
 * instead of `getNightWindow`'s astronomical dusk/dawn — moon photography doesn't need true
 * darkness, but "tonight" still has to mean the evening/night, not the whole calendar day
 * (otherwise a moon that's only up during the afternoon would wrongly count toward "tonight").
 */
export function getEveningWindow(date, latitude, longitude) {
  const today = getSunInfo(date, latitude, longitude)
  const tomorrow = getSunInfo(new Date(date.getTime() + 24 * 60 * 60 * 1000), latitude, longitude)

  return { start: today.sunset, end: tomorrow.sunrise }
}

/** Average cloud cover of a set of hourly readings that fall within [start, end). */
export function averageCloudCover(hourly, start, end) {
  const inWindow = hourly.filter((h) => h.time >= start && h.time < end)
  if (!inWindow.length) return null
  return inWindow.reduce((sum, h) => sum + h.cloudCover, 0) / inWindow.length
}

/**
 * Finds the longest contiguous run of hours below a cloud-cover/rain threshold inside [start, end).
 * `extraFilter`, when given, excludes hours outright (e.g. "the moon must be above the horizon") —
 * the run also breaks across any time gap this creates, so filtered-out hours can't be silently
 * bridged over as if they were clear.
 */
export function bestClearWindow(hourly, start, end, cloudThreshold = 30, rainThreshold = 40, extraFilter = null) {
  const inWindow = hourly
    .filter((h) => h.time >= start && h.time < end && (!extraFilter || extraFilter(h)))
    .sort((a, b) => a.time - b.time)

  let bestRun = null
  let currentRun = []
  let prevTime = null
  const ONE_HOUR_MS = 60 * 60 * 1000

  for (const hour of inWindow) {
    const contiguous = prevTime == null || hour.time - prevTime <= ONE_HOUR_MS + 60_000
    const isClear = hour.cloudCover <= cloudThreshold && (hour.precipitationProbability ?? 0) <= rainThreshold

    if (contiguous && isClear) {
      currentRun.push(hour)
    } else {
      if (!bestRun || currentRun.length > bestRun.length) bestRun = currentRun
      currentRun = isClear ? [hour] : []
    }
    prevTime = hour.time
  }
  if (!bestRun || currentRun.length > bestRun.length) bestRun = currentRun

  if (!bestRun || bestRun.length === 0) return null
  return { start: bestRun[0].time, end: new Date(bestRun[bestRun.length - 1].time.getTime() + ONE_HOUR_MS) }
}
