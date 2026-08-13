import { useCallback, useEffect, useState } from 'react'
import { readCache, writeCache } from '../utils/cache'
import { reverseGeocode } from '../lib/geocoding'

const CACHE_KEY = 'location'

/**
 * Resolves the user's location: browser geolocation first, with a manual
 * city/coordinates fallback when it's denied, unavailable, or times out.
 */
export function useGeolocation() {
  const [location, setLocation] = useState(() => readCache(CACHE_KEY))
  const [status, setStatus] = useState(location ? 'resolved' : 'idle')
  const [error, setError] = useState(null)

  const requestBrowserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('manual-required')
      setError("La géolocalisation n'est pas disponible dans ce navigateur.")
      return
    }
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const { label: cityLabel, population } = await reverseGeocode(latitude, longitude)
        const next = {
          latitude,
          longitude,
          label: cityLabel ?? 'Position actuelle',
          population,
          source: 'geolocation',
        }
        setLocation(next)
        writeCache(CACHE_KEY, next, null)
        setStatus('resolved')
        setError(null)
      },
      (err) => {
        setStatus('manual-required')
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Géolocalisation refusée. Indique ta position manuellement.'
            : 'Impossible de récupérer ta position. Indique-la manuellement.'
        )
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: ONE_HOUR_MS }
    )
  }, [])

  const setManualLocation = useCallback((latitude, longitude, label, population = 0) => {
    const next = { latitude, longitude, label: label || 'Position saisie', population, source: 'manual' }
    setLocation(next)
    writeCache(CACHE_KEY, next, null)
    setStatus('resolved')
    setError(null)
  }, [])

  useEffect(() => {
    if (!location) requestBrowserLocation()
  }, [location, requestBrowserLocation])

  return { location, status, error, requestBrowserLocation, setManualLocation }
}

const ONE_HOUR_MS = 60 * 60 * 1000
