'use client'

import { useEffect } from 'react'
import { hydrateProgressFromCloud } from '@/app/lib/progress'
import { hydrateCardsFromCloud } from '@/app/lib/cards'
import { hydrateAvatarFromCloud } from '@/app/lib/avatar'
import { hydrateAssignmentsFromCloud } from '@/app/lib/assignments'
import { hydrateOptInFromCloud } from '@/app/lib/leaderboard'
import { isCloud } from '@/app/lib/sync'
import { refreshSession, subscribeToAuth } from '@/app/lib/auth'

/**
 * Pulls the signed-in student's data down once per app load, and again
 * whenever auth changes.
 *
 * Mounted in the app shell rather than per screen so a student who lands
 * deep in the app — resuming a lesson from a home-screen shortcut, say —
 * still gets their progress, not just whoever opens Today first.
 */
export function CloudSync() {
  useEffect(() => {
    const pull = () => {
      if (!isCloud()) return
      void Promise.allSettled([
        // The profile row — display name, plan, exam focus, subjects — so a
        // change made elsewhere (another device, a direct DB edit, a
        // Paystack webhook) shows up on refocus, not just on next sign-in.
        refreshSession(),
        hydrateProgressFromCloud(),
        hydrateCardsFromCloud(),
        hydrateAvatarFromCloud(),
        hydrateAssignmentsFromCloud(),
        hydrateOptInFromCloud(),
      ])
    }

    pull()

    // Re-pull on sign-in, and when the tab is refocused after a long gap.
    const onVisible = () => {
      if (document.visibilityState === 'visible') pull()
    }
    document.addEventListener('visibilitychange', onVisible)
    const stop = subscribeToAuth(pull)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      stop()
    }
  }, [])

  return null
}
