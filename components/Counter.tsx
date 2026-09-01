'use client'

import { useEffect, useState } from 'react'
import { useInView } from './useInView'

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Counts up to `value` the first time it scrolls into view.
 *
 * Jumps straight to the final value when the user prefers reduced motion, and
 * renders `placeholder` until the app has hydrated real data.
 */
export function Counter({
  value,
  duration = 900,
  placeholder = '—',
  ready = true,
  className = '',
}: {
  value: number
  duration?: number
  placeholder?: string
  /** When false, render the placeholder instead of a number. */
  ready?: boolean
  className?: string
}) {
  const [ref, inView] = useInView<HTMLSpanElement>()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView || !ready) return

    if (prefersReducedMotion() || value === 0) {
      const id = requestAnimationFrame(() => setDisplay(value))
      return () => cancelAnimationFrame(id)
    }

    let raf = 0
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(value * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, ready, value, duration])

  return (
    <span ref={ref} className={className}>
      {ready ? display.toLocaleString() : placeholder}
    </span>
  )
}
