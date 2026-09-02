/**
 * Wire protocol between /api/tutor and the chat screens.
 *
 * The old transport was raw `text/plain`, which could carry prose and nothing
 * else — that is precisely why every structured signal (ACTION:, BRIEF:,
 * STUDY_CARDS:) had to be regex-scraped out of the model's prose, where a
 * literal "Q:" could corrupt it and a half-streamed marker rendered as
 * visible garbage.
 *
 * Newline-delimited JSON lets prose and structure travel together.
 */

export type ToolName =
  | 'assign_work'
  | 'save_study_card'
  | 'record_mastery'
  | 'ask_clarifying'
  | 'show_diagram'

export type AssignWorkInput = {
  kind: 'classwork' | 'homework'
  brief: string
  topic?: string
}

export type SaveStudyCardInput = {
  front: string
  back: string
}

export type RecordMasteryInput = {
  topic: string
  level: 'struggling' | 'developing' | 'solid'
}

export type AskClarifyingInput = {
  question: string
  options?: string[]
}

export type DiagramSpec =
  | { kind: 'numberline'; min: number; max: number; marks?: number[]; label?: string }
  | { kind: 'triangle'; a?: number; b?: number; c?: number; angle?: number; label?: string }
  | { kind: 'forces'; vectors: { label: string; dx: number; dy: number }[]; label?: string }
  | { kind: 'graph'; expression: 'linear' | 'quadratic'; m?: number; c?: number; a?: number; label?: string }
  | { kind: 'bar'; bars: { label: string; value: number }[]; label?: string }

export type ShowDiagramInput = { spec: DiagramSpec; caption?: string }

export type ToolInputMap = {
  assign_work: AssignWorkInput
  save_study_card: SaveStudyCardInput
  record_mastery: RecordMasteryInput
  ask_clarifying: AskClarifyingInput
  show_diagram: ShowDiagramInput
}

/** One line of the response stream. */
export type TutorEvent =
  | { t: 'text'; v: string }
  | { t: 'tool'; name: ToolName; input: unknown }
  | { t: 'done'; usage?: { in: number; out: number } }
  | { t: 'error'; message: string }

export function encodeEvent(e: TutorEvent): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(e) + '\n')
}

/**
 * Reads an NDJSON stream, buffering partial lines.
 *
 * A chunk boundary can land mid-line, so anything after the last newline is
 * held back until the next chunk completes it.
 */
export async function readTutorStream(
  res: Response,
  onEvent: (e: TutorEvent) => void,
): Promise<void> {
  if (!res.body) throw new Error('Tutor returned no body.')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const flushLine = (line: string) => {
    const trimmed = line.trim()
    if (!trimmed) return
    try {
      onEvent(JSON.parse(trimmed) as TutorEvent)
    } catch {
      /* a malformed line should never kill the stream */
    }
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    let nl: number
    while ((nl = buffer.indexOf('\n')) !== -1) {
      flushLine(buffer.slice(0, nl))
      buffer = buffer.slice(nl + 1)
    }
  }

  // Trailing line with no final newline
  flushLine(buffer)
}
