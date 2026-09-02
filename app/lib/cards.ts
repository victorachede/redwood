/** Study cards: localStorage + Supabase sync when signed in */

import { getSession } from '@/app/lib/auth'
import { createBrowserClient, isSupabaseConfigured } from '@/app/lib/supabase'
import { db, push } from '@/app/lib/sync'

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

function write(cards: StudyCard[]) {
  localStorage.setItem(KEY, JSON.stringify(cards.slice(0, 200)))
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

/** grade: 1 again, 3 hard, 4 good, 5 easy */
export function gradeCard(id: string, grade: 1 | 3 | 4 | 5) {
  const cards = read()
  const i = cards.findIndex((c) => c.id === id)
  if (i < 0) return
  const c = { ...cards[i] }
  if (grade === 1) {
    c.interval = 0
    c.due = Date.now() + 10 * 60 * 1000
    c.ease = Math.max(1.3, c.ease - 0.2)
  } else {
    const mult = grade === 3 ? 1.2 : grade === 4 ? 1.8 : 2.5
    c.interval = c.interval === 0 ? 1 : Math.max(1, Math.round(c.interval * c.ease * mult * 0.5))
    c.due = Date.now() + c.interval * 24 * 60 * 60 * 1000
    c.ease = Math.min(3.0, c.ease + (grade === 5 ? 0.15 : grade === 4 ? 0.05 : -0.05))
  }
  cards[i] = c
  write(cards)
  // Review state used to be local-only, so a student's queue reset entirely
  // on a new device. It now follows them.
  pushCard(c)
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
    .limit(200)

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
    }
    const mine = byFront.get(row.front)
    // Last write wins on the schedule, so grading on a phone is not undone
    // by an older copy sitting in a laptop's cache.
    if (!mine || (row.updated_at && new Date(row.updated_at).getTime() >= mine.due - mine.interval * 86400000)) {
      byFront.set(row.front, remote)
    }
  }

  write([...byFront.values()].sort((a, b) => b.createdAt - a.createdAt).slice(0, 200))
}
