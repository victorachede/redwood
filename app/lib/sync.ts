/**
 * Supabase-first data layer.
 *
 * Supabase is the source of truth whenever a student is signed in. Local
 * storage stays for exactly two jobs, both of which are load-bearing:
 *
 *   1. Signed-out students. The product promises "no account needed to
 *      start", so a guest's work has to live somewhere until they sign up.
 *   2. An offline cache. These users are on mobile data in Nigeria; reads
 *      serve instantly from cache and a failed write must not lose work.
 *
 * Everything else that used to be localStorage-only — streak, mastery,
 * misses, card scheduling, avatar — now round-trips through Postgres.
 */

import { createBrowserClient, isSupabaseConfigured } from '@/app/lib/supabase'
import { getSession } from '@/app/lib/auth'

export function currentUserId(): string | null {
  return getSession()?.id ?? null
}

/** True when writes should go to Postgres rather than staying local. */
export function isCloud(): boolean {
  return Boolean(isSupabaseConfigured && currentUserId())
}

export function db() {
  if (!isSupabaseConfigured) return null
  return createBrowserClient()
}

/** Reads a local cache entry, tolerating corrupt JSON. */
export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeLocal(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota — the cloud copy is authoritative, so this is survivable */
  }
}

/**
 * Fire-and-forget cloud write.
 *
 * Failures are logged, never thrown: a dropped connection mid-lesson must
 * not take the lesson down with it. The local cache already holds the value,
 * so the next successful sync reconciles.
 */
export function push(label: string, run: () => PromiseLike<{ error: unknown } | void>) {
  if (!isCloud()) return
  void Promise.resolve(run()).then(
    (res) => {
      const err = res && typeof res === 'object' && 'error' in res ? res.error : null
      if (err) console.warn(`[sync] ${label} failed`, err)
    },
    (err) => console.warn(`[sync] ${label} threw`, err),
  )
}

/** Emitted after a cloud pull so screens can re-read their caches. */
export const SYNC_EVENT = 'ewin-sync'

export function announceSync() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(SYNC_EVENT))
}

export function onSync(fn: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(SYNC_EVENT, fn)
  return () => window.removeEventListener(SYNC_EVENT, fn)
}
