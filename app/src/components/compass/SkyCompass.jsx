import { createPortal } from 'react-dom'
import { useDeviceHeading } from '../../hooks/useDeviceHeading'
import { IconClose, IconCompass } from '../icons/Icons.jsx'

const AZIMUTH_TOLERANCE_DEG = 12
const ELEVATION_TOLERANCE_DEG = 8

/** Signed angular difference (-180..180) from `a` to `b`, in degrees. */
function angleDiff(a, b) {
  return ((((b - a) % 360) + 540) % 360) - 180
}

/** Maps an angle in [-90, 90] (nadir..zenith) to a 0-100% position from the bottom of a vertical gauge. */
function elevationToPercent(deg) {
  return ((Math.max(-90, Math.min(90, deg)) + 90) / 180) * 100
}

/**
 * Full-screen live compass: rotates a dial under a fixed "you're facing this way" pointer for
 * azimuth, plus a vertical gauge for elevation (how high to tilt the phone) — when both line up,
 * the device is pointed straight at the target. Works for anything with a fixed or momentary
 * position: planets, the moon, a meteor shower's radiant, etc.
 */
export default function SkyCompass({ label, azimuthDeg, altitudeDeg, onClose }) {
  const { heading, elevation, supported, needsPermission, permissionDenied, requestPermission } = useDeviceHeading()

  const belowHorizon = altitudeDeg != null && altitudeDeg <= 0
  const azimuthAligned = heading != null && Math.abs(angleDiff(heading, azimuthDeg)) <= AZIMUTH_TOLERANCE_DEG
  const elevationAligned =
    elevation != null && altitudeDeg != null && Math.abs(elevation - altitudeDeg) <= ELEVATION_TOLERANCE_DEG
  const hasElevation = elevation != null && altitudeDeg != null
  const fullyAligned = azimuthAligned && (!hasElevation || elevationAligned)

  let instructions
  if (belowHorizon) {
    instructions = "Pointe où sera le repère — il n'est pas encore visible"
  } else if (fullyAligned) {
    instructions = 'Pile dessus !'
  } else if (!azimuthAligned && hasElevation && !elevationAligned) {
    instructions = 'Tourne-toi et ajuste la hauteur du téléphone'
  } else if (!azimuthAligned) {
    instructions = "Tourne-toi jusqu'à ce que le repère s'aligne en haut"
  } else if (hasElevation && elevation < altitudeDeg) {
    instructions = 'Lève un peu plus le téléphone'
  } else {
    instructions = 'Baisse un peu le téléphone'
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-night-bg flex flex-col items-center px-6 py-8" role="dialog" aria-modal="true">
      <div className="w-full flex items-center justify-between mb-6">
        <div>
          <p className="font-display text-lg font-semibold">{label}</p>
          {altitudeDeg != null && (
            <p className="text-xs text-muted">
              {belowHorizon ? 'Sous l\'horizon actuellement' : `${Math.round(altitudeDeg)}° au-dessus de l'horizon`}
            </p>
          )}
        </div>
        <button onClick={onClose} className="text-muted hover:text-white transition-colors" aria-label="Fermer">
          <IconClose size={22} />
        </button>
      </div>

      {!supported && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 max-w-xs">
          <IconCompass size={40} className="text-muted" />
          <p className="text-sm text-muted">
            La boussole n'est pas disponible sur cet appareil (fonctionne sur mobile, pas sur ordinateur).
          </p>
        </div>
      )}

      {supported && needsPermission && !permissionDenied && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 max-w-xs">
          <IconCompass size={40} className="text-brand-light" />
          <p className="text-sm text-muted">L'accès aux capteurs d'orientation doit être autorisé.</p>
          <button onClick={requestPermission} className="px-4 py-2 rounded-lg bg-brand text-night-bg text-sm font-medium">
            Activer la boussole
          </button>
        </div>
      )}

      {supported && permissionDenied && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 max-w-xs">
          <p className="text-sm text-sky-bad">Accès aux capteurs refusé. Autorise-le dans les réglages de ton navigateur.</p>
        </div>
      )}

      {supported && !needsPermission && !permissionDenied && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-56 h-56 flex-shrink-0">
              {/* Fixed pointer: represents where the phone is physically facing */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                <div
                  className={`w-0 h-0 border-l-8 border-r-8 border-b-[14px] border-l-transparent border-r-transparent ${
                    azimuthAligned ? 'border-b-sky-good' : 'border-b-brand-light'
                  }`}
                />
              </div>

              <div
                className={`relative w-56 h-56 rounded-full border-2 transition-colors duration-300 ${azimuthAligned ? 'border-sky-good' : 'border-night-border'}`}
                style={{ transform: heading != null ? `rotate(${-heading}deg)` : undefined, transition: 'transform 0.15s linear' }}
              >
                {['N', 'E', 'S', 'O'].map((dir, i) => (
                  <span
                    key={dir}
                    className="absolute text-xs text-muted font-medium"
                    style={{
                      top: i === 0 ? '20px' : i === 2 ? undefined : '50%',
                      bottom: i === 2 ? '20px' : undefined,
                      left: i === 3 ? '8px' : i === 1 ? undefined : '50%',
                      right: i === 1 ? '8px' : undefined,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {dir}
                  </span>
                ))}

                {/* Target marker, positioned at its azimuth on the dial */}
                <div className="absolute inset-0" style={{ transform: `rotate(${azimuthDeg}deg)` }}>
                  <div
                    className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center ${
                      belowHorizon ? 'bg-night-border' : azimuthAligned ? 'bg-sky-good' : 'bg-brand'
                    }`}
                  >
                    <span className="text-[10px] text-night-bg font-bold">★</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Elevation gauge: vertical bar from nadir (bottom) to zenith (top), horizon marked at mid-height */}
            {hasElevation && (
              <div className="relative w-10 h-56 flex-shrink-0">
                <div className="absolute inset-x-3 top-0 bottom-0 rounded-full border border-night-border bg-night-surface" />
                <div className="absolute left-0 right-0 h-px bg-night-border" style={{ bottom: '50%' }} />
                <span className="absolute -right-1 text-[9px] text-muted" style={{ bottom: 'calc(50% - 4px)' }}>
                  0°
                </span>
                <span className="absolute -right-1 top-0 text-[9px] text-muted">90°</span>

                {/* Target altitude, fixed */}
                <div
                  className="absolute inset-x-2 h-1 rounded-full bg-brand"
                  style={{ bottom: `calc(${elevationToPercent(altitudeDeg)}% - 2px)` }}
                />

                {/* Current phone tilt, live */}
                <div
                  className={`absolute inset-x-1 h-2 rounded-full transition-colors duration-300 ${elevationAligned ? 'bg-sky-good' : 'bg-brand-light'}`}
                  style={{ bottom: `calc(${elevationToPercent(elevation)}% - 4px)`, transition: 'bottom 0.15s linear' }}
                />
              </div>
            )}
          </div>

          <p className={`text-center font-medium max-w-xs ${fullyAligned ? 'text-sky-good' : 'text-muted'}`}>{instructions}</p>
        </div>
      )}
    </div>,
    document.body
  )
}
