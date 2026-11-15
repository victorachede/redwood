/**
 * Tests for the EWIN cast.
 *
 * Run: npm test
 *
 * The cast is data that other parts of the app lean on: every subject needs a
 * teacher for its calls, every character needs a line for every moment, and
 * the call prompt must carry a teacher's voice without dropping the rules
 * that keep the teaching honest.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CAST, MOMENTS, TEACHERS, defaultTeacher, renderPersona } from '../app/lib/cast.ts'

const SUBJECTS = ['mathematics', 'physics', 'chemistry', 'biology', 'english', 'economics']

test('sixteen characters with unique ids and names', () => {
  assert.equal(CAST.length, 16)
  assert.equal(new Set(CAST.map((c) => c.id)).size, CAST.length)
  assert.equal(new Set(CAST.map((c) => c.name)).size, CAST.length)
})

test('every subject has exactly one default teacher', () => {
  for (const s of SUBJECTS) {
    const owners = TEACHERS.filter((t) => t.subject === s)
    assert.equal(owners.length, 1, s)
    assert.equal(defaultTeacher(s).subject, s)
  }
})

test('only teachers own a subject', () => {
  for (const c of CAST) assert.equal(Boolean(c.subject), c.group === 'teacher', c.id)
})

test('every character has a line for every moment, and a full tone guide', () => {
  for (const c of CAST) {
    for (const m of MOMENTS) assert.ok(c.lines[m.id]?.trim(), `${c.id} ${m.id}`)
    assert.ok(c.traits.length >= 2, c.id)
    assert.ok(c.yes.length >= 1 && c.no.length >= 1, c.id)
    for (const d of c.dials) assert.ok(d >= 1 && d <= 5, c.id)
  }
})

test('a persona keeps the character honest about being EWIN', () => {
  const p = renderPersona(CAST[0])
  assert.match(p, new RegExp(CAST[0].name))
  assert.match(p, /AI tutor/)
  assert.match(p, /real person/)
})
