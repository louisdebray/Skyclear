import { useEffect, useState } from 'react'
import { fetchWeather } from '../lib/weather'
import { ONE_HOUR_MS, readCache, writeCache } from '../utils/cache'

/** Weather for a location, cached in localStorage for up to 1h to stay well under Open-Meteo's free-tier limits. */
export function useWeather(location) {
  const [weather, setWeather] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!location) return

    const cacheKey = `weather:${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`
    const cached = readCache(cacheKey)
    if (cached) {
      setWeather(reviveDates(cached))
      setStatus('resolved')
      return
    }

    let cancelled = false
    setStatus('loading')
    fetchWeather(location.latitude, location.longitude)
      .then((data) => {
        if (cancelled) return
        writeCache(cacheKey, data, ONE_HOUR_MS)
        setWeather(data)
        setStatus('resolved')
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('error')
        setError(err.message || 'Erreur lors de la récupération de la météo.')
      })

    return () => {
      cancelled = true
    }
  }, [location?.latitude, location?.longitude])

  return { weather, status, error }
}

function reviveDates(data) {
  return {
    ...data,
    current: { ...data.current, time: new Date(data.current.time) },
    hourly: data.hourly.map((h) => ({ ...h, time: new Date(h.time) })),
    daily: data.daily.map((d) => ({ ...d, date: new Date(d.date) })),
  }
}
