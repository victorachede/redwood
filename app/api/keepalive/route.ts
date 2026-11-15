import { NextResponse } from 'next/server'
import { createBrowserClient, createServiceClient } from '@/app/lib/supabase'

/**
 * Keeps the Supabase project awake.
 *
 * Supabase pauses a free-tier project after about a week with no database
 * activity, and a paused project means every sign-in and every saved answer
 * fails until someone unpauses it by hand. A Vercel cron (vercel.json) calls
 * this once a day; one cheap count against a real table is enough activity.
 *
 * When CRON_SECRET is set in the Vercel project, Vercel sends it as a bearer
 * token with each cron call, and anything else is turned away, so the route
 * cannot be used to hammer the database.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const db = createServiceClient() ?? createBrowserClient()
  if (!db) {
    return NextResponse.json({ ok: false, error: 'supabase_not_configured' }, { status: 503 })
  }

  const started = Date.now()
  // head + count runs a real query without returning any rows.
  const { error } = await db.from('profiles').select('id', { count: 'exact', head: true })
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 })
  }
  return NextResponse.json({ ok: true, ms: Date.now() - started })
}
