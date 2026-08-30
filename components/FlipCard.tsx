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
      <div
        className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div className="absolute inset-0 flex flex-col rounded-2xl border border-line bg-white p-7 shadow-[0_1px_0_var(--line),0_12px_32px_-16px_rgba(22,21,19,0.18)] [backface-visibility:hidden]">
          {subject && (
            <span className="font-mono text-[11px] tracking-wide text-ink-muted">{subject}</span>
          )}
          <div className="flex flex-1 items-center">
            <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">{front}</p>
          </div>
          <span className="text-[12px] text-ink-muted transition-colors group-hover:text-accent">
            Tap to reveal →
          </span>
        </div>
        <div
          className="absolute inset-0 flex flex-col rounded-2xl border border-accent bg-accent p-7 shadow-[0_12px_32px_-16px_rgba(22,21,19,0.35)] [backface-visibility:hidden]"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {subject && (
            <span className="font-mono text-[11px] tracking-wide text-white/60">{subject}</span>
          )}
          <div className="flex flex-1 items-center">
            <p className="font-serif text-lg leading-snug text-white sm:text-xl">{back}</p>
          </div>
          <span className="text-[12px] text-white/60">Tap to flip back →</span>
        </div>
      </div>
    </button>
  )
}
