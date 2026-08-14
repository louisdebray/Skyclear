import { useEffect, useRef, useState } from 'react'

const DEFAULT_HFOV_DEG = 62 // typical rear-camera horizontal field of view on a phone

/** Signed shortest difference (-180..180) from `a` to `b`, in degrees. */
function angleDelta(a, b) {
  return ((((b - a) % 360) + 540) % 360) - 180
}

const KIND_COLORS = {
  planet: 'bg-brand/80 border-brand-light',
  moon: 'bg-slate-200/90 border-white',
  'deep-sky': 'bg-sky-good/80 border-sky-good',
  meteor: 'bg-amber-400/80 border-amber-200',
}

/**
 * Same camera pass-through + angular-offset projection as ARSkyView, but for every visible
 * target at once instead of a single one — a live labeled map of the sky rather than an aiming
 * aid for one thing. Off-screen targets aren't shown (unlike the single-target view, there's no
 * single "here, turn this way" edge indicator that would make sense for a whole list at once).
 */
export default function ARSkyMap({ stream, heading, elevation, targets }) {
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

  const hasOrientation = heading != null && elevation != null
  const hfov = DEFAULT_HFOV_DEG
  const vfov = videoSize.width ? hfov * (videoSize.height / videoSize.width) : hfov * 1.3

  const points = hasOrientation
    ? targets
        .map((target) => {
          const azOffset = angleDelta(heading, target.azimuth)
          const elOffset = target.altitude - elevation
          const onScreenX = videoSize.width / 2 + (azOffset / (hfov / 2)) * (videoSize.width / 2)
          const onScreenY = videoSize.height / 2 - (elOffset / (vfov / 2)) * (videoSize.height / 2)
          const visible = Math.abs(azOffset) <= hfov / 2 && Math.abs(elOffset) <= vfov / 2
          return { ...target, onScreenX, onScreenY, visible }
        })
        .filter((p) => p.visible)
    : []

  return (
    <div className="relative w-full flex-1 rounded-2xl overflow-hidden bg-black">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline autoPlay />

      {points.map((point) => (
        <div
          key={point.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none"
          style={{ left: point.onScreenX, top: point.onScreenY }}
        >
          <div className={`w-4 h-4 rounded-full border-2 ${KIND_COLORS[point.kind] ?? KIND_COLORS.planet}`} />
          <span className="text-[11px] text-white font-medium bg-black/60 px-1.5 py-0.5 rounded whitespace-nowrap">
            {point.label}
          </span>
        </div>
      ))}

      {hasOrientation && points.length === 0 && (
        <div className="absolute inset-x-0 bottom-4 text-center">
          <p className="text-sm text-white bg-black/60 inline-block px-3 py-1.5 rounded-full">
            Rien dans cette direction — tourne-toi pour explorer le ciel
          </p>
        </div>
      )}
    </div>
  )
}
