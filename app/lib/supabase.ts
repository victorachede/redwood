import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/** Every client is schema-typed, so a wrong column name fails the build. */
export type Db = SupabaseClient<Database>

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anon)

let browserClient: Db | null = null

/** Browser client with anon key (RLS applies). Singleton for auth session. */
export function createBrowserClient(): Db | null {
  if (!url || !anon) return null
  if (typeof window !== 'undefined') {
    if (!browserClient) {
      browserClient = createClient<Database>(url, anon, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    }
    return browserClient
  }
  return createClient<Database>(url, anon)
}

/** Server-only client with service role (bypasses RLS). Never import in client components. */
export function createServiceClient(): Db | null {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return null
  return createClient<Database>(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
