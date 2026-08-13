import { useState } from 'react'
import { searchCities } from '../../lib/geocoding'

/** Geocodes a typed city name (or raw "lat, lon") via Open-Meteo's free geocoding API. */
export default function LocationSearchForm({ onLocationFound, autoFocus }) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [results, setResults] = useState([])

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    const coordMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/)
    if (coordMatch) {
      onLocationFound(parseFloat(coordMatch[1]), parseFloat(coordMatch[2]), 'Coordonnées saisies')
      return
    }

    setSearching(true)
    setSearchError(null)
    setResults([])
    try {
      const found = await searchCities(trimmed)
      if (!found.length) {
        setSearchError('Ville introuvable. Essaie un autre nom ou des coordonnées (lat, lon).')
        return
      }
      setResults(found)
    } catch {
      setSearchError('Recherche impossible pour le moment.')
    } finally {
      setSearching(false)
    }
  }

  function handlePick(match) {
    const parts = [match.name, match.admin1, match.country].filter(Boolean)
    onLocationFound(match.latitude, match.longitude, parts.join(', '), match.population ?? 0)
    setResults([])
    setQuery('')
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ville (ex: Lyon) ou coordonnées (45.76, 4.83)"
          className="w-full bg-night-bg border border-night-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={searching}
          className="w-full px-4 py-2 rounded-lg bg-brand text-night-bg text-sm font-medium disabled:opacity-50"
        >
          {searching ? 'Recherche…' : 'Valider'}
        </button>
      </form>

      {searchError && <p className="text-sm text-sky-bad mt-2">{searchError}</p>}

      {results.length > 0 && (
        <div className="flex flex-col gap-1 mt-2 max-h-48 overflow-y-auto">
          {results.map((match) => (
            <button
              key={`${match.id ?? `${match.latitude},${match.longitude}`}`}
              onClick={() => handlePick(match)}
              className="text-left text-sm px-3 py-2 rounded-lg hover:bg-night-bg border border-transparent hover:border-night-border transition-colors"
            >
              <span className="font-medium">
                {match.name}
                {match.postcodes?.[0] && <span className="text-muted font-normal"> ({match.postcodes[0]})</span>}
              </span>
              <span className="text-muted">
                {[match.admin1, match.country].filter(Boolean).length > 0 && ' · '}
                {[match.admin1, match.country].filter(Boolean).join(', ')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
