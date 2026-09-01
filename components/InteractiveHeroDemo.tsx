'use client'

import { useEffect, useRef, useState } from 'react'

type Msg = {
  role: 'tutor' | 'student'
  body: string
  question?: string
  card?: { q: string; a: string }
  action?: 'CLASSWORK' | 'HOMEWORK'
  brief?: string
}

type Scene = {
  subject: string
  topic: string
  messages: Msg[]
}

const SCENES: Scene[] = [
  {
    subject: 'Mathematics',
    topic: 'Algebra',
    messages: [
      {
        role: 'tutor',
        body: 'A linear equation is a balanced scale. Whatever you do to one side, do the same to the other — equality stays true.',
        question: 'If 3x − 5 = 10, what is x? Show each step.',
      },
      {
        role: 'student',
        body: 'Add 5 to both sides: 3x = 15. Then divide by 3 → x = 5.',
      },
      {
        role: 'tutor',
        body: 'Correct — clean method. The balance rule is the foundation for all of algebra.',
        card: { q: 'What keeps an equation valid?', a: 'Do the same operation to both sides.' },
      },
    ],
  },
  {
    subject: 'Physics',
    topic: 'Forces & Motion',
    messages: [
      {
        role: 'tutor',
        body: "Newton's second law: Force = mass × acceleration. More mass needs more force to reach the same speed.",
        question: 'A 4 kg box accelerates at 3 m/s². What force acts on it?',
      },
      {
        role: 'student',
        body: 'F = ma = 4 × 3 = 12 N',
      },
      {
        role: 'tutor',
        body: 'Exact. Always write the unit — WAEC marks deduct for missing N. Next, we find mass when force and acceleration are given.',
        action: 'CLASSWORK',
        brief: 'Practise F = ma problems — find mass and acceleration too, not just force.',
      },
    ],
  },
  {
    subject: 'Biology',
    topic: 'Cell Biology',
    messages: [
      {
        role: 'tutor',
        body: 'The cell membrane is selectively permeable — it controls exactly what enters and leaves the cell.',
        question: 'Why is selective permeability an advantage over being fully open?',
      },
      {
        role: 'student',
        body: 'So only what the cell needs gets in, and waste goes out without letting harmful things enter.',
      },
      {
        role: 'tutor',
        body: "Good reasoning. That answer would score well. You've covered both entry and exit — that's the full idea.",
        card: { q: 'What does selectively permeable mean?', a: 'Only certain substances can pass through the membrane.' },
      },
    ],
  },
  {
    subject: 'Chemistry',
    topic: 'Periodic Table',
    messages: [
      {
        role: 'tutor',
        body: 'Elements in the same group share the same number of outer electrons — that is why they react similarly.',
        question: 'Sodium is in Group I. What does that tell you about its electrons?',
      },
      {
        role: 'student',
        body: 'It has one electron in its outer shell.',
      },
      {
        role: 'tutor',
        body: 'Correct. That lone electron is easily lost — which is why Group I metals react vigorously with water.',
        action: 'HOMEWORK',
        brief: 'Write the word equations for sodium, potassium, and lithium reacting with water.',
      },
    ],
  },
  {
    subject: 'English',
    topic: 'Essay Writing',
    messages: [
      {
        role: 'tutor',
        body: 'A strong body paragraph has three parts: topic sentence, evidence, and explanation. The topic sentence makes a promise — the rest keeps it.',
        question: 'What job does the topic sentence do in a paragraph?',
      },
      {
        role: 'student',
        body: 'It tells the reader what the paragraph is about.',
      },
      {
        role: 'tutor',
        body: 'Right. Think of it as a contract with the reader — every sentence that follows must deliver on that one claim.',
        card: { q: 'Three parts of a body paragraph?', a: 'Topic sentence, evidence, explanation.' },
      },
    ],
  },
]

const MSG_DELAY = 1600
const SCENE_HOLD = 2400

export function InteractiveHeroDemo() {
  const [sceneIdx, setSceneIdx] = useState(0)
  const [visible, setVisible] = useState(1)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scene = SCENES[sceneIdx]
  const total = scene.messages.length

  useEffect(() => {
    function schedule() {
      if (visible < total) {
        timerRef.current = setTimeout(() => {
          setVisible((v) => v + 1)
        }, MSG_DELAY)
      } else {
        timerRef.current = setTimeout(() => {
          setSceneIdx((i) => (i + 1) % SCENES.length)
          setVisible(1)
        }, SCENE_HOLD)
      }
    }
    schedule()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [visible, total])

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(201,168,76,0.12) 0%, rgba(14,27,58,0) 70%)',
        }}
      />

      <div className="relative overflow-hidden rounded-[1.35rem] border border-line bg-[var(--paper-elevated)] shadow-[0_1px_0_var(--line),0_24px_48px_-28px_rgba(0,0,0,0.45)]">
        {/* Chrome */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-1.5">
            {SCENES.map((_, i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full transition-colors duration-300"
                style={{ background: i === sceneIdx ? 'var(--accent)' : 'var(--line-strong)' }}
              />
            ))}
          </div>
          <span
            key={sceneIdx}
            className="animate-fade-up font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
          >
            {scene.subject} · {scene.topic}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Live
          </span>
        </div>

        {/* Messages */}
        <div key={sceneIdx} className="min-h-[340px] space-y-3 p-4 sm:p-5">
          {scene.messages.slice(0, visible).map((msg, i) => (
            <div
              key={i}
              className={`animate-fade-up flex flex-col ${msg.role === 'student' ? 'items-end' : 'items-start'}`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <span className="mb-1 px-1 text-[10px] font-medium text-ink-muted">
                {msg.role === 'tutor' ? 'Ewin' : 'You'}
              </span>

              <div
                className={`max-w-[92%] rounded-2xl px-3.5 py-3 text-[13px] leading-relaxed sm:text-[14px] ${
                  msg.role === 'student'
                    ? 'rounded-tr-md bg-accent text-[var(--on-accent)]'
                    : 'rounded-tl-md border border-line bg-white text-ink'
                }`}
              >
                <p>{msg.body}</p>

                {msg.question && (
                  <div className="mt-2.5 border-t border-line/60 pt-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Question
                    </p>
                    <p className="mt-0.5 font-medium text-ink">{msg.question}</p>
                  </div>
                )}

                {msg.card && (
                  <div
                    className="mt-2.5 rounded-lg px-3 py-2.5"
                    style={{ background: 'var(--accent-soft)', border: '1px solid var(--line)' }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--brand)' }}>
                      Study card
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-ink">{msg.card.q}</p>
                    <p className="mt-0.5 text-[12px] text-ink-muted">{msg.card.a}</p>
                  </div>
                )}

                {msg.action && (
                  <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-line bg-white p-2.5">
                    <span
                      className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                      style={{ background: 'var(--accent)' }}
                    >
                      {msg.action === 'CLASSWORK' ? 'Classwork' : 'Homework'}
                    </span>
                    {msg.brief && (
                      <p className="text-[12px] leading-snug text-ink-muted">{msg.brief}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator while next message loading */}
          {visible < total && (
            <div className="animate-fade-up flex flex-col items-start">
              <span className="mb-1 px-1 text-[10px] font-medium text-ink-muted">
                {scene.messages[visible].role === 'student' ? 'You' : 'Ewin'}
              </span>
              <div className="rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input stub — visual only */}
        <div className="flex items-center gap-2 border-t border-line bg-paper px-4 py-3">
          <div className="h-8 flex-1 rounded-full border border-line bg-[var(--paper-card)] px-3 text-[12px] text-ink-muted flex items-center">
            Type your answer…
          </div>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="rounded-full px-3.5 py-1.5 text-[12px] font-medium text-[var(--on-accent)]"
            style={{ background: 'var(--accent)' }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Floating chips */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-2 top-8 hidden rotate-3 rounded-xl border border-line bg-[var(--paper-elevated)] px-3 py-2 text-[11px] text-ink-muted shadow-sm sm:block"
      >
        WAEC · JAMB · NECO
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1 bottom-16 hidden -rotate-2 rounded-xl border border-line bg-neutral-100 px-3 py-2 text-[11px] font-medium text-ink shadow-sm sm:block"
      >
        One idea at a time
      </div>
    </div>
  )
}
