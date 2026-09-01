import { Atom, FlaskConical, Leaf, PenLine, Sigma, TrendingUp } from 'lucide-react'
import type { SubjectIconName } from '@/app/lib/subjects'

const ICONS = {
  Sigma,
  Atom,
  FlaskConical,
  Leaf,
  PenLine,
  TrendingUp,
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
  const Icon = ICONS[icon] ?? Sigma
  const solid = tone === 'solid'

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl ${className}`}
      style={{
        width: size,
        height: size,
        background: solid ? accent : `color-mix(in srgb, ${accent} 12%, transparent)`,
        boxShadow: solid ? `0 6px 18px -6px ${accent}` : undefined,
      }}
      aria-hidden
    >
      <Icon
        style={{ color: solid ? '#fff' : accent }}
        strokeWidth={2}
        width={size * 0.48}
        height={size * 0.48}
      />
    </span>
  )
}
