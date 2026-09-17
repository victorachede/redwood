/**
 * Milestone celebrations.
 *
 * Three kinds, each honestly derivable from data that already exists —
 * nothing here is invented or counted specially just for the celebration:
 *
 *   - streak    → getStreakInfo().count, the same number Today shows.
 *   - questions → getUsageStats().practiceTotal, real practice volume.
 *   - cards     → listCards().length, cards actually saved.
 *
 * A device remembers which thresholds it has already celebrated (localStorage,
 * not synced — a new device gets to see the big one again, which reads as a
 * bonus, not a bug). On first check after a cloud hydrate can jump several
 * thresholds at once (e.g. signing in on a new phone with a 40-day streak);
 * only the highest newly-crossed threshold per kind is surfaced, and every
 * threshold at or below the current value is marked seen in the same pass,
 * so the smaller ones never queue up behind it later.
 */

import { getStreakInfo, getUsageStats } from '@/app/lib/progress'
import { listCards } from '@/app/lib/cards'

export type MilestoneKind = 'streak' | 'questions' | 'cards'

export type Milestone = {
  id: string
  kind: MilestoneKind
  value: number
  emoji: string
  title: string
  subtitle: string
}

const STREAK_THRESHOLDS = [3, 7, 14, 30, 60, 100, 200, 365]
const QUESTION_THRESHOLDS = [25, 50, 100, 250, 500, 1000, 2500]
const CARD_THRESHOLDS = [10, 25, 50, 100, 200]

const SEEN_KEY = 'ewin-milestones-seen-v1'

function loadSeen(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') as string[])
  } catch {
    return new Set()
  }
}

function saveSeen(ids: Set<string>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]))
  } catch {
    /* quota — not celebrating twice is a fine failure mode */
  }
}

function build(kind: MilestoneKind, value: number): Milestone {
  switch (kind) {
    case 'streak':
      return {
        id: `streak-${value}`,
        kind,
        value,
        emoji: '🔥',
        title: `${value}-day streak`,
        subtitle: `You've studied ${value} days running. Don't stop now.`,
      }
    case 'questions':
      return {
        id: `questions-${value}`,
        kind,
        value,
        emoji: '🎯',
        title: `${value} questions answered`,
        subtitle: `${value} practice questions done — real reps, real progress.`,
      }
    case 'cards':
      return {
        id: `cards-${value}`,
        kind,
        value,
        emoji: '🗂️',
        title: `${value} cards saved`,
        subtitle: `Your deck just passed ${value} cards worth remembering.`,
      }
  }
}

function highestNew(
  kind: MilestoneKind,
  thresholds: number[],
  current: number,
  seenSet: Set<string>,
): Milestone | null {
  const crossed = thresholds.filter((t) => current >= t)
  if (!crossed.length) return null
  const newOnes = crossed.filter((t) => !seenSet.has(`${kind}-${t}`))
  crossed.forEach((t) => seenSet.add(`${kind}-${t}`))
  if (!newOnes.length) return null
  return build(kind, Math.max(...newOnes))
}

/**
 * Call after anything that could move streak, practice volume or the card
 * count — grading a card, finishing a practice round, or just landing on
 * Today. Returns milestones newly crossed since the last check, highest
 * value per kind, and marks them (and everything below them) seen.
 */
export function checkMilestones(): Milestone[] {
  if (typeof window === 'undefined') return []
  const seenSet = loadSeen()
  const out: Milestone[] = []

  const streakM = highestNew('streak', STREAK_THRESHOLDS, getStreakInfo().count, seenSet)
  if (streakM) out.push(streakM)

  const stats = getUsageStats()
  const questionsM = highestNew('questions', QUESTION_THRESHOLDS, stats.practiceTotal, seenSet)
  if (questionsM) out.push(questionsM)

  const cardsM = highestNew('cards', CARD_THRESHOLDS, listCards().length, seenSet)
  if (cardsM) out.push(cardsM)

  if (out.length) saveSeen(seenSet)
  return out
}
