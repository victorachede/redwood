'use client'

import Link from 'next/link'
import { use, useEffect, useRef, useState } from 'react'
import { AppHeader } from '@/components/ui/AppHeader'
import { Avatar } from '@/components/ui/Avatar'
import { getSubject } from '@/app/lib/subjects'
import { getSession } from '@/app/lib/auth'
import {
  activeTimer,
  canJoinRoom,
  joinRoom,
  watchRoomCount,
  REACTIONS,
  TIMER_MINUTES,
  type RoomHandle,
  type RoomPresence,
  type RoomReaction,
} from '@/app/lib/rooms'

type Bubble = RoomReaction & { id: string }

function mmss(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

export default function RoomPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = use(params)
  const subject = getSubject(subjectId)

  const [people, setPeople] = useState<RoomPresence[]>([])
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [joinable, setJoinable] = useState(true)
  const [ready, setReady] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const handleRef = useRef<RoomHandle | null>(null)
  const meId = getSession()?.id

  useEffect(() => {
    if (!subject) return
    const can = canJoinRoom()
    setJoinable(can)

    if (!can) {
      setReady(true)
      return watchRoomCount(subject.id, () => {})
    }

    const handle = joinRoom(subject.id, {
      onPresence: (p) => {
        setPeople(p)
        setReady(true)
      },
      onReaction: (r) => {
        const bubble: Bubble = { ...r, id: `${r.at}-${Math.random().toString(36).slice(2, 6)}` }
        setBubbles((prev) => [...prev, bubble])
        setTimeout(() => setBubbles((prev) => prev.filter((b) => b.id !== bubble.id)), 3200)
      },
    })
    handleRef.current = handle
    return () => {
      handle?.leave()
      handleRef.current = null
    }
  }, [subject])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!subject) {
    return (
      <main className="bg-paper text-ink">
        <AppHeader title="Study rooms" back="/rooms" />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="font-display text-[20px] text-ink">That room doesn&rsquo;t exist</p>
          <Link href="/rooms" className="press mt-5 inline-block text-[13.5px] font-semibold text-primary">
            Back to rooms
          </Link>
        </div>
      </main>
    )
  }

  const timer = activeTimer(people)
  const remaining = timer ? mmss((timer.timerEndsAt ?? 0) - now) : null
  const alone = joinable && ready && people.length <= 1

  return (
    <main className="bg-paper text-ink">
      <AppHeader title={`${subject.name} room`} subtitle={ready ? undefined : 'Connecting…'} back="/rooms" />

      <div className="mx-auto max-w-2xl px-4 pb-8 pt-6">
        {/* ── Presence ─────────────────────────────────────────────────── */}
        <section
          className="rounded-2xl p-5"
          style={{ background: `color-mix(in srgb, ${subject.accent} 8%, var(--paper))` }}
        >
          <p className="margin-label">
            {ready
              ? people.length === 0
                ? 'Nobody here yet'
                : people.length === 1
                  ? '1 person here'
                  : `${people.length} people here`
              : 'Loading'}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {people.map((p) => (
              <div key={p.userId} className="flex items-center gap-2 rounded-full bg-surface py-1 pl-1 pr-3 shadow-[var(--shadow-sm)]">
                <Avatar name={p.name} size={26} color={p.userId === meId ? undefined : p.color} />
                <span className="text-[12.5px] font-medium text-ink">
                  {p.userId === meId ? 'You' : p.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
          {alone && (
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
              Be the first one here — start a session below and anyone who joins will see it
              running.
            </p>
          )}
        </section>

        {/* ── Shared timer ─────────────────────────────────────────────── */}
        <section className="mt-4 rounded-2xl border border-line bg-surface p-5">
          {timer ? (
            <>
              <p className="margin-label">
                {timer.userId === meId ? 'Your session' : `${timer.name.split(' ')[0]}'s session`}
              </p>
              <p className="tnum mt-2 font-display text-[40px] leading-none text-ink">{remaining}</p>
              <p className="mt-1.5 text-[13px] text-ink-muted">
                {timer.timerMinutes}-minute focus session — everyone here sees the same clock.
              </p>
            </>
          ) : joinable ? (
            <>
              <p className="margin-label">Start a focus session</p>
              <p className="mt-1.5 text-[13px] text-ink-muted">
                Everyone in the room sees the same countdown once it starts.
              </p>
              <div className="mt-3.5 flex gap-2">
                {TIMER_MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleRef.current?.startTimer(m)}
                    className="press flex-1 rounded-xl border border-line py-2.5 text-[14px] font-semibold text-ink hover:border-primary"
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-[14.5px] font-medium text-ink">Sign in to join this room</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
                A room needs a real identity, so a session and a reaction can only come from
                someone actually there. You can still watch the headcount without one.
              </p>
              <Link
                href="/signup"
                className="press mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-semibold text-on-primary no-underline"
              >
                Create an account
              </Link>
            </>
          )}
        </section>

        {/* ── Reactions ────────────────────────────────────────────────── */}
        {joinable && (
          <section className="mt-4">
            <div className="flex gap-2">
              {REACTIONS.map((r) => (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() => handleRef.current?.sendReaction(r.emoji, r.label)}
                  className="press flex flex-1 flex-col items-center gap-1 rounded-xl border border-line bg-surface py-3 text-[11px] font-medium text-ink-muted"
                  aria-label={r.label}
                >
                  <span className="text-[19px] leading-none">{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Ephemeral reaction bubbles — never stored, see app/lib/rooms.ts */}
        {bubbles.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2" aria-live="polite">
            {bubbles.map((b) => (
              <span
                key={b.id}
                className="rise inline-flex items-center gap-1.5 rounded-full bg-sunken px-3 py-1.5 text-[12.5px] font-medium text-ink"
              >
                <span>{b.emoji}</span>
                {b.from.split(' ')[0]} · {b.label}
              </span>
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-[12px] leading-relaxed text-ink-faint">
          Nothing said or done here is saved — the room only exists while you&rsquo;re in it.
        </p>
      </div>
    </main>
  )
}
