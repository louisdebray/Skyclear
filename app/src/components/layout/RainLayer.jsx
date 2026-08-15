import { useMemo } from 'react'

/** Falling rain streaks, shown whenever the current conditions indicate rain. */
export default function RainLayer({ visible }) {
  const drops = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: seededRandom(i) * 100,
        duration: 0.5 + seededRandom(i + 100) * 0.4,
        delay: seededRandom(i + 200) * 2,
        length: 12 + seededRandom(i + 300) * 14,
      })),
    []
  )

  if (!visible) return null

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {drops.map((drop) => (
        <span
          key={drop.id}
          className="absolute top-[-5%] w-px bg-brand-light/40 animate-fall-rain"
          style={{
            left: `${drop.left}%`,
            height: `${drop.length}px`,
            animationDuration: `${drop.duration}s`,
            animationDelay: `${drop.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}
