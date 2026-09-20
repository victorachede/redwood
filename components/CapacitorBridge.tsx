'use client'

import { useEffect } from 'react'

/**
 * Native-shell glue, no-op on the regular web.
 *
 * Everything here only matters inside the Capacitor wrapper (see
 * capacitor.config.ts) — a plain browser tab never has `Capacitor` on
 * `window`, so the dynamic imports below are skipped entirely there rather
 * than shipping native-only code to every web visitor.
 */
export function CapacitorBridge() {
  useEffect(() => {
    let removeBackListener: (() => void) | undefined

    void (async () => {
      const { Capacitor } = await import('@capacitor/core')
      if (!Capacitor.isNativePlatform()) return

      const [{ App }, { StatusBar, Style }, { SplashScreen }] = await Promise.all([
        import('@capacitor/app'),
        import('@capacitor/status-bar'),
        import('@capacitor/splash-screen'),
      ])

      // The paper background reads as light, so the status bar needs dark
      // icons/text — Style.Dark, despite the name, means "for a light
      // background." backgroundColor is Android-only; iOS takes its color
      // from the page itself.
      void StatusBar.setStyle({ style: Style.Dark })
      void StatusBar.setBackgroundColor({ color: '#fbf8f2' })
      void SplashScreen.hide()

      // Android's hardware back button otherwise exits the app on first
      // press instead of walking back through in-app navigation, which is
      // the one thing that would make this feel like a bad wrapper rather
      // than a real app.
      const listener = App.addListener('backButton', () => {
        if (window.history.length > 1) window.history.back()
        else void App.exitApp()
      })
      removeBackListener = () => void listener.then((l) => l.remove())
    })()

    return () => removeBackListener?.()
  }, [])

  return null
}
