import { useSyncExternalStore } from 'react'
import { loadPrefs, savePrefs } from '../lib/storage'
import type { Preferences } from '../types'

// Tiny shared store so every component sees the same preferences without a provider.
let current: Preferences | null = loadPrefs()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setPreferences(prefs: Preferences) {
  current = prefs
  savePrefs(prefs)
  listeners.forEach((l) => l())
}

/** The user's questionnaire answers, or null if they haven't filled it in yet. */
export function usePreferences(): Preferences | null {
  return useSyncExternalStore(subscribe, () => current)
}
