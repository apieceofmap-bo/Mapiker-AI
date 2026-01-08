import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(
    supabaseUrl &&
    supabaseUrl !== 'your_supabase_url_here' &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'your_supabase_anon_key_here'
  )
}

export const createClient = () => {
  if (!isSupabaseConfigured()) {
    // Return a mock client for build time or unconfigured state
    // This prevents build errors when Supabase is not configured
    console.warn('Supabase is not configured. Authentication features will be disabled.')
    return null as any
  }

  return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
}
