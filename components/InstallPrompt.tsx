'use client'

import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

const DISMISSED_KEY = 'ewin-install-dismissed'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * A student on a mid-range Android phone is never going to find "Install
 * app" buried in Chrome's overflow menu on their own — the browser's own
 * install affordance is easy to miss and, on iOS, does not exist at all
 * (Safari has no beforeinstallprompt; "Add to Home Screen" only lives under
 * the Share sheet). This surfaces the one thing worth doing about it: ask,
 * once, in the one place signed-in students already look every day.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [iosHint, setIosHint] = useState(false)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const alreadyInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as { standalone?: boolean }).standalone === true
    if (alreadyInstalled) return
    if (localStorage.getItem(DISMISSED_KEY)) return

    let cancelled = false
    let removeListener: (() => void) | undefined
    let t: ReturnType<typeof setTimeout> | undefined

    void import('@capacitor/core').then(({ Capacitor }) => {
      if (cancelled) return
      // Someone running the real native wrapper (see capacitor.config.ts)
      // has already "installed" the app in the way that matters — offering
      // the PWA install banner on top of that is just confusing.
      if (Capacitor.isNativePlatform()) return

      const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)

      const onPrompt = (e: Event) => {
        e.preventDefault()
        setDeferred(e as BeforeInstallPromptEvent)
        setDismissed(false)
      }
      window.addEventListener('beforeinstallprompt', onPrompt)
      removeListener = () => window.removeEventListener('beforeinstallprompt', onPrompt)

      // Chrome fires beforeinstallprompt asynchronously (or not at all if
      // the install criteria already failed); iOS never fires it. Either
      // way, decide what to show once we've given Chrome a moment to speak.
      t = setTimeout(() => {
        if (isIos) {
          setIosHint(true)
          setDismissed(false)
        }
      }, 1200)
    })

    return () => {
      cancelled = true
      removeListener?.()
      clearTimeout(t)
    }
  }, [])

  function dismiss() {
    setDismissed(true)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    if (outcome === 'accepted') setDismissed(true)
    // If dismissed from the native sheet, leave the banner up — a second
    // no-thanks tap costs nothing and re-prompting on next load is worse.
  }

  if (dismissed || (!deferred && !iosHint)) return null

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-[var(--shadow-sm)]">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {iosHint ? <Share className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-ink">Install EWIN</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">
          {iosHint
            ? 'Tap the Share icon below, then "Add to Home Screen" — opens faster and works offline.'
            : 'Opens faster, works offline, and sits on your home screen like a real app.'}
        </p>
        {!iosHint && (
          <button
            type="button"
            onClick={install}
            className="press mt-2.5 rounded-full bg-primary px-4 py-1.5 text-[12.5px] font-semibold text-on-primary"
          >
            Install
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="press shrink-0 rounded-full p-1 text-ink-faint hover:text-ink-muted"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
