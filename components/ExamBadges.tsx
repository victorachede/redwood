import Image from 'next/image'

/** Exam board marks for credibility (educational display). */

export type ExamBoard = 'JAMB' | 'WAEC' | 'NECO'

const ASSETS: Record<ExamBoard, { src: string; label: string }> = {
  JAMB: { src: '/exams/jamb.png', label: 'JAMB' },
  WAEC: { src: '/exams/waec.png', label: 'WAEC' },
  NECO: { src: '/exams/neco.png', label: 'NECO' },
}

export function ExamBadge({
  exam,
  size = 'md',
}: {
  exam: ExamBoard
  size?: 'sm' | 'md' | 'lg'
}) {
  const a = ASSETS[exam]
  const px = size === 'sm' ? 22 : size === 'lg' ? 36 : 28
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md overflow-hidden"
      title={`${exam} practice`}
    >
      <Image
        src={a.src}
        alt={a.label}
        width={px}
        height={px}
        className="rounded-md object-contain"
      />
      {size !== 'sm' && (
        <span className="text-[11px] font-semibold tracking-wide text-ink">{a.label}</span>
      )}
    </span>
  )
}

export function ExamBadgeRow({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <ExamBadge exam="JAMB" />
      <ExamBadge exam="WAEC" />
      <ExamBadge exam="NECO" />
    </div>
  )
}
