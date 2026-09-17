/**
 * Ewin's own icon set — hand-drawn, not Lucide.
 *
 * Started as landing-page-only, then the dashboard, cards and settings
 * rebuild all needed the same subject glyphs — a subject drawn one way on
 * the homepage and a different way once you're signed in would read as
 * two products sharing a login page. Moved here once it stopped being
 * marketing-specific. `SubjectIcon` now renders these instead of Lucide.
 *
 * Every icon uses `currentColor` rather than a hardcoded fill, so the
 * same glyph works white-on-solid-accent (a subject card) or
 * accent-on-tint (a dense list row) — whatever `color` the parent sets.
 *
 * Two of these replaced icons that read wrong at a glance: the first
 * maths icon (a triangle + crossbar) read as the letter "A"; the first
 * physics icon (one tilted ellipse) read as a chain link. Both are now
 * unambiguous — a real Σ, a real three-orbit atom.
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
      <path d="M3 8.5L6 11.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SigmaIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M11 3.5H4.5L8 8L4.5 12.5H11"
        stroke="currentColor"
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
      <ellipse cx="8" cy="8" rx="6.2" ry="2.3" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="8" cy="8" rx="6.2" ry="2.3" stroke="currentColor" strokeWidth="1" transform="rotate(60 8 8)" />
      <ellipse cx="8" cy="8" rx="6.2" ry="2.3" stroke="currentColor" strokeWidth="1" transform="rotate(120 8 8)" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    </svg>
  )
}

export function FlaskIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M6 3H10M6.5 3V7L3.5 12.5C3.2 13.1 3.6 13.8 4.3 13.8H11.7C12.4 13.8 12.8 13.1 12.5 12.5L9.5 7V3"
        stroke="currentColor"
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
      <path d="M4 12C4 6 8 3 13 3C13 8 10 12 4 12Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4 12C6 9 8 7 12 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

export function BookIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M8 4C6.5 3.2 4.5 3 3 3.3V12C4.5 12 6.5 12.2 8 13M8 4C9.5 3.2 11.5 3 13 3.3V12C11.5 12 9.5 12.2 8 13M8 4V13"
        stroke="currentColor"
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
      <path d="M3 12L6.5 8L9 10L13 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13" cy="4" r="1.2" fill="currentColor" />
    </svg>
  )
}

/** "One idea" — a single point held inside a ring, not a whole shelf of
 *  them. */
export function RingDotIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <circle cx="8" cy="8" r="5.3" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="1.7" fill="currentColor" />
    </svg>
  )
}

export function PencilIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M3 13L4 10L10.5 3.5C11 3 11.8 3 12.3 3.5C12.8 4 12.8 4.8 12.3 5.3L5.8 11.8L3 13Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MagnifierIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/** Used only where the ×  means "will not do" or "not yet" — kept in the
 *  brand's own wrong-red at the call site, not hardcoded here. */
export function CrossIcon({ size = 12, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Layers / stacked-cards glyph for study cards. */
export function LayersIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="8" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="6.5" y="5.5" width="8" height="10" rx="2" fill="var(--paper, #fff)" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

/** Small bar-chart glyph, for leaderboard/ranking. */
export function BarsIcon({ size = 16, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M3 13V9M8 13V5M13 13V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Bell, for notification preferences — drawn to match the rest of the
 *  set's stroke weight rather than pulled from Lucide. */
export function BellIcon({ size = 17, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M8 1.8c-2 0-3.4 1.7-3.4 4.2 0 3.3-1.3 4.4-1.3 4.4h9.4s-1.3-1.1-1.3-4.4c0-2.5-1.4-4.2-3.4-4.2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M6.6 12.7a1.6 1.6 0 002.8 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
