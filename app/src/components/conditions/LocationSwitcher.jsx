import { useState } from 'react'
import LocationSearchForm from './LocationSearchForm.jsx'
import { IconPin, IconCompass } from '../icons/Icons.jsx'

/** Clickable location label that opens a popover to search another city or snap back to device geolocation. */
export default function LocationSwitcher({ location, onManualLocation, onUseMyLocation, geoStatus }) {
  const [open, setOpen] = useState(false)

  function handleLocationFound(lat, lon, label) {
    onManualLocation(lat, lon, label)
    setOpen(false)
  }

  function handleUseMyLocation() {
    onUseMyLocation()
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-brand-light transition-colors max-w-full"
      >
        <IconPin size={12} className="flex-shrink-0" />
        <span className="truncate max-w-[160px] sm:max-w-[220px]">{location.label}</span>
        <span className="text-[10px] flex-shrink-0">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 card z-20 shadow-2xl">
            <button
              onClick={handleUseMyLocation}
              disabled={geoStatus === 'locating'}
              className="w-full flex items-center gap-2 text-left text-sm px-3 py-2 rounded-lg bg-night-bg border border-night-border hover:border-brand-dark transition-colors mb-3 disabled:opacity-50"
            >
              <IconCompass size={14} className="text-brand-light flex-shrink-0" />
              {geoStatus === 'locating' ? 'Localisation…' : 'Utiliser ma position actuelle'}
            </button>
            <p className="text-xs text-muted mb-2">Ou choisis une autre ville :</p>
            <LocationSearchForm onLocationFound={handleLocationFound} autoFocus />
          </div>
        </>
      )}
    </div>
  )
}
