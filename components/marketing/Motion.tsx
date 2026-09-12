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

        // Only now is it safe to let the CSS hide anything.
        document.documentElement.classList.add('js-reveal-ready')

        ctx = gsap.context(() => {
          // Hero: the one entrance that plays on load rather than on scroll.
          gsap.from('[data-hero-item]', {
            y: 26,
            opacity: 0,
            duration: 0.62,
            ease: 'power3.out',
            stagger: 0.09,
          })
          gsap.from('[data-hero-cast]', {
            y: 40,
            opacity: 0,
            scale: 0.86,
            duration: 0.8,
            ease: 'back.out(1.5)',
            delay: 0.25,
          })

          // Everything else reveals as it arrives.
          for (const el of gsap.utils.toArray<HTMLElement>('[data-reveal]')) {
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
