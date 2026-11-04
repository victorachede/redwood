import type { Subject, SubjectId } from '@/app/lib/subjects'

/**
 * The art on the head of a subject card.
 *
 * This is not a <PhotoSlot>. That component is an honest placeholder standing in for
 * photography that does not exist yet, and it says so — the striped grey it renders is meant
 * to read as "not final content". On the subject grid that reading was the problem: six of
 * them in a row read as six empty frames (the diagonal hatch looks like woodgrain), not as a
 * designed page.
 *
 * So these cards get real art instead of a stand-in: a drawing per subject, built from that
 * subject's own accent, of what the subject actually looks like on paper — graph paper and a
 * parabola, a benzene lattice, ruled foolscap. Nothing pretends to be a photograph, so there
 * is no asset to swap in later and nothing misleading at a glance.
 *
 * It paints as a `background-image`, not as inline <svg> children, and that is deliberate.
 * The art is cropped to fill its card the way a photo would be, which means its own drawing
 * is wider than the card at phone widths. As inline SVG those children keep their geometric
 * boxes past the card's edge, and scripts/check-layout.js — which measures element edges
 * precisely because an `overflow-hidden` ancestor hides real clipping bugs — counted every
 * one of them as a page overflow. Painting it means the crop happens in the paint layer,
 * there is no DOM child to measure, and the gate keeps its teeth.
 *
 * Quiet on purpose: the accent icon tile sits centred on top of this and the subject name
 * sits under it, so the strokes stay faint enough that neither has to fight the background.
 */

/** #rrggbb -> [r, g, b]. The accents in app/lib/subjects.ts are all 6-digit hex. */
function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
}

/** The ground each drawing sits on: the accent stirred into --sunken (#f3efe6), opaque. */
function ground(accent: string, amount = 0.09): string {
  const [r, g, b] = rgb(accent)
  const [br, bg, bb] = [0xf3, 0xef, 0xe6]
  const mix = (c: number, base: number) => Math.round(c * amount + base * (1 - amount))
  return `rgb(${mix(r, br)},${mix(g, bg)},${mix(b, bb)})`
}

/** Accent at an alpha. Written out rather than color-mix: CSS variables and color-mix do not
 *  resolve inside a data-URI SVG, which has no access to the page's custom properties. */
function alpha(accent: string, a: number): string {
  const [r, g, b] = rgb(accent)
  return `rgba(${r},${g},${b},${a})`
}

/** The drawing for each subject, as SVG markup over a 300x150 box. */
function art(id: SubjectId, accent: string): string {
  const line = alpha(accent, 0.62)
  const faint = alpha(accent, 0.26)
  const S = `fill='none' stroke='${line}' stroke-linecap='round' stroke-linejoin='round'`

  switch (id) {
    // Graph paper, and the parabola every WAEC candidate has drawn on it.
    case 'mathematics':
      return `
        <defs><pattern id='g' width='20' height='20' patternUnits='userSpaceOnUse'>
          <path d='M20 0 L0 0 0 20' fill='none' stroke='${faint}' stroke-width='1'/>
        </pattern></defs>
        <rect width='300' height='150' fill='url(%23g)'/>
        <path d='M20 20 L20 130 L280 130' ${S} stroke-width='2'/>
        <path d='M40 124 Q150 -30 260 124' ${S} stroke-width='2.5'/>`

    // Electron shells, and the wave that turns up in every other question.
    case 'physics':
      return `
        <g transform='translate(150 75)'>
          ${[0, 60, 120]
            .map((d) => `<ellipse rx='96' ry='38' transform='rotate(${d})' ${S} stroke-width='1.6'/>`)
            .join('')}
        </g>
        <path d='M-10 128 q22 -26 44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0' ${S} stroke-width='2' opacity='0.75'/>`

    // A benzene lattice — the one shape that says "chemistry" at a glance.
    case 'chemistry':
      return `
        <defs><pattern id='h' width='56' height='48' patternUnits='userSpaceOnUse'>
          <path d='M14 2 L42 2 L56 24 L42 46 L14 46 L0 24 Z' fill='none' stroke='${faint}' stroke-width='1.4'/>
        </pattern></defs>
        <rect width='300' height='150' fill='url(%23h)'/>
        <path d='M98 27 L154 27 L182 75 L154 123 L98 123 L70 75 Z' ${S} stroke-width='2.4'/>
        <path d='M106 40 L146 40 M106 110 L146 110 M84 75 L168 75' ${S} stroke-width='1.6' opacity='0.8'/>`

    // An actual leaf — midrib and veins — with cells drifting behind it.
    case 'biology':
      return `
        ${[
          [44, 34, 14],
          [258, 44, 10],
          [52, 122, 9],
          [244, 120, 13],
        ]
          .map(
            ([cx, cy, r]) =>
              `<circle cx='${cx}' cy='${cy}' r='${r}' ${S} stroke-width='1.4' opacity='0.6'/>` +
              `<circle cx='${cx}' cy='${cy}' r='${r / 3}' fill='${faint}' stroke='none'/>`,
          )
          .join('')}
        <path d='M74 120 Q104 36 214 26 Q196 116 74 120 Z' ${S} stroke-width='2.4'/>
        <path d='M74 120 Q146 84 214 26' ${S} stroke-width='2'/>
        ${[
          'M104 101 q10 -22 6 -40',
          'M118 93 q14 -24 12 -44',
          'M136 79 q16 -22 16 -40',
          'M158 64 q18 -18 20 -34',
          'M98 107 q-10 10 -24 12',
          'M126 87 q-8 12 -22 16',
          'M154 68 q-6 12 -20 18',
        ]
          .map((d) => `<path d='${d}' ${S} stroke-width='1.5' opacity='0.75'/>`)
          .join('')}`

    // Ruled foolscap with its margin — what an English answer is written on.
    case 'english':
      return `
        ${[24, 44, 64, 84, 104, 124]
          .map((y) => `<path d='M46 ${y} L282 ${y}' fill='none' stroke='${faint}' stroke-width='1.3'/>`)
          .join('')}
        <path d='M30 0 L30 150' fill='none' stroke='${line}' stroke-width='1.8' opacity='0.65'/>
        <path d='M60 36 L214 36 M60 56 L246 56 M60 76 L188 76' ${S} stroke-width='3' opacity='0.5'/>
        <path d='M60 96 q26 -12 52 0 t52 0' ${S} stroke-width='2.2'/>`

    // Bars, and the trend line drawn through them.
    case 'economics':
      return `
        <path d='M24 126 L282 126' fill='none' stroke='${faint}' stroke-width='1.5'/>
        ${[
          [44, 44],
          [86, 64],
          [128, 52],
          [170, 82],
          [212, 70],
          [254, 100],
        ]
          .map(
            ([x, h]) =>
              `<rect x='${x}' y='${126 - h}' width='22' height='${h}' rx='4' fill='${alpha(accent, 0.17)}'/>`,
          )
          .join('')}
        <path d='M34 108 L76 88 L118 96 L160 62 L202 72 L252 30' ${S} stroke-width='2.6'/>
        <path d='M236 28 L254 26 L252 44' ${S} stroke-width='2.6'/>`
  }
}

function backgroundImage(subject: Subject): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 150' preserveAspectRatio='xMidYMid slice'>` +
    art(subject.id, subject.accent) +
    `</svg>`
  // Only the characters a data URI cannot carry unescaped — '#' is already written as %23
  // above, since encoding it here would break the url(#id) pattern references.
  return `url("data:image/svg+xml,${svg.replace(/\s+/g, ' ').trim().replace(/"/g, "'").replace(/</g, '%3C').replace(/>/g, '%3E')}")`
}

export function SubjectArt({ subject, className = '' }: { subject: Subject; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: ground(subject.accent),
        backgroundImage: backgroundImage(subject),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      aria-hidden
    />
  )
}
