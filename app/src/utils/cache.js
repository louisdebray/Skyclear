const PREFIX = 'skyclear:'

export function readCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const { value, expiresAt } = JSON.parse(raw)
    if (expiresAt && Date.now() > expiresAt) {
      localStorage.removeItem(PREFIX + key)
      return null
    }
    return value
  } catch {
    return null
  }
}

export function writeCache(key, value, ttlMs) {
  try {
    const expiresAt = ttlMs ? Date.now() + ttlMs : null
    localStorage.setItem(PREFIX + key, JSON.stringify({ value, expiresAt }))
  } catch {
    // localStorage full or unavailable — fail silently, caching is best-effort
  }
}

export function removeCache(key) {
  localStorage.removeItem(PREFIX + key)
}

export const ONE_HOUR_MS = 60 * 60 * 1000
