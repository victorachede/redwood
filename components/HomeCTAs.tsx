'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getSession, useAuthListener } from '@/app/lib/auth'

/**
 * Both CTA rows sit on the navy hero/close bands, so gold is the primary
 * action and glass is the secondary.
 *
 * `mounted` gates the auth-dependent label: `signedIn` starts false on the
 * server, so without it the button text visibly flips after hydration.
 */

const PRIMARY =
  'sheen inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 px-6 py-3 text-[14px] font-semibold text-navy-800 no-underline shadow-[var(--shadow-gold)] transition-transform duration-200 hover:scale-[1.02] active:scale-100'

const SECONDARY =
  'inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-6 py-3 text-[14px] font-medium text-white no-underline backdrop-blur-sm transition-colors duration-200 hover:bg-white/[0.13]'

function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setSignedIn(!!getSession())
    setMounted(true)
    return useAuthListener(() => setSignedIn(!!getSession()))
  }, [])

  return { signedIn, mounted }
}

export function HomeHeroCTAs() {
  const { signedIn, mounted } = useSignedIn()

  return (
    <>
      <div className="mt-9 flex flex-wrap items-center gap-3">
        <Link href="#subjects" className={PRIMARY}>
          Choose a subject
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Link href={signedIn ? '/dashboard' : '/signup'} className={SECONDARY}>
          {/* Reserve the wider label so the row never reflows on hydration */}
          <span className={mounted ? '' : 'opacity-0'}>
            {signedIn ? 'Dashboard' : 'Create account'}
          </span>
        </Link>
      </div>

      <p className="mt-4 h-5 text-[13px] text-[var(--on-accent-muted)]">
        <span className={mounted ? '' : 'opacity-0'}>
          {signedIn ? 'Welcome back' : 'Free to start'}
        </span>
      </p>
    </>
  )
}

export function HomeBottomCTA() {
  const { signedIn, mounted } = useSignedIn()

  return (
    <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
      <Link href="#subjects" className={PRIMARY}>
        <span className={mounted ? '' : 'opacity-0'}>
          {signedIn ? 'Continue learning' : 'Start learning'}
        </span>
        <ArrowRight className="h-4 w-4" />
      </Link>

      <Link href={signedIn ? '/dashboard' : '/signup'} className={SECONDARY}>
        <span className={mounted ? '' : 'opacity-0'}>
          {signedIn ? 'Open dashboard' : 'Create account'}
        </span>
      </Link>
    </div>
  )
}
