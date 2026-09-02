/** Progress: localStorage cache + Supabase sync when signed in */

import { getSession } from '@/app/lib/auth'
import { createBrowserClient, isSupabaseConfigured } from '@/app/lib/supabase'

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
  messages: unknown[]
}) {
  const uid = userId()
  if (!uid || !isSupabaseConfigured) return
  const sb = createBrowserClient()
  if (!sb) return

  const payload = {
    user_id: uid,
    subject_id: input.subjectId,
    subject_name: input.subjectName || input.subjectId,
    topic: input.topic,
    messages: input.messages.slice(-80),
    updated_at: new Date().toISOString(),
  }

  const { data: existing } = await sb
    .from('tutor_sessions')
    .select('id')
    .eq('user_id', uid)
    .eq('subject_id', input.subjectId)
    .eq('topic', input.topic)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.id) {
    await sb.from('tutor_sessions').update(payload).eq('id', existing.id)
  } else {
    await sb.from('tutor_sessions').insert(payload)
  }
}

export async function hydrateProgressFromCloud(): Promise<void> {
  const uid = userId()
  if (!uid || !isSupabaseConfigured) return
  const sb = createBrowserClient()
  if (!sb) return

  const { data: attempts } = await sb
    .from('practice_attempts')
    .select('subject_id, correct, total, at, exam, timed')
    .eq('user_id', uid)
    .order('at', { ascending: false })
    .limit(40)

  if (attempts?.length) {
    const bySubject = new Map<string, PracticeRecord>()
    for (const a of attempts) {
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
    for (const p of local) {
      if (!bySubject.has(p.subjectId)) merged.push(p)
    }
    localStorage.setItem(PRACTICE_KEY, JSON.stringify(merged.slice(0, 20)))
  }

  const { data: sessions } = await sb
    .from('tutor_sessions')
    .select('subject_id, subject_name, topic, updated_at')
    .eq('user_id', uid)
    .order('updated_at', { ascending: false })
    .limit(20)

  if (sessions?.length) {
    const remote: SessionRecord[] = sessions.map((s) => ({
      subjectId: s.subject_id,
      subjectName: s.subject_name || s.subject_id,
      topic: s.topic || '',
      at: new Date(s.updated_at).getTime(),
    }))
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(remote))
  }
}


export async function loadTutorMessages(subjectId: string, topic: string): Promise<unknown[] | null> {
  const uid = userId()
  if (!uid || !isSupabaseConfigured) return null
  const sb = createBrowserClient()
  if (!sb) return null
  const { data } = await sb
    .from('tutor_sessions')
    .select('messages')
    .eq('user_id', uid)
    .eq('subject_id', subjectId)
    .eq('topic', topic)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.messages as unknown[]) || null
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
  try {
    localStorage.setItem(MASTERY_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
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
  try {
    localStorage.setItem(MISS_KEY, JSON.stringify([...stamped, ...prev].slice(0, 60)))
  } catch {
    /* ignore */
  }
}

/** Clears a miss once the student has been retaught it. */
export function clearMiss(questionId: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      MISS_KEY,
      JSON.stringify(loadMisses().filter((m) => m.questionId !== questionId)),
    )
  } catch {
    /* ignore */
  }
}
