import { useMemo } from 'react'
import { getPlanetVisibility } from '../../lib/planets'
import { formatTime } from '../../utils/format'
import PlanetIcon from './PlanetIcon.jsx'

export default function PlanetVisibility({ location }) {
  const planets = useMemo(
    () => getPlanetVisibility(new Date(), location.latitude, location.longitude),
    [location]
  )

  const visibleTonight = planets.filter((p) => p.isUp || p.rise)

  return (
    <div>
      <h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">Planètes</h3>
      <div className="flex flex-col gap-2.5">
        {visibleTonight.map((planet) => (
          <div key={planet.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <PlanetIcon name={planet.name} size={22} />
              <span className="font-medium">{planet.frenchName}</span>
              <span className="text-xs text-muted">mag {planet.magnitude.toFixed(1)}</span>
            </span>
            {planet.isUp ? (
              <span className="text-brand-light text-xs font-medium">
                Visible à l'{planet.currentDirection} · {Math.round(planet.currentAltitude)}°
              </span>
            ) : planet.rise ? (
              <span className="text-muted text-xs">Lever {formatTime(planet.rise)}</span>
            ) : (
              <span className="text-muted text-xs">Non visible</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
