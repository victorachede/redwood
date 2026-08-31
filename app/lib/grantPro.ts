import { createServiceClient } from '@/app/lib/supabase'

/** Mark a profile as Pro by email (Paystack verify / webhook). */
export async function grantProByEmail(
  email: string,
  opts?: { interval?: string; reference?: string },
): Promise<{ ok: boolean; error?: string }> {
  const sb = createServiceClient()
  if (!sb) return { ok: false, error: 'Supabase service client not configured' }

  const normalized = email.trim().toLowerCase()
  const { data: profile, error: findErr } = await sb
    .from('profiles')
    .select('id')
    .eq('email', normalized)
    .maybeSingle()

  if (findErr) return { ok: false, error: findErr.message }
  if (!profile) {
    // User may not have signed up yet — still ok for Paystack receipt
    return { ok: true }
  }

  const { error } = await sb
    .from('profiles')
    .update({
      plan: 'pro',
      plan_interval: opts?.interval === 'yearly' ? 'yearly' : 'monthly',
      plan_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
