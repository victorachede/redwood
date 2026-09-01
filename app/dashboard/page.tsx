'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BookOpen, Flame, Target, Layers, Clock } from 'lucide-react'
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

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] text-ink-muted">{greeting()}</p>
            <h1 className="mt-1 font-serif text-[1.75rem] font-semibold tracking-tight text-ink sm:text-3xl">
              {user ? user.displayName : 'Your study home'}
            </h1>
            <p className="mt-2 max-w-md text-[14px] text-ink-muted">
              {last
                ? `Continue ${subjectName(last.subjectId)}, or open another subject.`
                : 'Open a subject below. Ten focused minutes beat a late-night cram.'}
            </p>
          </div>
          {!user && (
            <Link
              href="/signup"
              className="rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white no-underline hover:bg-neutral-700"
            >
              Save progress
            </Link>
          )}
        </div>

        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Streak', value: streak > 0 ? `${streak}d` : '—', hint: streak > 0 ? 'Keep going' : 'Study today' },
            { label: 'Sessions', value: String(sessions.length), hint: 'Tutor opens' },
            {
              label: 'Practice',
              value: practiceTotals.total > 0 ? String(practiceTotals.total) : '—',
              hint: 'Questions answered',
            },
            {
              label: 'Accuracy',
              value: practiceTotals.pct != null ? `${practiceTotals.pct}%` : '—',
              hint: practiceTotals.total > 0 ? `${practiceTotals.correct}/${practiceTotals.total}` : 'No drills yet',
            },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-line bg-white p-4">
              <p className="text-[12px] text-ink-muted">{stat.label}</p>
              <p className="mt-1.5 text-xl font-semibold tracking-tight text-ink">
                {ready ? stat.value : '·'}
              </p>
              <p className="mt-0.5 text-[12px] text-ink-muted">{stat.hint}</p>
            </div>
          ))}
        </div>

        <div className="mb-12 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          {last ? (
            <Link
              href={`/learn/${last.subjectId}`}
              className="group rounded-lg border border-line bg-white p-6 no-underline transition hover:border-neutral-400"
            >
              <p className="text-[12px] text-ink-muted">Continue</p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-ink">
                {subjectName(last.subjectId)}
              </h2>
              <p className="mt-1 text-[14px] text-ink-muted">{last.topic}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink">
                Resume
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ) : (
            <div className="rounded-lg border border-line bg-white p-6">
              <p className="text-[12px] text-ink-muted">Get started</p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-ink">No session yet</h2>
              <p className="mt-1 text-[14px] text-ink-muted">
                Open any subject — Ewin teaches one idea, then checks you.
              </p>
              <Link
                href="/#subjects"
                className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink no-underline hover:underline"
              >
                Browse subjects
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {[
              { href: '/cards', title: 'Study cards', body: 'Flip cards from lessons', Icon: Layers },
              { href: '/practice/mathematics', title: 'Practice MCQ', body: 'Past-style questions', Icon: Target },
              { href: '/pricing', title: 'Pro mocks', body: 'Timed drills via Paystack', Icon: BookOpen },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-3.5 no-underline transition hover:border-neutral-400"
              >
                <item.Icon className="h-4 w-4 shrink-0 text-ink-muted" />
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-ink">{item.title}</p>
                  <p className="text-[12px] text-ink-muted">{item.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {streak > 0 && (
          <div className="mb-12">
            <ShareStreakCard />
          </div>
        )}

        <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">Subjects</h2>
        <p className="mt-1 text-[13px] text-ink-muted">Learn with the tutor or drill practice</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => {
            const pr = practice.find((p) => p.subjectId === s.id)
            return (
              <div key={s.id} className="flex flex-col rounded-lg border border-line bg-white p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-ink">{s.name}</h3>
                  <span className="text-[10px] uppercase tracking-wide text-ink-muted">{s.exam}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-muted line-clamp-2">{s.blurb}</p>
                {pr && (
                  <p className="mt-2 text-[12px] text-ink-muted">
                    Last practice: {pr.correct}/{pr.total} correct
                  </p>
                )}
                <div className="mt-auto flex gap-2 pt-4">
                  <Link
                    href={`/learn/${s.id}`}
                    className="flex-1 rounded-md bg-ink py-2 text-center text-[12px] font-medium text-white no-underline hover:bg-neutral-700"
                  >
                    Learn
                  </Link>
                  <Link
                    href={`/practice/${s.id}`}
                    className="flex-1 rounded-md border border-line py-2 text-center text-[12px] font-medium text-ink no-underline hover:bg-neutral-50"
                  >
                    Practice
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {sessions.length > 0 && (
          <div className="mt-14">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-ink-muted" />
              <h2 className="text-[12px] font-medium uppercase tracking-wide text-ink-muted">
                Recently opened
              </h2>
            </div>
            <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
              {sessions.slice(0, 8).map((s, i) => (
                <li key={`${s.subjectId}-${s.topic}-${i}`}>
                  <Link
                    href={`/learn/${s.subjectId}`}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 no-underline hover:bg-neutral-50"
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
