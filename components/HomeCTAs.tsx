'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { getSession, useAuthListener } from '@/app/lib/auth'

export function HomeHeroCTAs() {
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    setSignedIn(!!getSession())
    return useAuthListener(() => setSignedIn(!!getSession()))
  }, [])

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="#subjects"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] no-underline shadow-sm transition hover:bg-accent-hover"
        >
          Choose a subject
          <ArrowRight className="h-4 w-4" />
        </Link>
        {signedIn ? (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink no-underline transition hover:border-accent"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink no-underline transition hover:border-accent"
          >
            Create account
          </Link>
        )}
      </div>
      <p className="mt-4 text-xs text-ink-muted">
        {signedIn ? 'Welcome back · Pick up where you left off' : 'Free · No account needed to start'}
      </p>
    </>
  )
}

export function HomeBottomCTA() {
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    setSignedIn(!!getSession())
    return useAuthListener(() => setSignedIn(!!getSession()))
  }, [])

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <Link
        href="#subjects"
        className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[var(--on-accent)] no-underline hover:bg-accent-hover"
      >
        {signedIn ? 'Continue learning' : 'Start learning'}
        <ArrowRight className="h-4 w-4" />
      </Link>
      {!signedIn && (
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-medium text-ink no-underline hover:border-accent"
        >
          Create account
        </Link>
      )}
      {signedIn && (
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-medium text-ink no-underline hover:border-accent"
        >
          Open dashboard
        </Link>
      )}
    </div>
  )
}
