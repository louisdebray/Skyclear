import { useMemo, useState } from 'react'
import { getMilkyWayCorePosition } from '../../lib/milkyWay'
import { formatDirectionPhrase } from '../../utils/format'
import SkyCompass from '../compass/SkyCompass.jsx'
import { IconCompass } from '../icons/Icons.jsx'

/** Points at the galactic core — the dense, bright part of the Milky Way worth photographing. */
export default function MilkyWayFinder({ location }) {
  const [aiming, setAiming] = useState(false)

  const position = useMemo(
    () => getMilkyWayCorePosition(new Date(), location.latitude, location.longitude),
    [location]
  )

  const isSouthern = location.latitude < 0
  const seasonNote = isSouthern
    ? "Visible une grande partie de l'année dans l'hémisphère sud, haute dans le ciel — meilleure période avril-septembre."
    : "Visible de mars à octobre dans l'hémisphère nord, basse sur l'horizon sud — meilleure période juin-août."

  return (
    <div>
      <h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">Voie lactée</h3>
      {position.isUp ? (
        <button
          onClick={() => setAiming(true)}
          className="flex items-center gap-2 text-sm text-brand-light hover:text-brand transition-colors"
        >
          <IconCompass size={14} className="flex-shrink-0" />
          <span>
            Cœur galactique visible {formatDirectionPhrase(position.direction)} · {Math.round(position.altitude)}°
          </span>
        </button>
      ) : (
        <p className="text-sm text-muted">Cœur galactique sous l'horizon actuellement.</p>
      )}
      <p className="text-xs text-muted mt-2">{seasonNote}</p>

      {aiming && (
        <SkyCompass
          label="Cœur de la Voie lactée"
          azimuthDeg={position.azimuth}
          altitudeDeg={position.altitude}
          onClose={() => setAiming(false)}
        />
      )}
    </div>
  )
}
