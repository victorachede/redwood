/**
 * Study rooms: presence, chat and reactions over Supabase Realtime.
 *
 * Presence and broadcast (reactions, chat) are never written to Postgres —
 * a room's roster and its messages live only in the Realtime server's
 * in-memory state, gone the moment they scroll past or the room empties.
 * That is deliberate: it is what makes this "ephemeral" true rather than a
 * marketing word for a chat log with a short retention window.
 *
 * Ephemeral is not the same as unmoderated, though — a message nobody can
 * ever read back is also a message nobody can act on if it crosses a line.
 * So chat gets three real guards, each covering what the others can't:
 *   1. `checkMessage` — rejects contact-info patterns and profanity before
 *      a message ever sends. Client-side, so it stops accidents and casual
 *      attempts, not a determined bad actor editing their own JS.
 *   2. A per-tab rate limiter — stops flooding.
 *   3. `reportUser` — the one thing that IS written to Postgres, and the
 *      only durable record in this whole file (see the room_reports
 *      migration). Insert-only, unreadable through the anon key by anyone
 *      including the reporter: durable enough for a human to act on later,
 *      but not a browsable log for the ordinary case.
 * Plus a purely local block list — instant, private, needs no round trip.
 *
 * The shared timer piggybacks on presence rather than its own broadcast
 * event, on purpose: broadcast messages are never replayed to a client that
 * subscribes after they fired, so a student who joins mid-session would
 * never learn a timer was already running. Presence state, by contrast, is
 * sent in full to every new subscriber — so "start a timer" is really
 * "update my own presence to say when my timer ends," and every client
 * (including one that joins ten seconds before it finishes) derives the
 * room's running timer by looking at who is currently present.
 */

import { Filter } from 'bad-words'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createBrowserClient, isSupabaseConfigured } from '@/app/lib/supabase'
import { getSession } from '@/app/lib/auth'
import { loadAvatar, colorForName } from '@/app/lib/avatar'
import { db, push } from '@/app/lib/sync'

export type RoomPresence = {
  userId: string
  name: string
  color: string
  joinedAt: number
  /** Set while this person has an active focus timer running. */
  timerEndsAt?: number
  timerMinutes?: number
}

export type RoomReaction = {
  emoji: string
  label: string
  from: string
  at: number
}

export type RoomChatMessage = {
  id: string
  fromId: string
  from: string
  color: string
  text: string
  at: number
}

const MAX_MESSAGE_LEN = 240

/**
 * Contact-info patterns are the highest-value thing to catch here: "let's
 * move this off-platform" is the actual mechanism behind most real harm in
 * a stranger chat, far more than any single bad word. Tolerant of spacing
 * and separators in phone numbers on purpose — "080 123 456 78" is exactly
 * as much a phone number as "08012345678".
 */
const CONTACT_PATTERNS: RegExp[] = [
  /(?:\d[\s.-]?){7,}\d/,
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
  /\b(whatsapp|wa\.me|instagram|insta|snapchat|snap|tiktok|telegram|discord|facebook)\b/i,
  /\b(dm|inbox|text|add|follow)\s+me\b/i,
  /@\w{3,}/,
]

const profanity = new Filter()

/**
 * Rejects outright rather than silently editing, so what a student sees
 * sent is exactly what they typed, or nothing — never a quietly-redacted
 * version that could look like something else went through.
 */
export function checkMessage(raw: string): { ok: true; text: string } | { ok: false; reason: string } {
  const text = raw.trim()
  if (!text) return { ok: false, reason: 'Say something first.' }
  if (text.length > MAX_MESSAGE_LEN) return { ok: false, reason: `Keep it under ${MAX_MESSAGE_LEN} characters.` }
  if (CONTACT_PATTERNS.some((p) => p.test(text))) {
    return { ok: false, reason: "Messages can't include contact info here." }
  }
  if (profanity.isProfane(text)) {
    return { ok: false, reason: "That message isn't allowed here." }
  }
  return { ok: true, text }
}

function rateLimiter(max: number, windowMs: number) {
  const sent: number[] = []
  return () => {
    const now = Date.now()
    while (sent.length && now - sent[0] > windowMs) sent.shift()
    if (sent.length >= max) return false
    sent.push(now)
    return true
  }
}

const BLOCK_KEY = 'ewin-room-blocked-v1'

/** Purely local and instant — needs no round trip, and nobody is told. */
export function blockedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(BLOCK_KEY) || '[]') as string[])
  } catch {
    return new Set()
  }
}

export function blockUser(userId: string) {
  if (typeof window === 'undefined') return
  const ids = blockedIds()
  ids.add(userId)
  localStorage.setItem(BLOCK_KEY, JSON.stringify([...ids]))
}

export function unblockUser(userId: string) {
  if (typeof window === 'undefined') return
  const ids = blockedIds()
  ids.delete(userId)
  localStorage.setItem(BLOCK_KEY, JSON.stringify([...ids]))
}

/** The one durable record in this file — see the module docstring. */
export function reportUser(input: {
  reportedId: string
  reportedName: string
  subjectId: string
  messageText: string
  reason?: string
}) {
  const reporter = getSession()
  if (!reporter) return
  push('room report', () =>
    db()!.from('room_reports').insert({
      reporter_id: reporter.id,
      reported_id: input.reportedId,
      reported_name: input.reportedName,
      subject_id: input.subjectId,
      message_text: input.messageText,
      reason: input.reason ?? null,
    }),
  )
}

/** A small fixed set, not freeform text — see the module docstring. */
export const REACTIONS: { emoji: string; label: string }[] = [
  { emoji: '🔥', label: "Let's go" },
  { emoji: '👍', label: 'Nice one' },
  { emoji: '💪', label: 'Keep going' },
  { emoji: '✅', label: 'Done' },
]

export const TIMER_MINUTES = [15, 25, 45] as const

/** Presence needs a stable identity, so a room needs a real account. */
export function canJoinRoom(): boolean {
  return Boolean(isSupabaseConfigured && getSession())
}

function channelName(subjectId: string) {
  return `room:${subjectId}`
}

/** The room's current shared timer: whoever started one most recently, if it hasn't ended. */
export function activeTimer(people: RoomPresence[]): RoomPresence | null {
  const now = Date.now()
  const running = people.filter((p) => p.timerEndsAt && p.timerEndsAt > now)
  if (!running.length) return null
  return running.reduce((latest, p) => {
    const startOf = (x: RoomPresence) => (x.timerEndsAt ?? 0) - (x.timerMinutes ?? 0) * 60000
    return startOf(p) > startOf(latest) ? p : latest
  })
}

export type RoomHandle = {
  startTimer: (minutes: number) => void
  sendReaction: (emoji: string, label: string) => void
  /** Runs `checkMessage` and the rate limiter before ever sending. */
  sendChat: (text: string) => { ok: true } | { ok: false; reason: string }
  leave: () => void
}

/**
 * Joins a subject's live room. Returns null when this device cannot join
 * (signed out, or Supabase isn't configured) — callers should show a sign-in
 * prompt rather than call this.
 */
export function joinRoom(
  subjectId: string,
  handlers: {
    onPresence: (people: RoomPresence[]) => void
    onReaction: (reaction: RoomReaction) => void
    onChat: (message: RoomChatMessage) => void
  },
): RoomHandle | null {
  const sb = createBrowserClient()
  const session = getSession()
  if (!sb || !session) return null

  const avatar = loadAvatar()
  let me: RoomPresence = {
    userId: session.id,
    name: session.displayName,
    color: avatar.color || colorForName(session.displayName),
    joinedAt: Date.now(),
  }

  const channel: RealtimeChannel = sb.channel(channelName(subjectId), {
    config: { presence: { key: session.id } },
  })

  // 8 messages per 15 seconds — generous for real conversation, tight
  // enough that a flood attempt caps out fast.
  const allowSend = rateLimiter(8, 15000)

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<RoomPresence>()
      const people = Object.values(state)
        .map((entries) => entries[0])
        .filter((p): p is RoomPresence & { presence_ref: string } => Boolean(p))
        .sort((a, b) => a.joinedAt - b.joinedAt)
      handlers.onPresence(people)
    })
    .on('broadcast', { event: 'reaction' }, ({ payload }) => {
      handlers.onReaction(payload as RoomReaction)
    })
    .on('broadcast', { event: 'chat' }, ({ payload }) => {
      handlers.onChat(payload as RoomChatMessage)
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') void channel.track(me)
    })

  return {
    startTimer: (minutes: number) => {
      me = { ...me, timerEndsAt: Date.now() + minutes * 60000, timerMinutes: minutes }
      void channel.track(me)
    },
    sendReaction: (emoji: string, label: string) => {
      const reaction: RoomReaction = { emoji, label, from: me.name, at: Date.now() }
      void channel.send({ type: 'broadcast', event: 'reaction', payload: reaction })
    },
    sendChat: (raw: string) => {
      const checked = checkMessage(raw)
      if (!checked.ok) return checked
      if (!allowSend()) return { ok: false, reason: 'Slow down a little.' }
      const message: RoomChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fromId: me.userId,
        from: me.name,
        color: me.color,
        text: checked.text,
        at: Date.now(),
      }
      void channel.send({ type: 'broadcast', event: 'chat', payload: message })
      handlers.onChat(message)
      return { ok: true }
    },
    leave: () => {
      void sb.removeChannel(channel)
    },
  }
}

/**
 * Read-only headcount for the room list: subscribes to presence without ever
 * tracking, so browsing the list does not itself add a ghost occupant.
 */
export function watchRoomCount(subjectId: string, onCount: (n: number) => void): () => void {
  const sb = createBrowserClient()
  if (!sb) {
    onCount(0)
    return () => {}
  }
  const channel = sb.channel(channelName(subjectId))
  channel
    .on('presence', { event: 'sync' }, () => {
      onCount(Object.keys(channel.presenceState()).length)
    })
    .subscribe()
  return () => void sb.removeChannel(channel)
}
