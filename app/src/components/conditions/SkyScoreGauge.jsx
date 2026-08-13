const COLOR = {
  good: { text: 'text-sky-good', stroke: '#3ddc84' },
  okay: { text: 'text-sky-okay', stroke: '#f5b642' },
  bad: { text: 'text-sky-bad', stroke: '#f14c4c' },
}

const SIZE = 128
const STROKE = 8
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function SkyScoreGauge({ score, rating, summary }) {
  const colors = COLOR[rating.level]
  const offset = CIRCUMFERENCE * (1 - score / 100)

  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <div
          className="absolute inset-2 rounded-full blur-xl opacity-40 animate-pulse-glow"
          style={{ backgroundColor: colors.stroke }}
        />
        <svg width={SIZE} height={SIZE} className="-rotate-90 relative">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke="currentColor" strokeWidth={STROKE} fill="none" className="text-night-border" />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.stroke}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            className="animate-score-dash"
            style={{ '--circumference': CIRCUMFERENCE, '--offset': offset }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-display font-semibold">{score}</span>
        </div>
      </div>
      <div>
        <p className={`font-medium ${colors.text}`}>Conditions {rating.label.toLowerCase()}</p>
        <p className="text-sm text-muted mt-1 max-w-xs">{summary}</p>
      </div>
    </div>
  )
}
