import { TARGETS } from '../../hooks/useTarget'

/** Segmented control: what the user wants to photograph tonight — drives the whole scoring logic. */
export default function TargetSelector({ target, onChange }) {
  return (
    <div className="card py-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted uppercase tracking-wide mr-1">Je veux photographier</span>
        <div className="flex gap-1.5 flex-wrap">
          {TARGETS.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              title={t.description}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                target === t.id
                  ? 'bg-brand text-night-bg'
                  : 'bg-night-bg text-muted border border-night-border hover:border-brand-dark'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
