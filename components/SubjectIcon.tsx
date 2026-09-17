import { AtomIcon, BookIcon, FlaskIcon, LeafIcon, SigmaIcon, TrendIcon } from '@/components/icons'
import type { SubjectIconName } from '@/app/lib/subjects'

const ICONS = {
  Sigma: SigmaIcon,
  Atom: AtomIcon,
  FlaskConical: FlaskIcon,
  Leaf: LeafIcon,
  PenLine: BookIcon,
  TrendingUp: TrendIcon,
} as const

/**
 * Subject glyph in a tinted rounded square using that subject's accent.
 * `tone="solid"` fills with the accent for use on light cards; `tone="soft"`
 * tints at low alpha for dense lists.
 */
export function SubjectIcon({
  icon,
  accent,
  size = 40,
  tone = 'soft',
  className = '',
}: {
  icon: SubjectIconName
  accent: string
  size?: number
  tone?: 'soft' | 'solid'
  className?: string
}) {
  const Icon = ICONS[icon] ?? SigmaIcon
  const solid = tone === 'solid'

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl ${className}`}
      style={{
        width: size,
        height: size,
        background: solid ? accent : `color-mix(in srgb, ${accent} 12%, transparent)`,
        boxShadow: solid ? `0 6px 18px -6px ${accent}` : undefined,
        color: solid ? '#fff' : accent,
      }}
      aria-hidden
    >
      <Icon size={size * 0.48} />
    </span>
  )
}
