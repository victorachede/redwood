import type { DiagramSpec } from '@/app/lib/tutorProtocol'

/**
 * Renders tutor diagrams as inline SVG.
 *
 * Deliberately generated rather than a curated image library: a library
 * cannot draw *this* student's problem, goes stale, and needs hosting.
 * Generated SVG takes the actual numbers from the question, themes with
 * dark mode via currentColor and CSS variables, scales perfectly, and
 * costs no network request.
 */

const INK = 'var(--ink)'
const MUTED = 'var(--ink-muted)'
const LINE = 'var(--line-strong)'

export function Diagram({ spec, caption }: { spec: DiagramSpec; caption?: string }) {
  return (
    <figure className="my-1 overflow-hidden rounded-xl border border-line bg-surface p-3">
      <div className="w-full overflow-x-auto">
        <Body spec={spec} />
      </div>
      {(caption || spec.label) && (
        <figcaption className="mt-2 text-[12.5px] text-ink-muted">
          {caption || spec.label}
        </figcaption>
      )}
    </figure>
  )
}

function Body({ spec }: { spec: DiagramSpec }) {
  switch (spec.kind) {
    case 'numberline':
      return <NumberLine spec={spec} />
    case 'triangle':
      return <Triangle spec={spec} />
    case 'forces':
      return <Forces spec={spec} />
    case 'graph':
      return <Graph spec={spec} />
    case 'bar':
      return <Bars spec={spec} />
    default:
      return null
  }
}

function NumberLine({ spec }: { spec: Extract<DiagramSpec, { kind: 'numberline' }> }) {
  const { min, max, marks = [] } = spec
  const span = Math.max(1, max - min)
  const W = 300
  const x = (v: number) => 16 + ((v - min) / span) * (W - 32)
  const ticks = Array.from({ length: Math.min(11, span + 1) }, (_, i) =>
    min + Math.round((i * span) / Math.min(10, span)),
  )

  return (
    <svg viewBox="0 0 300 64" width="100%" height="64" role="img" aria-label="Number line">
      <line x1="16" y1="34" x2={W - 16} y2="34" stroke={LINE} strokeWidth="2" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} y1="28" x2={x(t)} y2="40" stroke={LINE} strokeWidth="2" />
          <text x={x(t)} y="56" textAnchor="middle" fontSize="10" fill={MUTED}>
            {t}
          </text>
        </g>
      ))}
      {marks.map((m, i) => (
        <circle key={i} cx={x(m)} cy="34" r="6" fill="var(--primary)" />
      ))}
    </svg>
  )
}

function Triangle({ spec }: { spec: Extract<DiagramSpec, { kind: 'triangle' }> }) {
  const { a, b, c, angle } = spec
  return (
    <svg viewBox="0 0 300 170" width="100%" height="170" role="img" aria-label="Triangle">
      <polygon
        points="40,140 250,140 40,30"
        fill="color-mix(in srgb, var(--primary) 8%, transparent)"
        stroke="var(--primary)"
        strokeWidth="2"
      />
      {/* right-angle marker */}
      <path d="M40,126 L54,126 L54,140" fill="none" stroke="var(--primary)" strokeWidth="2" />
      {b != null && (
        <text x="145" y="158" textAnchor="middle" fontSize="12" fill={INK}>{b}</text>
      )}
      {a != null && (
        <text x="26" y="88" textAnchor="middle" fontSize="12" fill={INK}>{a}</text>
      )}
      {c != null && (
        <text x="155" y="80" textAnchor="middle" fontSize="12" fill={INK}>{c}</text>
      )}
      {angle != null && (
        <text x="228" y="132" textAnchor="middle" fontSize="11" fill={MUTED}>{angle}°</text>
      )}
    </svg>
  )
}

function Forces({ spec }: { spec: Extract<DiagramSpec, { kind: 'forces' }> }) {
  const cx = 150
  const cy = 85
  const vectors = (spec.vectors ?? []).slice(0, 5)
  const scale = 46

  return (
    <svg viewBox="0 0 300 170" width="100%" height="170" role="img" aria-label="Force diagram">
      <defs>
        <marker id="ewin-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="var(--primary)" />
        </marker>
      </defs>

      <rect
        x={cx - 22}
        y={cy - 22}
        width="44"
        height="44"
        rx="6"
        fill="color-mix(in srgb, var(--primary) 12%, transparent)"
        stroke="var(--primary)"
        strokeWidth="2"
      />

      {vectors.map((v, i) => {
        const x2 = cx + v.dx * scale
        const y2 = cy - v.dy * scale
        return (
          <g key={i}>
            <line
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke="var(--primary)"
              strokeWidth="2.5"
              markerEnd="url(#ewin-arrow)"
            />
            <text
              x={x2 + (v.dx >= 0 ? 8 : -8)}
              y={y2 + (v.dy >= 0 ? -6 : 14)}
              textAnchor={v.dx >= 0 ? 'start' : 'end'}
              fontSize="11"
              fill={INK}
            >
              {v.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Graph({ spec }: { spec: Extract<DiagramSpec, { kind: 'graph' }> }) {
  const W = 300
  const H = 180
  const ox = 40
  const oy = H - 34
  const sx = 22
  const sy = 14

  const pts: string[] = []
  for (let px = -1; px <= 10; px += 0.25) {
    const y =
      spec.expression === 'quadratic'
        ? (spec.a ?? 1) * px * px + (spec.m ?? 0) * px + (spec.c ?? 0)
        : (spec.m ?? 1) * px + (spec.c ?? 0)
    const X = ox + px * sx
    const Y = oy - y * sy
    if (X >= ox - 10 && X <= W - 8 && Y >= 8 && Y <= oy + 10) pts.push(`${X},${Y}`)
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Graph">
      <line x1={ox} y1="12" x2={ox} y2={oy} stroke={LINE} strokeWidth="2" />
      <line x1={ox} y1={oy} x2={W - 12} y2={oy} stroke={LINE} strokeWidth="2" />
      <text x={W - 14} y={oy + 18} textAnchor="end" fontSize="10" fill={MUTED}>x</text>
      <text x={ox - 10} y="18" textAnchor="end" fontSize="10" fill={MUTED}>y</text>
      {pts.length > 1 && (
        <polyline points={pts.join(' ')} fill="none" stroke="var(--primary)" strokeWidth="2.5" />
      )}
    </svg>
  )
}

function Bars({ spec }: { spec: Extract<DiagramSpec, { kind: 'bar' }> }) {
  const bars = (spec.bars ?? []).slice(0, 6)
  const max = Math.max(1, ...bars.map((b) => b.value))
  const W = 300
  const H = 170
  const bw = bars.length ? (W - 40) / bars.length : 0

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Bar chart">
      <line x1="20" y1={H - 30} x2={W - 20} y2={H - 30} stroke={LINE} strokeWidth="2" />
      {bars.map((b, i) => {
        const h = (b.value / max) * (H - 60)
        const x = 20 + i * bw + bw * 0.16
        const w = bw * 0.68
        return (
          <g key={i}>
            <rect x={x} y={H - 30 - h} width={w} height={h} rx="3" fill="var(--primary)" />
            <text x={x + w / 2} y={H - 14} textAnchor="middle" fontSize="10" fill={MUTED}>
              {b.label}
            </text>
            <text x={x + w / 2} y={H - 36 - h} textAnchor="middle" fontSize="10" fill={INK}>
              {b.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
