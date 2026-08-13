import { useMemo } from 'react'
import { computeForecast } from '../../lib/forecast'
import { formatDayLabel, formatTime } from '../../utils/format'

const RING_COLOR = {
  good: 'border-sky-good text-sky-good',
  okay: 'border-sky-okay text-sky-okay',
  bad: 'border-sky-bad text-sky-bad',
}

/** Top 3 nights within the available forecast window (Open-Meteo's free tier caps at 16 days out). */
export default function BestNightsOfMonth({ location, weather }) {
  const topNights = useMemo(() => {
    const nights = computeForecast(weather, location.latitude, location.longitude, 15, location.population)
    return [...nights].sort((a, b) => b.score - a.score).slice(0, 3)
  }, [weather, location.latitude, location.longitude, location.population])

  return (
    <div className="card">
      <h3 className="font-display text-lg font-semibold mb-1">Meilleures nuits à venir</h3>
      <p className="text-xs text-muted mb-4">Sur les 15 prochains jours.</p>
      <div className="flex flex-col gap-3">
        {topNights.map((night, i) => (
          <div key={night.date.toISOString()} className="flex items-center gap-3">
            <span className="text-muted text-sm w-4">{i + 1}</span>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-display font-semibold ${RING_COLOR[night.rating.level]}`}>
              {night.score}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium capitalize">{formatDayLabel(night.date)}</p>
              <p className="text-xs text-muted">
                Lune {night.moon.illuminationPercent}%
                {night.clearWindow && ` · ${formatTime(night.clearWindow.start)}–${formatTime(night.clearWindow.end)}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
