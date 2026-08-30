'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Check,
  Flame,
  Target,
  Trash2,
  User,
  Shield,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { EwinAvatar } from '@/components/EwinAvatar'
import {
  changePassword,
  deleteAccount,
  getSession,
  signOut,
  updateProfile,
  useAuthListener,
  type LocalUser,
} from '@/app/lib/auth'
import { clearStudyData, getUsageStats, type UsageStats } from '@/app/lib/progress'

function formatDate(ts: number | null) {
  if (!ts) return 'Not yet'
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-ink px-4 py-2.5 text-[13px] font-medium text-paper shadow-lg animate-fade-up"
    >
      <Check className="h-3.5 w-3.5 text-accent" />
      {message}
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<LocalUser | null>(null)
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [school, setSchool] = useState('')
  const [examFocus, setExamFocus] = useState('WAEC & JAMB')
  const [profileErr, setProfileErr] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

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
    return useAuthListener(refresh)
  }, [])

  function onSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileErr(null)
    const res = updateProfile({ displayName, school, examFocus })
    setSavingProfile(false)
    if (!res.ok) {
      setProfileErr(res.error)
      return
    }
    setUser(res.user)
    setToast('Profile saved')
  }

  function onChangePassword(e: React.FormEvent) {
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

  function onClearData() {
    if (clearStep === 0) {
      setClearStep(1)
      return
    }
    clearStudyData()
    setStats(getUsageStats())
    setClearStep(0)
    setToast('Study history cleared')
  }

  function onDeleteAccount() {
    setDelErr(null)
    if (delStep === 0) {
      setDelStep(1)
      return
    }
    if (delStep === 1) {
      if (!delPass) {
        setDelErr('Enter your password to continue.')
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

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader solid />
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-ink-muted no-underline hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        <header className="mb-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1.5 text-[15px] text-ink-muted">
            Your profile, progress, and account — private on this device.
          </p>
        </header>

        {/* Identity */}
        <section className="mb-5 overflow-hidden rounded-[1.25rem] border border-line bg-white shadow-[0_1px_0_var(--line)]">
          <div
            className="relative h-[4.5rem] sm:h-20"
            style={{
              background:
                'linear-gradient(120deg, #143526 0%, #1b4332 40%, #40916c 78%, #d8f3dc 100%)',
            }}
          />
          <div className="relative px-5 pb-5 pt-0 sm:px-6">
            <div className="-mt-8 flex items-end gap-3.5">
              <EwinAvatar size={60} className="ring-[3px] ring-white" />
              <div className="min-w-0 flex-1 pb-1">
                <p className="truncate text-[17px] font-semibold tracking-tight text-ink">
                  {user?.displayName || 'Guest'}
                </p>
                <p className="truncate text-[13px] text-ink-muted">
                  {user?.email || 'Sign in to sync a name across sessions'}
                </p>
              </div>
            </div>
            {!user && (
              <div className="mt-4 flex gap-2">
                <Link
                  href="/signup"
                  className="flex-1 rounded-full bg-accent py-2.5 text-center text-[13px] font-medium text-paper no-underline hover:bg-accent-hover"
                >
                  Create free account
                </Link>
                <Link
                  href="/login"
                  className="flex-1 rounded-full border border-line bg-paper py-2.5 text-center text-[13px] font-medium text-ink no-underline hover:border-accent"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Metrics */}
        <section className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Study pulse
              </h2>
            </div>
            <span className="text-[11px] text-ink-muted">
              Active {formatDate(stats?.lastActiveAt ?? null)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { icon: Flame, label: 'Streak', value: stats ? `${stats.streak}` : '—', unit: 'days' },
              { icon: BookOpen, label: 'Topics', value: stats?.topicCount ?? '—', unit: 'opened' },
              {
                icon: Target,
                label: 'Accuracy',
                value: stats?.accuracyPct != null ? `${stats.accuracyPct}` : '—',
                unit: stats?.accuracyPct != null ? '%' : 'practice',
              },
              {
                icon: User,
                label: 'Subjects',
                value: stats?.uniqueSubjects ?? '—',
                unit: 'touched',
              },
            ].map(({ icon: Icon, label, value, unit }) => (
              <div
                key={label}
                className="rounded-[1.1rem] border border-line bg-white p-3.5 shadow-[0_1px_0_var(--line)]"
              >
                <Icon className="mb-2 h-3.5 w-3.5 text-accent" />
                <p className="font-serif text-[1.65rem] font-semibold leading-none tracking-tight text-ink">
                  {value}
                </p>
                <p className="mt-1.5 text-[12px] font-medium text-ink">{label}</p>
                <p className="text-[11px] text-ink-muted">{unit}</p>
              </div>
            ))}
          </div>
        </section>

        {user && (
          <>
            <section className="mb-5 rounded-[1.25rem] border border-line bg-white p-5 shadow-[0_1px_0_var(--line)] sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft">
                  <User className="h-3.5 w-3.5 text-accent" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-ink">Profile</h2>
                  <p className="text-[12px] text-ink-muted">How you show up in Ewin</p>
                </div>
              </div>
              <form onSubmit={onSaveProfile} className="space-y-3">
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                    Name
                  </span>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                    School
                  </span>
                  <input
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Optional"
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                    Exam focus
                  </span>
                  <div className="relative mt-1">
                    <select
                      value={examFocus}
                      onChange={(e) => setExamFocus(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-line bg-paper px-3.5 py-2.5 pr-9 text-sm outline-none transition-colors focus:border-accent"
                    >
                      <option>WAEC & JAMB</option>
                      <option>WAEC only</option>
                      <option>JAMB only</option>
                      <option>NECO</option>
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-ink-muted" />
                  </div>
                </label>
                {profileErr && (
                  <p className="text-[13px] text-red-700">{profileErr}</p>
                )}
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="mt-1 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent-hover disabled:opacity-60"
                >
                  {savingProfile ? 'Saving…' : 'Save changes'}
                </button>
              </form>
            </section>

            <section className="mb-5 rounded-[1.25rem] border border-line bg-white p-5 shadow-[0_1px_0_var(--line)] sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft">
                  <Shield className="h-3.5 w-3.5 text-accent" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-ink">Security</h2>
                  <p className="text-[12px] text-ink-muted">Password for this device account</p>
                </div>
              </div>
              <form onSubmit={onChangePassword} className="space-y-3">
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                    Current
                  </span>
                  <input
                    type="password"
                    value={curPass}
                    onChange={(e) => setCurPass(e.target.value)}
                    autoComplete="current-password"
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                    New password
                  </span>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    minLength={6}
                    autoComplete="new-password"
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                  />
                </label>
                {passErr && <p className="text-[13px] text-red-700">{passErr}</p>}
                <button
                  type="submit"
                  className="rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent"
                >
                  Update password
                </button>
              </form>
            </section>

            <button
              type="button"
              onClick={() => {
                signOut()
                router.push('/')
              }}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-[1.25rem] border border-line bg-white py-3.5 text-sm font-medium text-ink transition-colors hover:border-accent"
            >
              <LogOut className="h-4 w-4 text-ink-muted" />
              Sign out
            </button>
          </>
        )}

        {/* Danger — no window.confirm */}
        <section className="mb-12 rounded-[1.25rem] border border-red-200/70 bg-gradient-to-b from-red-50/80 to-white p-5 sm:p-6">
          <div className="mb-1 flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-700" />
            <h2 className="text-[15px] font-semibold text-ink">Data & account</h2>
          </div>
          <p className="mb-4 text-[13px] leading-relaxed text-ink-muted">
            These actions stay on this device. Nothing is sent to a server yet.
          </p>

          <div className="space-y-3">
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="text-[13px] font-medium text-ink">Clear study history</p>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                Removes lessons, practice scores, and streak on this device.
              </p>
              {clearStep === 0 ? (
                <button
                  type="button"
                  onClick={onClearData}
                  className="mt-3 rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink hover:border-red-300"
                >
                  Clear history
                </button>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onClearData}
                    className="rounded-full bg-red-700 px-4 py-2 text-[13px] font-medium text-white hover:bg-red-800"
                  >
                    Yes, clear everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setClearStep(0)}
                    className="rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {user && (
              <div className="rounded-xl border border-red-200 bg-white p-4">
                <p className="text-[13px] font-medium text-ink">Delete account</p>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  Removes your sign-in and clears study data on this browser.
                </p>
                {delStep >= 1 && (
                  <input
                    type="password"
                    placeholder="Your password"
                    value={delPass}
                    onChange={(e) => setDelPass(e.target.value)}
                    className="mt-3 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-red-400"
                  />
                )}
                {delErr && <p className="mt-2 text-[13px] text-red-700">{delErr}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onDeleteAccount}
                    className="rounded-full bg-red-700 px-4 py-2 text-[13px] font-medium text-white hover:bg-red-800"
                  >
                    {delStep === 0
                      ? 'Delete account'
                      : delStep === 1
                        ? 'Continue'
                        : 'Permanently delete'}
                  </button>
                  {delStep > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDelStep(0)
                        setDelPass('')
                        setDelErr(null)
                      }}
                      className="rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
