/** Classwork / homework only open when the tutor issues a ticket. */

import { recordAssignment } from '@/app/lib/assignments'

export type WorkKind = 'homework' | 'classwork'

export type WorkTicket = {
  kind: WorkKind
  subjectId?: string
  topic?: string
  issuedAt: number
  /** Optional brief from the tutor */
  brief?: string
}

const KEY = 'ewin-work-ticket-v1'
/** Ticket valid for 2 hours */
const TTL_MS = 2 * 60 * 60 * 1000

export function issueWorkTicket(ticket: Omit<WorkTicket, 'issuedAt'> & { issuedAt?: number }) {
  if (typeof window === 'undefined') return
  const full: WorkTicket = {
    ...ticket,
    issuedAt: ticket.issuedAt ?? Date.now(),
  }
  sessionStorage.setItem(KEY, JSON.stringify(full))
}

export function peekWorkTicket(): WorkTicket | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const t = JSON.parse(raw) as WorkTicket
    if (Date.now() - t.issuedAt > TTL_MS) {
      sessionStorage.removeItem(KEY)
      return null
    }
    return t
  } catch {
    return null
  }
}

export function consumeWorkTicket(kind: WorkKind): WorkTicket | null {
  const t = peekWorkTicket()
  if (!t || t.kind !== kind) return null
  return t
}

/**
 * Reopens work that was already set, from its stored assignment.
 *
 * The ticket lives in sessionStorage, so a student who comes back the next
 * day has none — without this, tapping their own outstanding homework on
 * Today would land on the lock screen. The gate exists to stop students
 * helping themselves to work they were never set; a recorded assignment is
 * proof they were, so reissuing is exactly right.
 */
export function reopenWork(a: { kind: WorkKind; subjectId?: string; topic?: string; brief?: string }) {
  issueWorkTicket({ kind: a.kind, subjectId: a.subjectId, topic: a.topic, brief: a.brief })
  window.location.href = `/work/${a.kind}`
}

export function clearWorkTicket() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(KEY)
}

/**
 * Called when the student taps the work card the tutor put in the chat.
 *
 * Two separate things happen, deliberately: the ticket is the per-tab gate
 * that unlocks /work/<kind> right now, and the assignment is the durable
 * record so the same work is still findable tomorrow on another device.
 */
export function openWorkFromTutor(
  kind: WorkKind,
  meta?: { subjectId?: string; topic?: string; brief?: string },
) {
  issueWorkTicket({ kind, ...meta })
  recordAssignment({ kind, ...meta })
  window.location.href = `/work/${kind}`
}
