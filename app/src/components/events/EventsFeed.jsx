import MeteorShowerAlert from './MeteorShowerAlert.jsx'
import PlanetVisibility from './PlanetVisibility.jsx'
import MilkyWayFinder from './MilkyWayFinder.jsx'

export default function EventsFeed({ location, currentCloudCover }) {
  return (
    <div className="card">
      <div className="pb-5 mb-5 border-b border-night-border">
        <MilkyWayFinder location={location} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <MeteorShowerAlert currentCloudCover={currentCloudCover} location={location} />
        <PlanetVisibility location={location} />
      </div>
    </div>
  )
}
