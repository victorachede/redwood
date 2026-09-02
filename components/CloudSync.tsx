'use client'

import { useEffect } from 'react'
import { hydrateProgressFromCloud } from '@/app/lib/progress'
import { hydrateCardsFromCloud } from '@/app/lib/cards'
import { hydrateAvatarFromCloud } from '@/app/lib/avatar'
import { hydratePlanFromCloud } from '@/app/lib/billing'
import { hydrateAssignmentsFromCloud } from '@/app/lib/assignments'
import { isCloud } from '@/app/lib/sync'
import { subscribeToAuth } from '@/app/lib/auth'

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
        hydrateProgressFromCloud(),
        hydrateCardsFromCloud(),
        hydrateAvatarFromCloud(),
        hydratePlanFromCloud(),
        hydrateAssignmentsFromCloud(),
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
