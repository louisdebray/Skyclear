const WGS84_A = 6378137.0 // semi-major axis, metres
const WGS84_E2 = 0.00669437999014 // eccentricity squared

/** Geodetic (lat/lon in degrees, altitude in metres) to Earth-Centered-Earth-Fixed Cartesian. */
function geodeticToEcef(latitudeDeg, longitudeDeg, altitudeMeters) {
  const lat = (latitudeDeg * Math.PI) / 180
  const lon = (longitudeDeg * Math.PI) / 180
  const sinLat = Math.sin(lat)
  const cosLat = Math.cos(lat)
  const radiusOfCurvature = WGS84_A / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat)

  return {
    x: (radiusOfCurvature + altitudeMeters) * cosLat * Math.cos(lon),
    y: (radiusOfCurvature + altitudeMeters) * cosLat * Math.sin(lon),
    z: (radiusOfCurvature * (1 - WGS84_E2) + altitudeMeters) * sinLat,
  }
}

/**
 * Azimuth/elevation/range of a target (given as geodetic lat/lon/altitude — e.g. a satellite's
 * ground-track subpoint and altitude) as seen from an observer at another geodetic position.
 * Standard ECEF -> local East-North-Up topocentric conversion.
 */
export function geodeticToAzElRange(observerLat, observerLon, observerAltMeters, targetLat, targetLon, targetAltMeters) {
  const observerEcef = geodeticToEcef(observerLat, observerLon, observerAltMeters)
  const targetEcef = geodeticToEcef(targetLat, targetLon, targetAltMeters)

  const dx = targetEcef.x - observerEcef.x
  const dy = targetEcef.y - observerEcef.y
  const dz = targetEcef.z - observerEcef.z

  const lat = (observerLat * Math.PI) / 180
  const lon = (observerLon * Math.PI) / 180
  const sinLat = Math.sin(lat)
  const cosLat = Math.cos(lat)
  const sinLon = Math.sin(lon)
  const cosLon = Math.cos(lon)

  const east = -sinLon * dx + cosLon * dy
  const north = -sinLat * cosLon * dx - sinLat * sinLon * dy + cosLat * dz
  const up = cosLat * cosLon * dx + cosLat * sinLon * dy + sinLat * dz

  const range = Math.sqrt(east * east + north * north + up * up)

  return {
    azimuth: ((Math.atan2(east, north) * 180) / Math.PI + 360) % 360,
    elevation: (Math.asin(up / range) * 180) / Math.PI,
    rangeKm: range / 1000,
  }
}
