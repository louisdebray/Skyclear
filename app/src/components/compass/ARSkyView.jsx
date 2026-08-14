import { useEffect, useRef, useState } from 'react'

const DEFAULT_HFOV_DEG = 62 // typical rear-camera horizontal field of view on a phone

/** Signed shortest difference (-180..180) from `a` to `b`, in degrees. */
function angleDelta(a, b) {
  return ((((b - a) % 360) + 540) % 360) - 180
}

/**
 * Real camera pass-through with the target overlaid at its actual position in the live image —
 * this is what makes aiming intuitive: point the phone's back camera like taking a photo, and
 * the marker sits where the target visually is. No SLAM/ARKit — just the camera feed plus the
 * angular offset (from device heading/tilt to target azimuth/altitude) mapped onto screen pixels
 * using an assumed field of view. Simple, but it's the "how am I supposed to hold this" fix.
 */
export default function ARSkyView({ stream, heading, elevation, azimuthDeg, altitudeDeg, azimuthAligned, elevationAligned }) {
  const videoRef = useRef(null)
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const video = videoRef.current
    if (!video || !stream) return
    video.srcObject = stream
    video.play().catch(() => {})

    function updateSize() {
      setVideoSize({ width: video.clientWidth, height: video.clientHeight })
    }
    video.addEventListener('loadedmetadata', updateSize)
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => {
      video.removeEventListener('loadedmetadata', updateSize)
      window.removeEventListener('resize', updateSize)
    }
  }, [stream])

  const hasPosition = heading != null && elevation != null
  const azOffset = hasPosition ? angleDelta(heading, azimuthDeg) : 0
  const elOffset = hasPosition ? altitudeDeg - elevation : 0

  const hfov = DEFAULT_HFOV_DEG
  const vfov = videoSize.width ? hfov * (videoSize.height / videoSize.width) : hfov * 1.3

  const onScreenX = hasPosition ? videoSize.width / 2 + (azOffset / (hfov / 2)) * (videoSize.width / 2) : null
  const onScreenY = hasPosition ? videoSize.height / 2 - (elOffset / (vfov / 2)) * (videoSize.height / 2) : null

  const withinHorizontal = Math.abs(azOffset) <= hfov / 2
  const withinVertical = Math.abs(elOffset) <= vfov / 2
  const markerVisible = withinHorizontal && withinVertical
  const aligned = azimuthAligned && elevationAligned
  const belowHorizon = altitudeDeg != null && altitudeDeg <= 0

  return (
    <div className="relative w-full flex-1 rounded-2xl overflow-hidden bg-black">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline autoPlay />

      {/* Fixed center crosshair — where the camera (and phone) is actually pointed */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/50" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/50" />
      </div>

      {!belowHorizon && markerVisible && onScreenX != null && (
        <div
          className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
            aligned ? 'bg-sky-good/90 border-sky-good' : 'bg-brand/80 border-brand-light'
          }`}
          style={{ left: onScreenX, top: onScreenY }}
        >
          <span className="text-night-bg font-bold">★</span>
        </div>
      )}

      {!belowHorizon && !markerVisible && hasPosition && (
        <div
          className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-brand/80 border-2 border-brand-light flex items-center justify-center text-night-bg font-bold text-lg"
          style={{ left: azOffset > 0 ? 'calc(100% - 32px)' : '8px' }}
        >
          {azOffset > 0 ? '›' : '‹'}
        </div>
      )}

      {belowHorizon && (
        <div className="absolute inset-x-0 bottom-4 text-center">
          <p className="text-sm text-white bg-black/60 inline-block px-3 py-1.5 rounded-full">
            Sous l'horizon — pas encore visible
          </p>
        </div>
      )}
    </div>
  )
}
