import { useState } from 'react'
import { formatTime, formatDirectionPhrase } from '../../utils/format'
import { azimuthToCompass } from '../../lib/skyPosition'
import MoonPhaseIcon from './MoonPhaseIcon.jsx'
import SkyCompass from '../compass/SkyCompass.jsx'
import { IconCompass } from '../icons/Icons.jsx'

export default function MoonWidget({ moon, moonPosition }) {
  const [aiming, setAiming] = useState(false)
  const moonIsUp = moonPosition && moonPosition.altitude > 0

  return (
    <div className="flex items-center gap-4">
      <MoonPhaseIcon illuminationFraction={moon.illuminationFraction} phase={moon.phase} size={40} />
      <div className="text-sm">
        <p className="font-medium">{moon.phaseName}</p>
        <p className="text-muted">{moon.illuminationPercent}% illuminée</p>
        <p className="text-muted">
          Lever {formatTime(moon.rise)} · Coucher {formatTime(moon.set)}
        </p>
        {moonIsUp && (
          <button
            onClick={() => setAiming(true)}
            className="flex items-center gap-1.5 text-brand-light hover:text-brand transition-colors mt-1"
          >
            <IconCompass size={12} />
            Visible {formatDirectionPhrase(azimuthToCompass(moonPosition.azimuth))}
          </button>
        )}
      </div>

      {aiming && (
        <SkyCompass label="Lune" azimuthDeg={moonPosition.azimuth} altitudeDeg={moonPosition.altitude} onClose={() => setAiming(false)} />
      )}
    </div>
  )
}
