import Header from './components/layout/Header.jsx'
import DynamicSky from './components/layout/DynamicSky.jsx'
import StickyStatusBar from './components/layout/StickyStatusBar.jsx'
import LocationPicker from './components/conditions/LocationPicker.jsx'
import CurrentConditionsCard from './components/conditions/CurrentConditionsCard.jsx'
import TargetSelector from './components/conditions/TargetSelector.jsx'
import TonightPreview from './components/forecast/TonightPreview.jsx'
import ForecastTimeline from './components/forecast/ForecastTimeline.jsx'
import EventsFeed from './components/events/EventsFeed.jsx'
import BestNightsOfMonth from './components/bonus/BestNightsOfMonth.jsx'
import Rule500Calculator from './components/bonus/Rule500Calculator.jsx'
import { useGeolocation } from './hooks/useGeolocation'
import { useWeather } from './hooks/useWeather'
import { useCurrentConditions } from './hooks/useCurrentConditions'
import { useScrolled } from './hooks/useScrolled'
import { useIsDaytime } from './hooks/useIsDaytime'
import { useTarget } from './hooks/useTarget'

export default function App() {
  const { location, status, error, requestBrowserLocation, setManualLocation } = useGeolocation()
  const { weather, status: weatherStatus, error: weatherError, refresh } = useWeather(location)
  const { target, setTarget } = useTarget()
  const conditions = useCurrentConditions(location, weather, target)
  const scrolled = useScrolled(180)
  const daytime = useIsDaytime(location)

  const locationControls = {
    onManualLocation: setManualLocation,
    onUseMyLocation: requestBrowserLocation,
    geoStatus: status,
  }

  const cloudCover = weather?.current.cloudCover ?? 0

  return (
    <div className="relative min-h-screen px-4 py-8 md:px-10">
      <DynamicSky isDaytime={daytime} cloudCoverPercent={cloudCover} condition={conditions?.condition} />
      {location && (
        <StickyStatusBar visible={scrolled} location={location} conditions={conditions} timezone={weather?.timezone} />
      )}
      <div className="relative max-w-4xl mx-auto flex flex-col gap-6">
        <Header daytime={daytime} />

        {status === 'manual-required' && !location && (
          <LocationPicker onManualLocation={setManualLocation} error={error} />
        )}

        {status === 'locating' && !location && (
          <div className="card text-muted text-sm animate-pulse">Localisation en cours…</div>
        )}

        {location && (weatherStatus === 'loading' || weatherStatus === 'idle') && (
          <div className="card animate-pulse text-muted text-sm">Récupération des conditions du ciel…</div>
        )}

        {location && weatherStatus === 'error' && <div className="card text-sky-bad text-sm">Erreur météo : {weatherError}</div>}

        {location && weatherStatus === 'resolved' && weather && (
          <>
            <div className="animate-fade-in-up">
              <TargetSelector target={target} onChange={setTarget} />
            </div>
            <div className="animate-fade-in-up">
              <CurrentConditionsCard
                location={location}
                weather={weather}
                locationControls={locationControls}
                onRefresh={refresh}
                refreshing={weatherStatus === 'loading'}
                target={target}
              />
            </div>
            {daytime && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
                <TonightPreview location={location} weather={weather} target={target} />
              </div>
            )}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
              <ForecastTimeline location={location} weather={weather} target={target} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <EventsFeed location={location} currentCloudCover={cloudCover} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.28s' }}>
              <BestNightsOfMonth location={location} weather={weather} target={target} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.34s' }}>
              <Rule500Calculator />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
