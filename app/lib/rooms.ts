/**
 * Study rooms: presence and reactions over Supabase Realtime.
 *
 * Deliberately nothing is written to Postgres here. A room's roster lives
 * only in the Realtime server's in-memory presence state, and a reaction is
 * a fire-once broadcast — neither is ever stored. That is the point: there
 * is no chat log to moderate, no message to report, no history to retain or
 * delete later, because none of it exists past the moment it happens.
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

import type { RealtimeChannel } from '@supabase/supabase-js'
import { createBrowserClient, isSupabaseConfigured } from '@/app/lib/supabase'
import { getSession } from '@/app/lib/auth'
import { loadAvatar, colorForName } from '@/app/lib/avatar'

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
