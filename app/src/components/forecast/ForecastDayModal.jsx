import { createPortal } from 'react-dom'
import { formatDayLabel, formatPercent, formatTime, formatWindKmh } from '../../utils/format'
import { BORTLE_LABELS } from '../../lib/bortle'
import { IconClose, IconTelescope } from '../icons/Icons.jsx'

const RING_COLOR = {
  good: 'text-sky-good border-sky-good',
  okay: 'text-sky-okay border-sky-okay',
  bad: 'text-sky-bad border-sky-bad',
}

export default function ForecastDayModal({ night, onClose }) {
  return createPortal(
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-night-bg animate-fade-in-up" onClick={onClose} />
      <div className="relative w-full max-w-md bg-night-surface border border-night-border rounded-2xl p-5 shadow-lg shadow-black/20 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-white transition-colors text-lg leading-none"
          aria-label="Fermer"
        >
          <IconClose size={18} />
        </button>

        <p className="text-sm text-muted capitalize mb-1">{formatDayLabel(night.date)}</p>
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${RING_COLOR[night.rating.level]}`}>
            <span className="text-xl font-display font-semibold">{night.score}</span>
          </div>
          <div>
            <p className={`font-medium ${RING_COLOR[night.rating.level].split(' ')[0]}`}>Conditions {night.rating.label.toLowerCase()}</p>
            <p className="text-xs text-muted">
              Nuit du {formatTime(night.nightStart)} au {formatTime(night.nightEnd)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <Row label="Couverture nuageuse" value={formatPercent(night.avgCloudCover)} />
          <Row label="Humidité" value={formatPercent(night.avgHumidity)} />
          <Row label="Vent" value={formatWindKmh(night.avgWind)} />
          <Row label="Pollution lumineuse" value={`Bortle ${night.bortle} · ${BORTLE_LABELS[night.bortle]}`} span />
          <Row label="Lune" value={`${night.moon.phaseName} · ${night.moon.illuminationPercent}%`} span />
        </div>

        {night.clearWindow ? (
          <p className="flex items-center gap-2 text-sm bg-night-bg border border-night-border rounded-lg px-3 py-2">
            <IconTelescope size={16} className="text-brand-light flex-shrink-0" />
            Meilleure fenêtre : <span className="text-brand-light font-medium">{formatTime(night.clearWindow.start)}–{formatTime(night.clearWindow.end)}</span>
          </p>
        ) : (
          <p className="text-sm text-muted bg-night-bg border border-night-border rounded-lg px-3 py-2">
            Pas de créneau suffisamment dégagé cette nuit-là.
          </p>
        )}
      </div>
    </div>,
    document.body
  )
}

function Row({ label, value, span }) {
  return (
    <div className={`flex justify-between border-b border-night-border/60 py-1.5 ${span ? 'col-span-2' : ''}`}>
      <span className="text-muted">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}
