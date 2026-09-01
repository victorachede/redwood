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
import { SUBJECTS } from '@/app/lib/subjects'
import { ShareStreakCard } from '@/components/ShareStreakCard'
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
      value: streak > 0 ? `${streak}` : '—',
      unit: streak > 0 ? 'd' : '',
      hint: streak > 0 ? 'days in a row' : 'Study today to start',
      Icon: Flame,
      iconClass: streak > 0 ? 'text-orange-500' : 'text-ink-muted',
      valueClass: streak > 0 ? 'text-ink' : 'text-ink-muted',
    },
    {
      label: 'Sessions',
      value: ready ? String(sessions.length) : '·',
      unit: '',
      hint: 'Tutor opens',
      Icon: Zap,
      iconClass: 'text-accent',
      valueClass: 'text-ink',
    },
    {
      label: 'Practice',
      value: ready && practiceTotals.total > 0 ? String(practiceTotals.total) : '—',
      unit: '',
      hint: 'Questions answered',
      Icon: Target,
      iconClass: 'text-accent',
      valueClass: 'text-ink',
    },
    {
      label: 'Accuracy',
      value: ready && practiceTotals.pct != null ? `${practiceTotals.pct}` : '—',
      unit: practiceTotals.pct != null ? '%' : '',
      hint:
        practiceTotals.total > 0
          ? `${practiceTotals.correct} of ${practiceTotals.total} correct`
          : 'No drills yet',
      Icon: TrendingUp,
      iconClass: 'text-accent',
      valueClass:
        practiceTotals.pct != null ? accuracyColor(practiceTotals.pct) : 'text-ink-muted',
    },
  ]

  const quickActions = [
    {
      href: '/cards',
      label: 'Study cards',
      body: 'Flip and revise key facts',
      Icon: Layers,
    },
    {
      href: '/practice/mathematics',
      label: 'Practice MCQ',
      body: 'Past-style exam questions',
      Icon: Target,
    },
    {
      href: '/pricing',
      label: 'Pro mocks',
      body: 'Timed drills · Paystack',
      Icon: BookOpen,
    },
  ]

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader solid />

      <div className="mx-auto max-w-5xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">

        {/* ── Greeting ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] text-ink-muted">{greeting()}</p>
            <h1 className="mt-1 font-serif text-[1.75rem] font-semibold tracking-tight sm:text-3xl">
              {user ? user.displayName : 'Your study home'}
            </h1>
            {last ? (
              <p className="mt-1.5 text-[14px] text-ink-muted">
                Last in {subjectName(last.subjectId)} · {last.topic}
              </p>
            ) : (
              <p className="mt-1.5 text-[14px] text-ink-muted">
                Ten focused minutes beat a late-night cram.
              </p>
            )}
          </div>
          {!user && (
            <Link
              href="/signup"
              className="rounded-lg bg-accent px-4 py-2.5 text-[13px] font-medium text-[var(--on-accent)] no-underline transition-opacity hover:opacity-90"
            >
              Save progress
            </Link>
          )}
        </div>

        {/* ── Continue / empty ─────────────────────────────────────────── */}
        {last ? (
          <div className="relative overflow-hidden rounded-2xl bg-accent px-6 py-6 sm:py-7">
            {/* Gold glow hint */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 55% 80% at 90% 50%, rgba(201,168,76,0.22) 0%, transparent 70%)',
              }}
            />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
                  Continue learning
                </p>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-white sm:text-3xl">
                  {subjectName(last.subjectId)}
                </h2>
                <p className="mt-1 text-[14px] text-white/65">{last.topic}</p>
              </div>
              <Link
                href={`/learn/${last.subjectId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-[13px] font-medium text-white no-underline transition-colors hover:bg-white/25"
              >
                Resume
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-8 text-center">
            <p className="text-[13px] font-medium text-ink">No session yet</p>
            <p className="mt-1 text-[13px] text-ink-muted">
              Open a subject below — Ewin explains one idea, then checks you.
            </p>
            <Link
              href="#subjects"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-[var(--on-accent)] no-underline hover:opacity-90"
            >
              Browse subjects
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col rounded-xl border border-line bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-ink-muted">
                  {s.label}
                </p>
                <s.Icon className={`h-4 w-4 ${s.iconClass}`} />
              </div>
              <div className="mt-3 flex items-baseline gap-0.5">
                <span className={`text-2xl font-semibold tracking-tight ${s.valueClass}`}>
                  {s.value}
                </span>
                {s.unit && (
                  <span className="text-[14px] font-medium text-ink-muted">{s.unit}</span>
                )}
              </div>
              <p className="mt-1 text-[12px] text-ink-muted">{s.hint}</p>
            </div>
          ))}
        </div>

        {/* ── Quick actions ─────────────────────────────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex items-center gap-3.5 rounded-xl border border-line bg-white px-4 py-4 no-underline transition hover:border-neutral-300 hover:shadow-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
                <a.Icon className="h-4 w-4 text-accent" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-ink">{a.label}</p>
                <p className="text-[12px] text-ink-muted">{a.body}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>

        {/* ── Subjects ─────────────────────────────────────────────────── */}
        <div id="subjects" className="scroll-mt-20">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-semibold tracking-tight">Subjects</h2>
              <p className="mt-0.5 text-[13px] text-ink-muted">
                Tutor or practice — your call.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECTS.map((s) => {
              const pr = practice.find((p) => p.subjectId === s.id)
              const hasSession = sessions.some((sess) => sess.subjectId === s.id)
              const pct = pr ? Math.min(100, Math.round((pr.correct / pr.total) * 100)) : null
              return (
                <div
                  key={s.id}
                  className="flex flex-col rounded-xl border border-line bg-white p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-semibold text-ink">{s.name}</h3>
                    {hasSession && (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                    {s.exam}
                  </p>
                  <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-ink-muted line-clamp-2">
                    {s.blurb}
                  </p>

                  {pct !== null && (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-ink-muted">
                        <span>Practice score</span>
                        <span className={accuracyColor(pct)}>{pct}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/learn/${s.id}`}
                      className="flex-1 rounded-lg bg-accent py-2 text-center text-[12px] font-medium text-[var(--on-accent)] no-underline transition-opacity hover:opacity-90"
                    >
                      Learn
                    </Link>
                    <Link
                      href={`/practice/${s.id}`}
                      className="flex-1 rounded-lg border border-line py-2 text-center text-[12px] font-medium text-ink no-underline transition-colors hover:bg-neutral-50"
                    >
                      Practice
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Streak share ─────────────────────────────────────────────── */}
        {streak > 0 && (
          <div className="max-w-sm">
            <ShareStreakCard />
          </div>
        )}

        {/* ── Recent sessions ───────────────────────────────────────────── */}
        {sessions.length > 0 && (
          <div>
            <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Recently opened
            </h2>
            <div className="overflow-hidden rounded-xl border border-line bg-white divide-y divide-line">
              {sessions.slice(0, 6).map((s, i) => (
                <Link
                  key={`${s.subjectId}-${s.topic}-${i}`}
                  href={`/learn/${s.subjectId}`}
                  className="flex items-center gap-3 px-4 py-3.5 no-underline transition-colors hover:bg-neutral-50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
                    <span className="text-[11px] font-semibold text-accent">
                      {s.subjectName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-ink">{s.subjectName}</p>
                    <p className="text-[12px] text-ink-muted truncate">{s.topic}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-ink-muted shrink-0">
                    <span className="hidden sm:block">{timeAgo(s.at)}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
