'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BarsIcon, BookOpen, Flame, Layers, Mic, Target, TickIcon, Users } from '@/components/icons'
import { SUBJECTS, getSubject } from '@/app/lib/subjects'
import { AppHeader } from '@/components/ui/AppHeader'
import { SubjectIcon } from '@/components/SubjectIcon'
import { Avatar } from '@/components/ui/Avatar'
import { Portrait } from '@/components/cast/Portrait'
import { defaultTeacher, getCharacter, teacherFor, type Character } from '@/app/lib/cast'
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
import { InstallPrompt } from '@/components/InstallPrompt'

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

/** "2 hours ago", "yesterday", "4 days ago". */
function ago(at: number) {
  const mins = Math.round((Date.now() - at) / 60000)
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins} minutes ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return hours === 1 ? 'an hour ago' : `${hours} hours ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'yesterday' : `${days} days ago`
}

function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`
}

/** Every subject's teacher, from the defaults; the student's own picks are
 *  read from storage after mount so the server and first render agree. */
const DEFAULT_TEACHERS: Record<string, Character> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, defaultTeacher(s.id)]),
)
const KEMI = getCharacter('kemi')

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
  const [teachers, setTeachers] = useState<Record<string, Character>>(DEFAULT_TEACHERS)
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
      const seen = new Set<string>()
      setWeak(
        [
          ...struggling.map((m) => ({ subjectId: m.subjectId, topic: m.topic })),
          ...misses.filter((m) => m.topic).map((m) => ({ subjectId: m.subjectId, topic: m.topic as string })),
        ]
          .filter((w) => {
            const k = `${w.subjectId}:${w.topic}`
            if (seen.has(k)) return false
            seen.add(k)
            return true
          })
          .slice(0, 3),
      )
      setTeachers(Object.fromEntries(SUBJECTS.map((s) => [s.id, teacherFor(s.id)])))
    }
    load()
    // Everything here lives in browser storage, which the server render cannot
    // see, so it is read once after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getSession())
    setReady(true)
    void hydrateProgressFromCloud().then(load)
    // Assignments and cards are pulled by CloudSync in the shell, not here;
    // this re-reads once that lands so Today is not a frame behind.
    return onSync(load)
  }, [])

  const last = sessions[0]
  const week = useWeekStrip(streak, streakLast)

  const practiceBySubject = useMemo(
    () =>
      SUBJECTS.map((s) => {
        const pr = practice.find((p) => p.subjectId === s.id)
        return { subject: s, pct: pr && pr.total ? Math.round((pr.correct / pr.total) * 100) : null, total: pr?.total ?? 0 }
      }),
    [practice],
  )
  const practiced = practiceBySubject.filter((x) => x.pct !== null) as { subject: (typeof SUBJECTS)[number]; pct: number; total: number }[]
  const accuracy = useMemo(() => {
    const correct = practice.reduce((a, p) => a + p.correct, 0)
    const total = practice.reduce((a, p) => a + p.total, 0)
    return total ? Math.round((correct / total) * 100) : null
  }, [practice])
  const answered = practice.reduce((a, p) => a + p.total, 0)

  /** Subjects picked at onboarding surface first; every subject still shows. */
  const orderedSubjects = useMemo(() => {
    const focus = user?.focusSubjects ?? []
    if (focus.length === 0) return SUBJECTS
    return [...SUBJECTS].sort((a, b) => {
      const ai = focus.indexOf(a.id)
      const bi = focus.indexOf(b.id)
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  }, [user])

  const todaysSession = sessions.find((s) => dayKey(new Date(s.at)) === dayKey(new Date()))

  /** The one next thing: carry on from the last lesson, or start in the
   *  student's first focus subject. */
  const nextSubjectId = last?.subjectId ?? orderedSubjects[0].id
  const nextSubject = getSubject(nextSubjectId) ?? SUBJECTS[0]
  const nextTeacher = teachers[nextSubjectId] ?? defaultTeacher(nextSubjectId)

  /** Practice goes where it helps most: the weakest subject practised so far. */
  const practiceTarget =
    [...practiced].sort((a, b) => a.pct - b.pct)[0]?.subject.id ?? nextSubjectId

  const planCount = work.length + (due > 0 ? 1 : 0) + (todaysSession ? 1 : 0)
  const planDone = todaysSession ? 1 : 0

  const status = (() => {
    const bits: string[] = []
    if (work.length) bits.push(`${plural(work.length, 'piece')} of work due`)
    if (due) bits.push(`${plural(due, 'card')} to review`)
    if (!bits.length) return todaysSession ? 'You’ve studied today. Anything more is a bonus.' : 'Nothing due today. A good day to get ahead.'
    return `You have ${bits.join(' and ')}.`
  })()

  const kemiLine =
    streak > 1 ? `${streak} days running. Keep the chain going.` : streak === 1 ? 'One day down. Come back tomorrow and it’s a streak.' : (KEMI?.lines.quiet ?? '')

  const { current: milestone, dismiss: dismissMilestone } = useMilestoneCheck(`${ready}-${streak}`)

  return (
    <main className="bg-paper text-ink">
      {milestone && <MilestonePopup milestone={milestone} onDismiss={dismissMilestone} />}
      <AppHeader
        title="Today"
        action={
          user ? (
            <Link href="/settings" aria-label="Your profile" className="press -m-1.5 rounded-full p-1.5">
              <Avatar name={user.displayName} size={32} />
            </Link>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-5xl px-4 pb-10 pt-6">
        <header className="mb-6">
          <p className="margin-label">{todayLabel()}</p>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,6vw,2.6rem)] leading-[1.05] text-ink">
            {greeting()}
            {user && (
              <>
                , <span className="text-primary">{user.displayName.split(' ')[0]}</span>
              </>
            )}
            .
          </h2>
          {ready ? <p className="mt-2 text-[15px] text-ink-muted">{status}</p> : <div className="skeleton mt-3 h-4 w-64" />}
        </header>

        <InstallPrompt />

        {/* ── Up next: the lesson, and the teacher who takes it ─────────── */}
        <section className="dash-next" aria-label="Up next">
          <div className="dash-next-text">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-on-hero-dim">
              Up next · {nextSubject.name}
            </p>
            <p className="mt-2 font-display text-[clamp(1.4rem,4.5vw,1.85rem)] leading-tight text-on-hero">
              {last ? last.topic : 'Your first lesson'}
            </p>
            <p className="mt-1.5 max-w-[34ch] text-[13.5px] leading-relaxed text-on-hero-dim">
              {last
                ? `Last studied ${ago(last.at)}. ${nextTeacher.name} picks up where you stopped.`
                : `${nextTeacher.name} teaches one idea at a time, then checks you’ve got it.`}
            </p>
          </div>
          <div className="dash-next-actions">
              <Link href={`/learn/${nextSubjectId}`} className="dash-btn dash-btn-light press no-underline">
                {last ? 'Continue lesson' : 'Start lesson'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/call/${nextSubjectId}`} className="dash-btn dash-btn-ghost press no-underline">
                <Mic className="h-4 w-4" />
                Call {nextTeacher.name}
              </Link>
          </div>
          <Portrait character={nextTeacher} className="dash-next-portrait" />
        </section>

        <div className="dash-grid">
          <div className="dash-col">
            {/* ── Today's plan: real work only, never invented counts ───── */}
            <section className="order-1 lg:order-none" aria-labelledby="plan-h">
              <div className="flex items-baseline justify-between">
                <h2 id="plan-h" className="margin-label">Today&rsquo;s plan</h2>
                {planCount > 0 && (
                  <span className="tnum text-[12.5px] font-semibold text-ink-muted">
                    {planDone} of {planCount} done
                  </span>
                )}
              </div>
              {planCount === 0 ? (
                <div className="dash-card mt-2.5 px-4 py-5 text-[14px] text-ink-muted">
                  Nothing set for today. Teachers set homework as you learn, so it shows up here after a lesson.
                </div>
              ) : (
                <ul className="dash-card mt-2.5 divide-y divide-line overflow-hidden">
                  {todaysSession && (
                    <li className="flex items-center gap-3 px-4 py-3.5">
                      <span className="dash-check dash-check-done" aria-hidden><TickIcon size={11} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium text-ink-muted line-through decoration-line-strong">
                          {todaysSession.topic}
                        </span>
                        <span className="block text-[12px] text-ink-faint">{todaysSession.subjectName} · lesson done</span>
                      </span>
                    </li>
                  )}
                  {work.slice(0, 4).map((a) => {
                    const s = a.subjectId ? getSubject(a.subjectId) : undefined
                    const t = a.subjectId ? teachers[a.subjectId] : undefined
                    return (
                      <li key={a.id}>
                        <button type="button" onClick={() => reopenWork(a)} className="press flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-paper">
                          <span className="dash-check" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] font-medium text-ink">
                              <span className="capitalize">{a.kind}</span>
                              {a.topic ? ` · ${a.topic}` : ''}
                            </span>
                            <span className="block truncate text-[12px] text-ink-muted">
                              {a.brief ?? s?.name}
                              {t ? ` · set by ${t.name}` : ''}
                            </span>
                          </span>
                          <span className="dash-due">Due</span>
                        </button>
                      </li>
                    )
                  })}
                  {due > 0 && (
                    <li>
                      <Link href="/cards" className="press flex items-center gap-3 px-4 py-3.5 no-underline hover:bg-paper">
                        <span className="dash-check" aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-medium text-ink">Review {plural(due, 'study card')}</span>
                          <span className="block text-[12px] text-ink-muted">A few minutes, and they stick</span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-ink-faint" />
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </section>

            {/* ── What tripped you up ──────────────────────────────────── */}
            {weak.length > 0 && (
              <section className="order-3 lg:order-none" aria-labelledby="weak-h">
                <h2 id="weak-h" className="margin-label">Worth another look</h2>
                <ul className="mt-2.5 space-y-2">
                  {weak.map((w, i) => {
                    const s = getSubject(w.subjectId)
                    const t = teachers[w.subjectId]
                    return (
                      <li key={`${w.subjectId}-${w.topic}-${i}`}>
                        <Link
                          href={`/learn/${w.subjectId}?topic=${encodeURIComponent(w.topic)}`}
                          className="dash-card press flex items-center gap-3 px-3.5 py-3 no-underline hover:border-line-strong"
                        >
                          {t && <Portrait character={t} className="dash-face" />}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] font-medium text-ink">{w.topic}</span>
                            <span className="block truncate text-[12px] text-ink-muted">
                              {s?.name}
                              {t ? ` · go over it with ${t.name}` : ''}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            {/* ── Subjects ─────────────────────────────────────────────── */}
            <section className="order-4 lg:order-none" aria-labelledby="subj-h">
              <div className="flex items-baseline justify-between">
                <h2 id="subj-h" className="margin-label">Your subjects</h2>
                <Link href="/cast" className="-my-3 inline-flex min-h-[44px] items-center text-[12.5px] font-semibold text-primary no-underline">Change teachers</Link>
              </div>
              <ul className="mt-2.5 grid grid-cols-2 gap-2.5">
                {orderedSubjects.map((s) => {
                  const started = new Set(sessions.filter((x) => x.subjectId === s.id).map((x) => x.topic)).size
                  const pr = practiceBySubject.find((x) => x.subject.id === s.id)
                  const t = teachers[s.id]
                  const pct = Math.round((started / s.topics.length) * 100)
                  return (
                    <li key={s.id}>
                      <Link href={`/learn/${s.id}`} className="dash-card press flex h-full flex-col p-3.5 no-underline hover:border-line-strong">
                        <span className="flex items-start justify-between gap-2">
                          <SubjectIcon icon={s.icon} accent={s.accent} size={36} tone="solid" />
                          {pr?.pct != null && (
                            <span className="text-right">
                              <span className="tnum block text-[15px] font-semibold leading-tight text-ink">{pr.pct}%</span>
                              <span className="block text-[10.5px] text-ink-faint">accuracy</span>
                            </span>
                          )}
                        </span>
                        <span className="mt-2.5 block truncate text-[14.5px] font-semibold text-ink">{s.name}</span>
                        <span className="block truncate text-[12px] text-ink-muted">with {t?.name}</span>
                        <span className="mt-auto block pt-3">
                          <span className="block truncate text-[11.5px] text-ink-muted">
                            {started ? `${started} of ${s.topics.length} topics studied` : 'No lessons yet'}
                          </span>
                          <span className="mt-1.5 block h-[5px] overflow-hidden rounded-full bg-sunken" aria-hidden>
                            <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: s.accent }} />
                          </span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>

          <div className="dash-col">
            {/* ── Streak, with the coach who keeps it ──────────────────── */}
            <section className="dash-card order-2 p-4 lg:order-none" aria-labelledby="streak-h">
              <div className="flex items-start gap-3">
                {KEMI && <Portrait character={KEMI} className="dash-face dash-face-lg" />}
                <div className="min-w-0 flex-1">
                  <h2 id="streak-h" className="flex items-baseline gap-1.5">
                    {ready ? (
                      <>
                        <span className="tnum font-display text-[26px] leading-none text-ink">{streak}</span>
                        <span className="text-[13px] text-ink-muted">{streak === 1 ? 'day streak' : 'day streak'}</span>
                      </>
                    ) : (
                      <span className="skeleton block h-6 w-28" />
                    )}
                    <Flame className="ml-auto h-5 w-5 self-center" style={{ color: streak > 0 ? 'var(--streak)' : 'var(--ink-faint)' }} />
                  </h2>
                  <p className="mt-1 text-[13px] leading-snug text-ink-muted">
                    <span className="font-semibold text-ink">Coach Kemi:</span> {kemiLine}
                  </p>
                </div>
              </div>
              <ol className="mt-4 flex justify-between" aria-label="This week">
                {week.map((d, i) => (
                  <li key={i} className="flex flex-col items-center gap-1.5" aria-label={`${d.letter}${d.studied ? ', studied' : ''}${d.isToday ? ', today' : ''}`}>
                    <span className={`text-[10.5px] font-semibold ${d.isToday ? 'text-ink' : 'text-ink-faint'}`}>{d.letter}</span>
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full"
                      style={{
                        background: d.studied ? 'var(--primary)' : 'var(--sunken)',
                        border: d.isToday && !d.studied ? '1.5px dashed var(--primary)' : undefined,
                      }}
                    >
                      {d.studied && <TickIcon size={11} className="text-on-primary" />}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {/* ── Practice accuracy, labelled per subject ──────────────── */}
            <section className="dash-card order-5 p-4 lg:order-none" aria-labelledby="acc-h">
              <h2 id="acc-h" className="margin-label">Practice accuracy</h2>
              {accuracy === null ? (
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
                  No practice yet. Ten quick exam-style questions will show you where you stand.
                </p>
              ) : (
                <>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span className="tnum font-display text-[32px] leading-none text-ink">{accuracy}%</span>
                    <span className="text-[12.5px] text-ink-muted">across {plural(answered, 'question')}</span>
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {practiced.map(({ subject, pct, total }) => (
                      <li key={subject.id} className="grid grid-cols-[88px_minmax(0,1fr)_40px] items-center gap-2.5 text-[12.5px]">
                        <span className="truncate text-ink">{subject.name}</span>
                        <span className="h-2 overflow-hidden rounded-full bg-sunken" title={`${pct}% of ${total} questions`}>
                          <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: subject.accent }} />
                        </span>
                        <span className="tnum text-right font-semibold text-ink">{pct}%</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            {/* ── Shortcuts ────────────────────────────────────────────── */}
            <nav className="order-6 grid grid-cols-2 gap-2 lg:order-none" aria-label="Shortcuts">
              <Link href={`/practice/${practiceTarget}`} className="dash-tile press no-underline">
                <Target className="h-[18px] w-[18px] text-primary" />
                <span>Practice</span>
                <small>{getSubject(practiceTarget)?.name}</small>
              </Link>
              <Link href="/cards" className="dash-tile press no-underline">
                <Layers className="h-[18px] w-[18px] text-primary" />
                <span>Study cards</span>
                <small>{due ? `${due} due now` : 'All caught up'}</small>
              </Link>
              <Link href="/rooms" className="dash-tile press no-underline">
                <Users className="h-4 w-4 text-primary" />
                <span>Study rooms</span>
                <small>Learn with others</small>
              </Link>
              <Link href="/leaderboard" className="dash-tile press no-underline">
                <BarsIcon size={16} className="text-primary" />
                <span>Leaderboard</span>
                <small>{rank ? `You’re #${rank}` : 'This week'}</small>
              </Link>
              <Link href="/cast" className="dash-tile dash-tile-wide press col-span-2 no-underline">
                <BookOpen className="h-[18px] w-[18px] text-primary" />
                <span>Meet the cast</span>
                <small>Pick who teaches each subject</small>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </main>
  )
}
