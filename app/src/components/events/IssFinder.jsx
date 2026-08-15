import { useEffect, useState } from 'react'
import { fetchIssPosition, getIssVisibility } from '../../lib/iss'
import { formatDirectionPhrase } from '../../utils/format'
import SkyCompass from '../compass/SkyCompass.jsx'
import { IconCompass } from '../icons/Icons.jsx'

const REFRESH_MS = 8000 // the ISS moves ~7.7 km/s — stale-by-a-minute would be visibly wrong

/** Live "is the ISS overhead right now" tracker — the one target in the app that actually moves. */
export default function IssFinder({ location }) {
  const [visibility, setVisibility] = useState(null)
  const [error, setError] = useState(false)
  const [aiming, setAiming] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      try {
        const position = await fetchIssPosition()
        if (cancelled) return
        setVisibility(getIssVisibility(position, location.latitude, location.longitude))
        setError(false)
      } catch {
        if (!cancelled) setError(true)
      }
    }

    refresh()
    const interval = setInterval(refresh, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [location])

  return (
    <div>
      <h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">Station spatiale (ISS)</h3>
      {error && <p className="text-sm text-muted">Position de l'ISS indisponible pour le moment.</p>}
      {!error && !visibility && <p className="text-sm text-muted">Localisation en cours…</p>}
      {!error && visibility && visibility.isUp && (
        <button
          onClick={() => setAiming(true)}
          className="flex items-center gap-2 text-sm text-brand-light hover:text-brand transition-colors"
        >
          <IconCompass size={14} className="flex-shrink-0" />
          <span>
            Au-dessus de toi, {formatDirectionPhrase(visibility.direction)} · {Math.round(visibility.altitude)}° · à{' '}
            {Math.round(visibility.rangeKm)} km de distance
          </span>
        </button>
      )}
      {!error && visibility && !visibility.isUp && (
        <p className="text-sm text-muted">Pas au-dessus de l'horizon actuellement — repasse dans quelques minutes.</p>
      )}

      {aiming && visibility && (
        <SkyCompass
          label="Station spatiale internationale"
          azimuthDeg={visibility.azimuth}
          altitudeDeg={visibility.altitude}
          onClose={() => setAiming(false)}
        />
      )}
    </div>
  )
}
