import type { Preferences } from '../types'
import { isPreferences } from './storage'
import { supabase } from './supabase'

const SETUP_HINT = 'Did you run supabase/schema.sql in the Supabase SQL Editor?'

/** The user's saved answers from Supabase, or null if they have none yet. */
export async function fetchRemotePrefs(userId: string): Promise<Preferences | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('preferences')
    .select('categories, vibe')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(`Loading preferences failed: ${error.message}. ${SETUP_HINT}`)
  // Keep only the answer fields (never store ids/timestamps locally).
  return isPreferences(data) ? { categories: data.categories, vibe: data.vibe } : null
}

/** Insert or update the user's row. */
export async function saveRemotePrefs(userId: string, prefs: Preferences): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('preferences')
    .upsert({ user_id: userId, categories: prefs.categories, vibe: prefs.vibe, updated_at: new Date().toISOString() })
  if (error) throw new Error(`Saving preferences failed: ${error.message}. ${SETUP_HINT}`)
}
