import { formatTime } from '../../utils/format'
import MoonPhaseIcon from './MoonPhaseIcon.jsx'

export default function MoonWidget({ moon }) {
  return (
    <div className="flex items-center gap-4">
      <MoonPhaseIcon illuminationFraction={moon.illuminationFraction} phase={moon.phase} size={40} />
      <div className="text-sm">
        <p className="font-medium">{moon.phaseName}</p>
        <p className="text-muted">{moon.illuminationPercent}% illuminée</p>
        <p className="text-muted">
          Lever {formatTime(moon.rise)} · Coucher {formatTime(moon.set)}
        </p>
      </div>
    </div>
  )
}
