import type { Preferences } from '../types'
import { CATEGORY_IDS, VIBE_IDS } from './categories'

const PREFS_KEY = 'nearbygems.prefs'

function isPreferences(value: unknown): value is Preferences {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    Array.isArray(v.categories) &&
    v.categories.length > 0 &&
    v.categories.every((c) => CATEGORY_IDS.includes(c)) &&
    VIBE_IDS.includes(v.vibe as Preferences['vibe'])
  )
}

/** Reads saved preferences; returns null if missing, corrupt, or storage is blocked. */
export function loadPrefs(): Preferences | null {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isPreferences(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Persists preferences; silently ignores storage being unavailable (e.g. private mode). */
export function savePrefs(prefs: Preferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    /* storage unavailable — prefs live in memory for this session only */
  }
}
