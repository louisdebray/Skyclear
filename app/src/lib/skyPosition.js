import * as Astronomy from 'astronomy-engine'

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']

export function azimuthToCompass(azimuthDeg) {
  const index = Math.round(azimuthDeg / 45) % 8
  return COMPASS[index]
}

/**
 * Precesses a catalog position (given in the J2000 epoch, as star/deep-sky-object coordinates
 * always are) to the equatorial system of the given date. `Astronomy.Horizon` expects "of-date"
 * coordinates, not J2000 — skipping this step silently introduces a growing error for anything
 * away from the celestial pole (over two decades since J2000, order of half a degree and rising),
 * while barely affecting objects very close to the pole (e.g. Polaris) since precession mostly
 * shifts right ascension, which matters little when declination is already ~90°. That's exactly
 * why Polaris can look right while a target like Andromeda looks clearly off without this step.
 */
function precessToDate(date, raDeg, decDeg) {
  const rotation = Astronomy.Rotation_EQJ_EQD(date)
  const vectorJ2000 = Astronomy.VectorFromSphere(new Astronomy.Spherical(decDeg, raDeg, 1), date)
  const vectorOfDate = Astronomy.RotateVector(rotation, vectorJ2000)
  const sphereOfDate = Astronomy.SphereFromVector(vectorOfDate)
  return { raDeg: sphereOfDate.lon, decDeg: sphereOfDate.lat }
}

/**
 * Converts a fixed sky position (right ascension/declination in degrees, J2000 — e.g. a meteor
 * shower radiant or a deep-sky object) into the current azimuth/altitude as seen from a given
 * place and time.
 */
export function getFixedSkyPosition(date, latitude, longitude, raDeg, decDeg) {
  const observer = new Astronomy.Observer(latitude, longitude, 0)
  const ofDate = precessToDate(date, raDeg, decDeg)
  const horizon = Astronomy.Horizon(date, observer, ofDate.raDeg / 15, ofDate.decDeg, 'normal')
  return {
    azimuth: horizon.azimuth,
    altitude: horizon.altitude,
    direction: azimuthToCompass(horizon.azimuth),
    isUp: horizon.altitude > 0,
  }
}
