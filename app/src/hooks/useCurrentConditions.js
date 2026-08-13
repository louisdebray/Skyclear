import { useMemo } from 'react'
import { getMoonInfo, getMoonAltitudeDeg } from '../lib/moon'
import { estimateBortle } from '../lib/bortle'
import { computeSkyScore, describeConditions } from '../lib/skyScore'

/** Shared score/moon/light-pollution computation so the main card and the sticky summary bar stay in sync. */
export function useCurrentConditions(location, weather) {
  return useMemo(() => {
    if (!location || !weather) return null

    const now = new Date()
    const moon = getMoonInfo(now, location.latitude, location.longitude)
    const moonVisible = getMoonAltitudeDeg(now, location.latitude, location.longitude) > 0
    const effectiveMoonIllumination = moonVisible ? moon.illuminationPercent : 0

    const bortleInfo = estimateBortle(location.latitude, location.longitude, location.population)
    const scoreResult = computeSkyScore({
      cloudCoverPercent: weather.current.cloudCover,
      moonIlluminationPercent: effectiveMoonIllumination,
      humidityPercent: weather.current.humidity,
      windSpeedKmh: weather.current.windSpeed,
      bortle: bortleInfo.bortle,
    })
    const summary = describeConditions({
      cloudCoverPercent: weather.current.cloudCover,
      moonIlluminationPercent: moon.illuminationPercent,
      moonVisible,
      bortle: bortleInfo.bortle,
      rating: scoreResult.rating,
    })

    return { moon, moonVisible, bortleInfo, scoreResult, summary }
  }, [location, weather])
}
