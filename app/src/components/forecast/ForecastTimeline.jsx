import { useMemo, useState } from 'react'
import { computeForecast } from '../../lib/forecast'
import ForecastDayCard from './ForecastDayCard.jsx'
import ForecastDayModal from './ForecastDayModal.jsx'

export default function ForecastTimeline({ location, weather }) {
  const [selectedNight, setSelectedNight] = useState(null)

  const nights = useMemo(
    () => computeForecast(weather, location.latitude, location.longitude, 15),
    [weather, location.latitude, location.longitude]
  )

  const bestScore = useMemo(() => Math.max(...nights.map((n) => n.score)), [nights])

  if (!nights.length) return null

  return (
    <div className="card">
      <h2 className="font-display text-lg font-semibold mb-4">Prévisions 15 jours</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1.5 -mx-1 px-1 -mt-1.5">
        {nights.map((night) => (
          <ForecastDayCard
            key={night.date.toISOString()}
            night={night}
            isBest={night.score === bestScore && bestScore >= 70}
            onClick={() => setSelectedNight(night)}
          />
        ))}
      </div>
      {selectedNight && <ForecastDayModal night={selectedNight} onClose={() => setSelectedNight(null)} />}
    </div>
  )
}
