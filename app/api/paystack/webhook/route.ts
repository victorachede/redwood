import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { grantProByEmail } from '@/app/lib/grantPro'

/** Paystack webhook — charge.success → Pro on profiles. */
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
    if (event.event === 'charge.success') {
      const email = event.data?.customer?.email as string | undefined
      const interval = (event.data?.metadata?.interval as string) || 'monthly'
      const reference = event.data?.reference as string | undefined
      if (email) {
        await grantProByEmail(email, { interval, reference })
      }
    }
  } catch {
    return NextResponse.json({ error: 'Bad payload' }, { status: 400 })
  }

  return NextResponse.json({ received: true })
}
