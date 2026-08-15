import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useDeviceHeading } from '../../hooks/useDeviceHeading'
import { useBackCamera } from '../../hooks/useBackCamera'
import { getVisibleSkyTargets } from '../../lib/skyMap'
import { IconClose } from '../icons/Icons.jsx'
import ARSkyMap from './ARSkyMap.jsx'

/**
 * All-in-one AR sky map: every currently-visible target (planets, moon, deep-sky objects, active
 * meteor radiants) overlaid live on the camera feed at once, each labeled — for "what's up there
 * right now" browsing, as opposed to SkyCompass's one-target aiming aid.
 */
export default function SkyMapView({ location, onClose }) {
  const { heading, elevation, supported, needsPermission, permissionDenied, requestPermission } = useDeviceHeading()
  const camera = useBackCamera()

  const targets = useMemo(() => getVisibleSkyTargets(new Date(), location.latitude, location.longitude), [location])

  return createPortal(
    <div className="fixed inset-0 z-50 bg-night-bg flex flex-col items-center px-4 py-6" role="dialog" aria-modal="true">
      <div className="w-full flex items-center justify-between mb-4">
        <p className="font-display text-lg font-semibold">Carte du ciel</p>
        <button onClick={onClose} className="text-muted hover:text-white transition-colors" aria-label="Fermer">
          <IconClose size={22} />
        </button>
      </div>

      {(!supported || !camera.supported) && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 max-w-xs">
          <p className="text-sm text-muted">
            La carte du ciel a besoin de la boussole et de la caméra — non disponibles sur cet appareil (fonctionne
            sur mobile, pas sur ordinateur).
          </p>
        </div>
      )}

      {supported && camera.supported && needsPermission && !permissionDenied && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 max-w-xs">
          <p className="text-sm text-muted">L'accès aux capteurs d'orientation doit être autorisé.</p>
          <button onClick={requestPermission} className="px-4 py-2 rounded-lg bg-brand text-night-bg text-sm font-medium">
            Activer la boussole
          </button>
        </div>
      )}

      {supported && camera.supported && permissionDenied && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 max-w-xs">
          <p className="text-sm text-sky-bad">Accès aux capteurs refusé. Autorise-le dans les réglages de ton navigateur.</p>
        </div>
      )}

      {supported && camera.supported && !needsPermission && !permissionDenied && (
        <>
          {!camera.stream ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 max-w-xs">
              <p className="text-sm text-muted">
                {targets.length > 0
                  ? `${targets.length} repère${targets.length > 1 ? 's' : ''} visible${targets.length > 1 ? 's' : ''} en ce moment.`
                  : 'Rien de visible dans le ciel pour le moment.'}{' '}
                Balaye le ciel avec la caméra pour les repérer.
              </p>
              <button
                onClick={camera.requestCamera}
                disabled={camera.requesting}
                className="px-4 py-2 rounded-lg bg-brand text-night-bg text-sm font-medium disabled:opacity-50"
              >
                {camera.requesting ? 'Ouverture…' : 'Activer la caméra'}
              </button>
            </div>
          ) : (
            <ARSkyMap stream={camera.stream} heading={heading} elevation={elevation} targets={targets} />
          )}
        </>
      )}
    </div>,
    document.body
  )
}
