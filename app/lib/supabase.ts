import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anon)

let browserClient: SupabaseClient | null = null

/** Browser client with anon key (RLS applies). Singleton for auth session. */
export function createBrowserClient(): SupabaseClient | null {
  if (!url || !anon) return null
  if (typeof window !== 'undefined') {
    if (!browserClient) {
      browserClient = createClient(url, anon, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    }
    return browserClient
  }
  return createClient(url, anon)
}

/** Server-only client with service role (bypasses RLS). Never import in client components. */
export function createServiceClient(): SupabaseClient | null {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return null
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
