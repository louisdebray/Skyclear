import * as Astronomy from 'astronomy-engine'
import { azimuthToCompass } from './skyPosition'

const PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']

/**
 * Rise/culmination/set + current altitude/azimuth/magnitude for the naked-eye planets,
 * computed locally with astronomy-engine (no external API).
 */
export function getPlanetVisibility(date, latitude, longitude) {
  const observer = new Astronomy.Observer(latitude, longitude, 0)

  return PLANETS.map((name) => {
    const body = Astronomy.Body[name]

    const rise = safeSearch(() => Astronomy.SearchRiseSet(body, observer, 1, date, 1))
    const set = safeSearch(() => Astronomy.SearchRiseSet(body, observer, -1, date, 1))
    const culmination = safeSearch(() => Astronomy.SearchHourAngle(body, observer, 0, date, 1))

    const equator = Astronomy.Equator(body, date, observer, true, true)
    const horizon = Astronomy.Horizon(date, observer, equator.ra, equator.dec, 'normal')
    const magnitude = Astronomy.Illumination(body, date).mag

    return {
      name,
      frenchName: FRENCH_NAMES[name],
      rise: rise?.date ?? null,
      culmination: culmination?.time?.date ?? null,
      set: set?.date ?? null,
      currentAltitude: horizon.altitude,
      currentAzimuth: horizon.azimuth,
      currentDirection: azimuthToCompass(horizon.azimuth),
      isUp: horizon.altitude > 0,
      magnitude,
    }
  })
}

/**
 * Which naked-eye planets are actually above the horizon at some point during [windowStart,
 * windowEnd) — e.g. tonight's astronomical-night window — and for how long. A planet that's up
 * right now can easily rise/set in the middle of a shown "tonight", so this samples across the
 * whole window rather than reporting one instant, and returns only the longest visible stretch
 * per planet (there's normally just one — planets don't rise/set twice in one night).
 */
export function getPlanetsVisibleDuring(windowStart, windowEnd, latitude, longitude, stepMinutes = 20) {
  const observer = new Astronomy.Observer(latitude, longitude, 0)
  const stepMs = stepMinutes * 60 * 1000
  const sampleCount = Math.max(1, Math.ceil((windowEnd - windowStart) / stepMs))

  return PLANETS.map((name) => {
    const body = Astronomy.Body[name]
    let bestRun = null
    let currentRun = null

    for (let i = 0; i <= sampleCount; i++) {
      const t = new Date(Math.min(windowStart.getTime() + i * stepMs, windowEnd.getTime()))
      const equator = Astronomy.Equator(body, t, observer, true, true)
      const horizon = Astronomy.Horizon(t, observer, equator.ra, equator.dec, 'normal')
      const isUp = horizon.altitude > 0

      if (isUp) {
        if (!currentRun) currentRun = { start: t, end: t, azimuth: horizon.azimuth }
        else currentRun.end = t
      } else if (currentRun) {
        if (!bestRun || currentRun.end - currentRun.start > bestRun.end - bestRun.start) bestRun = currentRun
        currentRun = null
      }
    }
    if (currentRun && (!bestRun || currentRun.end - currentRun.start > bestRun.end - bestRun.start)) bestRun = currentRun

    const magnitude = Astronomy.Illumination(body, windowStart).mag

    return {
      name,
      frenchName: FRENCH_NAMES[name],
      magnitude,
      visible: Boolean(bestRun),
      visibleFrom: bestRun?.start ?? null,
      visibleUntil: bestRun?.end ?? null,
      direction: bestRun ? azimuthToCompass(bestRun.azimuth) : null,
    }
  }).filter((p) => p.visible)
}

const FRENCH_NAMES = {
  Mercury: 'Mercure',
  Venus: 'Vénus',
  Mars: 'Mars',
  Jupiter: 'Jupiter',
  Saturn: 'Saturne',
}

function safeSearch(fn) {
  try {
    return fn()
  } catch {
    return null
  }
}
