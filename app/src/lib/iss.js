import { azimuthToCompass } from './skyPosition'
import { geodeticToAzElRange } from './geodesy'

/**
 * Live ISS ground position (lat/lon/altitude) from a free, no-key API. Unlike every other target
 * in the app, the ISS isn't a fixed sky position computable offline — it's a satellite doing
 * ~7.7 km/s, so its position has to be fetched fresh (the caller should re-fetch every several
 * seconds while a view showing it is open).
 */
export async function fetchIssPosition() {
  const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
  if (!response.ok) throw new Error('iss-fetch-failed')
  const data = await response.json()
  return {
    latitude: data.latitude,
    longitude: data.longitude,
    altitudeKm: data.altitude,
    timestamp: data.timestamp * 1000,
  }
}

/** Current azimuth/altitude/range/visibility of the ISS as seen from an observer's location. */
export function getIssVisibility(issPosition, observerLatitude, observerLongitude) {
  const { azimuth, elevation, rangeKm } = geodeticToAzElRange(
    observerLatitude,
    observerLongitude,
    0,
    issPosition.latitude,
    issPosition.longitude,
    issPosition.altitudeKm * 1000
  )
  return {
    azimuth,
    altitude: elevation,
    direction: azimuthToCompass(azimuth),
    rangeKm,
    isUp: elevation > 0,
  }
}
