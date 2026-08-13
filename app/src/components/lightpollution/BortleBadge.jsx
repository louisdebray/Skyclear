import { BORTLE_LABELS } from '../../lib/bortle'
import { IconCity } from '../icons/Icons.jsx'

export default function BortleBadge({ bortleInfo }) {
  const { bortle, nearestCity, nearestCityDistanceKm } = bortleInfo
  const positionPercent = ((bortle - 1) / 8) * 100

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <IconCity size={14} className="text-muted" />
        <p className="text-xs text-muted uppercase tracking-wide">Pollution lumineuse</p>
      </div>
      <div className="relative h-2 rounded-full bg-gradient-to-r from-sky-good via-sky-okay to-sky-bad">
        <div
          className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-night-surface shadow transition-all duration-500"
          style={{ left: `${positionPercent}%`, transform: 'translate(-50%, -50%)' }}
          title={`Bortle ${bortle}`}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted mt-1">
        <span>Ciel noir</span>
        <span>Centre-ville</span>
      </div>
      <p className="text-sm font-medium mt-2">
        {BORTLE_LABELS[bortle]} <span className="text-muted font-normal">(Bortle {bortle})</span>
      </p>
      {nearestCity && (
        <p className="text-muted text-xs">
          {nearestCity.name} à {nearestCityDistanceKm} km
        </p>
      )}
    </div>
  )
}
