import MeteorShowerAlert from './MeteorShowerAlert.jsx'
import PlanetVisibility from './PlanetVisibility.jsx'

export default function EventsFeed({ location, currentCloudCover }) {
  return (
    <div className="card grid md:grid-cols-2 gap-6">
      <MeteorShowerAlert currentCloudCover={currentCloudCover} />
      <PlanetVisibility location={location} />
    </div>
  )
}
