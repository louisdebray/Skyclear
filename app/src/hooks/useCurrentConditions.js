import { useMemo } from 'react'
import { getMoonInfo } from '../lib/moon'
import { estimateBortle } from '../lib/bortle'
import { computeSkyScore, describeConditions } from '../lib/skyScore'

/** Shared score/moon/light-pollution computation so the main card and the sticky summary bar stay in sync. */
export function useCurrentConditions(location, weather) {
  return useMemo(() => {
    if (!location || !weather) return null

    const moon = getMoonInfo(new Date(), location.latitude, location.longitude)
    const bortleInfo = estimateBortle(location.latitude, location.longitude)
    const scoreResult = computeSkyScore({
      cloudCoverPercent: weather.current.cloudCover,
      moonIlluminationPercent: moon.illuminationPercent,
      humidityPercent: weather.current.humidity,
      windSpeedKmh: weather.current.windSpeed,
      bortle: bortleInfo.bortle,
    })
    const summary = describeConditions({
      cloudCoverPercent: weather.current.cloudCover,
      moonIlluminationPercent: moon.illuminationPercent,
      bortle: bortleInfo.bortle,
      rating: scoreResult.rating,
    })

    return { moon, bortleInfo, scoreResult, summary }
  }, [location, weather])
}
