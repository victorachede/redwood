/**
 * Tests for the study card scheduler.
 *
 * Run: npm test
 *
 * A scheduler bug is invisible to a student: the card simply comes back too
 * soon to be worth reviewing, or too late to still be remembered. These pin
 * the behaviour each grade button promises.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { RELEARN_MS, dueLabel, previewLabel, schedule } from '../app/lib/cardSchedule.ts'

const DAY = 86_400_000
const fresh = { interval: 0, ease: 2.5 }

test('a new card comes back later the easier it was', () => {
  const hard = schedule(fresh, 3, 0)
  const good = schedule(fresh, 4, 0)
  const easy = schedule(fresh, 5, 0)
  assert.equal(hard.interval, 1)
  assert.equal(good.interval, 1)
  assert.equal(easy.interval, 4)
  assert.ok(easy.ease > good.ease && good.ease > hard.ease)
})

test('Again brings the card back in ten minutes and resets it', () => {
  const s = schedule({ interval: 30, ease: 2.5 }, 1, 1000)
  assert.equal(s.interval, 0)
  assert.equal(s.due, 1000 + RELEARN_MS)
  assert.equal(s.ease, 2.3)
})

test('a relearned card restarts from short steps, not its old interval', () => {
  const lapsed = schedule({ interval: 40, ease: 2.5 }, 1, 0)
  const back = schedule(lapsed, 4, 0)
  assert.equal(back.interval, 1)
})

test('intervals grow on Good, faster on Easy, slower on Hard, and always move forward', () => {
  const card = { interval: 6, ease: 2.5 }
  const hard = schedule(card, 3, 0).interval
  const good = schedule(card, 4, 0).interval
  const easy = schedule(card, 5, 0).interval
  assert.ok(hard > 6, 'hard still moves forward')
  assert.ok(good > hard)
  assert.ok(easy > good)
  assert.equal(schedule(card, 4, 0).due, good * DAY)
})

test('ease stays within bounds and intervals are capped at a year', () => {
  let card = { interval: 200, ease: 3.0 }
  for (let i = 0; i < 5; i++) card = schedule(card, 5, 0)
  assert.equal(card.ease, 3.0)
  assert.equal(card.interval, 365)
  let low = { interval: 5, ease: 1.3 }
  for (let i = 0; i < 5; i++) low = schedule(low, 1, 0)
  assert.equal(low.ease, 1.3)
})

test('button previews and due labels read the way a student would say them', () => {
  assert.equal(previewLabel(fresh, 1), '10m')
  assert.equal(previewLabel(fresh, 5), '4d')
  assert.equal(previewLabel({ interval: 20, ease: 2.5 }, 4), '7w')
  assert.equal(dueLabel(0, 10), 'due now')
  assert.equal(dueLabel(3 * 3_600_000, 0), 'in 3 hours')
  assert.equal(dueLabel(DAY, 0), 'tomorrow')
})
