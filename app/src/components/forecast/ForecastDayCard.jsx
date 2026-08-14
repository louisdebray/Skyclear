import { formatDayLabel, formatPercent, formatTime } from '../../utils/format'
import { IconRain } from '../icons/Icons.jsx'

const RING_COLOR = {
  good: 'border-sky-good text-sky-good',
  okay: 'border-sky-okay text-sky-okay',
  bad: 'border-sky-bad text-sky-bad',
}

export default function ForecastDayCard({ night, isBest, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`card min-w-[168px] flex-shrink-0 flex flex-col items-center gap-2 text-center cursor-pointer hover:-translate-y-0.5 transition-transform ${
        isBest ? 'ring-2 ring-brand' : ''
      }`}
    >
      <div className="h-4 flex items-center">
        {isBest && (
          <span className="whitespace-nowrap bg-brand text-night-bg text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full">
            Meilleure nuit
          </span>
        )}
      </div>
      <p className="text-sm font-medium capitalize">{formatDayLabel(night.date)}</p>
      <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${RING_COLOR[night.rating.level]}`}>
        <span className="text-lg font-display font-semibold">{night.score}</span>
      </div>
      <p className="text-xs text-muted">Nuages {formatPercent(night.avgCloudCover)}</p>
      {night.maxRainProbability >= 20 && (
        <p className="flex items-center gap-1 text-xs text-brand-light">
          <IconRain size={12} />
          {formatPercent(night.maxRainProbability)}
        </p>
      )}
      <p className="text-xs text-muted">Lune {night.moon.illuminationPercent}%</p>
      {night.visiblePlanets && (
        <p className="text-xs text-brand-light px-1">
          {night.visiblePlanets.length ? night.visiblePlanets.map((p) => p.frenchName).join(', ') : 'Aucune planète'}
        </p>
      )}
      {night.clearWindow ? (
        <p className="text-xs text-brand-light font-medium">
          {formatTime(night.clearWindow.start)}–{formatTime(night.clearWindow.end)}
        </p>
      ) : (
        <p className="text-xs text-muted">Pas de créneau dégagé</p>
      )}
    </button>
  )
}
