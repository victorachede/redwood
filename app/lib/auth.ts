/** Local auth for testing — swap to Supabase Auth later without changing page UX. */

export type LocalUser = {
  id: string
  email: string
  displayName: string
  createdAt: number
}

type Store = {
  users: Array<LocalUser & { password: string }>
  sessionUserId: string | null
}

const KEY = 'ewin-auth-v1'

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

export function getSession(): LocalUser | null {
  const s = read()
  if (!s.sessionUserId) return null
  const u = s.users.find((x) => x.id === s.sessionUserId)
  if (!u) return null
  const { password: _, ...user } = u
  return user
}

export function signUp(input: {
  email: string
  password: string
  displayName: string
}): { ok: true; user: LocalUser } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase()
  const password = input.password
  const displayName = input.displayName.trim() || email.split('@')[0]

  if (!email.includes('@')) return { ok: false, error: 'Enter a valid email.' }
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' }

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
  }
  s.users.push(user)
  s.sessionUserId = user.id
  write(s)
  const { password: _, ...safe } = user
  return { ok: true, user: safe }
}

export function signIn(input: {
  email: string
  password: string
}): { ok: true; user: LocalUser } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase()
  const s = read()
  const u = s.users.find((x) => x.email === email)
  if (!u || u.password !== input.password) {
    return { ok: false, error: 'Email or password is incorrect.' }
  }
  s.sessionUserId = u.id
  write(s)
  const { password: _, ...safe } = u
  return { ok: true, user: safe }
}

export function signOut() {
  const s = read()
  s.sessionUserId = null
  write(s)
}

export function useAuthListener(cb: () => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => cb()
  window.addEventListener('ewin-auth', handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener('ewin-auth', handler)
    window.removeEventListener('storage', handler)
  }
}
