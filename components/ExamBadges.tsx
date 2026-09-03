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

export type BadgeVariant = 'light' | 'dark'

export function ExamBadge({
  exam,
  size = 'md',
  showLabel = true,
  variant = 'light',
}: {
  exam: ExamBoard
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  /** `dark` for navy sections — a white chip there looks pasted on. */
  variant?: BadgeVariant
}) {
  const a = ASSETS[exam]
  const px = size === 'sm' ? 28 : size === 'lg' ? 48 : 36
  const dark = variant === 'dark'

  return (
    <span
      className={`group inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-colors duration-300 ${
        dark
          ? 'border border-white/10 bg-surface/[0.07] backdrop-blur-sm hover:bg-surface/[0.12]'
          : 'border border-line bg-surface hover:border-line'
      }`}
      title={a.alt}
    >
      <Image
        src={a.src}
        alt={a.alt}
        width={px}
        height={px}
        className="object-contain opacity-85 transition-opacity duration-300 group-hover:opacity-100"
        style={{ width: px, height: px }}
      />
      {showLabel && size !== 'sm' && (
        <span
          className={`text-[12px] font-semibold tracking-wide ${
            dark ? 'text-white/85' : 'text-ink'
          }`}
        >
          {a.label}
        </span>
      )}
    </span>
  )
}

/**
 * The board credential line.
 *
 * Presented as one row of marks at a consistent optical height rather than
 * three coloured chips — as chips they read as clip art, which undercut the
 * exact thing they are there to establish. The lead-in is typographic so the
 * claim is made in words and the logos only identify.
 */
export function ExamBadgeRow({
  className = '',
  variant = 'light',
}: {
  className?: string
  variant?: BadgeVariant
}) {
  const dark = variant === 'dark'
  return (
    <div className={`flex flex-wrap items-center gap-x-7 gap-y-4 ${className}`}>
      <p
        className="text-xs font-semibold uppercase tracking-[0.16em]"
        style={{ color: dark ? 'var(--on-hero-dim)' : 'var(--ink-faint)' }}
      >
        Written for
      </p>
      <div className="flex items-center gap-6">
        {(['WAEC', 'NECO', 'JAMB'] as ExamBoard[]).map((exam) => {
          const a = ASSETS[exam]
          return (
            <span key={exam} className="inline-flex items-center gap-2.5" title={a.alt}>
              <Image
                src={a.src}
                alt={a.alt}
                width={30}
                height={30}
                className="h-[30px] w-[30px] object-contain"
              />
              <span
                className="text-[13.5px] font-semibold tracking-wide"
                style={{ color: dark ? 'var(--on-hero)' : 'var(--ink)' }}
              >
                {a.label}
              </span>
            </span>
          )
        })}
      </div>
      <p
        className="text-sm"
        style={{ color: dark ? 'var(--on-hero-dim)' : 'var(--ink-faint)' }}
      >
        Not affiliated with any board.
      </p>
    </div>
  )
}
