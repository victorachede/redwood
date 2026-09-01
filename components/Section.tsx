import type { ReactNode } from 'react'

type Tone = 'paper' | 'sunken' | 'navy'

const TONES: Record<Tone, string> = {
  paper: 'bg-paper text-ink',
  sunken: 'bg-paper-sunken text-ink',
  navy: 'bg-navy-800 text-[var(--on-accent)]',
}

/**
 * Page section with a consistent tone, width and rhythm.
 *
 * Alternating `paper` / `sunken` / `navy` down a page is what gives the site
 * its vertical rhythm instead of reading as one flat sheet.
 */
export function Section({
  children,
  tone = 'paper',
  atmosphere = false,
  className = '',
  innerClassName = '',
  id,
}: {
  children: ReactNode
  tone?: Tone
  /** Adds the drifting aurora + grain. Intended for navy sections. */
  atmosphere?: boolean
  className?: string
  innerClassName?: string
  id?: string
}) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden ${TONES[tone]} ${
        atmosphere ? 'aurora noise' : ''
      } ${className}`}
    >
      <div
        className={`relative mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28 ${innerClassName}`}
      >
        {children}
      </div>
    </section>
  )
}

/** Small uppercase label that sits above a section heading. */
export function SectionLabel({
  children,
  tone = 'light',
}: {
  children: ReactNode
  tone?: 'light' | 'dark'
}) {
  return (
    <p
      className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
        tone === 'dark' ? 'text-gold-400' : 'text-gold-600'
      }`}
    >
      {children}
    </p>
  )
}
