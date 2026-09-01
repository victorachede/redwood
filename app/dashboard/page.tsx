'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Flame,
  Target,
  Layers,
  Zap,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { SUBJECTS, getSubject } from '@/app/lib/subjects'
import { ShareStreakCard } from '@/components/ShareStreakCard'
import { Reveal } from '@/components/Reveal'
import { Stagger } from '@/components/Stagger'
import { Counter } from '@/components/Counter'
import { SubjectIcon } from '@/components/SubjectIcon'
import {
  getStreak,
  loadPractice,
  loadSessions,
  hydrateProgressFromCloud,
  type PracticeRecord,
  type SessionRecord,
} from '@/app/lib/progress'
import { getSession, type LocalUser } from '@/app/lib/auth'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return days === 1 ? 'yesterday' : `${days}d ago`
}

function accuracyColor(pct: number): string {
  if (pct >= 70) return 'text-green-600'
  if (pct >= 50) return 'text-amber-600'
  return 'text-red-600'
}

/** Shimmer block shown while localStorage / cloud data hydrates. */
function Bar() {
  return <span className="skeleton inline-block h-7 w-12 align-middle" />
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [practice, setPractice] = useState<PracticeRecord[]>([])
  const [streak, setStreak] = useState(0)
  const [user, setUser] = useState<LocalUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setSessions(loadSessions())
    setPractice(loadPractice())
    setStreak(getStreak())
    setUser(getSession())
    setReady(true)
    void hydrateProgressFromCloud().then(() => {
      setSessions(loadSessions())
      setPractice(loadPractice())
      setStreak(getStreak())
    })
  }, [])

  const last = sessions[0]
  const lastSubject = last ? getSubject(last.subjectId) : undefined

  const practiceTotals = useMemo(() => {
    let correct = 0
    let total = 0
    for (const p of practice) {
      correct += p.correct
      total += p.total
    }
    return { correct, total, pct: total > 0 ? Math.round((correct / total) * 100) : null }
  }, [practice])

  const subjectName = (id: string) => SUBJECTS.find((s) => s.id === id)?.name ?? id

  const stats = [
    {
      label: 'Streak',
      value: streak,
      unit: streak > 0 ? 'd' : '',
      hint: streak > 0 ? 'days in a row' : 'Study today to start',
      Icon: Flame,
      tint: '#e07b39',
      show: streak > 0,
      valueClass: 'text-ink',
    },
    {
      label: 'Sessions',
      value: sessions.length,
      unit: '',
      hint: 'Tutor opens',
      Icon: Zap,
      tint: '#3b6fd4',
      show: true,
      valueClass: 'text-ink',
    },
    {
      label: 'Practice',
      value: practiceTotals.total,
      unit: '',
      hint: 'Questions answered',
      Icon: Target,
      tint: '#7c4dd4',
      show: practiceTotals.total > 0,
      valueClass: 'text-ink',
    },
    {
      label: 'Accuracy',
      value: practiceTotals.pct ?? 0,
      unit: practiceTotals.pct != null ? '%' : '',
      hint:
        practiceTotals.total > 0
          ? `${practiceTotals.correct} of ${practiceTotals.total} correct`
          : 'No drills yet',
      Icon: TrendingUp,
      tint: '#16a394',
      show: practiceTotals.pct != null,
      valueClass: practiceTotals.pct != null ? accuracyColor(practiceTotals.pct) : 'text-ink',
    },
  ]

  const quickActions = [
    { href: '/cards', label: 'Study cards', body: 'Flip and revise key facts', Icon: Layers },
    {
      href: '/practice/mathematics',
      label: 'Practice MCQ',
      body: 'Past-style exam questions',
      Icon: Target,
    },
    { href: '/pricing', label: 'Pro mocks', body: 'Timed drills · Paystack', Icon: BookOpen },
  ]

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader solid />

      <div className="mx-auto max-w-5xl space-y-10 px-5 py-10 sm:px-8 sm:py-14">
        {/* ── Greeting ───────────────────────────────────────────────────── */}
        <Reveal>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {user && (
                <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-600 to-navy-800 text-[15px] font-semibold text-white ring-2 ring-gold-500/30">
                  {user.displayName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-[13px] text-ink-muted">{greeting()}</p>
                <h1 className="mt-0.5 font-serif text-[1.875rem] font-semibold tracking-[-0.025em] sm:text-[2.25rem]">
                  {user ? user.displayName : 'Your study home'}
                </h1>
                <p className="mt-1.5 text-[14px] text-ink-muted">
                  {last
                    ? `Last in ${subjectName(last.subjectId)} · ${last.topic}`
                    : 'Ten focused minutes beat a late-night cram.'}
                </p>
              </div>
            </div>

            {!user && (
              <Link
                href="/signup"
                className="sheen rounded-xl bg-gradient-to-br from-[#16274d] to-[#0e1b3a] px-5 py-2.5 text-[13px] font-medium text-[var(--on-accent)] no-underline shadow-[var(--shadow-md)]"
              >
                Save progress
              </Link>
            )}
          </div>
        </Reveal>

        {/* ── Continue / empty ───────────────────────────────────────────── */}
        <Reveal delay={60}>
          {last ? (
            <div className="noise relative overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-navy-700 to-navy-900 px-6 py-7 shadow-[var(--shadow-navy)] sm:px-8 sm:py-8">
              {/* Glow tinted with the subject's own accent */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 55% 80% at 88% 50%, ${
                    lastSubject?.accent ?? '#c9a84c'
                  }38 0%, transparent 70%)`,
                }}
              />
              <div className="hairline-gold absolute inset-x-0 top-0 h-px" />

              <div className="relative flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-400">
                    Continue learning
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-semibold text-white sm:text-3xl">
                    {subjectName(last.subjectId)}
                  </h2>
                  <p className="mt-1 text-[14px] text-[var(--on-accent-muted)]">{last.topic}</p>
                </div>

                <Link
                  href={`/learn/${last.subjectId}`}
                  className="sheen group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-[13px] font-medium text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Resume
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.4rem] border border-dashed border-line-strong bg-white px-6 py-10 text-center">
              <p className="text-[15px] font-medium text-ink">No session yet</p>
              <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] text-ink-muted">
                Open a subject below — Ewin explains one idea, then checks you.
              </p>
              <Link
                href="#subjects"
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#16274d] to-[#0e1b3a] px-5 py-2.5 text-[13px] font-medium text-[var(--on-accent)] no-underline shadow-[var(--shadow-md)]"
              >
                Browse subjects
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </Reveal>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-4" step={70}>
          {stats.map((s) => (
            <div
              key={s.label}
              className="lift flex flex-col rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-sm)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  {s.label}
                </p>
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: `color-mix(in srgb, ${s.tint} 12%, transparent)` }}
                >
                  <s.Icon className="h-3.5 w-3.5" style={{ color: s.tint }} />
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-0.5">
                {!ready ? (
                  <Bar />
                ) : s.show ? (
                  <>
                    <span
                      className={`tnum font-serif text-[1.75rem] font-semibold tracking-tight ${s.valueClass}`}
                    >
                      <Counter value={s.value} />
                    </span>
                    {s.unit && (
                      <span className="text-[14px] font-medium text-ink-muted">{s.unit}</span>
                    )}
                  </>
                ) : (
                  <span className="font-serif text-[1.75rem] font-semibold text-ink-subtle">—</span>
                )}
              </div>

              <p className="mt-1 text-[12px] text-ink-muted">{s.hint}</p>
            </div>
          ))}
        </Stagger>

        {/* ── Quick actions ──────────────────────────────────────────────── */}
        <Stagger className="grid gap-3 sm:grid-cols-3" step={70}>
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="lift group flex items-center gap-3.5 rounded-2xl border border-line bg-white px-4 py-4 no-underline shadow-[var(--shadow-sm)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-700/[0.07] transition-colors group-hover:bg-navy-700/[0.12]">
                <a.Icon className="h-4 w-4 text-navy-700" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-ink">{a.label}</p>
                <p className="text-[12px] text-ink-muted">{a.body}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink-subtle transition-all duration-300 group-hover:translate-x-1 group-hover:text-navy-700" />
            </Link>
          ))}
        </Stagger>

        {/* ── Subjects ───────────────────────────────────────────────────── */}
        <div id="subjects" className="scroll-mt-20">
          <Reveal>
            <div className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600">
                Keep going
              </p>
              <h2 className="mt-2 font-serif text-2xl font-semibold tracking-[-0.02em]">Subjects</h2>
              <p className="mt-1 text-[13.5px] text-ink-muted">Tutor or practice — your call.</p>
            </div>
          </Reveal>

          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" step={60}>
            {SUBJECTS.map((s) => {
              const pr = practice.find((p) => p.subjectId === s.id)
              const hasSession = sessions.some((sess) => sess.subjectId === s.id)
              const pct = pr ? Math.min(100, Math.round((pr.correct / pr.total) * 100)) : null
              return (
                <div
                  key={s.id}
                  className="lift flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-sm)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <SubjectIcon icon={s.icon} accent={s.accent} size={38} />
                    {hasSession && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Started
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3.5 text-[15px] font-semibold text-ink">{s.name}</h3>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-subtle">
                    {s.exam}
                  </p>
                  <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-muted line-clamp-2">
                    {s.blurb}
                  </p>

                  {pct !== null && (
                    <div className="mt-3.5">
                      <div className="mb-1.5 flex items-center justify-between text-[11px]">
                        <span className="text-ink-muted">Practice score</span>
                        <span className={`tnum font-medium ${accuracyColor(pct)}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-sunken">
                        <div
                          className="h-full rounded-full transition-[width] duration-700 ease-out"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${s.accent}, ${s.accent}bb)`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/learn/${s.id}`}
                      className="flex-1 rounded-xl py-2.5 text-center text-[12.5px] font-medium text-white no-underline transition-opacity hover:opacity-90"
                      style={{ background: s.accent }}
                    >
                      Learn
                    </Link>
                    <Link
                      href={`/practice/${s.id}`}
                      className="flex-1 rounded-xl border border-line py-2.5 text-center text-[12.5px] font-medium text-ink no-underline transition-colors hover:bg-paper-sunken"
                    >
                      Practice
                    </Link>
                  </div>
                </div>
              )
            })}
          </Stagger>
        </div>

        {/* ── Streak share ───────────────────────────────────────────────── */}
        {streak > 0 && (
          <Reveal>
            <div className="max-w-sm">
              <ShareStreakCard />
            </div>
          </Reveal>
        )}

        {/* ── Recent sessions ────────────────────────────────────────────── */}
        {sessions.length > 0 && (
          <Reveal>
            <div>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Recently opened
              </h2>
              <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-sm)]">
                {sessions.slice(0, 6).map((s, i) => {
                  const meta = getSubject(s.subjectId)
                  return (
                    <Link
                      key={`${s.subjectId}-${s.topic}-${i}`}
                      href={`/learn/${s.subjectId}`}
                      className="group flex items-center gap-3.5 px-4 py-3.5 no-underline transition-colors hover:bg-paper-sunken"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold"
                        style={{
                          background: `color-mix(in srgb, ${
                            meta?.accent ?? '#0e1b3a'
                          } 12%, transparent)`,
                          color: meta?.accent ?? '#0e1b3a',
                        }}
                      >
                        {s.subjectName.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-ink">{s.subjectName}</p>
                        <p className="truncate text-[12px] text-ink-muted">{s.topic}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-[12px] text-ink-muted">
                        <span className="hidden sm:block">{timeAgo(s.at)}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </main>
  )
}
