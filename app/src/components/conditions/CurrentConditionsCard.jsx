import { useCurrentConditions } from '../../hooks/useCurrentConditions'
import SkyScoreGauge from './SkyScoreGauge.jsx'
import WeatherDetails from './WeatherDetails.jsx'
import MoonWidget from './MoonWidget.jsx'
import BortleBadge from '../lightpollution/BortleBadge.jsx'
import LocationSwitcher from './LocationSwitcher.jsx'
import LocalClock from '../layout/LocalClock.jsx'
import { IconRefresh } from '../icons/Icons.jsx'

export default function CurrentConditionsCard({ location, weather, locationControls, onRefresh, refreshing, target }) {
  const conditions = useCurrentConditions(location, weather, target)
  if (!conditions) return null
  const { moon, moonPosition, bortleInfo, scoreResult, summary } = conditions

  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-y-2 gap-x-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-display text-lg font-semibold whitespace-nowrap">Conditions actuelles</h2>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-brand-light transition-colors disabled:opacity-50 whitespace-nowrap"
            title="Recharger la météo"
          >
            <IconRefresh size={13} spinning={refreshing} />
            Mettre à jour
          </button>
        </div>
        <div className="flex flex-col items-end gap-1 max-w-full">
          <LocationSwitcher location={location} {...locationControls} />
          <LocalClock timezone={weather.timezone} />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <SkyScoreGauge score={scoreResult.score} rating={scoreResult.rating} summary={summary} />
        <WeatherDetails current={weather.current} />
        <div className="flex flex-col gap-4">
          <MoonWidget moon={moon} moonPosition={moonPosition} />
          <BortleBadge bortleInfo={bortleInfo} />
        </div>
      </div>
    </div>
  )
}
