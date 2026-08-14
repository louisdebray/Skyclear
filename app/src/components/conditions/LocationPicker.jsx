import LocationSearchForm from './LocationSearchForm.jsx'

/** Shown when geolocation is denied/unavailable: lets the user type a place name to geocode, or raw coordinates. */
export default function LocationPicker({ onManualLocation, error }) {
  return (
    <div className="card">
      <p className="text-sm text-muted mb-3">{error}</p>
      <LocationSearchForm onLocationFound={onManualLocation} autoFocus />
    </div>
  )
}
