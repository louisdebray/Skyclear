import SunCalc from 'suncalc'

const PHASE_NAMES = [
  { max: 0.03, name: 'Nouvelle lune' },
  { max: 0.22, name: 'Premier croissant' },
  { max: 0.28, name: 'Premier quartier' },
  { max: 0.47, name: 'Lune gibbeuse croissante' },
  { max: 0.53, name: 'Pleine lune' },
  { max: 0.72, name: 'Lune gibbeuse décroissante' },
  { max: 0.78, name: 'Dernier quartier' },
  { max: 0.97, name: 'Dernier croissant' },
  { max: 1, name: 'Nouvelle lune' },
]

function phaseName(phase) {
  return PHASE_NAMES.find((p) => phase <= p.max)?.name ?? 'Inconnue'
}

/** Moon illumination % and phase name for a given date, plus rise/set times for a location. */
export function getMoonInfo(date, latitude, longitude) {
  const illumination = SunCalc.getMoonIllumination(date)
  const times = SunCalc.getMoonTimes(date, latitude, longitude)

  return {
    illuminationFraction: illumination.fraction,
    illuminationPercent: Math.round(illumination.fraction * 100),
    phase: illumination.phase,
    phaseName: phaseName(illumination.phase),
    rise: times.rise ?? null,
    set: times.set ?? null,
    alwaysUp: Boolean(times.alwaysUp),
    alwaysDown: Boolean(times.alwaysDown),
  }
}

/** Moon altitude in degrees at a given instant — negative means below the horizon (not visible). */
export function getMoonAltitudeDeg(date, latitude, longitude) {
  const position = SunCalc.getMoonPosition(date, latitude, longitude)
  return (position.altitude * 180) / Math.PI
}

/**
 * Moon azimuth/altitude in degrees at a given instant — used to point a device compass at it.
 * SunCalc measures azimuth from south, clockwise; converted here to the standard from-north
 * compass bearing used everywhere else in the app (0° = North, 90° = East).
 */
export function getMoonAzimuthAltitude(date, latitude, longitude) {
  const position = SunCalc.getMoonPosition(date, latitude, longitude)
  const rawAzimuthDeg = (position.azimuth * 180) / Math.PI
  return {
    azimuth: ((rawAzimuthDeg + 180) % 360 + 360) % 360,
    altitude: (position.altitude * 180) / Math.PI,
  }
}

/**
 * Fraction (0-1) of a time window during which the moon is above the horizon at this location.
 * Sampled rather than derived from rise/set times, since rise/set-interval math gets messy
 * around wraparounds — a handful of altitude samples across the window is robust and simple.
 */
export function moonVisibleFraction(windowStart, windowEnd, latitude, longitude, samples = 6) {
  let upCount = 0
  for (let i = 0; i <= samples; i++) {
    const t = new Date(windowStart.getTime() + ((windowEnd - windowStart) * i) / samples)
    if (getMoonAltitudeDeg(t, latitude, longitude) > 0) upCount++
  }
  return upCount / (samples + 1)
}

/** Sun rise/set/twilight for a location, used to bound the "night window". */
export function getSunInfo(date, latitude, longitude) {
  const times = SunCalc.getTimes(date, latitude, longitude)
  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    astronomicalDusk: times.night,
    astronomicalDawn: times.nightEnd,
  }
}

/** Whether the sun is above the horizon right now — drives the day/night visual and layout. */
export function isDaytime(date, latitude, longitude) {
  const { sunrise, sunset } = getSunInfo(date, latitude, longitude)
  if (!sunrise || !sunset) return false
  return date >= sunrise && date < sunset
}
