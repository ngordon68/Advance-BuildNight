import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

/** Values copied from .env.example that were never filled in. */
const isPlaceholder = (v: string) => v.includes('your-project-ref') || v.includes('your-anon-public-key')

const configured = !!url && !!anonKey && !isPlaceholder(url) && !isPlaceholder(anonKey)

/**
 * Supabase client, or null when .env.local isn't filled in. Without it the app still
 * works for guests; sign-in shows a "not set up" message.
 */
export const supabase: SupabaseClient | null = configured ? createClient(url, anonKey) : null

if (!supabase) {
  console.warn('Supabase is not configured: fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
}
