'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, Flame, Target } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { SUBJECTS } from '@/app/lib/subjects'
import { ShareStreakCard } from '@/components/ShareStreakCard'
import {
  getStreak,
  loadPractice,
  loadSessions,
  type PracticeRecord,
  type SessionRecord,
} from '@/app/lib/progress'
import { getSession, type LocalUser } from '@/app/lib/auth'

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [practice, setPractice] = useState<PracticeRecord[]>([])
  const [streak, setStreak] = useState(0)
  const [user, setUser] = useState<LocalUser | null>(null)

  useEffect(() => {
    setSessions(loadSessions())
    setPractice(loadPractice())
    setStreak(getStreak())
    setUser(getSession())
  }, [])

  const last = sessions[0]

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader solid />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
              Your home
            </p>
            <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-ink">
              {user ? `Hi, ${user.displayName}` : 'Dashboard'}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {streak > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5">
                <Flame className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-ink">
                  {streak}-day streak
                </span>
              </div>
            )}
            <Link
              href="/settings"
              className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink no-underline hover:border-accent"
            >
              Settings
            </Link>
          </div>
        </div>

        {/* Continue */}
        {last ? (
          <Link
            href={`/learn/${last.subjectId}`}
            className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-accent bg-accent-soft p-5 no-underline transition-colors hover:bg-accent/10"
          >
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-accent">
                Continue where you stopped
              </p>
              <p className="mt-1 text-lg font-semibold text-ink">
                {last.subjectName}
                <span className="font-normal text-ink-muted"> · {last.topic}</span>
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-accent" />
          </Link>
        ) : (
          <div className="mb-8 rounded-2xl border border-accent bg-accent-soft p-6">
            <p className="text-[11px] font-medium uppercase tracking-wide text-accent">
              New here?
            </p>
            <h2 className="mt-1 font-serif text-xl font-semibold text-ink">
              Start with Mathematics
            </h2>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              Most students begin here. Ewin will teach one idea, then ask you a question.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/learn/mathematics"
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper no-underline hover:bg-accent-hover"
              >
                Start learning <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/practice/mathematics"
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink no-underline hover:border-accent"
              >
                Try practice questions
              </Link>
            </div>
          </div>
        )}

        {/* Two modes */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <ShareStreakCard />
          <div className="flex flex-col gap-3">
            <Link
              href="/cards"
              className="flex-1 rounded-2xl border border-line bg-white p-5 no-underline shadow-[0_1px_0_var(--line)] hover:border-accent"
            >
              <p className="text-[15px] font-semibold text-ink">Study cards</p>
              <p className="mt-1 text-[13px] text-ink-muted">Flip cards from lessons and homework.</p>
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/work/homework"
                className="rounded-2xl border border-line bg-white px-4 py-3 text-center text-[13px] font-medium text-ink no-underline hover:border-accent"
              >
                Homework
              </Link>
              <Link
                href="/work/classwork"
                className="rounded-2xl border border-line bg-white px-4 py-3 text-center text-[13px] font-medium text-ink no-underline hover:border-accent"
              >
                Classwork
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-10 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
              <BookOpen className="h-4 w-4 text-accent" />
            </div>
            <h2 className="text-[15px] font-semibold text-ink">Learn with tutor</h2>
            <p className="mt-1 text-[13px] text-ink-muted leading-relaxed">
              Ewin explains, then you type an answer. You get clear feedback.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
              <Target className="h-4 w-4 text-accent" />
            </div>
            <h2 className="text-[15px] font-semibold text-ink">Practice questions</h2>
            <p className="mt-1 text-[13px] text-ink-muted leading-relaxed">
              Choose A, B, C or D. Then see if you were right and read why.
            </p>
          </div>
        </div>

        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Subjects
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => {
            const pr = practice.find((p) => p.subjectId === s.id)
            return (
              <div
                key={s.id}
                className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_0_var(--line)]"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-ink">{s.name}</h3>
                  <span className="font-mono text-[10px] text-ink-muted">{s.exam}</span>
                </div>
                <p className="text-[12px] text-ink-muted line-clamp-2">{s.blurb}</p>
                {pr && (
                  <p className="mt-2 text-[11px] font-medium text-accent">
                    Last practice: {pr.correct}/{pr.total} correct
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/learn/${s.id}`}
                    className="flex-1 rounded-full bg-accent py-2 text-center text-[12px] font-medium text-paper no-underline hover:bg-accent-hover"
                  >
                    Learn
                  </Link>
                  <Link
                    href={`/practice/${s.id}`}
                    className="flex-1 rounded-full border border-line py-2 text-center text-[12px] font-medium text-ink no-underline hover:border-accent"
                  >
                    Practice
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {sessions.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Recently opened
            </h2>
            <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
              {sessions.slice(0, 8).map((s, i) => (
                <li key={`${s.subjectId}-${s.topic}-${i}`}>
                  <Link
                    href={`/learn/${s.subjectId}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 no-underline hover:bg-paper/80"
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink">{s.subjectName}</span>
                      <span className="block text-[12px] text-ink-muted">{s.topic}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-ink-muted" />
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
