import LocalClock from './LocalClock.jsx'

const RING_COLOR = {
  good: 'border-sky-good text-sky-good',
  okay: 'border-sky-okay text-sky-okay',
  bad: 'border-sky-bad text-sky-bad',
}

/** Compact "at a glance" bar that slides in once the user scrolls past the main header. */
export default function StickyStatusBar({ visible, location, conditions, timezone }) {
  if (!conditions) return null
  const { scoreResult, summary } = conditions

  return (
    <div
      className={`fixed top-0 inset-x-0 z-30 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-night-surface/90 backdrop-blur-md border-b border-night-border">
        <div className="max-w-4xl mx-auto px-4 md:px-10 py-2.5 flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}logo-skyclear.png`} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
          <div
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-display font-semibold ${RING_COLOR[scoreResult.rating.level]}`}
          >
            {scoreResult.score}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{location.label}</p>
            <p className="text-xs text-muted truncate">{summary}</p>
          </div>
          <LocalClock timezone={timezone} compact />
        </div>
      </div>
    </div>
  )
}
