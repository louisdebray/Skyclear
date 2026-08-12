import cities from '../data/majorCities.json'

const EARTH_RADIUS_KM = 6371
const SEARCH_RADIUS_KM = 300
const MIN_DISTANCE_KM = 2

/**
 * Light pollution is approximated (no VIIRS raster bundled, this stays free/static/client-only):
 * every major city within 300km contributes brightness proportional to population and inversely
 * proportional to distance², summed and mapped onto the 1-9 Bortle scale. It's a heuristic, not a
 * measurement — good enough to flag "you're near a big city" or "you're in the middle of nowhere".
 */
export function estimateBortle(latitude, longitude) {
  let brightness = 0
  let nearest = null
  let nearestDistance = Infinity

  for (const city of cities) {
    const distance = haversineKm(latitude, longitude, city.lat, city.lon)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = city
    }
    if (distance > SEARCH_RADIUS_KM) continue
    const effectiveDistance = Math.max(distance, MIN_DISTANCE_KM)
    brightness += city.population / (effectiveDistance * effectiveDistance)
  }

  return {
    bortle: brightnessToBortle(brightness),
    nearestCity: nearest,
    nearestCityDistanceKm: Math.round(nearestDistance),
  }
}

function brightnessToBortle(brightness) {
  const thresholds = [50, 200, 800, 3000, 10000, 40000, 150000, 600000]
  let bortle = 1
  for (const threshold of thresholds) {
    if (brightness >= threshold) bortle++
    else break
  }
  return Math.min(bortle, 9)
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg) {
  return (deg * Math.PI) / 180
}

export const BORTLE_LABELS = {
  1: 'Ciel excellent',
  2: 'Ciel très bon',
  3: 'Ciel rural',
  4: 'Transition rural/périurbain',
  5: 'Périurbain',
  6: 'Périurbain lumineux',
  7: 'Transition urbain',
  8: 'Urbain',
  9: 'Centre-ville',
}
