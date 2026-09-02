'use client'

import { useState } from 'react'

export function FlipCard({
  front,
  back,
  subject,
  className = '',
  onFlip,
}: {
  front: string
  back: string
  subject?: string
  className?: string
  onFlip?: (flipped: boolean) => void
}) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        setFlipped((f) => {
          const next = !f
          onFlip?.(next)
          return next
        })
      }}
      aria-pressed={flipped}
      aria-label={flipped ? 'Showing answer' : 'Showing question'}
      className={`group relative w-full max-w-sm aspect-[4/5] [perspective:1200px] cursor-pointer text-left ${className}`}
    >
      {/* Stacked-deck illusion — two cards peeking out behind the live one */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-2xl border border-line bg-surface shadow-[var(--shadow-sm)]"
        style={{ transform: 'translateY(10px) scale(0.94)' }}
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-2xl border border-line bg-surface shadow-[var(--shadow-sm)]"
        style={{ transform: 'translateY(5px) scale(0.97)' }}
      />

      <div
        className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transitionTimingFunction: 'var(--ease-spring)',
        }}
      >
        {/* Front */}
        <div className="absolute inset-0 flex flex-col rounded-2xl border border-line bg-surface p-7 shadow-[var(--shadow-lg)] [backface-visibility:hidden]">
          {subject && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-streak">
              {subject}
            </span>
          )}
          <div className="flex flex-1 items-center">
            <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">{front}</p>
          </div>
          <span className="text-[12px] text-ink-muted transition-colors group-hover:text-primary">
            Tap to reveal →
          </span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl border border-navy-600 bg-gradient-to-br from-navy-700 to-navy-900 p-7 shadow-[var(--shadow-lg)] [backface-visibility:hidden]"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="absolute inset-x-0 top-0 h-px" />
          {subject && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-streak">
              {subject}
            </span>
          )}
          <div className="flex flex-1 items-center">
            <p className="font-serif text-lg leading-snug text-white sm:text-xl">{back}</p>
          </div>
          <span className="text-[12px] text-ink-muted">Tap to flip back →</span>
        </div>
      </div>
    </button>
  )
}
