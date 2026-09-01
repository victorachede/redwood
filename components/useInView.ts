'use client'

import { useEffect, useRef, useState } from 'react'

type Options = {
  /** Stop observing after the first intersection. Default true. */
  once?: boolean
  /** rootMargin passed to IntersectionObserver. */
  margin?: string
  /** Visibility ratio that counts as "in view". */
  threshold?: number
}

/**
 * Reports whether the referenced element has scrolled into view.
 *
 * Falls back to `true` when IntersectionObserver is unavailable so content is
 * never left hidden.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  { once = true, margin = '0px 0px -10% 0px', threshold = 0.15 }: Options = {},
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      // Defer rather than setting state synchronously in the effect body
      const id = requestAnimationFrame(() => setInView(true))
      return () => cancelAnimationFrame(id)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin: margin, threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [once, margin, threshold])

  return [ref, inView]
}
