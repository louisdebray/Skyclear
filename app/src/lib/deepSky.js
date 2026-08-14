import deepSkyObjects from '../data/deepSkyObjects.json'
import { getFixedSkyPosition } from './skyPosition'

/** Current azimuth/altitude for every catalogued deep-sky target (fixed RA/Dec, same math as meteor radiants). */
export function getDeepSkyObjectsVisibility(date, latitude, longitude) {
  return deepSkyObjects.map((object) => ({
    ...object,
    ...getFixedSkyPosition(date, latitude, longitude, object.raDeg, object.decDeg),
  }))
}
