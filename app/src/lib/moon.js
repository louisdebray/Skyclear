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
