import { useCurrentConditions } from '../../hooks/useCurrentConditions'
import SkyScoreGauge from './SkyScoreGauge.jsx'
import WeatherDetails from './WeatherDetails.jsx'
import MoonWidget from './MoonWidget.jsx'
import BortleBadge from '../lightpollution/BortleBadge.jsx'
import LocationSwitcher from './LocationSwitcher.jsx'
import LocalClock from '../layout/LocalClock.jsx'

export default function CurrentConditionsCard({ location, weather, locationControls }) {
  const conditions = useCurrentConditions(location, weather)
  if (!conditions) return null
  const { moon, bortleInfo, scoreResult, summary } = conditions

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold">Conditions actuelles</h2>
        <div className="flex flex-col items-end gap-1">
          <LocationSwitcher location={location} {...locationControls} />
          <LocalClock timezone={weather.timezone} />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <SkyScoreGauge score={scoreResult.score} rating={scoreResult.rating} summary={summary} />
        <WeatherDetails current={weather.current} />
        <div className="flex flex-col gap-4">
          <MoonWidget moon={moon} />
          <BortleBadge bortleInfo={bortleInfo} />
        </div>
      </div>
    </div>
  )
}
