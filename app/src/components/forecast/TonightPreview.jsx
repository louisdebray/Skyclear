import { useMemo, useState } from 'react'
import { computeForecast } from '../../lib/forecast'
import { formatPercent, formatTime } from '../../utils/format'
import { IconRain, IconTelescope } from '../icons/Icons.jsx'
import ForecastDayModal from './ForecastDayModal.jsx'

const RING_COLOR = {
  good: 'border-sky-good text-sky-good',
  okay: 'border-sky-okay text-sky-okay',
  bad: 'border-sky-bad text-sky-bad',
}

/**
 * Shown only during the day: the current-conditions card describes daytime weather, which
 * isn't what an astrophotographer cares about right now — this surfaces tonight's outlook
 * instead. It disappears once night falls, since the current-conditions card then *is* tonight.
 * Clicking it opens the same full-detail modal as a day in the 15-day timeline.
 */
export default function TonightPreview({ location, weather, target }) {
  const [showDetail, setShowDetail] = useState(false)

  const tonight = useMemo(
    () => computeForecast(weather, location.latitude, location.longitude, 1, location.population, target)[0],
    [weather, location.latitude, location.longitude, location.population, target]
  )

  if (!tonight) return null

  return (
    <>
      <button onClick={() => setShowDetail(true)} className="card w-full text-left hover:-translate-y-0.5 transition-transform">
        <h2 className="font-display text-lg font-semibold mb-4">Prévisions pour ce soir</h2>
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${RING_COLOR[tonight.rating.level]}`}>
            <span className="text-xl font-display font-semibold">{tonight.score}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium ${RING_COLOR[tonight.rating.level].split(' ')[0]}`}>Conditions {tonight.rating.label.toLowerCase()}</p>
            <p className="text-sm text-muted">
              Nuages {formatPercent(tonight.avgCloudCover)} · Lune {tonight.moon.illuminationPercent}%
            </p>
            {target === 'planets' && (
              <p className="text-sm text-brand-light mt-1">
                {tonight.visiblePlanets?.length
                  ? `Visibles : ${tonight.visiblePlanets.map((p) => p.frenchName).join(', ')}`
                  : 'Aucune planète visible cette nuit'}
              </p>
            )}
            {tonight.maxRainProbability >= 20 && (
              <p className="flex items-center gap-1.5 text-sm text-brand-light mt-1">
                <IconRain size={13} />
                Risque de pluie {formatPercent(tonight.maxRainProbability)}
              </p>
            )}
            {tonight.clearWindow && (
              <p className="flex items-center gap-1.5 text-sm text-brand-light mt-1">
                <IconTelescope size={13} />
                Meilleure fenêtre {formatTime(tonight.clearWindow.start)}–{formatTime(tonight.clearWindow.end)}
              </p>
            )}
          </div>
        </div>
      </button>
      {showDetail && <ForecastDayModal night={tonight} onClose={() => setShowDetail(false)} target={target} />}
    </>
  )
}
