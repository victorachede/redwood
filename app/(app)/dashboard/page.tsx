'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ClipboardList, Flame, Users } from 'lucide-react'
import { SUBJECTS, getSubject } from '@/app/lib/subjects'
import { AppHeader } from '@/components/ui/AppHeader'
import { SubjectIcon } from '@/components/SubjectIcon'
import { Avatar } from '@/components/ui/Avatar'
import { Blob } from '@/components/Blob'
import { BarsIcon, LayersIcon, RingDotIcon, TickIcon } from '@/components/icons'
import {
  getStreakInfo,
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
import { openAssignments, type Assignment } from '@/app/lib/assignments'
import { reopenWork } from '@/app/lib/workGate'
import { cachedBoard, isOptedIn } from '@/app/lib/leaderboard'
import { onSync } from '@/app/lib/sync'
import { MilestonePopup, useMilestoneCheck } from '@/components/MilestonePopup'

/** "Tuesday, 3 September" — the date a student would write in the margin. */
function todayLabel() {
  return new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/**
 * The current week's Mon–Sun strip, each day marked studied, today, or
 * unknown. `getStreakInfo` only ever preserves the current unbroken run —
 * there is no per-day log — so a day only reads as studied when it falls
 * inside that run counting back from `last`. Anything the streak can't
 * vouch for renders as a plain dot, not a false "missed".
 */
function useWeekStrip(count: number, last: string | null) {
  return useMemo(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    const lastDate = last ? new Date(`${last}T00:00:00`) : null

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const key = dayKey(d)
      const isToday = key === dayKey(today)
      let studied = false
      if (lastDate && count > 0) {
        const diff = Math.round((lastDate.getTime() - d.getTime()) / 86400000)
        studied = diff >= 0 && diff < count
      }
      return { letter: DAY_LETTERS[i], isToday, studied }
    })
  }, [count, last])
}

export default function TodayPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [practice, setPractice] = useState<PracticeRecord[]>([])
  const [streak, setStreak] = useState(0)
  const [streakLast, setStreakLast] = useState<string | null>(null)
  const [due, setDue] = useState(0)
  const [weak, setWeak] = useState<{ subjectId: string; topic: string }[]>([])
  const [user, setUser] = useState<LocalUser | null>(null)
  const [work, setWork] = useState<Assignment[]>([])
  const [rank, setRank] = useState<number | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const load = () => {
      setSessions(loadSessions())
      setPractice(loadPractice())
      const info = getStreakInfo()
      setStreak(info.count)
      setStreakLast(info.last)
      setDue(dueCards().length)
      setWork(openAssignments())
      const board = isOptedIn() ? cachedBoard() : []
      setRank(board.find((r) => r.isMe)?.rank ?? null)
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
    // Assignments and cards are pulled by CloudSync in the shell, not here;
    // this re-reads once that lands so Today is not a frame behind.
    return onSync(load)
  }, [])

  const last = sessions[0]
  const lastSubject = last ? getSubject(last.subjectId) : undefined
  const week = useWeekStrip(streak, streakLast)

  const accuracy = useMemo(() => {
    const correct = practice.reduce((a, p) => a + p.correct, 0)
    const total = practice.reduce((a, p) => a + p.total, 0)
    return total ? Math.round((correct / total) * 100) : null
  }, [practice])

  /** Per-subject accuracy, for the summary panel — the one breakdown the
   *  data actually supports. `PracticeRecord` keeps one aggregate per
   *  subject, not a dated history, so a day-by-day chart would have to be
   *  invented; a subject-by-subject one is real. */
  const subjectAccuracy = useMemo(
    () =>
      SUBJECTS.map((s) => {
        const pr = practice.find((p) => p.subjectId === s.id)
        return { subject: s, pct: pr ? Math.round((pr.correct / pr.total) * 100) : null }
      }).filter((x) => x.pct !== null) as { subject: (typeof SUBJECTS)[number]; pct: number }[],
    [practice],
  )

  const todaysSession = sessions.find((s) => dayKey(new Date(s.at)) === dayKey(new Date()))

  /** One clear next action, chosen for them. */
  const primary = last
    ? { href: `/learn/${last.subjectId}`, label: `Continue ${lastSubject?.name ?? ''}`, sub: last.topic }
    : { href: '/learn/mathematics', label: 'Start your first lesson', sub: 'Mathematics · one idea at a time' }

  const hasTasks = work.length > 0 || due > 0 || !!todaysSession

  const { current: milestone, dismiss: dismissMilestone } = useMilestoneCheck(`${ready}-${streak}`)

  return (
    <main className="bg-paper text-ink">
      {milestone && <MilestonePopup milestone={milestone} onDismiss={dismissMilestone} />}
      <AppHeader
        title="Today"
        action={user ? <Avatar name={user.displayName} size={32} /> : undefined}
      />

      <div className="mx-auto max-w-3xl px-4 pb-5 pt-6">
        {/* An opener in the display face, sized like a page and not a toolbar. */}
        <header className="mb-7">
          <p className="margin-label">{todayLabel()}</p>
          <h2 className="mt-4 font-display text-[clamp(2rem,8vw,2.75rem)] leading-[1.05] text-ink">
            {greeting()}
            {user ? (
              <>
                ,<br />
                <span className="text-primary">{user.displayName.split(' ')[0]}</span>.
              </>
            ) : (
              '.'
            )}
          </h2>
        </header>

        {/* ── The one thing to do next ─────────────────────────────────── */}
        <Link
          href={primary.href}
          className="press relative block overflow-hidden rounded-2xl bg-hero p-5 no-underline shadow-[var(--shadow-md)]"
        >
          <Blob
            id="dash-continue-blob"
            from="#3a67a8"
            to="var(--hero)"
            className="pointer-events-none absolute -top-10 right-0 h-[170px] w-[170px] opacity-50"
          />
          <p className="relative text-[12px] font-semibold uppercase tracking-[0.12em] text-on-hero-dim">
            Pick up where you left off
          </p>
          <p className="relative mt-2 font-display text-[22px] leading-tight text-on-hero">
            {primary.label}
          </p>
          <p className="relative mt-1 text-[13.5px] text-on-hero-dim">{primary.sub}</p>
          <span className="press relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-paper px-4 py-2 text-[13px] font-semibold text-ink">
            Resume
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        {/* ── Streak, drawn as a week ──────────────────────────────────── */}
        <section className="mt-3 rounded-2xl border border-line bg-surface px-4 py-4">
          <div className="flex items-baseline justify-between">
            {ready ? (
              <p className="flex items-baseline gap-1.5">
                <span className="tnum font-display text-[26px] leading-none text-ink">{streak}</span>
                <span className="text-[13px] text-ink-muted">
                  {streak > 0 ? `${streak === 1 ? 'day' : 'days'} running` : 'Starts with today'}
                </span>
              </p>
            ) : (
              <div className="skeleton h-6 w-28" />
            )}
            <Flame
              className="h-5 w-5"
              style={{ color: streak > 0 ? 'var(--streak)' : 'var(--ink-faint)' }}
            />
          </div>
          <div className="mt-3.5 flex justify-between">
            {week.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[10.5px] font-semibold text-ink-faint">{d.letter}</span>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    background: d.studied ? 'var(--primary)' : 'var(--sunken)',
                    border: d.isToday && !d.studied ? '1.5px dashed var(--primary)' : undefined,
                  }}
                >
                  {d.studied && <TickIcon size={10} className="text-on-primary" />}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Today's tasks — real work only: assignments, cards due, and
            today's completed session if there is one. Never a fabricated
            question count. ─────────────────────────────────────────────── */}
        {hasTasks && (
          <section className="mt-6">
            <h2 className="margin-label">Today&rsquo;s tasks</h2>
            <div className="mt-2.5 overflow-hidden rounded-2xl border border-line bg-surface">
              {todaysSession && (
                <div className="flex items-center gap-3 border-b border-line px-3.5 py-3 last:border-b-0">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                    style={{ background: 'var(--correct)' }}
                  >
                    <TickIcon size={10} className="text-white" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-ink">
                      {todaysSession.topic}
                    </span>
                    <span className="block text-[11.5px] text-ink-muted">
                      {todaysSession.subjectName} · Done
                    </span>
                  </span>
                </div>
              )}
              {work.slice(0, 3).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => reopenWork(a)}
                  className="press flex w-full items-center gap-3 border-b border-line px-3.5 py-3 text-left last:border-b-0"
                >
                  <span
                    aria-hidden
                    className="h-5 w-5 shrink-0 rounded-md border-[1.5px] border-line-strong"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium capitalize text-ink">
                      {a.kind}
                      {a.topic ? ` · ${a.topic}` : ''}
                    </span>
                    {a.brief && (
                      <span className="mt-0.5 block truncate text-[11.5px] text-ink-muted">
                        {a.brief}
                      </span>
                    )}
                  </span>
                  <span
                    className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                    style={{ background: 'var(--streak-soft)', color: '#a5641b' }}
                  >
                    Due
                  </span>
                </button>
              ))}
              {due > 0 && (
                <Link
                  href="/cards"
                  className="press flex items-center gap-3 px-3.5 py-3 no-underline"
                >
                  <span aria-hidden className="h-5 w-5 shrink-0 rounded-md border-[1.5px] border-line-strong" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium text-ink">
                      {due} {due === 1 ? 'card' : 'cards'} ready for review
                    </span>
                    <span className="block text-[11.5px] text-ink-muted">Study cards</span>
                  </span>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* ── What tripped you up — the memory made visible ─────────────── */}
        {weak.length > 0 && (
          <section className="mt-6">
            <h2 className="margin-label">Worth another look</h2>
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

        {/* ── Subjects — tinted rows, matching the landing page's accent
            system, with real per-topic and per-accuracy progress. ───────── */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="margin-label">Subjects</h2>
            <span className="text-[12.5px] font-semibold text-primary">All {SUBJECTS.length}</span>
          </div>
          <div className="mt-2.5 flex flex-col gap-2.5">
            {SUBJECTS.map((s) => {
              const topicsStarted = new Set(
                sessions.filter((x) => x.subjectId === s.id).map((x) => x.topic),
              ).size
              const pr = practice.find((p) => p.subjectId === s.id)
              const pct = pr ? Math.round((pr.correct / pr.total) * 100) : null
              const barPct = pct ?? (topicsStarted > 0 ? Math.round((topicsStarted / s.topics.length) * 100) : 0)
              return (
                <Link
                  key={s.id}
                  href={`/learn/${s.id}`}
                  className="press flex items-center gap-3.5 rounded-2xl p-3.5 no-underline"
                  style={{ background: `color-mix(in srgb, ${s.accent} 10%, var(--paper))` }}
                >
                  <SubjectIcon icon={s.icon} accent={s.accent} size={40} tone="solid" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold text-ink">{s.name}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">
                      {topicsStarted > 0
                        ? `${topicsStarted} of ${s.topics.length} topic${s.topics.length === 1 ? '' : 's'} started`
                        : 'Not started yet'}
                    </p>
                    <span className="mt-1.5 block h-[5px] overflow-hidden rounded-full bg-black/[0.06]">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${barPct}%`, background: s.accent }}
                      />
                    </span>
                  </div>
                  <span className="tnum shrink-0 text-[12px] font-bold text-ink">
                    {pct !== null ? `${pct}%` : '—'}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Quick actions ────────────────────────────────────────────── */}
        <section className="mt-6 flex flex-col gap-2">
          <Link
            href="/leaderboard"
            className="press flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 no-underline"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
              style={{ background: 'var(--streak-soft)' }}
            >
              <BarsIcon size={16} className="text-[#a5641b]" />
            </span>
            <span className="flex-1 text-[13.5px] font-medium text-ink">This week&rsquo;s leaderboard</span>
            {rank ? (
              <span className="rounded-full bg-streak-soft px-2.5 py-1 text-[11.5px] font-bold text-[#a5641b]">
                #{rank}
              </span>
            ) : (
              <ArrowRight className="h-4 w-4 text-ink-faint" />
            )}
          </Link>
          <div className="flex gap-2">
            <Link
              href="/practice/mathematics"
              className="press flex flex-1 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 no-underline"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-primary-soft">
                <RingDotIcon size={16} className="text-primary" />
              </span>
              <span className="text-[13.5px] font-medium text-ink">Practice</span>
            </Link>
            <Link
              href="/cards"
              className="press flex flex-1 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 no-underline"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-primary-soft">
                <LayersIcon size={16} className="text-primary" />
              </span>
              <span className="text-[13.5px] font-medium text-ink">Study cards</span>
            </Link>
          </div>
          <Link
            href="/rooms"
            className="press flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 no-underline"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-primary-soft">
              <Users className="h-4 w-4 text-primary" />
            </span>
            <span className="flex-1 text-[13.5px] font-medium text-ink">Study rooms</span>
            <ArrowRight className="h-4 w-4 text-ink-faint" />
          </Link>
        </section>

        {/* ── Accuracy, broken down by subject — the one breakdown real
            data supports (no dated history exists to chart by day). ─────── */}
        {accuracy !== null && (
          <section className="mt-6 rounded-2xl bg-ink p-5 text-on-dark">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="tnum font-display text-[32px] leading-none">{accuracy}%</p>
                <p className="mt-1.5 max-w-[170px] text-[12px] leading-relaxed text-on-dark/55">
                  Practice accuracy across every subject so far.
                </p>
              </div>
              {subjectAccuracy.length > 0 && (
                <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-on-dark/70">
                  {subjectAccuracy.length} subject{subjectAccuracy.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            {subjectAccuracy.length > 1 && (
              <>
                <div className="mt-5 flex h-[46px] items-end gap-1.5">
                  {subjectAccuracy.map(({ subject, pct }) => (
                    <div
                      key={subject.id}
                      className="flex-1 rounded-t"
                      style={{ height: `${Math.max(pct, 6)}%`, background: subject.accent }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex gap-1.5">
                  {subjectAccuracy.map(({ subject }) => (
                    <span key={subject.id} className="flex-1 text-center text-[10px] text-on-dark/45">
                      {subject.name.slice(0, 1)}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {work.length > 0 && (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-muted">
            <ClipboardList className="h-3.5 w-3.5" />
            {work.length} {work.length === 1 ? 'piece' : 'pieces'} of work outstanding
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
