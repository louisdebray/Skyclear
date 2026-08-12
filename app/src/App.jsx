import Header from './components/layout/Header.jsx'
import StarField from './components/layout/StarField.jsx'
import CloudLayer from './components/layout/CloudLayer.jsx'
import StickyStatusBar from './components/layout/StickyStatusBar.jsx'
import LocationPicker from './components/conditions/LocationPicker.jsx'
import CurrentConditionsCard from './components/conditions/CurrentConditionsCard.jsx'
import ForecastTimeline from './components/forecast/ForecastTimeline.jsx'
import EventsFeed from './components/events/EventsFeed.jsx'
import BestNightsOfMonth from './components/bonus/BestNightsOfMonth.jsx'
import Rule500Calculator from './components/bonus/Rule500Calculator.jsx'
import { useGeolocation } from './hooks/useGeolocation'
import { useWeather } from './hooks/useWeather'
import { useCurrentConditions } from './hooks/useCurrentConditions'
import { useScrolled } from './hooks/useScrolled'

export default function App() {
  const { location, status, error, requestBrowserLocation, setManualLocation } = useGeolocation()
  const { weather, status: weatherStatus, error: weatherError } = useWeather(location)
  const conditions = useCurrentConditions(location, weather)
  const scrolled = useScrolled(180)

  const locationControls = {
    onManualLocation: setManualLocation,
    onUseMyLocation: requestBrowserLocation,
    geoStatus: status,
  }

  const cloudCover = weather?.current.cloudCover ?? 0
  const starOpacity = 1 - Math.min(1, cloudCover / 90) * 0.85

  return (
    <div className="relative min-h-screen px-4 py-8 md:px-10">
      <StarField opacity={starOpacity} />
      <CloudLayer cloudCoverPercent={cloudCover} />
      {location && (
        <StickyStatusBar visible={scrolled} location={location} conditions={conditions} timezone={weather?.timezone} />
      )}
      <div className="relative max-w-4xl mx-auto flex flex-col gap-6">
        <Header />

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
              <CurrentConditionsCard location={location} weather={weather} locationControls={locationControls} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
              <ForecastTimeline location={location} weather={weather} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <EventsFeed location={location} currentCloudCover={cloudCover} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.28s' }}>
              <BestNightsOfMonth location={location} weather={weather} />
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
