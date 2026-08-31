import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Paystack webhook. Set PAYSTACK_SECRET_KEY for signature check.
 * Wire to Supabase when ready to persist subscriptions server-side.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text()
  const signature = req.headers.get('x-paystack-signature') || ''
  const secret = process.env.PAYSTACK_SECRET_KEY

  if (secret) {
    const hash = crypto.createHmac('sha512', secret).update(raw).digest('hex')
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  try {
    const event = JSON.parse(raw)
    // event.event === 'charge.success' → grant pro
    console.log('paystack webhook', event.event, event.data?.reference)
  } catch {
    return NextResponse.json({ error: 'Bad payload' }, { status: 400 })
  }

  return NextResponse.json({ received: true })
}
