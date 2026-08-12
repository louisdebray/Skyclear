import { useCallback, useEffect, useState } from 'react'
import { readCache, writeCache } from '../utils/cache'

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
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: 'Position actuelle',
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

  const setManualLocation = useCallback((latitude, longitude, label) => {
    const next = { latitude, longitude, label: label || 'Position saisie', source: 'manual' }
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
