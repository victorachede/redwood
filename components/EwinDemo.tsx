'use client'

import { useEffect, useRef, useState } from 'react'

type Step = {
  role: 'tutor' | 'student'
  text: string
  delay: number
}

const SCRIPT: Step[] = [
  {
    role: 'tutor',
    text: 'A linear equation is like a balanced scale — whatever you do to one side, you must do to the other.\n\nQuestion: If 2x + 3 = 11, what is x? Explain your steps.',
    delay: 600,
  },
  {
    role: 'student',
    text: 'I subtract 3 from both sides to get 2x = 8, then divide by 2. So x = 4.',
    delay: 1800,
  },
  {
    role: 'tutor',
    text: 'Exactly right — order of operations on the equation is correct.\n\nQuestion: Now try this one: 3x − 5 = 10. What is x?',
    delay: 1400,
  },
]

function formatText(text: string) {
  const parts = text.split(/(Question:)/g)
  return parts.map((p, i) =>
    p === 'Question:' ? (
      <span key={i} className="mt-3 mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
        Question
      </span>
    ) : (
      <span key={i} className="whitespace-pre-wrap">
        {p}
      </span>
    )
  )
}

export function EwinDemo() {
  const [visible, setVisible] = useState<Step[]>([])
  const [typing, setTyping] = useState(false)
  const [done, setDone] = useState(false)
  const [running, setRunning] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [visible, typing])

  function run(index = 0, current: Step[] = []) {
    if (index >= SCRIPT.length) {
      setTyping(false)
      setDone(true)
      setRunning(false)
      return
    }
    const step = SCRIPT[index]
    setTyping(true)
    timerRef.current = setTimeout(() => {
      setTyping(false)
      const next = [...current, step]
      setVisible(next)
      timerRef.current = setTimeout(() => run(index + 1, next), 400)
    }, step.delay)
  }

  function start() {
    if (running) return
    setVisible([])
    setTyping(false)
    setDone(false)
    setRunning(true)
    timerRef.current = setTimeout(() => run(0, []), 300)
  }

  const showPrompt = !running && !done

  return (
    <div className="w-full rounded-2xl border border-line bg-white shadow-[0_1px_0_var(--line),0_20px_48px_-24px_rgba(22,21,19,0.22)] overflow-hidden">
      {/* chrome bar */}
      <div className="flex items-center justify-between border-b border-line bg-paper/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-[11px] font-bold text-paper">
            E
          </span>
          <span className="text-[13px] font-semibold text-ink">Ewin</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
            Mathematics · Algebra
          </span>
          {(running || done) && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
              Live
            </span>
          )}
        </div>
      </div>

      {/* messages */}
      <div className="flex min-h-[260px] flex-col gap-3 px-4 py-4">
        {showPrompt && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6">
            <p className="text-center text-[13px] text-ink-muted">
              See how a session works
            </p>
            <button
              type="button"
              onClick={start}
              className="rounded-full bg-accent px-5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-accent-hover"
            >
              Watch a lesson
            </button>
          </div>
        )}

        {visible.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${m.role === 'student' ? 'items-end' : 'items-start'}`}
            style={{ animation: 'fade-up 0.35s ease-out both' }}
          >
            {m.role === 'tutor' && (
              <span className="mb-1 ml-1 text-[10px] font-medium text-ink-muted">Ewin</span>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                m.role === 'student'
                  ? 'rounded-tr-md bg-accent text-paper'
                  : 'rounded-tl-md border border-line bg-paper/80 text-ink'
              }`}
            >
              {m.role === 'tutor' ? formatText(m.text) : m.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex flex-col items-start">
            <span className="mb-1 ml-1 text-[10px] font-medium text-ink-muted">Ewin</span>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-line bg-paper/80 px-3.5 py-3">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        {done && (
          <div className="mt-1 text-center">
            <button
              type="button"
              onClick={start}
              className="text-[12px] text-ink-muted underline underline-offset-2 hover:text-accent"
            >
              Replay
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
