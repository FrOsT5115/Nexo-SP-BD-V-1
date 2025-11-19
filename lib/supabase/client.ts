// ============================================
// Supabase Client Configuration
// ============================================

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[v0] Supabase environment variables are missing!')
    console.error('[v0] Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    // Return a mock client to prevent crashes
    return null as any
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
