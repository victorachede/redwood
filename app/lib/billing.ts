/** Billing + plans. Paystack-ready; works offline with local plan until keys are set. */

export type PlanId = 'free' | 'pro'

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
    blurb: 'Start learning today. No card needed.',
    features: [
      'All 6 core subjects',
      'Tutor sessions (fair use)',
      'Practice questions',
      'Study cards on this device',
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
      'Progress synced when Supabase is live',
    ],
    cta: 'Upgrade with Paystack',
  },
}

const PLAN_KEY = 'ewin-plan-v1'

export type LocalPlanState = {
  plan: PlanId
  interval: 'monthly' | 'yearly'
  /** Paystack reference when paid */
  reference?: string
  updatedAt: number
}

export function getLocalPlan(): LocalPlanState {
  if (typeof window === 'undefined') {
    return { plan: 'free', interval: 'monthly', updatedAt: 0 }
  }
  try {
    const raw = localStorage.getItem(PLAN_KEY)
    if (!raw) return { plan: 'free', interval: 'monthly', updatedAt: 0 }
    return JSON.parse(raw) as LocalPlanState
  } catch {
    return { plan: 'free', interval: 'monthly', updatedAt: 0 }
  }
}

export function setLocalPlan(state: LocalPlanState) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PLAN_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event('ewin-plan'))

  // The profile row is the real record of what someone paid for. The local
  // copy is a cache so gating does not wait on a round trip.
  void (async () => {
    const { getSession } = await import('@/app/lib/auth')
    const { db, isCloud } = await import('@/app/lib/sync')
    if (!isCloud()) return
    const uid = getSession()!.id
    const { error } = await db()!
      .from('profiles')
      .update({
        plan: state.plan,
        plan_interval: state.interval,
        plan_updated_at: new Date(state.updatedAt || Date.now()).toISOString(),
      })
      .eq('id', uid)
    if (error) console.warn('[sync] plan failed', error)
  })()
}

/** Reads the authoritative plan from the profile on load. */
export async function hydratePlanFromCloud(): Promise<void> {
  if (typeof window === 'undefined') return
  const { getSession } = await import('@/app/lib/auth')
  const { db, isCloud } = await import('@/app/lib/sync')
  if (!isCloud()) return

  const { data } = await db()!
    .from('profiles')
    .select('plan, plan_interval, plan_updated_at')
    .eq('id', getSession()!.id)
    .maybeSingle()
  if (!data) return

  const next: LocalPlanState = {
    plan: (data.plan as PlanId) || 'free',
    interval: (data.plan_interval as 'monthly' | 'yearly') || 'monthly',
    updatedAt: data.plan_updated_at ? new Date(data.plan_updated_at).getTime() : Date.now(),
  }
  localStorage.setItem(PLAN_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('ewin-plan'))
}

export function isPro(): boolean {
  return getLocalPlan().plan === 'pro'
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
