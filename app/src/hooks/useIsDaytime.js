import { useEffect, useState } from 'react'
import { isDaytime } from '../lib/moon'

/** Recomputes day/night for the given location once a minute — enough to catch sunrise/sunset. */
export function useIsDaytime(location) {
  const [daytime, setDaytime] = useState(() => (location ? isDaytime(new Date(), location.latitude, location.longitude) : true))

  useEffect(() => {
    if (!location) return

    const update = () => setDaytime(isDaytime(new Date(), location.latitude, location.longitude))
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [location?.latitude, location?.longitude])

  return daytime
}
