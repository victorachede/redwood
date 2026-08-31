import { NextRequest, NextResponse } from 'next/server'
import { grantProByEmail } from '@/app/lib/grantPro'

/** Verify Paystack transaction by reference and grant Pro in Supabase. */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference')
  if (!reference) {
    return NextResponse.json({ error: 'reference required' }, { status: 400 })
  }

  // Demo references from absentia mode
  if (reference.startsWith('demo_ewin_')) {
    const email = req.nextUrl.searchParams.get('email')
    if (email) await grantProByEmail(email, { interval: 'monthly', reference })
    return NextResponse.json({
      ok: true,
      demo: true,
      status: 'success',
      plan: 'pro',
      reference,
    })
  }

  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    const email = req.nextUrl.searchParams.get('email')
    if (email) await grantProByEmail(email, { interval: 'monthly', reference })
    return NextResponse.json({
      ok: true,
      demo: true,
      status: 'success',
      plan: 'pro',
      reference,
    })
  }

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  )
  const data = await res.json()
  if (!res.ok || !data.status) {
    return NextResponse.json({ error: data.message || 'Verify failed' }, { status: 502 })
  }

  const paid = data.data.status === 'success'
  const email = data.data.customer?.email as string | undefined
  const interval = (data.data.metadata?.interval as string) || 'monthly'
  const plan = (data.data.metadata?.plan as string) || 'pro'

  if (paid && email && plan === 'pro') {
    await grantProByEmail(email, { interval, reference: data.data.reference })
  }

  return NextResponse.json({
    ok: paid,
    status: data.data.status,
    amount: data.data.amount,
    plan,
    interval,
    reference: data.data.reference,
    customer: email,
  })
}
