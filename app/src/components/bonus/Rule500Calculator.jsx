import { useMemo, useState } from 'react'
import { computeMaxExposure, CROP_FACTORS } from '../../lib/rule500'

export default function Rule500Calculator() {
  const [focalLength, setFocalLength] = useState(24)
  const [cropFactor, setCropFactor] = useState(CROP_FACTORS[0].value)

  const { rule500, rule300 } = useMemo(() => computeMaxExposure(focalLength || 1, cropFactor), [focalLength, cropFactor])

  return (
    <div className="card">
      <h3 className="font-display text-lg font-semibold mb-1">Règle des 500 / 300</h3>
      <p className="text-xs text-muted mb-4">Temps de pose max avant filé d'étoiles.</p>

      <div className="flex flex-col gap-3 mb-4">
        <label className="text-sm">
          <span className="text-muted block mb-1">Focale (mm)</span>
          <input
            type="number"
            min="1"
            value={focalLength}
            onChange={(e) => setFocalLength(parseFloat(e.target.value) || 0)}
            className="w-full bg-night-bg border border-night-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm">
          <span className="text-muted block mb-1">Capteur</span>
          <select
            value={cropFactor}
            onChange={(e) => setCropFactor(parseFloat(e.target.value))}
            className="w-full bg-night-bg border border-night-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
          >
            {CROP_FACTORS.map((c) => (
              <option key={c.label} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-night-bg border border-night-border rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-muted">Règle des 500</p>
          <p className="text-xl font-display font-semibold text-brand-light">{rule500.toFixed(1)}s</p>
        </div>
        <div className="bg-night-bg border border-night-border rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-muted">Règle des 300 (stricte)</p>
          <p className="text-xl font-display font-semibold text-brand-light">{rule300.toFixed(1)}s</p>
        </div>
      </div>
    </div>
  )
}
