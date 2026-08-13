import { useMemo, useState } from 'react'
import { getPlanetVisibility } from '../../lib/planets'
import { formatTime, formatDirectionPhrase } from '../../utils/format'
import PlanetIcon from './PlanetIcon.jsx'
import SkyCompass from '../compass/SkyCompass.jsx'
import { IconCompass } from '../icons/Icons.jsx'

export default function PlanetVisibility({ location }) {
  const [aiming, setAiming] = useState(null)

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
              <button
                onClick={() => setAiming(planet)}
                className="flex items-center gap-1.5 text-brand-light text-xs font-medium hover:text-brand transition-colors"
              >
                <IconCompass size={13} />
                Visible {formatDirectionPhrase(planet.currentDirection)} · {Math.round(planet.currentAltitude)}°
              </button>
            ) : planet.rise ? (
              <span className="text-muted text-xs">Lever {formatTime(planet.rise)}</span>
            ) : (
              <span className="text-muted text-xs">Non visible</span>
            )}
          </div>
        ))}
      </div>

      {aiming && (
        <SkyCompass
          label={aiming.frenchName}
          azimuthDeg={aiming.currentAzimuth}
          altitudeDeg={aiming.currentAltitude}
          onClose={() => setAiming(null)}
        />
      )}
    </div>
  )
}
