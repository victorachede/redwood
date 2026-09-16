/**
 * The wavy background blob behind the hero and the closing CTA.
 *
 * An SVG path rather than a CSS border-radius trick — border-radius can
 * fake "organic" with four corner values, but it cannot fake a genuinely
 * undulating edge, and that was specifically the note this replaced a
 * plainer shape for. One path, reused at two sizes and two gradients, so
 * the two blob moments on the page read as one device rather than two
 * different decorations.
 */
export function Blob({
  id,
  from,
  to,
  className = '',
}: {
  /** Must be unique per instance — SVG gradient ids are global to the DOM. */
  id: string
  from: string
  to: string
  className?: string
}) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden>
      <defs>
        <radialGradient id={id} cx="35%" cy="22%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </radialGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M45.3,-58.5C58.6,-50.4,68.6,-36.4,72.8,-20.9C77,-5.4,75.4,11.6,68.5,26.4C61.6,41.2,49.4,53.8,34.7,61.5C20,69.2,2.8,72,-14.6,70.1C-32,68.2,-49.6,61.6,-61.4,49.2C-73.2,36.8,-79.2,18.6,-78.4,0.9C-77.6,-16.8,-70,-33.6,-57.8,-44.8C-45.6,-56,-28.8,-61.6,-11.8,-63.6C5.2,-65.6,32,-66.6,45.3,-58.5Z"
      />
    </svg>
  )
}
