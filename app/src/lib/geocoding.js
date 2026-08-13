const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const EARTH_RADIUS_KM = 6371
const COMBINING_MARKS = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g')

/** Strips accents/diacritics so "Etienne" matches "Étienne" and vice versa. */
function stripAccents(str) {
  return str.normalize('NFD').replace(COMBINING_MARKS, '')
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function searchOnce(name) {
  const params = new URLSearchParams({ name, count: '6', language: 'fr' })
  const res = await fetch(`${GEOCODING_URL}?${params.toString()}`)
  const data = await res.json()
  return data.results ?? []
}

/**
 * Searches Open-Meteo's geocoding API across looser variants (swapped hyphens/spaces, accents
 * stripped) and merges the results — Open-Meteo treats "saint etienne" and "saint-etienne" as
 * different queries with very different top matches (a 200-person hamlet vs. the actual city
 * of 170k), so querying only the literal input can surface the wrong place entirely. Merging
 * and sorting by population ensures the well-known city wins regardless of how it was typed.
 */
export async function searchCities(query) {
  const trimmed = query.trim()
  if (!trimmed) return []

  const variants = [
    trimmed,
    trimmed.replace(/-/g, ' '),
    trimmed.replace(/\s+/g, '-'),
    stripAccents(trimmed),
    stripAccents(trimmed.replace(/-/g, ' ')),
  ]

  const seen = new Set()
  const uniqueVariants = variants.filter((v) => {
    const key = v.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const resultSets = await Promise.all(uniqueVariants.map((v) => searchOnce(v).catch(() => [])))

  const byId = new Map()
  for (const result of resultSets.flat()) {
    const key = result.id ?? `${result.latitude},${result.longitude}`
    if (!byId.has(key)) byId.set(key, result)
  }

  return [...byId.values()].sort((a, b) => (b.population ?? 0) - (a.population ?? 0)).slice(0, 6)
}

/**
 * Reverse-geocodes coordinates to a human-readable "City, Country" label (free, no API key),
 * plus a best-effort population lookup (BigDataCloud's reverse endpoint doesn't return population,
 * so we cross-check the resolved city name against Open-Meteo's geocoder and take the population
 * of whichever match sits closest to the original coordinates).
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toFixed(4),
      longitude: longitude.toFixed(4),
      localityLanguage: 'fr',
    })
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`)
    if (!res.ok) return { label: null, population: 0 }
    const data = await res.json()
    const city = data.city || data.locality
    // BigDataCloud's French country names carry a trailing grammatical article, e.g. "France (la)".
    const country = data.countryName?.replace(/\s*\([^)]*\)\s*$/, '')
    const parts = [city, country].filter(Boolean)
    const label = parts.length ? parts.join(', ') : null

    const population = city ? await lookupPopulationNear(city, latitude, longitude) : 0

    return { label, population }
  } catch {
    return { label: null, population: 0 }
  }
}

async function lookupPopulationNear(cityName, latitude, longitude) {
  try {
    const candidates = await searchOnce(cityName)
    const withinRange = candidates.filter((c) => haversineKm(latitude, longitude, c.latitude, c.longitude) < 30)
    if (!withinRange.length) return 0
    withinRange.sort((a, b) => haversineKm(latitude, longitude, a.latitude, a.longitude) - haversineKm(latitude, longitude, b.latitude, b.longitude))
    return withinRange[0].population ?? 0
  } catch {
    return 0
  }
}
