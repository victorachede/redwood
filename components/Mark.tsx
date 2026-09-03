/**
 * The Ewin mark.
 *
 * Drawn, not photographed. What it replaced was a stock academy crest —
 * laurels, a mortarboard, an "EA" monogram, baked onto an opaque navy square.
 * That asset could not sit on a light background, went to mud at header size,
 * and said "generic institution" rather than anything about this product.
 *
 * This says the whole product in two strokes: the red margin rule of an
 * exercise book, and a tick crossing it. Work done in the book, marked
 * correct. It is legible at 16px, works in a single colour, inherits the
 * theme, and needs no network request.
 */
export function Mark({
  size = 28,
  className = '',
  title,
}: {
  size?: number
  className?: string
  /** Give it a title only where it is the sole naming of the brand. */
  title?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      {/* The page */}
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="7.5"
        fill="var(--surface)"
        stroke="var(--ink)"
        strokeWidth="1.75"
      />
      {/* The ruled margin */}
      <path d="M10.5 3.5V28.5" stroke="var(--rule)" strokeWidth="1.75" strokeLinecap="round" />
      {/* The tick, crossing the rule the way a teacher's pen does */}
      <path
        d="M7 17.5 L13.5 23 L25 10"
        stroke="var(--primary)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Mark plus wordmark, for the header and auth screens. */
export function Wordmark({
  size = 28,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark size={size} />
      <span
        className="font-display leading-none text-ink"
        style={{ fontSize: size * 0.82, letterSpacing: '-0.02em' }}
      >
        Ewin
      </span>
    </span>
  )
}
