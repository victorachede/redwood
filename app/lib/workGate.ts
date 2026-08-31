/** Classwork / homework only open when the tutor issues a ticket. */

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

export function clearWorkTicket() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(KEY)
}

/** Call from learn UI when tutor emits ACTION: CLASSWORK | HOMEWORK */
export function openWorkFromTutor(kind: WorkKind, meta?: { subjectId?: string; topic?: string; brief?: string }) {
  issueWorkTicket({ kind, ...meta })
  window.location.href = `/work/${kind}`
}
