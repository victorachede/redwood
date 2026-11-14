/**
 * Tests for the voice call whiteboard.
 *
 * Run: npm test
 *
 * Every board operation comes from a model mid-call. A malformed one must not
 * crash the screen or draw in the wrong place, because a student talking to a
 * tutor cannot tell a broken board from a wrong answer.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  EMPTY_BOARD,
  applyBoardOp,
  parseBoardTool,
  splitCircle,
  type BoardOp,
  type BoardState,
} from '../app/lib/callBoard.ts'

function run(ops: [string, unknown][], start: BoardState = EMPTY_BOARD): BoardState {
  return ops.reduce((s, [name, input]) => {
    const op = parseBoardTool(name, input)
    return op ? applyBoardOp(s, op) : s
  }, start)
}

test('writes steps in order, defaulting to the tutor', () => {
  const s = run([
    ['write_step', { id: 'a', text: 'x + 5 = 12' }],
    ['write_step', { id: 'b', text: 'x = 7', by: 'student' }],
  ])
  assert.deepEqual(s.lines.map((l) => [l.id, l.by]), [['a', 'ewin'], ['b', 'student']])
})

test('rewriting an id replaces the line instead of adding a second one', () => {
  const s = run([
    ['write_step', { id: 'a', text: 'x = 12 + 5' }],
    ['write_step', { id: 'a', text: 'x = 12 − 5' }],
  ])
  assert.equal(s.lines.length, 1)
  assert.equal(s.lines[0].text, 'x = 12 − 5')
})

test('marks a line with a tick, a circle and a note', () => {
  const s = run([
    ['write_step', { id: 'y', text: '2x − x = 4 − 6', by: 'student' }],
    ['mark_step', { id: 'y', mark: 'cross', circle: '− 6', note: 'sign?' }],
  ])
  assert.equal(s.lines[0].mark, 'cross')
  assert.equal(s.lines[0].note, 'sign?')
  assert.deepEqual(splitCircle(s.lines[0]), ['2x − x = 4 ', '− 6', ''])
})

test('drops a circle that is not in the line rather than drawing it anywhere', () => {
  const s = run([
    ['write_step', { id: 'y', text: 'x = −2' }],
    ['mark_step', { id: 'y', circle: '+ 6', mark: 'cross' }],
  ])
  assert.equal(s.lines[0].circle, undefined)
  assert.equal(s.lines[0].mark, 'cross')
  assert.equal(splitCircle(s.lines[0]), null)
})

test('marking a line that does not exist changes nothing', () => {
  const before = run([['write_step', { id: 'a', text: 'x = 7' }]])
  const after = run([['mark_step', { id: 'missing', mark: 'tick' }]], before)
  assert.equal(after, before)
})

test('rejects malformed tool input without throwing', () => {
  for (const [name, input] of [
    ['write_step', null],
    ['write_step', { id: 'a' }],
    ['write_step', { text: 'no id' }],
    ['mark_step', { id: 'a' }],
    ['set_phase', { phase: 'lunch' }],
    ['show_diagram', { spec: 'triangle' }],
    ['not_a_tool', { id: 'a', text: 'x' }],
  ] as [string, unknown][]) {
    assert.equal(parseBoardTool(name, input), null, `${name} ${JSON.stringify(input)}`)
  }
})

test('clearing the board keeps the phase and sets the new title', () => {
  const s = run([
    ['set_phase', { phase: 'your_turn' }],
    ['write_step', { id: 'a', text: 'x = 7' }],
    ['clear_board', { title: 'Your turn' }],
  ])
  assert.equal(s.phase, 'your_turn')
  assert.equal(s.title, 'Your turn')
  assert.equal(s.lines.length, 0)
})

test('the recap phase can carry the rule to remember', () => {
  const s = run([['set_phase', { phase: 'recap', recap: 'When a term crosses =, its sign flips.' }]])
  assert.equal(s.phase, 'recap')
  assert.equal(s.recap, 'When a term crosses =, its sign flips.')
})

test('long text is trimmed and the board keeps only the latest lines', () => {
  const ops: [string, unknown][] = Array.from({ length: 20 }, (_, i) => ['write_step', { id: `l${i}`, text: 'y'.repeat(200) }])
  const s = run(ops)
  assert.equal(s.lines.length, 12)
  assert.equal(s.lines[0].id, 'l8')
  assert.equal(s.lines[0].text.length, 80)
})

test('applyBoardOp never mutates the state it was given', () => {
  const start = run([['write_step', { id: 'a', text: 'x = 7' }]])
  const snapshot = JSON.stringify(start)
  const op: BoardOp = { op: 'mark', input: { id: 'a', mark: 'tick' } }
  applyBoardOp(start, op)
  assert.equal(JSON.stringify(start), snapshot)
})
