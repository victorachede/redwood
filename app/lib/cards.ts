/** Study cards: localStorage + Supabase sync when signed in */

import { getSession } from '@/app/lib/auth'
import { createBrowserClient, isSupabaseConfigured } from '@/app/lib/supabase'
import { db, push } from '@/app/lib/sync'
import { SUBJECTS } from '@/app/lib/subjects'
import { schedule, type Grade } from '@/app/lib/cardSchedule'

export type StudyCard = {
  id: string
  front: string
  back: string
  subject?: string
  source?: 'tutor' | 'practice' | 'work' | 'manual'
  ease: number
  interval: number
  due: number
  createdAt: number
  /** When it was last graded. Lets a sync tell a fresher copy from an older one. */
  reviewedAt?: number
}

const KEY = 'ewin-cards-v1'

function read(): StudyCard[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as StudyCard[]
  } catch {
    return []
  }
}

/** Generous, but bounded: localStorage is a few megabytes at most. */
const MAX_CARDS = 1000

function write(cards: StudyCard[]) {
  localStorage.setItem(KEY, JSON.stringify(cards.slice(0, MAX_CARDS)))
}

/**
 * The subject a card belongs to. Cards record a loose label (a lesson's
 * subject name, a subject id from a call, a work item's title), so this
 * accepts either an id or a name and returns the id, or undefined.
 */
export function subjectIdOf(label?: string): string | undefined {
  if (!label) return undefined
  const norm = label.trim().toLowerCase()
  return SUBJECTS.find((s) => s.id === norm || s.name.toLowerCase() === norm)?.id
}

function userId(): string | null {
  return getSession()?.id ?? null
}

export function listCards(): StudyCard[] {
  return read().sort((a, b) => a.due - b.due)
}

export function dueCards(now = Date.now()): StudyCard[] {
  return listCards().filter((c) => c.due <= now)
}

export function addCard(input: {
  front: string
  back: string
  subject?: string
  source?: StudyCard['source']
}): StudyCard {
  const card: StudyCard = {
    id: `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    front: input.front.trim(),
    back: input.back.trim(),
    subject: input.subject,
    source: input.source || 'manual',
    ease: 2.5,
    interval: 0,
    due: Date.now(),
    createdAt: Date.now(),
  }
  write([card, ...read().filter((c) => c.front !== card.front)])

  pushCard(card)
  return card
}

/**
 * Writes a card and its review schedule to Postgres.
 *
 * Upserts on (user_id, md5(front)) so the same card saved twice updates in
 * place instead of accumulating rows.
 */
function pushCard(c: StudyCard) {
  const uid = userId()
  if (!uid) return
  push('card', () =>
    db()!.from('study_cards').upsert(
      {
        user_id: uid,
        front: c.front,
        back: c.back,
        subject: c.subject ?? null,
        source: c.source || 'manual',
        ease: c.ease,
        interval_days: c.interval,
        due: new Date(c.due).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,front_key' },
    ),
  )
}

/**
 * Grades a card (1 again, 3 hard, 4 good, 5 easy) and returns both the
 * card as it was, so the grade can be undone, and as it is now.
 */
export function gradeCard(id: string, grade: Grade): { before: StudyCard; after: StudyCard } | null {
  const cards = read()
  const i = cards.findIndex((c) => c.id === id)
  if (i < 0) return null
  const before = cards[i]
  const now = Date.now()
  const after: StudyCard = { ...before, ...schedule(before, grade, now), reviewedAt: now }
  cards[i] = after
  write(cards)
  // Review state follows the student to any device they sign in on.
  pushCard(after)
  return { before, after }
}

/** Puts a card back exactly as it was: the undo for a grade. */
export function restoreCard(card: StudyCard) {
  const cards = read()
  const i = cards.findIndex((c) => c.id === card.id)
  if (i < 0) return
  cards[i] = card
  write(cards)
  pushCard(card)
}

/** Deletes a card here and from the student's account. */
export function deleteCard(id: string) {
  const cards = read()
  const card = cards.find((c) => c.id === id)
  if (!card) return
  write(cards.filter((c) => c.id !== id))
  const uid = userId()
  if (!uid) return
  push('card-delete', () => db()!.from('study_cards').delete().eq('user_id', uid).eq('front', card.front))
}

/** How many cards were graded today, for the "reviewed today" count. */
export function reviewedToday(now = new Date()): number {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  return read().filter((c) => (c.reviewedAt ?? 0) >= start.getTime()).length
}

export function parseTutorCards(text: string): { front: string; back: string }[] {
  const block = text.match(/STUDY_CARDS:\s*([\s\S]*)$/i)
  if (!block) return []
  const pairs: { front: string; back: string }[] = []
  const re = /Q:\s*([\s\S]+?)\s*A:\s*([\s\S]+?)(?=\s*Q:|$)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(block[1])) !== null) {
    pairs.push({ front: m[1].trim(), back: m[2].trim() })
  }
  return pairs.slice(0, 4)
}

export function stripStudyCardsBlock(text: string): string {
  return text.replace(/\n*STUDY_CARDS:\s*[\s\S]*$/i, '').trim()
}

/** Merge remote cards into local (by front text). */
export async function hydrateCardsFromCloud(): Promise<void> {
  const uid = userId()
  if (!uid || !isSupabaseConfigured) return
  const sb = createBrowserClient()
  if (!sb) return

  const { data } = await sb
    .from('study_cards')
    .select('id, front, back, subject, source, ease, interval_days, due, created_at, updated_at')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(MAX_CARDS)

  if (!data?.length) return

  const local = read()
  const byFront = new Map(local.map((c) => [c.front, c]))

  for (const row of data) {
    const remote: StudyCard = {
      id: row.id,
      front: row.front,
      back: row.back,
      subject: row.subject || undefined,
      source: (row.source as StudyCard['source']) || 'tutor',
      ease: row.ease ?? 2.5,
      interval: row.interval_days ?? 0,
      due: row.due ? new Date(row.due).getTime() : Date.now(),
      createdAt: new Date(row.created_at).getTime(),
      reviewedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
    }
    const mine = byFront.get(row.front)
    // Last write wins on the schedule, so grading on a phone is not undone
    // by an older copy sitting in a laptop's cache. The local id is kept so
    // an undo in progress still finds its card.
    const mineAt = mine ? (mine.reviewedAt ?? mine.createdAt) : 0
    if (!mine || (remote.reviewedAt ?? 0) > mineAt) {
      byFront.set(row.front, mine ? { ...remote, id: mine.id } : remote)
    }
  }

  write([...byFront.values()].sort((a, b) => b.createdAt - a.createdAt))
}
