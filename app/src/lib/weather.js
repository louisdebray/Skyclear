const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

/**
 * Fetches current + hourly (16 days) + daily weather from Open-Meteo (no API key required).
 * Hourly cloud cover is what the sky-quality score and "best window tonight" logic rely on;
 * precipitation is fetched too since rain is a hard blocker for astrophotography, not just a
 * secondary factor like humidity/wind.
 */
export async function fetchWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: 'temperature_2m,relative_humidity_2m,dew_point_2m,cloud_cover,wind_speed_10m,precipitation,weather_code',
    hourly: 'cloud_cover,relative_humidity_2m,dew_point_2m,wind_speed_10m,temperature_2m,precipitation_probability,precipitation,weather_code',
    daily: 'cloud_cover_mean,precipitation_probability_max',
    forecast_days: '16',
    timezone: 'auto',
  })

  const response = await fetch(`${BASE_URL}?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Open-Meteo a répondu avec le statut ${response.status}`)
  }
  const data = await response.json()

  return {
    current: {
      time: new Date(data.current.time),
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      dewPoint: data.current.dew_point_2m,
      cloudCover: data.current.cloud_cover,
      windSpeed: data.current.wind_speed_10m,
      precipitation: data.current.precipitation,
      weatherCode: data.current.weather_code,
    },
    hourly: data.hourly.time.map((t, i) => ({
      time: new Date(t),
      cloudCover: data.hourly.cloud_cover[i],
      humidity: data.hourly.relative_humidity_2m[i],
      dewPoint: data.hourly.dew_point_2m[i],
      windSpeed: data.hourly.wind_speed_10m[i],
      temperature: data.hourly.temperature_2m[i],
      precipitationProbability: data.hourly.precipitation_probability[i],
      precipitation: data.hourly.precipitation[i],
      weatherCode: data.hourly.weather_code[i],
    })),
    daily: data.daily.time.map((t, i) => ({
      date: new Date(t),
      cloudCoverMean: data.daily.cloud_cover_mean[i],
      precipitationProbabilityMax: data.daily.precipitation_probability_max[i],
    })),
    timezone: data.timezone,
  }
}

/** Dew point risk for optics fogging: the closer air temp gets to the dew point, the higher the risk. */
export function dewPointRisk(temperature, dewPoint) {
  if (temperature == null || dewPoint == null) return 'unknown'
  const spread = temperature - dewPoint
  if (spread <= 2) return 'high'
  if (spread <= 5) return 'medium'
  return 'low'
}

/**
 * Buckets an Open-Meteo WMO weather code into a coarse condition used to pick the right sky
 * visual (clear / cloudy / rain). See https://open-meteo.com/en/docs for the full code table.
 */
export function classifyWeatherCode(code) {
  if (code == null) return 'clear'
  if (code >= 95) return 'storm'
  if (code >= 51) return 'rain'
  if (code >= 45) return 'fog'
  if (code >= 3) return 'cloudy'
  return 'clear'
}
