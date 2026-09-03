/**
 * Weekly leaderboard.
 *
 * All the rules live in Postgres (see the leaderboard_week migration) rather
 * than here, because a score the client computes is a score the client can
 * make up. This module only fetches and caches.
 */

import { createBrowserClient, isSupabaseConfigured } from '@/app/lib/supabase'
import { getSession } from '@/app/lib/auth'
import { readLocal, writeLocal, isCloud, push, db } from '@/app/lib/sync'

const CACHE = 'ewin-leaderboard-v1'
const OPT_IN = 'ewin-leaderboard-optin-v1'

export type LeaderboardRow = {
  rank: number
  name: string
  correct: number
  total: number
  accuracy: number
  streak: number
  isMe: boolean
}

/** Monday in Lagos, matching the week the database ranks on. */
export function weekStart(): Date {
  const now = new Date()
  const lagos = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }))
  // getDay(): 0 Sun … 6 Sat. Monday is the start, so Sunday counts back six.
  const back = (lagos.getDay() + 6) % 7
  lagos.setDate(lagos.getDate() - back)
  lagos.setHours(0, 0, 0, 0)
  return lagos
}

export function daysLeftInWeek(): number {
  const end = weekStart()
  end.setDate(end.getDate() + 7)
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000))
}

export function cachedBoard(): LeaderboardRow[] {
  return readLocal<LeaderboardRow[]>(CACHE, [])
}

/**
 * Returns null when the board could not be reached, and [] only when it was
 * genuinely empty.
 *
 * The distinction is the difference between "nobody has played yet, be first"
 * and "you are offline" — telling a student the first when the truth is the
 * second is a small lie the UI has no business telling.
 */
export async function fetchBoard(limit = 50): Promise<LeaderboardRow[] | null> {
  if (!isSupabaseConfigured) return null
  const sb = createBrowserClient()
  if (!sb) return null

  const { data, error } = await sb.rpc('leaderboard_week', { limit_n: limit })
  if (error || !data) return null

  const rows: LeaderboardRow[] = (
    data as { rank: number; display_name: string; correct: number; total: number; accuracy: number; streak: number; is_me: boolean }[]
  ).map((r) => ({
    rank: Number(r.rank),
    name: r.display_name,
    correct: Number(r.correct),
    total: Number(r.total),
    accuracy: Number(r.accuracy),
    streak: Number(r.streak ?? 0),
    isMe: Boolean(r.is_me),
  }))

  writeLocal(CACHE, rows)
  return rows
}

/* ── Opt-in ───────────────────────────────────────────────────────────── */

export function isOptedIn(): boolean {
  return readLocal<boolean>(OPT_IN, false)
}

/**
 * Opting in is the only way a student's name reaches anyone else's screen, so
 * it defaults to off and stays a single explicit switch rather than something
 * buried in a settings sub-page.
 */
export function setOptedIn(on: boolean) {
  writeLocal(OPT_IN, on)
  push('leaderboard opt-in', () =>
    db()!
      .from('profiles')
      .update({ leaderboard_opt_in: on })
      .eq('id', getSession()!.id),
  )
}

export async function hydrateOptInFromCloud(): Promise<void> {
  if (!isCloud()) return
  const sb = db()
  if (!sb) return
  const { data } = await sb
    .from('profiles')
    .select('leaderboard_opt_in')
    .eq('id', getSession()!.id)
    .maybeSingle()
  if (data) writeLocal(OPT_IN, Boolean(data.leaderboard_opt_in))
}

/** The board needs an account: there is no way to rank an anonymous device. */
export function canJoin(): boolean {
  return isCloud()
}
