'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Flame,
  Target,
  Layers,
  Clock,
  Sparkles,
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

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader solid />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Hero greeting */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="animate-fade-up">
            <p className="text-[13px] text-ink-muted">{greeting()}</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-[2rem]">
              {user ? user.displayName : 'Your study home'}
            </h1>
            <p className="mt-1.5 max-w-md text-[14px] text-ink-muted">
              {last
                ? `Pick up ${subjectName(last.subjectId)} where you left off — or open a new subject.`
                : 'Choose a subject below. Ten focused minutes beat a late-night cram.'}
            </p>
          </div>
          {!user && (
            <Link
              href="/signup"
              className="shrink-0 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-[var(--on-accent)] no-underline hover:bg-accent-hover"
            >
              Save progress — sign up
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: 'Streak',
              value: streak > 0 ? `${streak}d` : '—',
              hint: streak > 0 ? 'Keep it going' : 'Study today',
              icon: Flame,
            },
            {
              label: 'Sessions',
              value: String(sessions.length),
              hint: 'Tutor opens',
              icon: BookOpen,
            },
            {
              label: 'Practice',
              value: practiceTotals.total > 0 ? String(practiceTotals.total) : '—',
              hint: 'Questions answered',
              icon: Target,
            },
            {
              label: 'Accuracy',
              value: practiceTotals.pct != null ? `${practiceTotals.pct}%` : '—',
              hint: practiceTotals.total > 0 ? `${practiceTotals.correct}/${practiceTotals.total}` : 'No drills yet',
              icon: Sparkles,
            },
          ].map((stat) => (
            <div key={stat.label} className="surface-card rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  {stat.label}
                </p>
                <stat.icon className="h-3.5 w-3.5 text-accent" />
              </div>
              <p className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink">
                {ready ? stat.value : '·'}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-muted">{stat.hint}</p>
            </div>
          ))}
        </div>

        {/* Continue + quick links */}
        <div className="mb-10 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          {last ? (
            <Link
              href={`/learn/${last.subjectId}`}
              className="group relative overflow-hidden rounded-2xl border border-accent/30 bg-accent-soft p-6 no-underline transition hover:border-accent"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                Continue learning
              </p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-ink sm:text-2xl">
                {subjectName(last.subjectId)}
              </h2>
              <p className="mt-1 text-[14px] text-ink-muted">{last.topic}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-accent">
                Resume session
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ) : (
            <div className="surface-card rounded-2xl p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                Get started
              </p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-ink sm:text-2xl">
                No session yet
              </h2>
              <p className="mt-1 text-[14px] text-ink-muted">
                Open any subject — Ewin will teach one idea, then check you understood.
              </p>
              <Link
                href="/#subjects"
                className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-accent no-underline hover:underline"
              >
                Browse subjects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              href="/cards"
              className="surface-card flex items-center gap-3 rounded-2xl p-4 no-underline transition hover:border-accent"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink">Study cards</p>
                <p className="text-[12px] text-ink-muted">Flip cards from lessons</p>
              </div>
            </Link>
            <Link
              href="/practice/mathematics"
              className="surface-card flex items-center gap-3 rounded-2xl p-4 no-underline transition hover:border-accent"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Target className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink">Practice MCQ</p>
                <p className="text-[12px] text-ink-muted">Past-style questions</p>
              </div>
            </Link>
            <Link
              href="/pricing"
              className="surface-card flex items-center gap-3 rounded-2xl p-4 no-underline transition hover:border-accent sm:col-span-2 lg:col-span-1"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink">Pro mocks</p>
                <p className="text-[12px] text-ink-muted">Timed drills via Paystack</p>
              </div>
            </Link>
          </div>
        </div>

        {streak > 0 && (
          <div className="mb-10">
            <ShareStreakCard streak={streak} />
          </div>
        )}

        {/* Subjects */}
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">Subjects</h2>
            <p className="mt-0.5 text-[13px] text-ink-muted">Learn with the tutor or drill practice questions</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => {
            const pr = practice.find((p) => p.subjectId === s.id)
            return (
              <div key={s.id} className="surface-card flex flex-col rounded-2xl p-5">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-ink">{s.name}</h3>
                  <span className="font-mono text-[10px] text-ink-muted">{s.exam}</span>
                </div>
                <p className="text-[12px] leading-relaxed text-ink-muted line-clamp-2">{s.blurb}</p>
                {pr && (
                  <p className="mt-2 text-[11px] font-medium text-accent">
                    Last practice: {pr.correct}/{pr.total} correct
                  </p>
                )}
                <div className="mt-auto flex gap-2 pt-4">
                  <Link
                    href={`/learn/${s.id}`}
                    className="flex-1 rounded-full bg-accent py-2 text-center text-[12px] font-semibold text-[var(--on-accent)] no-underline hover:bg-accent-hover"
                  >
                    Learn
                  </Link>
                  <Link
                    href={`/practice/${s.id}`}
                    className="flex-1 rounded-full border border-line bg-paper py-2 text-center text-[12px] font-medium text-ink no-underline hover:border-accent"
                  >
                    Practice
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent */}
        {sessions.length > 0 && (
          <div className="mt-12">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-ink-muted" />
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Recently opened
              </h2>
            </div>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {sessions.slice(0, 8).map((s, i) => (
                <li key={`${s.subjectId}-${s.topic}-${i}`}>
                  <Link
                    href={`/learn/${s.subjectId}`}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 no-underline transition hover:bg-paper"
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink">{s.subjectName}</span>
                      <span className="block text-[12px] text-ink-muted">{s.topic}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
