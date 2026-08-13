import { useMemo } from 'react'

/** Twinkling starfield behind the app content — fades out as cloud cover increases. */
export default function StarField({ opacity = 1 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        top: Math.round((seededRandom(i) * 100 + Number.EPSILON) * 100) / 100,
        left: Math.round((seededRandom(i + 1000) * 100 + Number.EPSILON) * 100) / 100,
        size: seededRandom(i + 2000) > 0.85 ? 2 : 1,
        delay: (seededRandom(i + 3000) * 6).toFixed(2),
        duration: (3 + seededRandom(i + 4000) * 4).toFixed(2),
      })),
    []
  )

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-deep/30 via-transparent to-transparent" />
      <div className="absolute inset-0 transition-opacity duration-[2000ms]" style={{ opacity }}>
        {stars.map((star) => (
          <span
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

/** Deterministic pseudo-random so the starfield doesn't reshuffle on every render. */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}
