'use client'

import { useEffect } from 'react'

/**
 * GSAP scroll choreography for the landing page.
 *
 * Three rules this is built around, all of them about not making the page
 * worse for the student it is actually for — a mid-range Android on mobile
 * data, at night:
 *
 * 1. GSAP is imported dynamically, so its ~50KB never blocks first paint and
 *    never ships to the app routes at all.
 * 2. Elements are only hidden once the library has actually loaded. If the
 *    chunk fails — bad signal, blocked CDN, an old browser — the page stays
 *    fully visible rather than animating to nothing. A reveal animation that
 *    can hide your content on failure is a bug, not a flourish.
 * 3. Under prefers-reduced-motion nothing is hidden and nothing moves.
 */
export function Motion() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    let ctx: { revert: () => void } | undefined
    let cancelled = false

    void (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ])
        if (cancelled) return
        gsap.registerPlugin(ScrollTrigger)

        // Anything already on screen when the library finally arrives must be
        // shown in the same task that hides it, or the student watches the
        // paragraph they are reading disappear and fade back. The class and
        // the reveal below happen without yielding to the browser, so the
        // hidden state is never painted.
        document.documentElement.classList.add('js-reveal-ready')

        /** Already in view, or scrolled past — nothing to animate in. */
        const alreadySeen = (el: Element) =>
          el.getBoundingClientRect().top < window.innerHeight * 0.95

        ctx = gsap.context(() => {
          // The hero is animated in CSS, not here. gsap.from() paints the
          // element in place and only then snaps it to the start state on the
          // next frame, so the headline dropped 26px and the card 68px about
          // 900ms in and slid back — the jump. Above the fold, nothing may
          // wait on a dynamic import before it settles.

          // Everything below the fold reveals as it arrives.
          for (const el of gsap.utils.toArray<HTMLElement>('[data-reveal]')) {
            if (alreadySeen(el)) {
              gsap.set(el, { opacity: 1, y: 0 })
              continue
            }
            gsap.to(el, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
              startAt: { y: 30 },
            })
          }

          // Grouped items come in one after another rather than all at once.
          for (const group of gsap.utils.toArray<HTMLElement>('[data-reveal-group]')) {
            if (alreadySeen(group)) {
              gsap.set(group.children, { opacity: 1, y: 0 })
              continue
            }
            gsap.to(group.children, {
              y: 0,
              opacity: 1,
              duration: 0.55,
              ease: 'power3.out',
              stagger: 0.07,
              scrollTrigger: { trigger: group, start: 'top 85%', once: true },
              startAt: { y: 26 },
            })
          }
        })
      } catch {
        // The page is already fully readable; nothing to recover.
        document.documentElement.classList.remove('js-reveal-ready')
      }
    })()

    return () => {
      cancelled = true
      ctx?.revert()
      document.documentElement.classList.remove('js-reveal-ready')
    }
  }, [])

  return null
}
