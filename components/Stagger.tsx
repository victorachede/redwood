'use client'

import { Children, type ReactNode } from 'react'
import { Reveal } from './Reveal'

/**
 * Wraps each child in a Reveal with an increasing delay so grids cascade in
 * rather than popping together.
 */
export function Stagger({
  children,
  step = 70,
  start = 0,
  variant = 'up',
  className = '',
  itemClassName = '',
}: {
  children: ReactNode
  /** ms between consecutive children. */
  step?: number
  /** ms before the first child. */
  start?: number
  variant?: 'up' | 'scale'
  className?: string
  itemClassName?: string
}) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) => (
        <Reveal delay={start + i * step} variant={variant} className={itemClassName}>
          {child}
        </Reveal>
      ))}
    </div>
  )
}
