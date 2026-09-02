'use client'

import { useState } from 'react'

/** Question on the front, answer on the back. Tap to flip. */
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
      aria-label={flipped ? 'Showing the answer' : 'Showing the question'}
      className={`relative aspect-[4/5] w-full cursor-pointer text-left [perspective:1200px] ${className}`}
    >
      {/* Cards waiting behind, so the deck reads as a deck */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-2xl border border-line bg-surface"
        style={{ transform: 'translateY(9px) scale(0.95)' }}
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-2xl border border-line bg-surface"
        style={{ transform: 'translateY(4px) scale(0.975)' }}
      />

      <div
        className="relative h-full w-full [transform-style:preserve-3d]"
        style={{
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 420ms var(--ease)',
        }}
      >
        {/* Front */}
        <div className="absolute inset-0 flex flex-col rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-md)] [backface-visibility:hidden]">
          {subject && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              {subject}
            </span>
          )}
          <div className="flex flex-1 items-center">
            <p className="font-display text-[21px] leading-snug text-ink">{front}</p>
          </div>
          <span className="text-[12.5px] text-ink-muted">Tap to reveal</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl border p-6 shadow-[var(--shadow-md)] [backface-visibility:hidden]"
          style={{
            transform: 'rotateY(180deg)',
            background: 'var(--primary)',
            borderColor: 'var(--primary)',
          }}
        >
          {subject && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-primary opacity-65">
              {subject}
            </span>
          )}
          <div className="flex flex-1 items-center">
            <p className="font-display text-[19px] leading-snug text-on-primary">{back}</p>
          </div>
          <span className="text-[12.5px] text-on-primary opacity-65">Tap to flip back</span>
        </div>
      </div>
    </button>
  )
}
