import * as Astronomy from 'astronomy-engine'

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']

export function azimuthToCompass(azimuthDeg) {
  const index = Math.round(azimuthDeg / 45) % 8
  return COMPASS[index]
}

/**
 * Converts a fixed sky position (right ascension/declination in degrees — e.g. a meteor shower
 * radiant) into the current azimuth/altitude as seen from a given place and time.
 */
export function getFixedSkyPosition(date, latitude, longitude, raDeg, decDeg) {
  const observer = new Astronomy.Observer(latitude, longitude, 0)
  const horizon = Astronomy.Horizon(date, observer, raDeg / 15, decDeg, 'normal')
  return {
    azimuth: horizon.azimuth,
    altitude: horizon.altitude,
    direction: azimuthToCompass(horizon.azimuth),
    isUp: horizon.altitude > 0,
  }
}
