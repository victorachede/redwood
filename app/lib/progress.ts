/** Client-side progress — no account required */

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
}

const SESSIONS_KEY = 'ewin-sessions'
const PRACTICE_KEY = 'ewin-practice'
const STREAK_KEY = 'ewin-streak'

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10)
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
    (s) => !(s.subjectId === rec.subjectId && s.topic === rec.topic)
  )
  const next = [rec, ...prev].slice(0, 20)
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(next))
  touchStreak()
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
    if (raw.last !== today && raw.last !== yesterday) return 0
    return raw.count || 0
  } catch {
    return 0
  }
}
