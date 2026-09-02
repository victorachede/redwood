'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, Flame, Layers, Play, Target } from 'lucide-react'
import { SUBJECTS, getSubject } from '@/app/lib/subjects'
import { AppHeader } from '@/components/ui/AppHeader'
import { SubjectIcon } from '@/components/SubjectIcon'
import {
  getStreak,
  loadPractice,
  loadSessions,
  loadMisses,
  loadMastery,
  hydrateProgressFromCloud,
  type PracticeRecord,
  type SessionRecord,
} from '@/app/lib/progress'
import { dueCards } from '@/app/lib/cards'
import { getSession, type LocalUser } from '@/app/lib/auth'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function TodayPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [practice, setPractice] = useState<PracticeRecord[]>([])
  const [streak, setStreak] = useState(0)
  const [due, setDue] = useState(0)
  const [weak, setWeak] = useState<{ subjectId: string; topic: string }[]>([])
  const [user, setUser] = useState<LocalUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const load = () => {
      setSessions(loadSessions())
      setPractice(loadPractice())
      setStreak(getStreak())
      setDue(dueCards().length)
      const misses = loadMisses()
      const struggling = loadMastery().filter((m) => m.level === 'struggling')
      setWeak([
        ...struggling.map((m) => ({ subjectId: m.subjectId, topic: m.topic })),
        ...misses
          .filter((m) => m.topic)
          .map((m) => ({ subjectId: m.subjectId, topic: m.topic as string })),
      ].slice(0, 3))
    }
    load()
    setUser(getSession())
    setReady(true)
    void hydrateProgressFromCloud().then(load)
  }, [])

  const last = sessions[0]
  const lastSubject = last ? getSubject(last.subjectId) : undefined

  const accuracy = useMemo(() => {
    const correct = practice.reduce((a, p) => a + p.correct, 0)
    const total = practice.reduce((a, p) => a + p.total, 0)
    return total ? Math.round((correct / total) * 100) : null
  }, [practice])

  /** One clear next action, chosen for them. */
  const primary = last
    ? { href: `/learn/${last.subjectId}`, label: `Continue ${lastSubject?.name ?? ''}`, sub: last.topic }
    : { href: '/learn/mathematics', label: 'Start your first lesson', sub: 'Mathematics · one idea at a time' }

  return (
    <main className="bg-paper text-ink">
      <AppHeader title="Today" subtitle={user ? user.displayName : greeting()} />

      <div className="mx-auto max-w-3xl px-4 py-5">
        {/* ── The one thing to do next ─────────────────────────────────── */}
        <Link
          href={primary.href}
          className="press block rounded-2xl bg-hero p-5 no-underline shadow-[var(--shadow-md)]"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-on-hero-dim">
            Pick up where you left off
          </p>
          <p className="mt-2 font-display text-[22px] leading-tight text-on-hero">
            {primary.label}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-on-hero-dim">
            {primary.sub}
            <ArrowRight className="h-4 w-4" />
          </p>
        </Link>

        {/* ── Streak + due, the two numbers that drive returning ───────── */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center gap-2">
              <Flame
                className="h-[18px] w-[18px]"
                style={{ color: streak > 0 ? 'var(--streak)' : 'var(--ink-faint)' }}
              />
              <span className="text-[12px] font-medium text-ink-muted">Streak</span>
            </div>
            {ready ? (
              <p className="tnum mt-1.5 font-display text-[26px] leading-none text-ink">
                {streak}
                <span className="ml-1 text-[13px] font-normal text-ink-muted">
                  {streak === 1 ? 'day' : 'days'}
                </span>
              </p>
            ) : (
              <div className="skeleton mt-2 h-6 w-14" />
            )}
          </div>

          <Link
            href="/cards"
            className="press rounded-2xl border border-line bg-surface p-4 no-underline"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-[18px] w-[18px] text-ink-faint" />
              <span className="text-[12px] font-medium text-ink-muted">Cards due</span>
            </div>
            {ready ? (
              <p className="tnum mt-1.5 font-display text-[26px] leading-none text-ink">{due}</p>
            ) : (
              <div className="skeleton mt-2 h-6 w-10" />
            )}
          </Link>
        </div>

        {/* ── What tripped you up — the memory made visible ─────────────── */}
        {weak.length > 0 && (
          <section className="mt-6">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Worth another look
            </h2>
            <ul className="mt-2.5 space-y-2">
              {weak.map((w, i) => {
                const s = getSubject(w.subjectId)
                return (
                  <li key={`${w.subjectId}-${w.topic}-${i}`}>
                    <Link
                      href={`/learn/${w.subjectId}?topic=${encodeURIComponent(w.topic)}`}
                      className="press flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 no-underline"
                    >
                      <span
                        className="h-8 w-1 shrink-0 rounded-full"
                        style={{ background: s?.accent ?? 'var(--primary)' }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium text-ink">
                          {w.topic}
                        </span>
                        <span className="block text-[12px] text-ink-muted">{s?.name}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* ── Subjects ─────────────────────────────────────────────────── */}
        <section className="mt-6">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Subjects
          </h2>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            {SUBJECTS.map((s) => {
              const pr = practice.find((p) => p.subjectId === s.id)
              const pct = pr ? Math.round((pr.correct / pr.total) * 100) : null
              const started = sessions.some((x) => x.subjectId === s.id)
              return (
                <Link
                  key={s.id}
                  href={`/learn/${s.id}`}
                  className="press flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3.5 no-underline"
                >
                  <SubjectIcon icon={s.icon} accent={s.accent} size={42} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[15px] font-semibold text-ink">{s.name}</p>
                      {started && <Check className="h-3.5 w-3.5 shrink-0 text-correct" />}
                    </div>
                    {pct !== null ? (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
                          <span
                            className="block h-full rounded-full"
                            style={{ width: `${pct}%`, background: s.accent }}
                          />
                        </span>
                        <span className="tnum text-[11px] text-ink-muted">{pct}%</span>
                      </div>
                    ) : (
                      <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">
                        {s.topics.length} topics
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Quick actions ────────────────────────────────────────────── */}
        <section className="mt-6 grid grid-cols-2 gap-2.5">
          <Link
            href="/practice/mathematics"
            className="press flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 no-underline"
          >
            <Target className="h-[18px] w-[18px] text-primary" />
            <span className="text-[13.5px] font-medium text-ink">Practice</span>
          </Link>
          <Link
            href="/cards"
            className="press flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 no-underline"
          >
            <Play className="h-[18px] w-[18px] text-primary" />
            <span className="text-[13.5px] font-medium text-ink">Review cards</span>
          </Link>
        </section>

        {accuracy !== null && (
          <p className="mt-6 text-center text-[12.5px] text-ink-muted">
            Practice accuracy so far:{' '}
            <span className="tnum font-semibold text-ink">{accuracy}%</span>
          </p>
        )}

        {!user && (
          <Link
            href="/signup"
            className="press mt-6 block rounded-xl border border-line bg-surface px-4 py-3.5 text-center text-[13.5px] font-medium text-ink no-underline"
          >
            Create an account to save your progress
          </Link>
        )}
      </div>
    </main>
  )
}
