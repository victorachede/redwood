/**
 * Validation tests for generated practice questions.
 *
 * Run: npm test
 *
 * Every case here is a way a generated question can be quietly broken while
 * still rendering perfectly in the UI. A student revising for WAEC cannot
 * tell any of them from a good question, so these are the only thing that
 * can.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateQuestion } from '../app/lib/questionGen.ts'

const good = {
  question: 'If 3x - 5 = 10, what is the value of x?',
  options: { A: '3', B: '5', C: '15', D: '45' },
  answer: 'B',
  explanation: 'Add 5 to both sides to get 3x = 15, then divide both sides by 3 to get x = 5.',
  difficulty: 1,
}

test('accepts a well-formed question', () => {
  const r = validateQuestion(good)
  assert.equal(r.ok, true)
  if (r.ok) {
    assert.equal(r.value.answer, 'B')
    assert.equal(r.value.difficulty, 1)
  }
})

test('rejects duplicate options — unanswerable even with a correct key', () => {
  const r = validateQuestion({ ...good, options: { A: '5', B: '5', C: '15', D: '45' } })
  assert.equal(r.ok, false)
  if (!r.ok) assert.match(r.why, /duplicate/)
})

test('rejects an empty option', () => {
  const r = validateQuestion({ ...good, options: { A: '3', B: '', C: '15', D: '45' } })
  assert.equal(r.ok, false)
})

test('rejects an answer key outside A-D', () => {
  assert.equal(validateQuestion({ ...good, answer: 'E' }).ok, false)
  assert.equal(validateQuestion({ ...good, answer: '' }).ok, false)
  assert.equal(validateQuestion({ ...good, answer: 2 }).ok, false)
})

test('accepts a lowercase answer key, normalised', () => {
  const r = validateQuestion({ ...good, answer: 'b' })
  assert.equal(r.ok, true)
  if (r.ok) assert.equal(r.value.answer, 'B')
})

test('rejects an explanation that only restates the answer', () => {
  for (const e of ['The answer is B.', 'answer is B', 'The correct option is B.']) {
    const r = validateQuestion({ ...good, explanation: e })
    assert.equal(r.ok, false, `should reject: ${e}`)
  }
})

test('rejects an explanation too thin to teach anything', () => {
  assert.equal(validateQuestion({ ...good, explanation: 'Divide by 3.' }).ok, false)
})

test('rejects a stub question', () => {
  assert.equal(validateQuestion({ ...good, question: 'Solve.' }).ok, false)
})

test('rejects junk rather than throwing on it', () => {
  for (const junk of [null, undefined, 'a string', 42, [], {}]) {
    const r = validateQuestion(junk)
    assert.equal(r.ok, false)
  }
})

test('clamps difficulty into range and defaults when missing', () => {
  const hi = validateQuestion({ ...good, difficulty: 9 })
  assert.equal(hi.ok && hi.value.difficulty, 3)
  const lo = validateQuestion({ ...good, difficulty: -4 })
  assert.equal(lo.ok && lo.value.difficulty, 1)
  const none = validateQuestion({ ...good, difficulty: undefined })
  assert.equal(none.ok && none.value.difficulty, 2)
})

test('trims whitespace rather than treating padding as content', () => {
  const r = validateQuestion({
    ...good,
    question: `  ${good.question}  `,
    options: { A: ' 3 ', B: ' 5 ', C: '15', D: '45' },
  })
  assert.equal(r.ok, true)
  if (r.ok) {
    assert.equal(r.value.question, good.question)
    assert.equal(r.value.options.A, '3')
  }
})

test('rejects options that differ only by case — same answer twice', () => {
  const r = validateQuestion({
    ...good,
    options: { A: 'Protons', B: 'protons', C: 'Neutrons', D: 'Electrons' },
  })
  assert.equal(r.ok, false)
  if (!r.ok) assert.match(r.why, /duplicate/)
})
