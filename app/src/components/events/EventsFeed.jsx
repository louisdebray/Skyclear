import { useState } from 'react'
import MeteorShowerAlert from './MeteorShowerAlert.jsx'
import PlanetVisibility from './PlanetVisibility.jsx'
import MilkyWayFinder from './MilkyWayFinder.jsx'
import DeepSkyFinder from './DeepSkyFinder.jsx'
import IssFinder from './IssFinder.jsx'
import SkyMapView from '../compass/SkyMapView.jsx'
import { IconCompass } from '../icons/Icons.jsx'

export default function EventsFeed({ location, currentCloudCover }) {
  const [showMap, setShowMap] = useState(false)

  return (
    <div className="card">
      <div className="pb-5 mb-5 border-b border-night-border flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Maintenant dans le ciel</h2>
        <button
          onClick={() => setShowMap(true)}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-brand-light hover:text-brand transition-colors border border-night-border rounded-full px-3 py-1.5 whitespace-nowrap"
        >
          <IconCompass size={13} />
          Carte du ciel
        </button>
      </div>
      <div className="pb-5 mb-5 border-b border-night-border">
        <MilkyWayFinder location={location} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <MeteorShowerAlert currentCloudCover={currentCloudCover} location={location} />
        <PlanetVisibility location={location} />
      </div>
      <div className="pt-5 mt-5 border-t border-night-border">
        <DeepSkyFinder location={location} />
      </div>
      <div className="pt-5 mt-5 border-t border-night-border">
        <IssFinder location={location} />
      </div>

      {showMap && <SkyMapView location={location} onClose={() => setShowMap(false)} />}
    </div>
  )
}
