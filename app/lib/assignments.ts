/**
 * Work the tutor has set: durable, unlike the ticket that opens it.
 *
 * The sessionStorage ticket in workGate.ts is a per-tab gate and stays that
 * way — it is genuinely ephemeral. The *assignment* is not: being set
 * homework on Trigonometry is progress data, and until now it died the
 * moment the tab closed. A student set work on the bus should still find it
 * waiting on Today that evening.
 *
 * Signed-out students keep a local list, same as everywhere else.
 */

import { db, isCloud, push, readLocal, writeLocal, announceSync } from '@/app/lib/sync'
import { getSession } from '@/app/lib/auth'
import type { WorkKind } from '@/app/lib/workGate'

const KEY = 'ewin-assignments-v1'

export type Assignment = {
  id: string
  kind: WorkKind
  subjectId?: string
  topic?: string
  brief?: string
  /** epoch ms */
  at: number
  completedAt?: number
}

function read(): Assignment[] {
  return readLocal<Assignment[]>(KEY, [])
}

function write(list: Assignment[]) {
  writeLocal(KEY, list.slice(0, 50))
}

export function listAssignments(): Assignment[] {
  return read().sort((a, b) => b.at - a.at)
}

export function openAssignments(): Assignment[] {
  return listAssignments().filter((a) => !a.completedAt)
}

/** Called when the tutor issues work. Returns the local record immediately. */
export function recordAssignment(input: {
  kind: WorkKind
  subjectId?: string
  topic?: string
  brief?: string
}): Assignment {
  const a: Assignment = {
    // crypto.randomUUID keeps the local id and the Postgres id the same, so
    // completing an assignment offline still matches the right row later.
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}`,
    kind: input.kind,
    subjectId: input.subjectId,
    topic: input.topic,
    brief: input.brief,
    at: Date.now(),
  }
  write([a, ...read()])

  push('assignment', () =>
    db()!
      .from('assignments')
      .insert({
        id: a.id,
        user_id: getSession()!.id,
        kind: a.kind,
        subject_id: a.subjectId ?? null,
        topic: a.topic ?? null,
        brief: a.brief ?? null,
        status: 'open',
      }),
  )

  return a
}

export function completeAssignment(id: string) {
  const now = Date.now()
  write(read().map((a) => (a.id === id ? { ...a, completedAt: now } : a)))

  push('assignment complete', () =>
    db()!
      .from('assignments')
      .update({ status: 'done', completed_at: new Date(now).toISOString() })
      .eq('id', id)
      .eq('user_id', getSession()!.id),
  )
}

/**
 * Marks the most recent open assignment of this kind as done.
 *
 * The work page only knows which *kind* it is running — the ticket carries
 * no id — so this is what "the student finished their homework" resolves to.
 */
export function completeLatestOpen(kind: WorkKind) {
  const target = openAssignments().find((a) => a.kind === kind)
  if (target) completeAssignment(target.id)
}

export async function hydrateAssignmentsFromCloud(): Promise<void> {
  if (!isCloud()) return
  const sb = db()
  if (!sb) return
  const { data, error } = await sb
    .from('assignments')
    .select('id, kind, subject_id, topic, brief, created_at, completed_at')
    .eq('user_id', getSession()!.id)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error || !data) return

  write(
    data.map((r) => ({
      id: r.id,
      kind: r.kind as WorkKind,
      subjectId: r.subject_id ?? undefined,
      topic: r.topic ?? undefined,
      brief: r.brief ?? undefined,
      at: new Date(r.created_at).getTime(),
      completedAt: r.completed_at ? new Date(r.completed_at).getTime() : undefined,
    })),
  )
  announceSync()
}
