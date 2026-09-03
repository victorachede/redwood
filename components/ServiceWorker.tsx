'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker in production only.
 *
 * Deliberately not in development: a caching worker in front of the dev
 * server hands you yesterday's bundle and an afternoon of debugging a fix
 * that already shipped.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return
    // After load, so registration never competes with first paint on a slow
    // connection — which is the exact connection this exists for.
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* An unavailable worker just means no offline support, not a broken app. */
      })
    }
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }, [])

  return null
}
