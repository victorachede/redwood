'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Flame,
  Target,
  Trash2,
  User,
  Shield,
  LogOut,
  Sparkles,
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
  if (!ts) return '—'
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

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<LocalUser | null>(null)
  const [stats, setStats] = useState<UsageStats | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [school, setSchool] = useState('')
  const [examFocus, setExamFocus] = useState('WAEC & JAMB')
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [profileErr, setProfileErr] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [passMsg, setPassMsg] = useState<string | null>(null)
  const [passErr, setPassErr] = useState<string | null>(null)

  const [delPass, setDelPass] = useState('')
  const [delConfirm, setDelConfirm] = useState(false)
  const [delErr, setDelErr] = useState<string | null>(null)

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
    setProfileMsg(null)
    setProfileErr(null)
    const res = updateProfile({ displayName, school, examFocus })
    setSavingProfile(false)
    if (!res.ok) {
      setProfileErr(res.error)
      return
    }
    setUser(res.user)
    setProfileMsg('Profile saved.')
  }

  function onChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPassMsg(null)
    setPassErr(null)
    const res = changePassword({ current: curPass, next: newPass })
    if (!res.ok) {
      setPassErr(res.error)
      return
    }
    setCurPass('')
    setNewPass('')
    setPassMsg('Password updated.')
  }

  function onDeleteAccount() {
    setDelErr(null)
    if (!delConfirm) {
      setDelConfirm(true)
      return
    }
    const res = deleteAccount(delPass)
    if (!res.ok) {
      setDelErr(res.error)
      return
    }
    clearStudyData()
    router.push('/')
  }

  function onClearData() {
    if (!window.confirm('Clear all lessons and practice history on this device?')) return
    clearStudyData()
    setStats(getUsageStats())
  }

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader solid />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-ink-muted no-underline hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
            Account
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Profile, study stats, and account controls — on this device until cloud sync is on.
          </p>
        </div>

        {/* Profile hero */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_0_var(--line),0_20px_40px_-28px_rgba(22,21,19,0.2)]">
          <div
            className="h-20 sm:h-24"
            style={{
              background:
                'linear-gradient(135deg, #1b4332 0%, #2d6a4f 45%, #e8efe9 100%)',
            }}
          />
          <div className="-mt-8 px-5 pb-5 sm:px-6">
            <div className="flex items-end gap-3">
              <EwinAvatar size={64} className="ring-4 ring-white" />
              <div className="min-w-0 pb-1">
                <p className="truncate text-lg font-semibold text-ink">
                  {user?.displayName || 'Guest'}
                </p>
                <p className="truncate text-[13px] text-ink-muted">
                  {user?.email || 'Not signed in — stats still track on this phone'}
                </p>
              </div>
            </div>
            {!user && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/signup"
                  className="rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-paper no-underline hover:bg-accent-hover"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-line bg-paper px-4 py-2 text-[13px] font-medium text-ink no-underline hover:border-accent"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Usage metrics */}
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Your study pulse
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                icon: Flame,
                label: 'Streak',
                value: stats ? `${stats.streak}d` : '—',
                hint: 'Days in a row',
              },
              {
                icon: BookOpen,
                label: 'Topics',
                value: stats?.topicCount ?? '—',
                hint: 'Tutor sessions',
              },
              {
                icon: Target,
                label: 'Practice',
                value:
                  stats && stats.accuracyPct != null
                    ? `${stats.accuracyPct}%`
                    : stats?.practiceRuns
                      ? `${stats.practiceCorrect}/${stats.practiceTotal}`
                      : '—',
                hint: 'Accuracy',
              },
              {
                icon: User,
                label: 'Subjects',
                value: stats?.uniqueSubjects ?? '—',
                hint: 'Touched',
              },
            ].map(({ icon: Icon, label, value, hint }) => (
              <div
                key={label}
                className="rounded-2xl border border-line bg-white p-4 shadow-[0_1px_0_var(--line)]"
              >
                <Icon className="mb-2 h-4 w-4 text-accent" />
                <p className="font-serif text-2xl font-semibold tracking-tight text-ink">{value}</p>
                <p className="text-[12px] font-medium text-ink">{label}</p>
                <p className="text-[11px] text-ink-muted">{hint}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-ink-muted">
            Last active {formatDate(stats?.lastActiveAt ?? null)}
            {stats && stats.practiceRuns > 0
              ? ` · ${stats.practiceRuns} practice run${stats.practiceRuns === 1 ? '' : 's'}`
              : ''}
          </p>
        </section>

        {user && (
          <>
            {/* Edit profile */}
            <section className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_0_var(--line)] sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                <h2 className="text-[15px] font-semibold text-ink">Edit profile</h2>
              </div>
              <form onSubmit={onSaveProfile} className="space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-ink-muted">Display name</span>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-ink-muted">School (optional)</span>
                  <input
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Government College Makurdi"
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-ink-muted">Exam focus</span>
                  <select
                    value={examFocus}
                    onChange={(e) => setExamFocus(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                  >
                    <option>WAEC & JAMB</option>
                    <option>WAEC only</option>
                    <option>JAMB only</option>
                    <option>NECO</option>
                  </select>
                </label>
                {profileErr && (
                  <p className="text-[13px] text-red-700">{profileErr}</p>
                )}
                {profileMsg && (
                  <p className="text-[13px] text-accent">{profileMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper hover:bg-accent-hover disabled:opacity-60"
                >
                  {savingProfile ? 'Saving…' : 'Save profile'}
                </button>
              </form>
            </section>

            {/* Password */}
            <section className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_0_var(--line)] sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <h2 className="text-[15px] font-semibold text-ink">Password</h2>
              </div>
              <form onSubmit={onChangePassword} className="space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-ink-muted">Current password</span>
                  <input
                    type="password"
                    value={curPass}
                    onChange={(e) => setCurPass(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-ink-muted">New password</span>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    minLength={6}
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                  />
                </label>
                {passErr && <p className="text-[13px] text-red-700">{passErr}</p>}
                {passMsg && <p className="text-[13px] text-accent">{passMsg}</p>}
                <button
                  type="submit"
                  className="rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-medium text-ink hover:border-accent"
                >
                  Update password
                </button>
              </form>
            </section>

            <section className="mb-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
              <button
                type="button"
                onClick={() => {
                  signOut()
                  router.push('/')
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-line py-2.5 text-sm font-medium text-ink hover:border-accent"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </section>
          </>
        )}

        {/* Data + danger */}
        <section className="mb-10 rounded-2xl border border-red-200/80 bg-red-50/40 p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-700" />
            <h2 className="text-[15px] font-semibold text-ink">Danger zone</h2>
          </div>
          <p className="mb-4 text-[13px] leading-relaxed text-ink-muted">
            Clear study history on this device, or delete your local account. This cannot be undone
            here.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onClearData}
              className="rounded-full border border-line bg-white px-4 py-2.5 text-left text-sm font-medium text-ink hover:border-red-300"
            >
              Clear lessons & practice on this device
            </button>
            {user && (
              <div className="rounded-xl border border-red-200 bg-white p-4">
                <p className="text-[13px] font-medium text-ink">Delete account</p>
                <p className="mt-1 text-[12px] text-ink-muted">
                  Removes your sign-in from this browser and clears study data.
                </p>
                <input
                  type="password"
                  placeholder="Confirm with password"
                  value={delPass}
                  onChange={(e) => setDelPass(e.target.value)}
                  className="mt-3 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-red-400"
                />
                {delErr && <p className="mt-2 text-[13px] text-red-700">{delErr}</p>}
                <button
                  type="button"
                  onClick={onDeleteAccount}
                  className="mt-3 rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
                >
                  {delConfirm ? 'Tap again to confirm delete' : 'Delete my account'}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
