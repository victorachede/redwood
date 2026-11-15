'use client'

/**
 * A study card: question on the front, answer on the back.
 *
 * Controlled, so the page can flip it from the keyboard as well as a tap.
 * The question side is set like a page and the answer side in the brand
 * navy, so which side is showing is obvious at a glance.
 */
export function FlipCard({
  front,
  back,
  subject,
  accent = 'var(--primary)',
  note,
  flipped,
  onFlip,
  className = '',
}: {
  front: string
  back: string
  subject?: string
  /** The subject's colour, for the strip along the top. */
  accent?: string
  /** A small line under the question, such as where the card came from. */
  note?: string
  flipped: boolean
  onFlip: (flipped: boolean) => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onFlip(!flipped)}
      aria-pressed={flipped}
      aria-label={flipped ? `Answer: ${back}. Tap to see the question.` : `Question: ${front}. Tap to see the answer.`}
      className={`relative block aspect-[4/3] w-full cursor-pointer text-left [perspective:1200px] sm:aspect-[16/10] ${className}`}
    >
      {/* Cards waiting behind, so the deck reads as a deck */}
      <span aria-hidden className="absolute inset-0 rounded-2xl border border-line bg-surface" style={{ transform: 'translateY(10px) scale(0.94)' }} />
      <span aria-hidden className="absolute inset-0 rounded-2xl border border-line bg-surface" style={{ transform: 'translateY(5px) scale(0.97)' }} />

      <div
        className="relative h-full w-full [transform-style:preserve-3d]"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 420ms var(--ease)' }}
      >
        <div aria-hidden={flipped} className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-md)] [backface-visibility:hidden]">
          <span className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{subject ?? 'Question'}</span>
          <div className="flex flex-1 items-center">
            <p className="font-display text-[clamp(1.15rem,4.6vw,1.45rem)] leading-snug text-ink">{front}</p>
          </div>
          <span className="flex items-center justify-between text-[12px] text-ink-faint">
            <span>{note}</span>
            <span>Tap to reveal</span>
          </span>
        </div>

        <div
          aria-hidden={!flipped}
          className="absolute inset-0 flex flex-col rounded-2xl border p-6 shadow-[var(--shadow-md)] [backface-visibility:hidden]"
          style={{ transform: 'rotateY(180deg)', background: 'var(--primary)', borderColor: 'var(--primary)' }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-hero-dim">Answer</span>
          <div className="flex flex-1 items-center">
            <p className="font-display text-[clamp(1.05rem,4.2vw,1.3rem)] leading-snug text-on-primary">{back}</p>
          </div>
          <span className="text-[12px] text-on-hero-dim">How well did you know it?</span>
        </div>
      </div>
    </button>
  )
}
