export function formatTime(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date)
}

export function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return `${Math.round(value)}%`
}

export function formatTemp(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return `${Math.round(value)}°C`
}

export function formatWindKmh(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return `${Math.round(value)} km/h`
}

export function formatDayLabel(date) {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(date)
}

const VOWEL_DIRECTIONS = new Set(['E', 'O'])

/** "au N", "au SE", but "à l'E" / "à l'O" — French elides "au" before a vowel-sounding direction. */
export function formatDirectionPhrase(direction) {
  return VOWEL_DIRECTIONS.has(direction) ? `à l'${direction}` : `au ${direction}`
}
