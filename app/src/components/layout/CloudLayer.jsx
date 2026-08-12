import { useMemo } from 'react'

/** Slow-drifting cloud silhouettes, visible in proportion to current cloud cover. */
export default function CloudLayer({ cloudCoverPercent }) {
  const clouds = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        top: 5 + seededRandom(i) * 70,
        width: 260 + seededRandom(i + 10) * 220,
        duration: 50 + seededRandom(i + 20) * 60,
        delay: -seededRandom(i + 30) * 60,
        opacity: 0.12 + seededRandom(i + 40) * 0.14,
      })),
    []
  )

  const visibility = Math.min(1, cloudCoverPercent / 70)
  if (visibility <= 0) return null

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-[2000ms]" style={{ opacity: visibility }} aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-500/10 via-transparent to-transparent" />
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute rounded-full bg-slate-300 blur-3xl animate-drift-cloud"
          style={{
            top: `${cloud.top}%`,
            width: `${cloud.width}px`,
            height: `${cloud.width * 0.35}px`,
            opacity: cloud.opacity,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function seededRandom(seed) {
  const x = Math.sin(seed * 13.37) * 10000
  return x - Math.floor(x)
}
