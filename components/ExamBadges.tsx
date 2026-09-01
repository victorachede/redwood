import Image from 'next/image'

/** Official exam board logos (educational identification). */

export type ExamBoard = 'JAMB' | 'WAEC' | 'NECO'

const ASSETS: Record<
  ExamBoard,
  { src: string; src2x: string; label: string; alt: string }
> = {
  JAMB: {
    src: '/exams/jamb.png',
    src2x: '/exams/jamb@2x.png',
    label: 'JAMB',
    alt: 'Joint Admissions and Matriculation Board logo',
  },
  WAEC: {
    src: '/exams/waec.png',
    src2x: '/exams/waec@2x.png',
    label: 'WAEC',
    alt: 'West African Examinations Council logo',
  },
  NECO: {
    src: '/exams/neco.png',
    src2x: '/exams/neco@2x.png',
    label: 'NECO',
    alt: 'National Examination Council logo',
  },
}

export function ExamBadge({
  exam,
  size = 'md',
  showLabel = true,
}: {
  exam: ExamBoard
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}) {
  const a = ASSETS[exam]
  const px = size === 'sm' ? 28 : size === 'lg' ? 48 : 36
  return (
    <span
      className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-2 py-1"
      title={a.alt}
    >
      <Image
        src={a.src}
        alt={a.alt}
        width={px}
        height={px}
        className="object-contain"
        style={{ width: px, height: px }}
      />
      {showLabel && size !== 'sm' && (
        <span className="text-[12px] font-semibold tracking-wide text-ink">{a.label}</span>
      )}
    </span>
  )
}

export function ExamBadgeRow({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      <ExamBadge exam="JAMB" />
      <ExamBadge exam="WAEC" />
      <ExamBadge exam="NECO" />
    </div>
  )
}
