/**
 * A compact picture of the student, sent with every tutor request.
 *
 * Before this, the tutor had no memory at all: streak, accuracy, past
 * transcripts and card ease all existed in the app and none were ever sent,
 * so every session opened cold. This is the thing that lets it say "last time
 * the ratio questions tripped you up" instead of "what would you like to
 * learn?".
 *
 * Kept deliberately small — it rides on every request, so it is a token cost
 * paid per turn.
 */

import { SUBJECTS, getSubject } from '@/app/lib/subjects'
import { dueCards } from '@/app/lib/cards'
import {
  getStreak,
  loadMastery,
  loadMisses,
  loadPractice,
  loadSessions,
} from '@/app/lib/progress'
import { getSession } from '@/app/lib/auth'

export type ProfileSubject = {
  id: string
  name: string
  accuracyPct: number | null
  weak: string[]
  solid: string[]
}

export type LearnerProfile = {
  name?: string
  streakDays: number
  dueCards: number
  subjects: ProfileSubject[]
  recentMisses: { q: string; picked: string; correct: string; topic?: string }[]
  lastTopic?: { subject: string; topic: string; daysAgo: number }
}

const MAX_MISSES = 4

export function buildLearnerProfile(subjectId?: string): LearnerProfile | null {
  if (typeof window === 'undefined') return null

  try {
    const mastery = loadMastery()
    const practice = loadPractice()
    const sessions = loadSessions()
    const misses = loadMisses()

    // Only carry subjects the student has actually touched, plus the one they
    // are in right now. Sending all six every turn is noise.
    const touched = new Set<string>([
      ...practice.map((p) => p.subjectId),
      ...sessions.map((s) => s.subjectId),
      ...mastery.map((m) => m.subjectId),
    ])
    if (subjectId) touched.add(subjectId)

    const subjects: ProfileSubject[] = SUBJECTS.filter((s) => touched.has(s.id)).map((s) => {
      const pr = practice.find((p) => p.subjectId === s.id)
      const mine = mastery.filter((m) => m.subjectId === s.id)
      return {
        id: s.id,
        name: s.name,
        accuracyPct: pr && pr.total > 0 ? Math.round((pr.correct / pr.total) * 100) : null,
        weak: mine.filter((m) => m.level === 'struggling').map((m) => m.topic).slice(0, 4),
        solid: mine.filter((m) => m.level === 'solid').map((m) => m.topic).slice(0, 4),
      }
    })

    const last = sessions[0]
    const lastTopic = last
      ? {
          subject: getSubject(last.subjectId)?.name ?? last.subjectId,
          topic: last.topic,
          daysAgo: Math.max(0, Math.floor((Date.now() - last.at) / 86_400_000)),
        }
      : undefined

    return {
      name: getSession()?.displayName,
      streakDays: getStreak(),
      dueCards: dueCards().length,
      subjects,
      recentMisses: misses
        .filter((m) => !subjectId || m.subjectId === subjectId)
        .slice(0, MAX_MISSES)
        .map((m) => ({ q: m.question, picked: m.picked, correct: m.correct, topic: m.topic })),
      lastTopic,
    }
  } catch {
    return null
  }
}

/**
 * Renders the profile as prose for the system prompt.
 *
 * Prose rather than JSON on purpose: the model follows narrative instructions
 * about a person more reliably than it reads a data structure, and it costs
 * fewer tokens than a nested object.
 */
export function renderProfile(p: LearnerProfile | null | undefined): string {
  if (!p) return ''

  const lines: string[] = []

  if (p.name) lines.push(`Student: ${p.name}.`)
  if (p.streakDays > 1) lines.push(`On a ${p.streakDays}-day study streak.`)

  if (p.lastTopic) {
    const when =
      p.lastTopic.daysAgo === 0
        ? 'earlier today'
        : p.lastTopic.daysAgo === 1
          ? 'yesterday'
          : `${p.lastTopic.daysAgo} days ago`
    lines.push(`Last studied ${p.lastTopic.subject} — ${p.lastTopic.topic}, ${when}.`)
  }

  for (const s of p.subjects) {
    const bits: string[] = []
    if (s.accuracyPct !== null) bits.push(`${s.accuracyPct}% on practice`)
    if (s.weak.length) bits.push(`struggling with ${s.weak.join(', ')}`)
    if (s.solid.length) bits.push(`solid on ${s.solid.join(', ')}`)
    if (bits.length) lines.push(`${s.name}: ${bits.join('; ')}.`)
  }

  if (p.recentMisses.length) {
    lines.push('Recently got these practice questions wrong:')
    for (const m of p.recentMisses) {
      lines.push(`- "${m.q}" (answered ${m.picked}, correct was ${m.correct})`)
    }
  }

  if (p.dueCards > 0) lines.push(`${p.dueCards} revision cards are due.`)

  if (lines.length === 0) return ''

  return `What you know about this student:
${lines.join('\n')}

Use this naturally. Open on a known weakness when it is relevant rather than asking what they want to study. Do not read the list back to them, and do not mention that you have notes on them.`
}
