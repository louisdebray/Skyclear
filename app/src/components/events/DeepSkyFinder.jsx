import { useMemo, useState } from 'react'
import { getDeepSkyObjectsVisibility } from '../../lib/deepSky'
import { formatDirectionPhrase } from '../../utils/format'
import SkyCompass from '../compass/SkyCompass.jsx'
import { IconCompass, IconStar } from '../icons/Icons.jsx'

/** Fixed-position targets worth aiming at beyond planets/moon/meteors: bright deep-sky objects and Polaris. */
export default function DeepSkyFinder({ location }) {
  const [aiming, setAiming] = useState(null)

  const objects = useMemo(
    () => getDeepSkyObjectsVisibility(new Date(), location.latitude, location.longitude),
    [location]
  )

  return (
    <div>
      <h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">Repères du ciel</h3>
      <div className="flex flex-col gap-2.5">
        {objects.map((object) => (
          <div key={object.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <IconStar size={16} className="text-brand-light flex-shrink-0" />
              <span className="font-medium">{object.name}</span>
              <span className="text-xs text-muted">mag {object.magnitude.toFixed(1)}</span>
            </span>
            {object.isUp ? (
              <button
                onClick={() => setAiming(object)}
                className="flex items-center gap-1.5 text-brand-light text-xs font-medium hover:text-brand transition-colors"
              >
                <IconCompass size={13} />
                Visible {formatDirectionPhrase(object.direction)} · {Math.round(object.altitude)}°
              </button>
            ) : (
              <span className="text-muted text-xs">Sous l'horizon</span>
            )}
          </div>
        ))}
      </div>

      {aiming && (
        <SkyCompass
          label={aiming.name}
          azimuthDeg={aiming.azimuth}
          altitudeDeg={aiming.altitude}
          onClose={() => setAiming(null)}
        />
      )}
    </div>
  )
}
