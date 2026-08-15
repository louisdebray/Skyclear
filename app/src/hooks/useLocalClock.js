import { useEffect, useState } from 'react'

/** Ticking local time at the observed location's timezone (not the browser's). */
export function useLocalClock(timezone, { withSeconds = true } = {}) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!timezone) return null

  try {
    return new Intl.DateTimeFormat('fr-FR', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: withSeconds ? '2-digit' : undefined,
    }).format(now)
  } catch {
    return null
  }
}
