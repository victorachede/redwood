'use client'

import Link from 'next/link'
import { use, useEffect, useRef, useState } from 'react'
import { AppHeader } from '@/components/ui/AppHeader'
import { Avatar } from '@/components/ui/Avatar'
import { getSubject } from '@/app/lib/subjects'
import { getSession } from '@/app/lib/auth'
import {
  activeTimer,
  blockedIds,
  blockUser,
  canJoinRoom,
  joinRoom,
  reportUser,
  unblockUser,
  watchRoomCount,
  REACTIONS,
  TIMER_MINUTES,
  type RoomChatMessage,
  type RoomHandle,
  type RoomPresence,
  type RoomReaction,
} from '@/app/lib/rooms'

type Bubble = RoomReaction & { id: string }

const REPORT_REASONS = ['Asked for contact info', 'Inappropriate language', 'Something else']

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
  const [messages, setMessages] = useState<RoomChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [chatError, setChatError] = useState<string | null>(null)
  const [blocked, setBlocked] = useState<Set<string>>(() => blockedIds())
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [reportTarget, setReportTarget] = useState<RoomChatMessage | null>(null)
  const [reported, setReported] = useState(false)
  const [joinable, setJoinable] = useState(true)
  const [ready, setReady] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const handleRef = useRef<RoomHandle | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
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
      onChat: (m) => setMessages((prev) => [...prev.slice(-99), m]),
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  function send(e: React.FormEvent) {
    e.preventDefault()
    if (!handleRef.current) return
    const res = handleRef.current.sendChat(draft)
    if (!res.ok) {
      setChatError(res.reason)
      setTimeout(() => setChatError(null), 3000)
      return
    }
    setDraft('')
  }

  function doBlock(userId: string) {
    blockUser(userId)
    setBlocked(blockedIds())
    setMenuFor(null)
  }

  function doUnblock(userId: string) {
    unblockUser(userId)
    setBlocked(blockedIds())
  }

  function submitReport(reason: string) {
    if (!reportTarget || !subject) return
    reportUser({
      reportedId: reportTarget.fromId,
      reportedName: reportTarget.from,
      subjectId: subject.id,
      messageText: reportTarget.text,
      reason,
    })
    setReportTarget(null)
    setMenuFor(null)
    setReported(true)
    setTimeout(() => setReported(false), 2500)
  }

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
  const visiblePeople = people.filter((p) => !blocked.has(p.userId))
  const visibleMessages = messages.filter((m) => !blocked.has(m.fromId))
  const alone = joinable && ready && visiblePeople.length <= 1

  return (
    <main className="bg-paper text-ink">
      {reported && (
        <div
          role="status"
          className="rise fixed bottom-8 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-on-dark shadow-[var(--shadow-lg)]"
        >
          Reported — thanks for flagging it.
        </div>
      )}
      <AppHeader title={`${subject.name} room`} subtitle={ready ? undefined : 'Connecting…'} back="/rooms" />

      <div className="mx-auto max-w-2xl px-4 pb-8 pt-6">
        {/* ── Presence ─────────────────────────────────────────────────── */}
        <section
          className="rounded-2xl p-5"
          style={{ background: `color-mix(in srgb, ${subject.accent} 8%, var(--paper))` }}
        >
          <p className="margin-label">
            {ready
              ? visiblePeople.length === 0
                ? 'Nobody here yet'
                : visiblePeople.length === 1
                  ? '1 person here'
                  : `${visiblePeople.length} people here`
              : 'Loading'}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {visiblePeople.map((p) => (
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
                A room needs a real identity, so a session, a message or a reaction can only come
                from someone actually there. You can still watch the headcount without one.
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

        {/* ── Chat ─────────────────────────────────────────────────────── */}
        {joinable && (
          <section className="mt-4 rounded-2xl border border-line bg-surface">
            <div className="max-h-[340px] min-h-[120px] overflow-y-auto px-4 py-3">
              {visibleMessages.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-ink-muted">
                  No messages yet — say hello.
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {visibleMessages.map((m) => {
                    const mine = m.fromId === meId
                    return (
                      <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                        {!mine && (
                          <button
                            type="button"
                            onClick={() => setMenuFor(menuFor === m.id ? null : m.id)}
                            className="mb-0.5 px-1 text-[11px] font-semibold"
                            style={{ color: m.color }}
                          >
                            {m.from.split(' ')[0]}
                          </button>
                        )}
                        <span
                          className="max-w-[80%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-snug"
                          style={
                            mine
                              ? { background: 'var(--primary)', color: 'var(--on-primary)' }
                              : { background: 'var(--sunken)', color: 'var(--ink)' }
                          }
                        >
                          {m.text}
                        </span>
                        {!mine && menuFor === m.id && (
                          <div className="mt-1 flex gap-2 px-1">
                            <button
                              type="button"
                              onClick={() => doBlock(m.fromId)}
                              className="text-[11px] font-semibold text-ink-muted"
                            >
                              Block {m.from.split(' ')[0]}
                            </button>
                            <button
                              type="button"
                              onClick={() => setReportTarget(m)}
                              className="text-[11px] font-semibold text-wrong"
                            >
                              Report
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
            <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-2.5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Say something…"
                maxLength={240}
                className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-[13.5px] text-ink outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="press shrink-0 rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-on-primary disabled:opacity-40"
              >
                Send
              </button>
            </form>
            {chatError && (
              <p className="px-4 pb-2.5 text-[12px] font-medium text-wrong">{chatError}</p>
            )}
          </section>
        )}

        {blocked.size > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 px-1 text-[11.5px] text-ink-faint">
            <span>Blocked here:</span>
            {[...blocked].map((id) => {
              const p = people.find((x) => x.userId === id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => doUnblock(id)}
                  className="rounded-full bg-sunken px-2 py-0.5 font-medium text-ink-muted"
                >
                  {p?.name.split(' ')[0] ?? 'Someone'} ✕
                </button>
              )
            })}
          </div>
        )}

        <p className="mt-6 text-center text-[12px] leading-relaxed text-ink-faint">
          Nothing said or done here is saved — the room only exists while you&rsquo;re in it.
          Reporting someone is the one exception: that goes to us, not the other person.
        </p>
      </div>

      {/* ── Report confirm ───────────────────────────────────────────── */}
      {reportTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 sm:items-center"
          onClick={() => setReportTarget(null)}
        >
          <div
            className="pop w-full max-w-sm rounded-t-3xl bg-surface p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-[19px] text-ink">Report {reportTarget.from.split(' ')[0]}?</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
              This goes to Ewin, not back to them. Pick what happened.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => submitReport(reason)}
                  className="press rounded-xl border border-line px-4 py-3 text-left text-[13.5px] font-medium text-ink hover:border-wrong"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setReportTarget(null)}
              className="press mt-3 w-full rounded-xl px-4 py-2.5 text-[13px] font-medium text-ink-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
