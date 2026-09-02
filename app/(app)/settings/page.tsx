'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Flame,
  LogOut,
  BookOpen,
  Target,
} from 'lucide-react'
import { EwinAvatar } from '@/components/EwinAvatar'
import {
  changePassword,
  deleteAccount,
  getSession,
  signOutAndGoHome,
  updateProfile,
  subscribeToAuth,
  type LocalUser,
} from '@/app/lib/auth'
import { clearStudyData, getUsageStats, type UsageStats } from '@/app/lib/progress'
import { PasswordField } from '@/components/PasswordField'
import { AvatarPicker } from '@/components/ui/AvatarPicker'
import { AppHeader } from '@/components/ui/AppHeader'

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div
      role="status"
      className="rise fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[13px] font-medium text-on-primary shadow-[var(--shadow-lg)]"
    >
      <Check className="h-3.5 w-3.5 text-correct" />
      {message}
    </div>
  )
}

function Group({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-6">
      {title && (
        <p className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {title}
        </p>
      )}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {children}
      </div>
    </div>
  )
}

function Row({
  children,
  last,
}: {
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div
      className={`px-4 py-4 transition-colors ${last ? '' : 'border-b border-line'}`}
    >
      {children}
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-28 shrink-0 text-[13px] text-ink-muted">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </label>
  )
}

const inputClass =
  'w-full rounded-xl border border-line bg-paper px-3.5 py-3 text-[15px] text-ink outline-none transition-colors focus:border-primary'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<LocalUser | null>(null)
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [school, setSchool] = useState('')
  const [examFocus, setExamFocus] = useState('WAEC & JAMB')
  const [profileErr, setProfileErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [passErr, setPassErr] = useState<string | null>(null)

  const [delPass, setDelPass] = useState('')
  const [delStep, setDelStep] = useState(0)
  const [delErr, setDelErr] = useState<string | null>(null)
  const [clearStep, setClearStep] = useState(0)

  function refresh() {
    const u = getSession()
    setUser(u)
    if (u) {
      setDisplayName(u.displayName)
      setSchool(u.school || '')
      setExamFocus(u.examFocus || 'WAEC & JAMB')
    }
    setStats(getUsageStats())
  }

  useEffect(() => {
    refresh()
    setHydrated(true)
    return subscribeToAuth(refresh)
  }, [])

  function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setProfileErr(null)
    const res = updateProfile({ displayName, school, examFocus })
    setSaving(false)
    if (!res.ok) {
      setProfileErr(res.error)
      return
    }
    setUser(res.user)
    setToast('Saved')
  }

  function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPassErr(null)
    const res = changePassword({ current: curPass, next: newPass })
    if (!res.ok) {
      setPassErr(res.error)
      return
    }
    setCurPass('')
    setNewPass('')
    setToast('Password updated')
  }

  function clearHistory() {
    if (clearStep === 0) {
      setClearStep(1)
      return
    }
    clearStudyData()
    setStats(getUsageStats())
    setClearStep(0)
    setToast('History cleared')
  }

  function removeAccount() {
    setDelErr(null)
    if (delStep === 0) {
      setDelStep(1)
      return
    }
    if (delStep === 1) {
      if (!delPass.trim()) {
        setDelErr('Enter your password')
        return
      }
      setDelStep(2)
      return
    }
    const res = deleteAccount(delPass)
    if (!res.ok) {
      setDelErr(res.error)
      setDelStep(1)
      return
    }
    clearStudyData()
    router.push('/')
  }

  const metrics = [
    { icon: Flame, label: 'Streak', value: stats ? `${stats.streak}d` : '—' },
    { icon: BookOpen, label: 'Topics', value: stats?.topicCount ?? '—' },
    {
      icon: Target,
      label: 'Accuracy',
      value: stats?.accuracyPct != null ? `${stats.accuracyPct}%` : '—',
    },
  ]


  if (hydrated && !user) {
    return (
      <main className="min-h-dvh bg-paper text-ink">
        <AppHeader title="Me" />
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
          <EwinAvatar size={56} />
          <h1 className="mt-6 font-display text-[22px] text-ink">Sign in for settings</h1>
          <p className="mx-auto mt-2 max-w-xs text-[14.5px] leading-relaxed text-ink-muted">
            Your profile, photo and account controls need an account. You can still learn
            without one.
          </p>
          <div className="mt-7 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="press rounded-full bg-primary px-6 py-3 text-[14.5px] font-medium text-on-primary no-underline"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="press rounded-full border border-line bg-surface px-6 py-3 text-[14.5px] font-medium text-ink no-underline"
            >
              Create account
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <AppHeader title="Me" subtitle={user?.displayName} />
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="mx-auto max-w-lg px-4 py-5">

        {/* Identity card */}
        <Group>
          <div className="border-b border-line px-4 py-5">
            <AvatarPicker name={user?.displayName || 'You'} onDone={(m) => setToast(m)} />
            <div className="mt-4">
              <p className="font-display text-[19px] leading-tight text-ink">
                {user?.displayName || 'Guest'}
              </p>
              <p className="truncate text-[13px] text-ink-muted">
                {user?.email || 'Learning on this device only'}
              </p>
              {user && examFocus && (
                <span className="mt-2 inline-flex rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  {examFocus}
                </span>
              )}
            </div>
          </div>
          {!user && (
            <Row last>
              <div className="flex gap-2 pt-0.5">
                <Link
                  href="/signup"
                  className="flex-1 rounded-full bg-primary py-2.5 text-center text-[13px] font-medium text-on-primary no-underline"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="flex-1 rounded-full bg-paper py-2.5 text-center text-[13px] font-medium text-ink ring-1 ring-line no-underline"
                >
                  Sign in
                </Link>
              </div>
            </Row>
          )}
        </Group>

        {/* Activity — calm, not dashboard clutter */}
        <Group title="Activity">
          <Row last>
            <div className="grid grid-cols-3 gap-2">
              {metrics.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl bg-paper px-2.5 py-3 text-center">
                  <Icon className="mx-auto mb-1.5 h-3.5 w-3.5 text-primary" />
                  <p className="font-display text-lg font-semibold leading-none tracking-tight">
                    {value}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-muted">{label}</p>
                </div>
              ))}
            </div>
          </Row>
        </Group>

        {user && (
          <>
            <Group title="Profile">
              <form onSubmit={saveProfile}>
                <Row>
                  <Field label="Name">
                    <input
                      className={inputClass}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </Field>
                </Row>
                <Row>
                  <Field label="School">
                    <input
                      className={inputClass}
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="Optional"
                    />
                  </Field>
                </Row>
                <Row>
                  <Field label="Exams">
                    <div className="relative">
                      <select
                        className={`${inputClass} appearance-none pr-8`}
                        value={examFocus}
                        onChange={(e) => setExamFocus(e.target.value)}
                      >
                        <option>WAEC & JAMB</option>
                        <option>WAEC only</option>
                        <option>JAMB only</option>
                        <option>NECO</option>
                      </select>
                      <ChevronRight className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-ink-muted" />
                    </div>
                  </Field>
                </Row>
                <Row last>
                  {profileErr && (
                    <p className="mb-2 text-[13px] text-red-700">{profileErr}</p>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-on-primary disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </Row>
              </form>
            </Group>

            <Group title="Password">
              <form onSubmit={savePassword}>
                <Row>
                  <PasswordField
                    label="Current"
                    value={curPass}
                    onChange={setCurPass}
                    autoComplete="current-password"
                    required={false}
                  />
                </Row>
                <Row>
                  <PasswordField
                    id="new-password"
                    name="new-password"
                    label="New"
                    value={newPass}
                    onChange={setNewPass}
                    autoComplete="new-password"
                    minLength={6}
                    required={false}
                  />
                </Row>
                <Row last>
                  {passErr && <p className="mb-2 text-[13px] text-red-700">{passErr}</p>}
                  <button
                    type="submit"
                    className="rounded-full bg-paper px-4 py-2 text-[13px] font-medium text-ink ring-1 ring-line"
                  >
                    Update password
                  </button>
                </Row>
              </form>
            </Group>

            <Group>
              <button
                type="button"
                onClick={() => {
                  void signOutAndGoHome()
                }}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left text-[14px] font-medium text-ink hover:bg-paper/80"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-ink-muted" />
                  Sign out
                </span>
                <ChevronRight className="h-4 w-4 text-ink-muted" />
              </button>
            </Group>
          </>
        )}

        <Group title="Data">
          <Row>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[14px] font-medium">Clear study history</p>
                <p className="text-[12px] text-ink-muted">Lessons, practice, streak on this device</p>
              </div>
              {clearStep === 0 ? (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="shrink-0 self-start rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink ring-1 ring-line hover:ring-accent"
                >
                  Clear
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="rounded-xl bg-danger px-4 py-2 text-[13px] font-medium text-on-primary transition-opacity hover:opacity-90"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setClearStep(0)}
                    className="rounded-xl px-4 py-2 text-[13px] text-ink-muted transition-colors hover:bg-sunken"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </Row>
          {user && (
            <Row last>
              <div>
                <p className="text-[14px] font-medium text-red-800">Delete account</p>
                <p className="text-[12px] text-ink-muted">
                  Removes sign-in and study data from this browser
                </p>
                {delStep >= 1 && (
                  <div className="mt-2">
                    <PasswordField
                      id="del-password"
                      name="del-password"
                      label="Password"
                      value={delPass}
                      onChange={setDelPass}
                      autoComplete="current-password"
                      required={false}
                    />
                  </div>
                )}
                {delErr && <p className="mt-1.5 text-[13px] text-red-700">{delErr}</p>}
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={removeAccount}
                    className="rounded-xl bg-danger px-4 py-2 text-[13px] font-medium text-on-primary transition-opacity hover:opacity-90"
                  >
                    {delStep === 0 ? 'Delete' : delStep === 1 ? 'Continue' : 'Delete forever'}
                  </button>
                  {delStep > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDelStep(0)
                        setDelPass('')
                        setDelErr(null)
                      }}
                      className="rounded-xl px-4 py-2 text-[13px] text-ink-muted transition-colors hover:bg-sunken"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </Row>
          )}
        </Group>

        <p className="px-1 pb-10 text-center text-[11px] text-ink-muted">
          Ewin · data stays on this device until cloud accounts are on
        </p>
      </div>
    </main>
  )
}
