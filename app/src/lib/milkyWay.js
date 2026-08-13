import { getFixedSkyPosition } from './skyPosition'

// The galactic center (Sagittarius A*) — the brightest, densest part of the Milky Way band and
// the classic target for Milky Way astrophotography. A fixed sky position, same treatment as a
// meteor shower radiant.
const GALACTIC_CENTER_RA_DEG = 266.4
const GALACTIC_CENTER_DEC_DEG = -29.0

export function getMilkyWayCorePosition(date, latitude, longitude) {
  return getFixedSkyPosition(date, latitude, longitude, GALACTIC_CENTER_RA_DEG, GALACTIC_CENTER_DEC_DEG)
}
