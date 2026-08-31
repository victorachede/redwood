import { NextRequest, NextResponse } from 'next/server'

/** Verify Paystack transaction by reference. */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference')
  if (!reference) {
    return NextResponse.json({ error: 'reference required' }, { status: 400 })
  }

  // Demo references from absentia mode
  if (reference.startsWith('demo_ewin_')) {
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
    return NextResponse.json(
      { error: 'PAYSTACK_SECRET_KEY not set', demo: true, status: 'success', plan: 'pro', reference },
      { status: 200 }
    )
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  })
  const data = await res.json()
  if (!res.ok || !data.status) {
    return NextResponse.json({ error: data.message || 'Verify failed' }, { status: 502 })
  }

  const paid = data.data.status === 'success'
  return NextResponse.json({
    ok: paid,
    status: data.data.status,
    amount: data.data.amount,
    plan: data.data.metadata?.plan || 'pro',
    interval: data.data.metadata?.interval || 'monthly',
    reference: data.data.reference,
    customer: data.data.customer?.email,
  })
}
