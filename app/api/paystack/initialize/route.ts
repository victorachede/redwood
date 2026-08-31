import { NextRequest, NextResponse } from 'next/server'
import { PLANS, type PlanId } from '@/app/lib/billing'

/**
 * Initialize a Paystack transaction.
 * Set PAYSTACK_SECRET_KEY in env. Without it, returns demo mode so UI can be built.
 *
 * Docs: https://paystack.com/docs/api/transaction/#initialize
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const plan = (body.plan === 'pro' ? 'pro' : 'free') as PlanId
    const interval = body.interval === 'yearly' ? 'yearly' : 'monthly'
    const callbackUrl =
      String(body.callbackUrl || '').trim() ||
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?paid=1`

    if (plan === 'free') {
      return NextResponse.json({ ok: true, plan: 'free', message: 'Free plan needs no payment.' })
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
    }

    const amountNgn =
      interval === 'yearly' ? PLANS.pro.priceYearlyNgn : PLANS.pro.priceMonthlyNgn
    const amountKobo = amountNgn * 100

    const secret = process.env.PAYSTACK_SECRET_KEY

    if (!secret) {
      // Absentia / demo mode — frontend can still complete the UX path
      const demoRef = `demo_ewin_${Date.now().toString(36)}`
      return NextResponse.json({
        ok: true,
        demo: true,
        message:
          'Paystack secret not configured. Using demo checkout. Add PAYSTACK_SECRET_KEY to go live.',
        reference: demoRef,
        amount: amountKobo,
        authorization_url: null,
        access_code: null,
        plan: 'pro',
        interval,
      })
    }

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        currency: 'NGN',
        callback_url: callbackUrl,
        metadata: {
          plan: 'pro',
          interval,
          product: 'ewin',
        },
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      }),
    })

    const data = await res.json()
    if (!res.ok || !data.status) {
      console.error('paystack init failed', data)
      return NextResponse.json(
        { error: data.message || 'Could not start Paystack checkout.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      ok: true,
      demo: false,
      authorization_url: data.data.authorization_url as string,
      access_code: data.data.access_code as string,
      reference: data.data.reference as string,
      amount: amountKobo,
      plan: 'pro',
      interval,
    })
  } catch (err) {
    console.error('paystack initialize', err)
    return NextResponse.json({ error: 'Payment init failed.' }, { status: 500 })
  }
}
