import { useSyncExternalStore } from 'react'
import { fetchRemotePrefs, saveRemotePrefs } from '../lib/remotePrefs'
import { clearPrefs, loadPrefs, savePrefs } from '../lib/storage'
import type { Preferences } from '../types'
import { getAuth, subscribeAuth } from './useAuth'

export type PreferencesState = {
  /** The user's questionnaire answers, or null if they haven't filled it in yet. */
  prefs: Preferences | null
  /** True while a signed-in user's answers are being loaded from Supabase. */
  syncing: boolean
  /** Set when Supabase couldn't be read/written; this device's copy is used instead. */
  syncError: string | null
}

// Shared store so every component sees the same preferences without a provider.
// localStorage always holds a copy (guests, and offline fallback for signed-in users).
let state: PreferencesState = { prefs: loadPrefs(), syncing: false, syncError: null }
const listeners = new Set<() => void>()

function set(next: Partial<PreferencesState>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function reportSyncError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err)
  console.error(message)
  set({ syncing: false, syncError: message })
}

/**
 * When someone signs in: use their saved answers from Supabase if they have any;
 * otherwise upload the answers they gave as a guest on this device.
 */
let syncedUserId: string | null = null
async function syncForUser(userId: string) {
  set({ syncing: true, syncError: null })
  try {
    const remote = await fetchRemotePrefs(userId)
    if (getAuth().user?.id !== userId) return // signed out / switched user meanwhile
    if (remote) {
      savePrefs(remote)
      set({ prefs: remote, syncing: false })
    } else {
      if (state.prefs) await saveRemotePrefs(userId, state.prefs)
      set({ syncing: false })
    }
  } catch (err) {
    reportSyncError(err)
  }
}

function onAuthChanged() {
  const { ready, user } = getAuth()
  if (!ready) return
  const userId = user?.id ?? null
  if (userId === syncedUserId) return // e.g. token refresh: same user, nothing to do
  const signedOut = syncedUserId !== null && userId === null
  syncedUserId = userId
  if (userId) void syncForUser(userId)
  else if (signedOut) {
    // Don't leave this account's answers behind for the next person on a shared device.
    clearPrefs()
    set({ prefs: null, syncing: false, syncError: null })
  }
}
subscribeAuth(onAuthChanged)
onAuthChanged()

/** Save answers locally, and to Supabase when signed in. */
export function setPreferences(prefs: Preferences) {
  savePrefs(prefs)
  set({ prefs, syncError: null })
  const userId = getAuth().user?.id
  if (userId) saveRemotePrefs(userId, prefs).catch(reportSyncError)
}

export function usePreferencesState(): PreferencesState {
  return useSyncExternalStore(subscribe, () => state)
}

/** The user's questionnaire answers, or null if they haven't filled it in yet. */
export function usePreferences(): Preferences | null {
  return usePreferencesState().prefs
}
