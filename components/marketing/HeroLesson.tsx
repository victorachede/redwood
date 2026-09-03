'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { Check } from 'lucide-react'
import { Mark } from '@/components/Mark'

/**
 * The hero demo.
 *
 * The pitch is "it makes you answer, then tells you what broke", so the hero
 * should perform that rather than assert it. What was here before was a static
 * screenshot of a finished conversation — it showed the product's surface and
 * none of its argument.
 *
 * Two hard rules, both learned from the version that shipped and had to be
 * pulled: it reserves its full height up front so nothing below it ever moves
 * (the old demo grew as it played and shoved the page down mid-read), and it
 * renders complete and static under prefers-reduced-motion.
 */

type Line =
  | { kind: 'tutor'; text: string }
  | { kind: 'ask'; text: string }
  | { kind: 'student'; text: string }
  | { kind: 'mark'; text: string }

const SCRIPT: Line[] = [
  { kind: 'tutor', text: 'An equation is a balanced scale. Whatever you do to one side, do to the other, and it stays true.' },
  { kind: 'ask', text: 'If 3x − 5 = 10, what is x? Show the step.' },
  { kind: 'student', text: 'add 5 both sides, 3x = 15, x = 5' },
  { kind: 'mark', text: 'Correct — and you showed the step, which is where the marks are.' },
]

/** ms per character while a line types in */
const CPS = 16
const HOLD = 620

export function HeroLesson() {
  const reduced = usePrefersReducedMotion()
  const [played, setPlayed] = useState(0)
  const [typed, setTyped] = useState('')

  // Derived, not stored: under reduced motion every line is simply present.
  // Mirroring that into state through an effect is what made this a cascading
  // render, and the transcript is a pure function of the two values above.
  const shown = reduced ? SCRIPT.length : played

  useEffect(() => {
    if (reduced) return
    let cancelled = false
    let i = 0

    async function play() {
      // Loop the script so a visitor who arrives mid-run still sees it whole.
      for (;;) {
        if (cancelled) return
        setPlayed(0)
        setTyped('')
        await wait(500)
        for (i = 0; i < SCRIPT.length; i++) {
          if (cancelled) return
          const line = SCRIPT[i]
          setPlayed(i)
          for (let c = 1; c <= line.text.length; c++) {
            if (cancelled) return
            setTyped(line.text.slice(0, c))
            await wait(CPS)
          }
          setPlayed(i + 1)
          setTyped('')
          await wait(HOLD)
        }
        await wait(3200)
      }
    }
    void play()
    return () => {
      cancelled = true
    }
  }, [reduced])

  return (
    <div
      className="relative rounded-2xl border border-line bg-surface shadow-[var(--shadow-lg)]"
      /* Reserved so the page never reflows as lines land. */
      style={{ minHeight: 396 }}
      aria-label="A short example of an Ewin lesson"
    >
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
        <Mark size={22} />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-tight text-ink">Mathematics</p>
          <p className="text-[11.5px] leading-tight text-ink-muted">Algebraic processes</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-ink-faint">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--correct)' }} />
          live
        </span>
      </div>

      <div className="space-y-3.5 p-4">
        {SCRIPT.map((line, i) => {
          if (i > shown) return null
          const isTyping = i === shown && !reduced
          const text = isTyping ? typed : line.text
          if (isTyping && !text) return null
          return (
            <Bubble key={i} line={line} text={text} typing={isTyping} />
          )
        })}
      </div>
    </div>
  )
}

function Bubble({ line, text, typing }: { line: Line; text: string; typing: boolean }) {
  if (line.kind === 'student') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-[14px] leading-relaxed text-on-primary">
          {text}
          {typing && <Caret />}
        </p>
      </div>
    )
  }

  if (line.kind === 'ask') {
    return (
      <div
        className="rounded-xl px-3.5 py-3"
        style={{ background: 'var(--primary-soft)', borderLeft: '3px solid var(--primary)' }}
      >
        <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-primary">
          Your turn
        </p>
        <p className="text-[14.5px] font-medium leading-relaxed text-ink">
          {text}
          {typing && <Caret />}
        </p>
      </div>
    )
  }

  if (line.kind === 'mark') {
    return (
      <div
        className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
        style={{ background: 'var(--correct-soft)' }}
      >
        <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--correct)' }} />
        <p className="text-[14px] leading-relaxed text-ink">
          {text}
          {typing && <Caret />}
        </p>
      </div>
    )
  }

  return (
    <p className="text-[14px] leading-relaxed text-ink-muted">
      {text}
      {typing && <Caret />}
    </p>
  )
}

function Caret() {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-ink-faint"
      style={{ animation: 'dot 1s step-end infinite' }}
    />
  )
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * The media query is an external store, so it is read with the hook built for
 * external stores rather than mirrored into state from an effect — which is
 * both a cascading render and a frame of wrong answer on first paint.
 */
const MQ = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(MQ)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MQ).matches,
    // On the server nobody is watching an animation yet, so the honest
    // snapshot is "not reduced"; the client store corrects it on hydration.
    () => false,
  )
}
