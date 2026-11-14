/**
 * The voice call's whiteboard, as data.
 *
 * On a call the tutor teaches the way a teacher does at a board: it writes a
 * step while it says it, circles the part of a student's line that broke, and
 * ticks the line that is right. Each of those is a tool call. This module
 * owns what those calls mean, so the call screen only renders a BoardState and
 * never interprets model output itself.
 *
 * Kept free of React and the DOM so it can be tested directly. Every input
 * arrives from a model, so every parser here assumes it can be malformed and
 * drops what it cannot use instead of throwing mid-call.
 */

import type { ShowDiagramInput } from '@/app/lib/tutorProtocol'

/** The five parts of a call, in order. The bar at the top of the screen. */
export const CALL_PHASES = ['warm_up', 'teach', 'your_turn', 'check', 'recap'] as const
export type CallPhase = (typeof CALL_PHASES)[number]

export const PHASE_LABEL: Record<CallPhase, string> = {
  warm_up: 'Warm-up',
  teach: 'Teach',
  your_turn: 'Your turn',
  check: 'Check',
  recap: 'Recap',
}

/** Who a line on the board belongs to. It decides the ink colour. */
export type LineAuthor = 'ewin' | 'student' | 'question'

export type BoardLine = {
  id: string
  text: string
  by: LineAuthor
  mark?: 'tick' | 'cross'
  /** A piece of the line circled in red pen. Must occur in `text`. */
  circle?: string
  /** A short pen note written beside the line. */
  note?: string
  struck?: boolean
}

export type BoardState = {
  phase: CallPhase
  title: string
  lines: BoardLine[]
  recap?: string
  diagram?: ShowDiagramInput
}

export const EMPTY_BOARD: BoardState = { phase: 'warm_up', title: '', lines: [] }

/* ── Tool inputs ─────────────────────────────────────────────────────────── */

export type WriteStepInput = { id: string; text: string; by?: LineAuthor }
export type MarkStepInput = {
  id: string
  mark?: 'tick' | 'cross'
  circle?: string
  note?: string
  strike?: boolean
}
export type ClearBoardInput = { title?: string }
export type SetPhaseInput = { phase: CallPhase; recap?: string }

export type BoardOp =
  | { op: 'write'; input: WriteStepInput }
  | { op: 'mark'; input: MarkStepInput }
  | { op: 'clear'; input: ClearBoardInput }
  | { op: 'phase'; input: SetPhaseInput }
  | { op: 'diagram'; input: ShowDiagramInput }

/** A whiteboard holds what a phone screen can show. Older lines scroll off. */
const MAX_LINES = 12
const MAX_TEXT = 80
const MAX_NOTE = 24

function str(v: unknown, max: number): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.replace(/\s+/g, ' ').trim()
  return t ? t.slice(0, max) : undefined
}

/**
 * Turns a tool call into a board operation, or null when the call is not a
 * board tool or its input is unusable.
 */
export function parseBoardTool(name: string, input: unknown): BoardOp | null {
  const o = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>

  switch (name) {
    case 'write_step': {
      const id = str(o.id, 40)
      const text = str(o.text, MAX_TEXT)
      if (!id || !text) return null
      const by = o.by === 'student' || o.by === 'question' ? o.by : 'ewin'
      return { op: 'write', input: { id, text, by } }
    }
    case 'mark_step': {
      const id = str(o.id, 40)
      if (!id) return null
      const mark = o.mark === 'tick' || o.mark === 'cross' ? o.mark : undefined
      const circle = str(o.circle, MAX_TEXT)
      const note = str(o.note, MAX_NOTE)
      const strike = o.strike === true ? true : undefined
      if (!mark && !circle && !note && !strike) return null
      return { op: 'mark', input: { id, mark, circle, note, strike } }
    }
    case 'clear_board':
      return { op: 'clear', input: { title: str(o.title, 48) } }
    case 'set_phase': {
      const phase = CALL_PHASES.find((p) => p === o.phase)
      if (!phase) return null
      return { op: 'phase', input: { phase, recap: str(o.recap, 160) } }
    }
    case 'show_diagram': {
      const d = o as ShowDiagramInput
      if (!d.spec || typeof d.spec !== 'object' || !('kind' in d.spec)) return null
      return { op: 'diagram', input: d }
    }
    default:
      return null
  }
}

/** Applies one operation. Pure: returns a new state, never mutates. */
export function applyBoardOp(state: BoardState, op: BoardOp): BoardState {
  switch (op.op) {
    case 'write': {
      const { id, text, by = 'ewin' } = op.input
      // Writing an id that already exists rewrites that line in place: the
      // tutor correcting its own step should not leave two versions up.
      const existing = state.lines.findIndex((l) => l.id === id)
      if (existing !== -1) {
        const lines = state.lines.slice()
        lines[existing] = { id, text, by }
        return { ...state, lines }
      }
      return { ...state, lines: [...state.lines, { id, text, by }].slice(-MAX_LINES) }
    }
    case 'mark': {
      const { id, mark, circle, note, strike } = op.input
      let found = false
      const lines = state.lines.map((l) => {
        if (l.id !== id) return l
        found = true
        return {
          ...l,
          ...(mark ? { mark } : {}),
          // A circle that is not actually in the line would float over
          // nothing, so it is dropped rather than drawn in the wrong place.
          ...(circle && l.text.includes(circle) ? { circle } : {}),
          ...(note ? { note } : {}),
          ...(strike ? { struck: true } : {}),
        }
      })
      return found ? { ...state, lines } : state
    }
    case 'clear':
      return { ...state, title: op.input.title ?? '', lines: [], recap: undefined, diagram: undefined }
    case 'phase':
      return {
        ...state,
        phase: op.input.phase,
        ...(op.input.recap ? { recap: op.input.recap } : {}),
      }
    case 'diagram':
      return { ...state, diagram: op.input }
  }
}

export function phaseIndex(p: CallPhase): number {
  return CALL_PHASES.indexOf(p)
}

/**
 * Splits a line around its circled part, so the screen can draw the pen
 * circle around exactly that text. Returns null when nothing is circled.
 */
export function splitCircle(line: BoardLine): [string, string, string] | null {
  if (!line.circle) return null
  const at = line.text.indexOf(line.circle)
  if (at === -1) return null
  return [line.text.slice(0, at), line.circle, line.text.slice(at + line.circle.length)]
}

/** What the end-of-call sheet reports. Gathered from the tool calls as they land. */
export type CallSummary = {
  mastery: { topic: string; level: 'struggling' | 'developing' | 'solid' }[]
  homework: string[]
  cards: string[]
  slips: number
}

export const EMPTY_SUMMARY: CallSummary = { mastery: [], homework: [], cards: [], slips: 0 }
