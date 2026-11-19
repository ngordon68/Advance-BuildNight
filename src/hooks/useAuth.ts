import type { User } from '@supabase/supabase-js'
import { useSyncExternalStore } from 'react'
import { supabase } from '../lib/supabase'

export type AuthState = {
  /** False until Supabase has restored any saved session. */
  ready: boolean
  user: User | null
  configured: boolean
}

// Shared store fed by Supabase's auth events, so every component agrees on who's signed in.
let state: AuthState = { ready: !supabase, user: null, configured: !!supabase }
const listeners = new Set<() => void>()

function set(next: Partial<AuthState>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

// INITIAL_SESSION fires once with the restored session (or null), then on every change.
// Keep this callback synchronous: awaiting other auth calls inside it can deadlock.
supabase?.auth.onAuthStateChange((_event, session) => set({ ready: true, user: session?.user ?? null }))

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, () => state)
}

const NOT_CONFIGURED = 'Sign-in isn’t set up yet (Supabase keys missing from .env.local).'

/**
 * Browsers report unreachable servers vaguely ("Load failed" in Safari, "Failed to fetch"
 * in Chrome, "NetworkError…" in Firefox). Turn that into something actionable.
 */
function friendly(message: string): string {
  if (/load failed|failed to fetch|networkerror|network request failed/i.test(message)) {
    return 'Couldn’t reach Supabase. Check VITE_SUPABASE_URL in .env.local, that your project isn’t paused, and your internet connection.'
  }
  return message
}

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: NOT_CONFIGURED }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error: error ? friendly(error.message) : null }
}

export type SignUpResult = { error: string | null; needsConfirmation: boolean }

export async function signUp(email: string, password: string): Promise<SignUpResult> {
  if (!supabase) return { error: NOT_CONFIGURED, needsConfirmation: false }
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: friendly(error.message), needsConfirmation: false }
  // With email confirmation on, signing up an existing address returns a user with no identities.
  if (data.user && data.user.identities?.length === 0) {
    return { error: 'An account with this email already exists. Try signing in.', needsConfirmation: false }
  }
  return { error: null, needsConfirmation: !data.session }
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut()
}
