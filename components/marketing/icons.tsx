/**
 * The landing page's own icon set.
 *
 * Every mark here is drawn for this page rather than pulled from Lucide —
 * that was an explicit call, not a default. A stroke width, a corner
 * radius and a level of detail chosen once, by hand, reads as considered;
 * a library glyph next to a hand-drawn logo reads as two different
 * projects sharing a page.
 *
 * Two of these traced through a real bug before landing here: the first
 * pass at the maths icon (a triangle with a crossbar) read as the letter
 * "A", and the first physics icon (one tilted ellipse) read as a chain
 * link. Both replaced with unambiguous shapes — a real Σ, a real
 * three-orbit atom — rather than left as "close enough".
 */

type IconProps = {
  size?: number
  className?: string
}

/** The CTA arrow — a 45° dart with a swept tail. Deliberately thin (1.1px
 *  at a 15px box); a thick stroke here read as heavy-handed next to Sora's
 *  own weight. */
export function ArrowIcon({ size = 15, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M4 12L12 4M12 4H6.5M12 4V9.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Subject-card tick — a reduced version of the Ewin mark's own checkmark,
 *  so every small glyph on the page traces back to one shape rather than
 *  each being invented separately. */
export function TickIcon({ size = 16, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M3 8.5L6 11.5L13 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SigmaIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M11 3.5H4.5L8 8L4.5 12.5H11"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Three crossing orbits + a nucleus — the universal atom convention. The
 *  first attempt was a single tilted ellipse, which at icon scale reads as
 *  a chain link, not a physics symbol. */
export function AtomIcon({ size = 18, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <ellipse cx="8" cy="8" rx="6.2" ry="2.3" stroke="#fff" strokeWidth="1" />
      <ellipse cx="8" cy="8" rx="6.2" ry="2.3" stroke="#fff" strokeWidth="1" transform="rotate(60 8 8)" />
      <ellipse cx="8" cy="8" rx="6.2" ry="2.3" stroke="#fff" strokeWidth="1" transform="rotate(120 8 8)" />
      <circle cx="8" cy="8" r="1.2" fill="#fff" />
    </svg>
  )
}

export function FlaskIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M6 3H10M6.5 3V7L3.5 12.5C3.2 13.1 3.6 13.8 4.3 13.8H11.7C12.4 13.8 12.8 13.1 12.5 12.5L9.5 7V3"
        stroke="#fff"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LeafIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M4 12C4 6 8 3 13 3C13 8 10 12 4 12Z" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4 12C6 9 8 7 12 4" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

export function BookIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M8 4C6.5 3.2 4.5 3 3 3.3V12C4.5 12 6.5 12.2 8 13M8 4C9.5 3.2 11.5 3 13 3.3V12C11.5 12 9.5 12.2 8 13M8 4V13"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TrendIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M3 12L6.5 8L9 10L13 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13" cy="4" r="1.2" fill="#fff" />
    </svg>
  )
}

/** "One idea" — a single point held inside a ring, not a whole shelf of
 *  them. */
export function RingDotIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <circle cx="8" cy="8" r="5.3" stroke="#fff" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="1.7" fill="#fff" />
    </svg>
  )
}

export function PencilIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M3 13L4 10L10.5 3.5C11 3 11.8 3 12.3 3.5C12.8 4 12.8 4.8 12.3 5.3L5.8 11.8L3 13Z"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MagnifierIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <circle cx="6.5" cy="6.5" r="4" stroke="#fff" strokeWidth="1.3" />
      <path d="M9.5 9.5L13 13" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/** Used only where the ×  means "will not do" — kept in the brand's own
 *  wrong-red, not decoration. */
export function CrossIcon({ size = 12, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M4 4L12 12M12 4L4 12" stroke="var(--wrong)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
