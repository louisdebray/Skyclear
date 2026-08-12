/**
 * A textured moon sphere (base disk + craters) with a translucent shadow sliding across it to
 * represent the current phase — the dark side stays dimly visible instead of vanishing into the
 * background, and craters keep showing through so it always reads as "the moon", not a flat dot.
 */
export default function MoonPhaseIcon({ illuminationFraction, phase, size = 40 }) {
  const waxing = phase < 0.5
  const offset = illuminationFraction * size * (waxing ? 1 : -1)
  const clipId = 'moon-clip'
  const gradId = 'moon-surface'

  const craters = [
    { cx: 0.32, cy: 0.28, r: 0.09 },
    { cx: 0.62, cy: 0.22, r: 0.06 },
    { cx: 0.7, cy: 0.5, r: 0.1 },
    { cx: 0.4, cy: 0.6, r: 0.07 },
    { cx: 0.55, cy: 0.72, r: 0.05 },
    { cx: 0.25, cy: 0.55, r: 0.045 },
  ]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#fdf9ec" />
          <stop offset="100%" stopColor="#c9c2ac" />
        </radialGradient>
        <clipPath id={clipId}>
          <circle cx={size / 2} cy={size / 2} r={size / 2} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width={size} height={size} fill={`url(#${gradId})`} />
        {craters.map((c, i) => (
          <circle key={i} cx={c.cx * size} cy={c.cy * size} r={c.r * size} fill="#8f8973" opacity="0.35" />
        ))}
        <circle cx={size / 2 - offset} cy={size / 2} r={size / 2} fill="#141824" fillOpacity="0.82" />
      </g>
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 0.5} fill="none" stroke="#1f3252" strokeWidth="1" />
    </svg>
  )
}
