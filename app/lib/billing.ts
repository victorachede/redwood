/** Billing + plans. Paystack-ready. The profile row in Postgres is the only
 *  place a plan lives — gating reads the session cache, which refreshSession()
 *  keeps in sync with that row, never a separate local plan cache. */

import { getSession, setSessionPlan } from '@/app/lib/auth'
import { db, isCloud } from '@/app/lib/sync'

export type PlanId = 'free' | 'pro' | 'voice'

export type Plan = {
  id: PlanId
  name: string
  priceMonthlyNgn: number
  priceYearlyNgn: number
  blurb: string
  features: string[]
  cta: string
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthlyNgn: 0,
    priceYearlyNgn: 0,
    blurb: 'Everything you need to study. No card, ever.',
    features: [
      'All 6 core subjects',
      'Tutor sessions (fair use)',
      'Practice questions',
      'Study cards, synced across your devices',
      'JAMB · WAEC · NECO style drills',
    ],
    cta: 'Stay on Free',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthlyNgn: 2500,
    priceYearlyNgn: 20000,
    blurb: 'Timed mocks, deeper practice, and priority tutor.',
    features: [
      'Everything in Free',
      'Timed full mocks (JAMB / WAEC / NECO)',
      'Unlimited practice & weak-spot drills',
      'Exam-mode filters + score history',
      'Priority tutor responses',
    ],
    cta: 'Upgrade with Paystack',
  },
  voice: {
    id: 'voice',
    name: 'Voice',
    priceMonthlyNgn: 10000,
    priceYearlyNgn: 0,
    blurb: 'A real teacher on a call — explains out loud, draws it on a whiteboard as it talks.',
    features: [
      'Everything in Pro',
      '30 min/month of live voice tutoring',
      'Interruptible — jump in and ask, like a real class',
      'Whiteboard narration synced to the call',
    ],
    cta: 'Coming soon',
  },
}

export type PlanUpdate = {
  plan: PlanId
  interval: 'monthly' | 'yearly'
}

/**
 * Writes a plan change to the profile row and patches the cached session
 * immediately, so isPro() reflects it without waiting for the next full
 * session refresh. Used for the demo/no-Paystack-keys flow and for
 * downgrading to Free — real payments are granted server-side (see
 * app/lib/grantPro.ts) and reach the client the same way, through the
 * session cache.
 */
export function setPlan(update: PlanUpdate) {
  if (typeof window === 'undefined') return
  setSessionPlan(update.plan)
  if (!isCloud()) return
  const uid = getSession()!.id
  void db()!
    .from('profiles')
    .update({
      plan: update.plan,
      plan_interval: update.interval,
      plan_updated_at: new Date().toISOString(),
    })
    .eq('id', uid)
    .then(({ error }: { error: unknown }) => {
      if (error) console.warn('[sync] plan failed', error)
    })
}

/** Voice includes everything Pro has (see PLANS.voice's own feature list),
 *  so a Voice subscriber must pass every Pro gate too — not just the new
 *  voice-specific one. Reads the session cache, which refreshSession() keeps
 *  in sync with Postgres on every load and auth change. */
export function isPro(): boolean {
  const plan = getSession()?.plan ?? 'free'
  return plan === 'pro' || plan === 'voice'
}

/** Feature gates used across the app */
export function canAccessTimedMocks(): boolean {
  return isPro()
}

export function canAccessUnlimitedPractice(): boolean {
  return isPro()
}

export function formatNgn(amount: number): string {
  if (amount <= 0) return '₦0'
  return `₦${amount.toLocaleString('en-NG')}`
}
