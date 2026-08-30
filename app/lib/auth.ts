/** Local auth for testing — swap to Supabase Auth later without changing page UX. */

export type LocalUser = {
  id: string
  email: string
  displayName: string
  createdAt: number
  school?: string
  examFocus?: string
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

function toPublic(u: LocalUser & { password: string }): LocalUser {
  const { password: _, ...user } = u
  return user
}

export function getSession(): LocalUser | null {
  const s = read()
  if (!s.sessionUserId) return null
  const u = s.users.find((x) => x.id === s.sessionUserId)
  if (!u) return null
  return toPublic(u)
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
    examFocus: 'WAEC & JAMB',
  }
  s.users.push(user)
  s.sessionUserId = user.id
  write(s)
  return { ok: true, user: toPublic(user) }
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
  return { ok: true, user: toPublic(u) }
}

export function signOut() {
  const s = read()
  s.sessionUserId = null
  write(s)
}

export function updateProfile(input: {
  displayName?: string
  school?: string
  examFocus?: string
}): { ok: true; user: LocalUser } | { ok: false; error: string } {
  const s = read()
  if (!s.sessionUserId) return { ok: false, error: 'Sign in first.' }
  const idx = s.users.findIndex((x) => x.id === s.sessionUserId)
  if (idx < 0) return { ok: false, error: 'Account not found.' }
  const u = s.users[idx]
  if (input.displayName !== undefined) {
    const name = input.displayName.trim()
    if (!name) return { ok: false, error: 'Name cannot be empty.' }
    u.displayName = name
  }
  if (input.school !== undefined) u.school = input.school.trim()
  if (input.examFocus !== undefined) u.examFocus = input.examFocus.trim()
  s.users[idx] = u
  write(s)
  return { ok: true, user: toPublic(u) }
}

export function changePassword(input: {
  current: string
  next: string
}): { ok: true } | { ok: false; error: string } {
  const s = read()
  if (!s.sessionUserId) return { ok: false, error: 'Sign in first.' }
  const idx = s.users.findIndex((x) => x.id === s.sessionUserId)
  if (idx < 0) return { ok: false, error: 'Account not found.' }
  if (s.users[idx].password !== input.current) {
    return { ok: false, error: 'Current password is wrong.' }
  }
  if (input.next.length < 6) return { ok: false, error: 'New password must be at least 6 characters.' }
  s.users[idx].password = input.next
  write(s)
  return { ok: true }
}

/** Deletes the signed-in account from local store. Does not clear study data unless asked. */
export function deleteAccount(password: string): { ok: true } | { ok: false; error: string } {
  const s = read()
  if (!s.sessionUserId) return { ok: false, error: 'Sign in first.' }
  const u = s.users.find((x) => x.id === s.sessionUserId)
  if (!u) return { ok: false, error: 'Account not found.' }
  if (u.password !== password) return { ok: false, error: 'Password is incorrect.' }
  s.users = s.users.filter((x) => x.id !== u.id)
  s.sessionUserId = null
  write(s)
  return { ok: true }
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
