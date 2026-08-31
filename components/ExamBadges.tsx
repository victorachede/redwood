/** Official exam board marks — display for credibility (non-fraud educational use). */

export type ExamBoard = 'JAMB' | 'WAEC' | 'NECO'

const STYLES: Record<
  ExamBoard,
  { bg: string; fg: string; border: string; label: string }
> = {
  JAMB: {
    bg: '#0d5c2e',
    fg: '#ffffff',
    border: '#0a4a24',
    label: 'JAMB',
  },
  WAEC: {
    bg: '#1a3a6b',
    fg: '#ffffff',
    border: '#122a4f',
    label: 'WAEC',
  },
  NECO: {
    bg: '#8b1a1a',
    fg: '#ffffff',
    border: '#6b1212',
    label: 'NECO',
  },
}

export function ExamBadge({
  exam,
  size = 'md',
}: {
  exam: ExamBoard
  size?: 'sm' | 'md' | 'lg'
}) {
  const s = STYLES[exam]
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : size === 'lg' ? 'px-3.5 py-1.5 text-[13px]' : 'px-2.5 py-1 text-[11px]'
  return (
    <span
      className={`inline-flex items-center rounded-md font-bold tracking-wide ${pad}`}
      style={{ background: s.bg, color: s.fg, border: `1px solid ${s.border}` }}
      title={`${exam} practice`}
    >
      {s.label}
    </span>
  )
}

export function ExamBadgeRow({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <ExamBadge exam="JAMB" />
      <ExamBadge exam="WAEC" />
      <ExamBadge exam="NECO" />
    </div>
  )
}
