'use client'

import { useEffect, useState } from 'react'

/**
 * Claude-style product illustration: soft stage, interactive tutor demo.
 * Click through the loop — not a static screenshot.
 */

const STEPS: Array<{
  kind: 'tutor' | 'student' | 'feedback'
  label: string
  body: string
  question?: string
}> = [
  {
    kind: 'tutor',
    label: 'Ewin',
    body: 'A linear equation is a balanced scale. Whatever you do to one side, you do to the other — so equality stays true.',
    question: 'If 2x + 3 = 11, what is x? Explain your steps.',
  },
  {
    kind: 'student',
    label: 'You',
    body: 'Subtract 3 from both sides → 2x = 8. Divide by 2 → x = 4.',
  },
  {
    kind: 'feedback',
    label: 'Ewin',
    body: 'Exactly — order is right. Next we’ll try one with a negative coefficient so the scale still holds.',
  },
]

export function InteractiveHeroDemo() {
  const [step, setStep] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto) return
    const t = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length)
    }, 3200)
    return () => clearInterval(t)
  }, [auto])

  const visible = STEPS.slice(0, step + 1)

  return (
    <div className="relative">
      {/* Soft Claude-like stage */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(232,239,233,0.95) 0%, rgba(250,247,240,0) 70%)',
        }}
      />
      <div
        className="relative overflow-hidden rounded-[1.35rem] border border-line bg-white/90 shadow-[0_1px_0_var(--line),0_24px_48px_-28px_rgba(22,21,19,0.28)] backdrop-blur-sm"
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e5e0d3]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e5e0d3]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e5e0d3]" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
            Mathematics · Algebra
          </span>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
            Live
          </span>
        </div>

        <div className="min-h-[320px] space-y-3 p-4 sm:p-5">
          {visible.map((m, i) => (
            <div
              key={`${m.kind}-${i}`}
              className={`animate-fade-up flex flex-col ${
                m.kind === 'student' ? 'items-end' : 'items-start'
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="mb-1 px-1 text-[10px] font-medium text-ink-muted">{m.label}</span>
              <div
                className={`max-w-[92%] rounded-2xl px-3.5 py-3 text-[13px] leading-relaxed sm:text-[14px] ${
                  m.kind === 'student'
                    ? 'rounded-tr-md bg-accent text-paper'
                    : 'rounded-tl-md border border-line bg-paper/80 text-ink'
                }`}
              >
                <p>{m.body}</p>
                {m.question && i === step && (
                  <div className="mt-2.5 border-t border-line/80 pt-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                      Question
                    </p>
                    <p className="mt-0.5 font-medium text-ink">{m.question}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Controls — interactive */}
        <div className="flex items-center gap-2 border-t border-line bg-paper/50 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              setAuto(false)
              setStep((s) => (s + 1) % STEPS.length)
            }}
            className="rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-medium text-paper hover:bg-accent-hover"
          >
            Next step
          </button>
          <button
            type="button"
            onClick={() => {
              setAuto(false)
              setStep(0)
            }}
            className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[12px] font-medium text-ink hover:border-accent"
          >
            Replay
          </button>
          <button
            type="button"
            onClick={() => setAuto((a) => !a)}
            className="ml-auto text-[11px] text-ink-muted hover:text-ink"
          >
            {auto ? 'Pause auto' : 'Play auto'}
          </button>
        </div>
      </div>

      {/* Floating accent chips — illustration layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-2 top-8 hidden rotate-3 rounded-xl border border-line bg-white px-3 py-2 text-[11px] text-ink-muted shadow-sm sm:block"
      >
        WAEC · JAMB
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1 bottom-16 hidden -rotate-2 rounded-xl border border-accent/20 bg-accent-soft px-3 py-2 text-[11px] font-medium text-accent shadow-sm sm:block"
      >
        One idea at a time
      </div>
    </div>
  )
}
