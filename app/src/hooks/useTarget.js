import { useState } from 'react'
import { readCache, writeCache } from '../utils/cache'

const CACHE_KEY = 'target'

export const TARGETS = [
  { id: 'stars', label: 'Ciel profond', description: 'Étoiles, Voie lactée, nébuleuses' },
  { id: 'moon', label: 'Lune', description: 'Photographie lunaire' },
  { id: 'planets', label: 'Planètes', description: 'Jupiter, Saturne, Mars…' },
]

/** What the user wants to photograph — changes what "good conditions" even means. Persisted. */
export function useTarget() {
  const [target, setTargetState] = useState(() => readCache(CACHE_KEY) ?? 'stars')

  function setTarget(next) {
    setTargetState(next)
    writeCache(CACHE_KEY, next, null)
  }

  return { target, setTarget }
}
