'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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
          className="inline-flex items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-[var(--on-accent)] no-underline hover:bg-accent-hover"
        >
          Choose a subject
        </Link>
        {signedIn ? (
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink no-underline hover:bg-neutral-50"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/signup"
            className="inline-flex items-center rounded-md border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink no-underline hover:bg-neutral-50"
          >
            Create account
          </Link>
        )}
      </div>
      <p className="mt-4 text-[13px] text-ink-muted">
        {signedIn ? 'Welcome back' : 'Free to start'}
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
        className="inline-flex items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-[var(--on-accent)] no-underline hover:bg-accent-hover"
      >
        {signedIn ? 'Continue learning' : 'Start learning'}
      </Link>
      {!signedIn && (
        <Link
          href="/signup"
          className="inline-flex items-center rounded-md border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink no-underline hover:bg-neutral-50"
        >
          Create account
        </Link>
      )}
      {signedIn && (
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-md border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink no-underline hover:bg-neutral-50"
        >
          Open dashboard
        </Link>
      )}
    </div>
  )
}
