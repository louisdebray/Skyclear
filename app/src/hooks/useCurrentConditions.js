import { useMemo } from 'react'
import { getMoonInfo, getMoonAltitudeDeg, getMoonAzimuthAltitude, isDaytime as computeIsDaytime } from '../lib/moon'
import { estimateBortle } from '../lib/bortle'
import { computeSkyScore, describeConditions } from '../lib/skyScore'
import { classifyWeatherCode } from '../lib/weather'

/** Shared score/moon/light-pollution computation so the main card and the sticky summary bar stay in sync. */
export function useCurrentConditions(location, weather, target = 'stars') {
  return useMemo(() => {
    if (!location || !weather) return null

    const now = new Date()
    const moon = getMoonInfo(now, location.latitude, location.longitude)
    const moonVisible = getMoonAltitudeDeg(now, location.latitude, location.longitude) > 0
    const moonPosition = getMoonAzimuthAltitude(now, location.latitude, location.longitude)
    const effectiveMoonIllumination = moonVisible ? moon.illuminationPercent : 0
    const daytime = computeIsDaytime(now, location.latitude, location.longitude)

    const condition = classifyWeatherCode(weather.current.weatherCode)
    const isRaining = condition === 'rain' || condition === 'storm' || (weather.current.precipitation ?? 0) > 0.1

    const bortleInfo = estimateBortle(location.latitude, location.longitude, location.population)
    const scoreResult = computeSkyScore({
      cloudCoverPercent: weather.current.cloudCover,
      moonIlluminationPercent: effectiveMoonIllumination,
      humidityPercent: weather.current.humidity,
      windSpeedKmh: weather.current.windSpeed,
      precipitationProbabilityPercent: isRaining ? 100 : 0,
      bortle: bortleInfo.bortle,
      target,
      isDaytime: daytime,
      moonAboveHorizon: moonVisible,
    })
    const summary = describeConditions({
      cloudCoverPercent: weather.current.cloudCover,
      moonIlluminationPercent: moon.illuminationPercent,
      moonVisible,
      isRaining,
      isDaytime: daytime,
      target,
      bortle: bortleInfo.bortle,
      rating: scoreResult.rating,
    })

    return { moon, moonVisible, moonPosition, bortleInfo, scoreResult, summary, condition, isRaining, isDaytime: daytime }
  }, [location, weather, target])
}
