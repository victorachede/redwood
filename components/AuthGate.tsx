'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getSession, refreshSession, subscribeToAuth } from '@/app/lib/auth'
import { Wordmark } from '@/components/Mark'

/**
 * Requires an account for everything inside the app shell.
 *
 * The product used to say "no account needed to start" and the routes matched
 * that. The copy now says an account is required, so the routes have to mean
 * it — a promise the app does not keep is worse than either version of the
 * promise.
 *
 * It waits for refreshSession() before deciding. Auth is resolved on the
 * client, so acting on the first render would bounce a signed-in student to
 * the login page on every reload, which is the failure people actually
 * notice.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<'checking' | 'in' | 'out'>('checking')

  useEffect(() => {
    let cancelled = false

    const decide = (signedIn: boolean) => {
      if (cancelled) return
      if (signedIn) {
        setState('in')
        return
      }
      setState('out')
      // Carry where they were headed, so signing in lands them there rather
      // than dumping everyone on Today.
      const next = pathname && pathname !== '/dashboard' ? `?next=${encodeURIComponent(pathname)}` : ''
      router.replace(`/login${next}`)
    }

    // The cached session paints immediately; the refresh confirms it.
    // In an effect rather than a lazy initialiser because the cache lives in
    // localStorage, which does not exist during SSR — seeding state from it
    // at render time gives the server "signed out" and the client "signed
    // in", which is a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (getSession()) setState('in')
    void refreshSession()
      .then((u) => decide(Boolean(u || getSession())))
      .catch(() => decide(Boolean(getSession())))

    const stop = subscribeToAuth(() => decide(Boolean(getSession())))
    return () => {
      cancelled = true
      stop()
    }
  }, [router, pathname])

  if (state === 'in') return <>{children}</>

  // One calm screen for both checking and redirecting. Showing "you must sign
  // in" during a check that is about to succeed is its own small lie.
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-paper px-6 text-center">
      <Wordmark size={30} />
      <p className="flex items-center gap-2 text-[15px] font-semibold text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        {state === 'checking' ? 'One moment…' : 'Taking you to sign in…'}
      </p>
    </div>
  )
}
