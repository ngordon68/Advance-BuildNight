import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// null when .env.local is missing, so the app can show an error instead of crashing.
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export async function fetchRecentChecks(deviceId) {
  if (!supabase) throw new Error('Supabase is not configured. Check .env.local.')
  const { data, error } = await supabase
    .from('checks')
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) throw error
  return data
}
