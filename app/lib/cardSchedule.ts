/**
 * When a study card comes back.
 *
 * A small spaced-repetition scheduler in the SM-2 family. Kept free of
 * storage and React so the rules can be tested on their own.
 *
 * What it fixes from the first version: a brand-new card came back in one
 * day whether it was marked Hard, Good or Easy, so "Easy" meant nothing on
 * a first review; and a lapsed card kept its long interval's maths, so it
 * could jump straight back out to weeks after being forgotten.
 */

export type Grade = 1 | 3 | 4 | 5

export type Schedulable = {
  /** Days until the next review; 0 while the card is new or relearning. */
  interval: number
  /** How quickly intervals grow, 1.3 to 3.0. */
  ease: number
}

export type Scheduled = Schedulable & { due: number }

const MINUTE = 60_000
const DAY = 86_400_000
const MAX_DAYS = 365
const MIN_EASE = 1.3
const MAX_EASE = 3.0

/** Again: back in ten minutes, in this sitting. */
export const RELEARN_MS = 10 * MINUTE

const clampEase = (e: number) => Math.min(MAX_EASE, Math.max(MIN_EASE, Math.round(e * 100) / 100))
const clampDays = (d: number) => Math.min(MAX_DAYS, Math.max(1, Math.round(d)))

/** The card's next interval and due time after a grade. */
export function schedule(card: Schedulable, grade: Grade, now = Date.now()): Scheduled {
  const ease = card.ease || 2.5

  if (grade === 1) {
    return { interval: 0, ease: clampEase(ease - 0.2), due: now + RELEARN_MS }
  }

  // First time through, or relearning after an Again: fixed first steps, so
  // the grade actually changes when it comes back.
  if (card.interval === 0) {
    const days = grade === 3 ? 1 : grade === 4 ? 1 : 4
    const nextEase = grade === 3 ? ease - 0.15 : grade === 5 ? ease + 0.15 : ease
    return { interval: days, ease: clampEase(nextEase), due: now + days * DAY }
  }

  const prev = card.interval
  let days: number
  let nextEase = ease
  if (grade === 3) {
    days = Math.max(prev + 1, prev * 1.2)
    nextEase = ease - 0.15
  } else if (grade === 4) {
    days = Math.max(prev + 1, prev * ease)
  } else {
    days = Math.max(prev + 2, prev * ease * 1.3)
    nextEase = ease + 0.15
  }
  const interval = clampDays(days)
  return { interval, ease: clampEase(nextEase), due: now + interval * DAY }
}

/** "10m", "1d", "3w", "4mo": what each grade button would do, shown on the button. */
export function previewLabel(card: Schedulable, grade: Grade): string {
  const s = schedule(card, grade, 0)
  if (s.interval === 0) return `${Math.round(RELEARN_MS / MINUTE)}m`
  const d = s.interval
  if (d < 14) return `${d}d`
  if (d < 60) return `${Math.round(d / 7)}w`
  return `${Math.round(d / 30)}mo`
}

/** "now", "in 3 hours", "tomorrow", "in 5 days". */
export function dueLabel(due: number, now = Date.now()): string {
  const ms = due - now
  if (ms <= 0) return 'due now'
  const mins = Math.round(ms / MINUTE)
  if (mins < 60) return `in ${mins} min`
  const hours = Math.round(ms / 3_600_000)
  if (hours < 24) return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`
  const days = Math.round(ms / DAY)
  if (days === 1) return 'tomorrow'
  if (days < 60) return `in ${days} days`
  return `in ${Math.round(days / 30)} months`
}
