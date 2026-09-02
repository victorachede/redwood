/** Progress: localStorage cache + Supabase sync when signed in */

import { getSession } from '@/app/lib/auth'
import { createBrowserClient, isSupabaseConfigured } from '@/app/lib/supabase'
import { db, isCloud, push, readLocal, writeLocal, announceSync } from '@/app/lib/sync'
import type { ShowDiagramInput } from '@/app/lib/tutorProtocol'
import type { Json } from '@/app/lib/database.types'

/**
 * One turn of a tutor conversation.
 *
 * Defined here rather than in the chat page because the transcript is
 * persisted data, not view state — the page, the Postgres round trip and
 * the learner profile all have to agree on its shape.
 */
export type TutorMessage = {
  role: 'tutor' | 'student'
  content: string
  type?: string
  attachments?: { name: string }[]
  /** Photos the student sent, kept as previews for the transcript */
  photos?: string[]
  /** Figures the tutor drew during this reply */
  diagrams?: ShowDiagramInput[]
}

export type SessionRecord = {
  subjectId: string
  subjectName: string
  topic: string
  at: number
  messageCount?: number
}

export type PracticeRecord = {
  subjectId: string
  correct: number
  total: number
  at: number
  exam?: string
  timed?: boolean
}

const SESSIONS_KEY = 'ewin-sessions'
const PRACTICE_KEY = 'ewin-practice'
const STREAK_KEY = 'ewin-streak'

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

function userId(): string | null {
  return getSession()?.id ?? null
}

export function loadSessions(): SessionRecord[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]') as SessionRecord[]
  } catch {
    return []
  }
}

export function saveSession(rec: SessionRecord) {
  const prev = loadSessions().filter(
    (s) => !(s.subjectId === rec.subjectId && s.topic === rec.topic),
  )
  const next = [rec, ...prev].slice(0, 20)
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(next))
  touchStreak()

  const uid = userId()
  if (uid && isSupabaseConfigured) {
    const sb = createBrowserClient()
    if (sb) {
      void sb.from('tutor_sessions').upsert(
        {
          user_id: uid,
          subject_id: rec.subjectId,
          subject_name: rec.subjectName,
          topic: rec.topic,
          updated_at: new Date(rec.at).toISOString(),
        },
        { onConflict: 'id' },
      ).then(({ error }) => {
        // If no unique constraint on subject/topic, plain insert is fine
        if (error) {
          void sb.from('tutor_sessions').insert({
            user_id: uid,
            subject_id: rec.subjectId,
            subject_name: rec.subjectName,
            topic: rec.topic,
            messages: [],
          })
        }
      })
    }
  }
}

export function loadPractice(): PracticeRecord[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(PRACTICE_KEY) || '[]') as PracticeRecord[]
  } catch {
    return []
  }
}

export function savePractice(rec: PracticeRecord) {
  const prev = loadPractice().filter((p) => p.subjectId !== rec.subjectId)
  localStorage.setItem(PRACTICE_KEY, JSON.stringify([rec, ...prev].slice(0, 20)))
  touchStreak()

  const uid = userId()
  if (uid && isSupabaseConfigured) {
    const sb = createBrowserClient()
    if (sb) {
      void sb.from('practice_attempts').insert({
        user_id: uid,
        subject_id: rec.subjectId,
        exam: rec.exam || 'ALL',
        correct: rec.correct,
        total: rec.total,
        timed: rec.timed ?? false,
        at: new Date(rec.at).toISOString(),
      })
    }
  }
}

/** Pushes the current streak to the profile so it survives a device change. */
function pushStreak(count: number, last: string) {
  push('streak', () =>
    db()!.from('profiles').update({ streak_count: count, streak_last: last }).eq('id', getSession()!.id),
  )
}

export function touchStreak(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}') as {
      last?: string
      count?: number
    }
    const today = dayKey()
    const yesterday = dayKey(new Date(Date.now() - 86400000))
    let count = raw.count || 0
    if (raw.last === today) {
      // already counted
    } else if (raw.last === yesterday) {
      count += 1
    } else {
      count = 1
    }
    localStorage.setItem(STREAK_KEY, JSON.stringify({ last: today, count }))
    pushStreak(count, today)
    return count
  } catch {
    return 0
  }
}

export function getStreak(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}') as {
      last?: string
      count?: number
    }
    const today = dayKey()
    const yesterday = dayKey(new Date(Date.now() - 86400000))
    if (raw.last === today || raw.last === yesterday) return raw.count || 0
    return 0
  } catch {
    return 0
  }
}

export type UsageStats = {
  sessions: number
  subjects: number
  topicCount: number
  practiceCorrect: number
  practiceTotal: number
  accuracyPct: number | null
  streak: number
  lastActive: number | null
}

export function getUsageStats(): UsageStats {
  const sessions = loadSessions()
  const practice = loadPractice()
  const streak = getStreak()
  const subjects = new Set(sessions.map((s) => s.subjectId))
  practice.forEach((p) => subjects.add(p.subjectId))
  const topics = new Set(sessions.map((s) => `${s.subjectId}:${s.topic}`))
  const practiceCorrect = practice.reduce((a, p) => a + p.correct, 0)
  const practiceTotal = practice.reduce((a, p) => a + p.total, 0)
  const times = [
    ...sessions.map((s) => s.at),
    ...practice.map((p) => p.at),
  ]
  return {
    sessions: sessions.length,
    subjects: subjects.size,
    topicCount: topics.size,
    practiceCorrect,
    practiceTotal,
    accuracyPct: practiceTotal > 0 ? Math.round((practiceCorrect / practiceTotal) * 100) : null,
    streak,
    lastActive: times.length ? Math.max(...times) : null,
  }
}

export function clearStudyData() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSIONS_KEY)
  localStorage.removeItem(PRACTICE_KEY)
  localStorage.removeItem(STREAK_KEY)
}

/** Pull remote practice/sessions into local cache (best-effort). */


/** Upsert full chat transcript for a topic into tutor_sessions.messages */
export async function saveTutorMessages(input: {
  subjectId: string
  subjectName?: string
  topic: string
  messages: TutorMessage[]
}) {
  const uid = userId()
  if (!uid || !isSupabaseConfigured) return
  const sb = createBrowserClient()
  if (!sb) return

  // A unique index on (user_id, subject_id, topic) makes this a real upsert.
  // It used to be select-then-update-or-insert, which raced across tabs and
  // had already produced duplicate rows in production. `topic` is NOT NULL
  // DEFAULT '' in the database precisely so a topicless session still keys
  // cleanly — NULLs never compare equal, so they would each insert a row.
  const { error } = await sb.from('tutor_sessions').upsert(
    {
      user_id: uid,
      subject_id: input.subjectId,
      subject_name: input.subjectName || input.subjectId,
      topic: input.topic || '',
      messages: input.messages.slice(-80) as unknown as Json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,subject_id,topic' },
  )
  if (error) console.warn('[sync] saveTutorMessages failed', error)
}

export async function hydrateProgressFromCloud(): Promise<void> {
  const uid = userId()
  if (!uid || !isSupabaseConfigured) return
  const sb = createBrowserClient()
  if (!sb) return

  // One round trip for everything, so a slow connection pays the latency once.
  const [attempts, sessions, mastery, misses, profile] = await Promise.all([
    sb.from('practice_attempts')
      .select('subject_id, correct, total, at, exam, timed')
      .eq('user_id', uid).order('at', { ascending: false }).limit(40),
    sb.from('tutor_sessions')
      .select('subject_id, subject_name, topic, updated_at')
      .eq('user_id', uid).order('updated_at', { ascending: false }).limit(20),
    sb.from('mastery')
      .select('subject_id, topic, level, updated_at')
      .eq('user_id', uid).not('level', 'is', null).limit(120),
    sb.from('practice_misses')
      .select('subject_id, question_id, question, picked, correct, topic, at')
      .eq('user_id', uid).order('at', { ascending: false }).limit(60),
    sb.from('profiles').select('streak_count, streak_last').eq('id', uid).maybeSingle(),
  ])

  if (attempts.data?.length) {
    const bySubject = new Map<string, PracticeRecord>()
    for (const a of attempts.data) {
      if (bySubject.has(a.subject_id)) continue
      bySubject.set(a.subject_id, {
        subjectId: a.subject_id,
        correct: a.correct,
        total: a.total,
        at: new Date(a.at).getTime(),
        exam: a.exam,
        timed: a.timed,
      })
    }
    const local = loadPractice()
    const merged = [...bySubject.values()]
    for (const p of local) if (!bySubject.has(p.subjectId)) merged.push(p)
    writeLocal(PRACTICE_KEY, merged.slice(0, 20))
  }

  if (sessions.data?.length) {
    writeLocal(
      SESSIONS_KEY,
      sessions.data.map((s) => ({
        subjectId: s.subject_id,
        subjectName: s.subject_name || s.subject_id,
        topic: s.topic || '',
        at: new Date(s.updated_at).getTime(),
      })),
    )
  }

  if (mastery.data?.length) {
    writeLocal(
      MASTERY_KEY,
      mastery.data.map((m) => ({
        subjectId: m.subject_id,
        topic: m.topic,
        level: m.level as MasteryLevel,
        at: new Date(m.updated_at).getTime(),
      })),
    )
  }

  if (misses.data?.length) {
    writeLocal(
      MISS_KEY,
      misses.data.map((m) => ({
        subjectId: m.subject_id,
        questionId: m.question_id,
        question: m.question,
        picked: m.picked,
        correct: m.correct,
        topic: m.topic ?? undefined,
        at: new Date(m.at).getTime(),
      })),
    )
  }

  // The streak is the one value where the server can be behind: it is only
  // written on activity. Take whichever is further along.
  const remote = profile.data
  if (remote?.streak_last) {
    const local = readLocal<{ last?: string; count?: number }>(STREAK_KEY, {})
    if (!local.last || remote.streak_last > local.last || (remote.streak_count ?? 0) > (local.count ?? 0)) {
      writeLocal(STREAK_KEY, { last: remote.streak_last, count: remote.streak_count ?? 0 })
    }
  }

  announceSync()
}

export async function loadTutorMessages(
  subjectId: string,
  topic: string,
): Promise<TutorMessage[] | null> {
  const uid = userId()
  if (!uid || !isSupabaseConfigured) return null
  const sb = createBrowserClient()
  if (!sb) return null
  const { data } = await sb
    .from('tutor_sessions')
    .select('messages')
    .eq('user_id', uid)
    .eq('subject_id', subjectId)
    .eq('topic', topic || '')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.messages as TutorMessage[] | null) || null
}

/* ═══════════════════════════════════════════════════════════════════════════
   Topic mastery — the tutor's memory of where a student stands.

   Written by the record_mastery tool, read back into the learner profile so
   a later session can open on the right weakness instead of starting cold.
   ═══════════════════════════════════════════════════════════════════════════ */

export type MasteryLevel = 'struggling' | 'developing' | 'solid'

export type MasteryRecord = {
  subjectId: string
  topic: string
  level: MasteryLevel
  at: number
}

const MASTERY_KEY = 'ewin-mastery-v1'

export function loadMastery(): MasteryRecord[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(MASTERY_KEY) || '[]') as MasteryRecord[]
  } catch {
    return []
  }
}

/** Latest judgement per (subject, topic) wins. */
export function recordMastery(subjectId: string, topic: string, level: MasteryLevel) {
  if (typeof window === 'undefined') return
  const prev = loadMastery().filter(
    (m) => !(m.subjectId === subjectId && m.topic === topic),
  )
  const next = [{ subjectId, topic, level, at: Date.now() }, ...prev].slice(0, 120)
  writeLocal(MASTERY_KEY, next)

  push('mastery', () =>
    db()!
      .from('mastery')
      .upsert(
        {
          user_id: getSession()!.id,
          subject_id: subjectId,
          topic,
          level,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,subject_id,topic' },
      ),
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Practice misses — which questions were actually got wrong.

   PracticeRecord only ever stored {correct, total} aggregates, so "what you
   got wrong last time" was not recoverable from any store in the app.
   ═══════════════════════════════════════════════════════════════════════════ */

export type MissRecord = {
  subjectId: string
  questionId: string
  question: string
  picked: string
  correct: string
  topic?: string
  at: number
}

const MISS_KEY = 'ewin-misses-v1'

export function loadMisses(): MissRecord[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(MISS_KEY) || '[]') as MissRecord[]
  } catch {
    return []
  }
}

export function saveMisses(records: Omit<MissRecord, 'at'>[]) {
  if (typeof window === 'undefined' || records.length === 0) return
  const at = Date.now()
  const stamped = records.map((r) => ({ ...r, at }))
  // De-duplicate by question id, newest first, capped.
  const seen = new Set(stamped.map((r) => r.questionId))
  const prev = loadMisses().filter((m) => !seen.has(m.questionId))
  writeLocal(MISS_KEY, [...stamped, ...prev].slice(0, 60))

  const uid = getSession()?.id
  if (uid) {
    push('misses', () =>
      db()!.from('practice_misses').upsert(
        stamped.map((r) => ({
          user_id: uid,
          question_id: r.questionId,
          subject_id: r.subjectId,
          question: r.question,
          picked: r.picked,
          correct: r.correct,
          topic: r.topic ?? null,
          at: new Date(r.at).toISOString(),
        })),
        { onConflict: 'user_id,question_id' },
      ),
    )
  }
}

/** Clears a miss once the student has been retaught it. */
export function clearMiss(questionId: string) {
  if (typeof window === 'undefined') return
  writeLocal(MISS_KEY, loadMisses().filter((m) => m.questionId !== questionId))
  const uid = getSession()?.id
  if (uid) {
    push('clearMiss', () =>
      db()!.from('practice_misses').delete().eq('user_id', uid).eq('question_id', questionId),
    )
  }
}
