import { getPlanetVisibility } from './planets'
import { getMoonAzimuthAltitude, getMoonInfo } from './moon'
import { getMilkyWayCorePosition } from './milkyWay'
import { getDeepSkyObjectsVisibility } from './deepSky'
import { isShowerActive } from './meteorShowers'
import { getFixedSkyPosition } from './skyPosition'
import meteorShowerData from '../data/meteorShowers.json'

/**
 * Every currently-visible target the app knows how to point at, combined into one list — for the
 * all-in-one "Carte du ciel" AR view (as opposed to aiming at just one thing at a time).
 */
export function getVisibleSkyTargets(date, latitude, longitude) {
  const targets = []

  const planets = getPlanetVisibility(date, latitude, longitude)
  for (const planet of planets) {
    if (planet.isUp) {
      targets.push({
        id: `planet-${planet.name}`,
        label: planet.frenchName,
        kind: 'planet',
        azimuth: planet.currentAzimuth,
        altitude: planet.currentAltitude,
      })
    }
  }

  const moonInfo = getMoonInfo(date, latitude, longitude)
  const moonPosition = getMoonAzimuthAltitude(date, latitude, longitude)
  if (moonPosition.altitude > 0) {
    targets.push({
      id: 'moon',
      label: `Lune (${moonInfo.illuminationPercent}%)`,
      kind: 'moon',
      azimuth: moonPosition.azimuth,
      altitude: moonPosition.altitude,
    })
  }

  const milkyWay = getMilkyWayCorePosition(date, latitude, longitude)
  if (milkyWay.isUp) {
    targets.push({
      id: 'milky-way',
      label: 'Voie lactée',
      kind: 'deep-sky',
      azimuth: milkyWay.azimuth,
      altitude: milkyWay.altitude,
    })
  }

  for (const object of getDeepSkyObjectsVisibility(date, latitude, longitude)) {
    if (object.isUp) {
      targets.push({
        id: object.id,
        label: object.name,
        kind: 'deep-sky',
        azimuth: object.azimuth,
        altitude: object.altitude,
      })
    }
  }

  for (const shower of meteorShowerData) {
    if (!isShowerActive(shower, date)) continue
    const position = getFixedSkyPosition(date, latitude, longitude, shower.raDeg, shower.decDeg)
    if (position.isUp) {
      targets.push({
        id: `meteor-${shower.name}`,
        label: `Radiant ${shower.name}`,
        kind: 'meteor',
        azimuth: position.azimuth,
        altitude: position.altitude,
      })
    }
  }

  return targets
}
