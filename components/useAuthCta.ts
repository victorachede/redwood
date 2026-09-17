'use client'

import { useEffect, useState } from 'react'
import { getSession, subscribeToAuth } from '@/app/lib/auth'

/**
 * Marketing CTAs default to sending a new visitor to /signup — but a
 * returning, already-signed-in visitor tapping "Start learning" would just
 * land back on the signup form, which reads as the product forgetting them.
 * Swap the destination once we know they're signed in. Defaults to the
 * signed-out href until the check resolves client-side, matching how the
 * rest of the app already handles auth-dependent UI.
 */
export function useAuthCta(signedOutHref: string, signedInHref = '/dashboard') {
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    const check = () => setSignedIn(Boolean(getSession()))
    check()
    return subscribeToAuth(check)
  }, [])

  return {
    href: signedIn ? signedInHref : signedOutHref,
    signedIn,
  }
}
