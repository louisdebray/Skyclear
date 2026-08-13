import { formatPercent, formatTemp, formatWindKmh } from '../../utils/format'
import { dewPointRisk } from '../../lib/weather'

const RISK_LABEL = {
  low: { label: 'Faible', color: 'text-sky-good' },
  medium: { label: 'Modéré', color: 'text-sky-okay' },
  high: { label: 'Élevé', color: 'text-sky-bad' },
  unknown: { label: '—', color: 'text-muted' },
}

export default function WeatherDetails({ current }) {
  const risk = RISK_LABEL[dewPointRisk(current.temperature, current.dewPoint)]

  const rows = [
    { label: 'Couverture nuageuse', value: formatPercent(current.cloudCover) },
    { label: 'Pluie', value: current.precipitation > 0 ? `${current.precipitation.toFixed(1)} mm` : 'Aucune' },
    { label: 'Humidité', value: formatPercent(current.humidity) },
    { label: 'Vent', value: formatWindKmh(current.windSpeed) },
    { label: 'Température', value: formatTemp(current.temperature) },
    { label: 'Point de rosée', value: formatTemp(current.dewPoint) },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between border-b border-night-border/60 py-1.5">
          <span className="text-muted">{row.label}</span>
          <span className="font-medium">{row.value}</span>
        </div>
      ))}
      <div className="flex justify-between border-b border-night-border/60 py-1.5 col-span-2">
        <span className="text-muted">Risque de buée sur l'optique</span>
        <span className={`font-medium ${risk.color}`}>{risk.label}</span>
      </div>
    </div>
  )
}
