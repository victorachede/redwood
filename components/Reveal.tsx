'use client'

import { createElement, type ElementType, type ReactNode } from 'react'
import { useInView } from './useInView'

export type RevealProps = {
  children: ReactNode
  /** Entrance delay in ms — use to cascade siblings. */
  delay?: number
  /** `up` slides from below, `scale` eases up from 96%. */
  variant?: 'up' | 'scale'
  /** Element to render. Defaults to a div. */
  as?: ElementType
  className?: string
  id?: string
}

/**
 * Reveals its children once they scroll into view.
 *
 * Animation is opacity/transform only, so it never shifts layout. Under
 * `prefers-reduced-motion` globals.css forces the visible state, so content
 * is shown immediately rather than stranded at opacity 0.
 */
export function Reveal({
  children,
  delay = 0,
  variant = 'up',
  as = 'div',
  className = '',
  id,
}: RevealProps) {
  const [ref, inView] = useInView<HTMLElement>()

  return createElement(
    as,
    {
      ref,
      id,
      className: `reveal ${inView ? 'is-visible' : ''} ${className}`.trim(),
      'data-variant': variant,
      style: delay ? { animationDelay: `${delay}ms` } : undefined,
    },
    children,
  )
}
