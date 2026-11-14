import type { ReactNode } from 'react'
import { Diagram } from '@/components/Diagram'
import { splitCircle, type BoardLine, type BoardState } from '@/app/lib/callBoard'

/**
 * The call's whiteboard.
 *
 * Maths is set the way an exam paper prints it, with the variable x in
 * italics. The tutor writes in navy, the student's answers go up in their own
 * colour with a "You" tag, and marking is done in red pen: a hand-drawn circle
 * around the exact part that broke, a short note, a tick or a cross.
 */

/** Italicises a lone x, the way it is printed in a textbook. */
function math(text: string): ReactNode[] {
  return text.split(/(?<![A-Za-z])(x)(?![A-Za-z])/).map((part, i) =>
    part === 'x' && i % 2 === 1 ? <em key={i}>x</em> : part,
  )
}

/** A loose pen circle, drawn to fit whatever it surrounds. */
function PenCircle({ children }: { children: ReactNode }) {
  return (
    <span className="vc-circled">
      {math(String(children))}
      <svg viewBox="0 0 60 44" preserveAspectRatio="none" aria-hidden>
        <path d="M30 3 C 8 2, 1 14, 3 24 C 6 38, 40 43, 54 32 C 62 24, 56 6, 36 3 C 30 2, 22 4, 18 7" />
      </svg>
    </span>
  )
}

function Line({ line }: { line: BoardLine }) {
  const split = splitCircle(line)
  const label =
    `${line.by === 'student' ? 'Your answer: ' : ''}${line.text}` +
    (line.mark === 'tick' ? ', marked right' : line.mark === 'cross' ? ', marked wrong' : '') +
    (line.circle ? `, circled: ${line.circle}` : '') +
    (line.note ? `, note: ${line.note}` : '') +
    (line.struck ? ', crossed out' : '')

  return (
    <li className={`vc-line vc-by-${line.by}${line.struck ? ' vc-struck' : ''}`} aria-label={label}>
      {line.by === 'student' && <span className="vc-you" aria-hidden>You</span>}
      <span aria-hidden>
        {split ? (
          <>
            {math(split[0])}
            <PenCircle>{split[1]}</PenCircle>
            {math(split[2])}
          </>
        ) : (
          math(line.text)
        )}
      </span>
      {line.mark && (
        <span className={`vc-mark ${line.mark === 'tick' ? 'vc-tick' : 'vc-cross'}`} aria-hidden>
          {line.mark === 'tick' ? '✓' : '✗'}
        </span>
      )}
      {line.note && <span className="vc-note" aria-hidden>{line.note}</span>}
    </li>
  )
}

export function Whiteboard({ board, children }: { board: BoardState; children?: ReactNode }) {
  return (
    <section className="vc-board" aria-label="Whiteboard">
      <p className="vc-board-title">{board.title}</p>
      <ol className="vc-lines">
        {board.lines.map((l) => (
          <Line key={l.id} line={l} />
        ))}
      </ol>
      {board.diagram && (
        <div className="vc-diagram">
          <Diagram spec={board.diagram.spec} caption={board.diagram.caption} />
        </div>
      )}
      {board.recap && (
        <div className="vc-recap">
          <small>Remember</small>
          {board.recap}
        </div>
      )}
      {children}
    </section>
  )
}
