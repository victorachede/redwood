/**
 * Auth: Supabase when env is configured, else localStorage fallback.
 * Pages use async signUp/signIn/signOut; getSession remains sync-friendly via cache.
 */

import { createBrowserClient, isSupabaseConfigured } from '@/app/lib/supabase'

export type LocalUser = {
  id: string
  email: string
  displayName: string
  createdAt: number
  school?: string
  examFocus?: string
  plan?: 'free' | 'pro'
}

type Store = {
  users: Array<LocalUser & { password: string }>
  sessionUserId: string | null
}

const KEY = 'ewin-auth-v1'
const CACHE_KEY = 'ewin-session-cache'

function read(): Store {
  if (typeof window === 'undefined') return { users: [], sessionUserId: null }
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{"users":[],"sessionUserId":null}') as Store
  } catch {
    return { users: [], sessionUserId: null }
  }
}

function write(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store))
  window.dispatchEvent(new Event('ewin-auth'))
}

function uid() {
  return `local_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`
}

function toPublic(u: LocalUser & { password: string }): LocalUser {
  const { password: _, ...user } = u
  return user
}

function cacheSession(user: LocalUser | null) {
  if (typeof window === 'undefined') return
  if (user) localStorage.setItem(CACHE_KEY, JSON.stringify(user))
  else localStorage.removeItem(CACHE_KEY)
  window.dispatchEvent(new Event('ewin-auth'))
}

function readCache(): LocalUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as LocalUser) : null
  } catch {
    return null
  }
}

/** Sync session read for UI (uses cache; call refreshSession on mount for accuracy). */
export function getSession(): LocalUser | null {
  if (isSupabaseConfigured) {
    return readCache()
  }
  const s = read()
  if (!s.sessionUserId) return null
  const u = s.users.find((x) => x.id === s.sessionUserId)
  if (!u) return null
  return toPublic(u)
}

/** Pull latest session from Supabase into local cache. */
export async function refreshSession(): Promise<LocalUser | null> {
  if (!isSupabaseConfigured) return getSession()
  const sb = createBrowserClient()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  const session = data.session
  if (!session?.user) {
    cacheSession(null)
    return null
  }
  const user = await profileFromAuthUser(session.user.id, session.user.email, session.user.user_metadata)
  cacheSession(user)
  return user
}

async function profileFromAuthUser(
  id: string,
  email: string | undefined,
  meta: Record<string, unknown> | undefined,
): Promise<LocalUser> {
  const sb = createBrowserClient()
  let displayName =
    (typeof meta?.display_name === 'string' && meta.display_name) ||
    (email ? email.split('@')[0] : 'Student')
  let plan: 'free' | 'pro' = 'free'
  let examFocus = 'WAEC & JAMB'
  let school: string | undefined
  let createdAt = Date.now()

  if (sb) {
    const { data } = await sb.from('profiles').select('*').eq('id', id).maybeSingle()
    if (data) {
      displayName = data.display_name || displayName
      plan = data.plan === 'pro' ? 'pro' : 'free'
      examFocus = data.exam_focus || examFocus
      school = data.school || undefined
      createdAt = data.created_at ? new Date(data.created_at).getTime() : createdAt
    }
  }

  return {
    id,
    email: email || '',
    displayName,
    createdAt,
    examFocus,
    school,
    plan,
  }
}

export async function signUp(input: {
  email: string
  password: string
  displayName: string
}): Promise<{ ok: true; user: LocalUser } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase()
  const password = input.password
  const displayName = input.displayName.trim() || email.split('@')[0]

  if (!email.includes('@')) return { ok: false, error: 'Enter a valid email.' }
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' }

  if (isSupabaseConfigured) {
    const sb = createBrowserClient()
    if (!sb) return { ok: false, error: 'Auth is not configured.' }
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) return { ok: false, error: error.message }
    if (!data.user) return { ok: false, error: 'Could not create account.' }

    // Ensure profile row (trigger should do this; upsert as backup)
    await sb.from('profiles').upsert({
      id: data.user.id,
      email,
      display_name: displayName,
    })

    const user = await profileFromAuthUser(data.user.id, email, { display_name: displayName })
    cacheSession(user)
    return { ok: true, user }
  }

  // Local fallback
  const s = read()
  if (s.users.some((u) => u.email === email)) {
    return { ok: false, error: 'An account with this email already exists.' }
  }
  const user: LocalUser & { password: string } = {
    id: uid(),
    email,
    displayName,
    password,
    createdAt: Date.now(),
    examFocus: 'WAEC & JAMB',
    plan: 'free',
  }
  s.users.push(user)
  s.sessionUserId = user.id
  write(s)
  cacheSession(toPublic(user))
  return { ok: true, user: toPublic(user) }
}

export async function signIn(input: {
  email: string
  password: string
}): Promise<{ ok: true; user: LocalUser } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase()
  const password = input.password

  if (isSupabaseConfigured) {
    const sb = createBrowserClient()
    if (!sb) return { ok: false, error: 'Auth is not configured.' }
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    if (!data.user) return { ok: false, error: 'Sign in failed.' }
    const user = await profileFromAuthUser(data.user.id, data.user.email, data.user.user_metadata)
    cacheSession(user)
    return { ok: true, user }
  }

  const s = read()
  const u = s.users.find((x) => x.email === email)
  if (!u || u.password !== password) {
    return { ok: false, error: 'Wrong email or password.' }
  }
  s.sessionUserId = u.id
  write(s)
  cacheSession(toPublic(u))
  return { ok: true, user: toPublic(u) }
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    const sb = createBrowserClient()
    await sb?.auth.signOut()
  }
  const s = read()
  s.sessionUserId = null
  write(s)
  cacheSession(null)
}

export function updateProfile(
  patch: Partial<Pick<LocalUser, 'displayName' | 'school' | 'examFocus'>>,
): LocalUser | null {
  const current = getSession()
  if (!current) return null

  if (isSupabaseConfigured) {
    const sb = createBrowserClient()
    if (sb) {
      void sb
        .from('profiles')
        .update({
          display_name: patch.displayName ?? current.displayName,
          school: patch.school ?? current.school ?? null,
          exam_focus: patch.examFocus ?? current.examFocus ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', current.id)
    }
    const next = { ...current, ...patch }
    cacheSession(next)
    return next
  }

  const s = read()
  const idx = s.users.findIndex((x) => x.id === current.id)
  if (idx < 0) return null
  s.users[idx] = {
    ...s.users[idx],
    displayName: patch.displayName ?? s.users[idx].displayName,
    school: patch.school ?? s.users[idx].school,
    examFocus: patch.examFocus ?? s.users[idx].examFocus,
  }
  write(s)
  const pub = toPublic(s.users[idx])
  cacheSession(pub)
  return pub
}


/** Subscribe to auth changes (local + Supabase). */
export function useAuthListener(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => onChange()
  window.addEventListener('ewin-auth', handler)
  // Supabase auth state
  let unsub: (() => void) | undefined
  if (isSupabaseConfigured) {
    const sb = createBrowserClient()
    if (sb) {
      const { data } = sb.auth.onAuthStateChange(() => {
        void refreshSession().then(() => onChange())
      })
      unsub = () => data.subscription.unsubscribe()
    }
  }
  return () => {
    window.removeEventListener('ewin-auth', handler)
    unsub?.()
  }
}
