'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, Flame, Target } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { SUBJECTS } from '@/app/lib/subjects'
import {
  getStreak,
  loadPractice,
  loadSessions,
  type PracticeRecord,
  type SessionRecord,
} from '@/app/lib/progress'

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [practice, setPractice] = useState<PracticeRecord[]>([])
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    setSessions(loadSessions())
    setPractice(loadPractice())
    setStreak(getStreak())
  }, [])

  const last = sessions[0]

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader solid />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
              Your study home
            </p>
            <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-ink">
              Dashboard
            </h1>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5">
              <Flame className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-ink">
                {streak}-day streak
              </span>
            </div>
          )}
        </div>

        {/* Continue */}
        {last ? (
          <Link
            href={`/learn/${last.subjectId}`}
            className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-accent bg-accent-soft p-5 no-underline transition-colors hover:bg-accent/10"
          >
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-accent">
                Continue learning
              </p>
              <p className="mt-1 text-lg font-semibold text-ink">
                {last.subjectName}
                <span className="font-normal text-ink-muted"> · {last.topic}</span>
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-accent" />
          </Link>
        ) : (
          <div className="mb-8 rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-ink-muted">
              No sessions yet. Pick a subject, choose a topic, and learn with Ewin — or drill past
              questions in Practice.
            </p>
            <Link
              href="/#subjects"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent no-underline"
            >
              Browse subjects <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Two modes */}
        <div className="mb-10 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
              <BookOpen className="h-4 w-4 text-accent" />
            </div>
            <h2 className="text-[15px] font-semibold text-ink">Tutor sessions</h2>
            <p className="mt-1 text-[13px] text-ink-muted leading-relaxed">
              One concept, then a question you answer in your own words. Socratic feedback.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
              <Target className="h-4 w-4 text-accent" />
            </div>
            <h2 className="text-[15px] font-semibold text-ink">Practice (CBT-style)</h2>
            <p className="mt-1 text-[13px] text-ink-muted leading-relaxed">
              Timed-feel past questions with explanations — same pressure pattern as exam day.
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
                    Tutor
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
              Recent sessions
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
