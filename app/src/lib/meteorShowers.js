import showers from '../data/meteorShowers.json'

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Upcoming meteor shower peaks within the next `daysAhead` days, sorted by proximity. */
export function getUpcomingMeteorShowers(fromDate, daysAhead = 60) {
  const results = []

  for (const shower of showers) {
    for (const year of [fromDate.getFullYear(), fromDate.getFullYear() + 1]) {
      const peakDate = new Date(year, shower.peakMonth - 1, shower.peakDay)
      const daysUntilPeak = Math.round((peakDate - fromDate) / MS_PER_DAY)
      if (daysUntilPeak >= -1 && daysUntilPeak <= daysAhead) {
        results.push({ ...shower, peakDate, daysUntilPeak })
      }
    }
  }

  return results.sort((a, b) => a.daysUntilPeak - b.daysUntilPeak)
}

/** Whether `date` falls within a shower's active window (handles windows that cross the new year). */
export function isShowerActive(shower, date) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const value = month * 100 + day
  const from = shower.activeFromDay[0] * 100 + shower.activeFromDay[1]
  const to = shower.activeToDay[0] * 100 + shower.activeToDay[1]

  if (from <= to) return value >= from && value <= to
  return value >= from || value <= to
}
