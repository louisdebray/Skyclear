import * as Astronomy from 'astronomy-engine'

const PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']

function azimuthToCompass(azimuthDeg) {
  const index = Math.round(azimuthDeg / 45) % 8
  return COMPASS[index]
}

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
