'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Loader2 } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { ExamBadgeRow } from '@/components/ExamBadges'
import {
  PLANS,
  formatNgn,
  getLocalPlan,
  setLocalPlan,
  type PlanId,
} from '@/app/lib/billing'
import { getSession } from '@/app/lib/auth'
import { SiteFooter } from '@/components/SiteFooter'

export default function PricingPage() {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [plan, setPlan] = useState<PlanId>('free')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    setPlan(getLocalPlan().plan)
    const u = getSession()
    if (u?.email) setEmail(u.email)

    const params = new URLSearchParams(window.location.search)
    const ref = params.get('reference') || params.get('trxref')
    if (params.get('paid') === '1' || ref) {
      void confirmPayment(ref)
    }
  }, [])

  async function confirmPayment(reference: string | null) {
    if (!reference) {
      // demo success without ref
      setLocalPlan({ plan: 'pro', interval, updatedAt: Date.now(), reference: 'demo_local' })
      setPlan('pro')
      setMsg('Pro activated (demo). Add Paystack keys to take real payments.')
      return
    }
    try {
      const payEmail = email.trim() || getSession()?.email || ''
      const q = new URLSearchParams({ reference })
      if (payEmail) q.set('email', payEmail)
      const res = await fetch(`/api/paystack/verify?${q.toString()}`)
      const data = await res.json()
      if (data.ok || data.status === 'success') {
        setLocalPlan({
          plan: 'pro',
          interval: data.interval === 'yearly' ? 'yearly' : 'monthly',
          reference,
          updatedAt: Date.now(),
        })
        setPlan('pro')
        setMsg(data.demo ? 'Pro activated in demo mode.' : 'Payment confirmed. Welcome to Pro.')
      } else {
        setMsg(data.error || 'Could not verify payment.')
      }
    } catch {
      setMsg('Verification failed. Try again or contact support.')
    }
  }

  async function upgrade() {
    setLoading(true)
    setMsg(null)
    const userEmail = email.trim() || getSession()?.email || ''
    if (!userEmail.includes('@')) {
      setMsg('Enter the email you will pay with (Paystack receipt).')
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          plan: 'pro',
          interval,
          callbackUrl: `${window.location.origin}/pricing?paid=1`,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg(data.error || 'Could not start checkout.')
        setLoading(false)
        return
      }
      if (data.authorization_url) {
        window.location.href = data.authorization_url
        return
      }
      // Demo mode — no Paystack keys yet
      if (data.demo) {
        setLocalPlan({
          plan: 'pro',
          interval,
          reference: data.reference,
          updatedAt: Date.now(),
        })
        setPlan('pro')
        if (userEmail) {
          void fetch(
            `/api/paystack/verify?reference=${encodeURIComponent(data.reference)}&email=${encodeURIComponent(userEmail)}`,
          )
        }
        setMsg(
          'Pro unlocked in demo mode (Paystack keys not set yet). When your keys land, real charges will go through.'
        )
      }
    } catch {
      setMsg('Network error starting checkout.')
    }
    setLoading(false)
  }

  function stayFree() {
    setLocalPlan({ plan: 'free', interval: 'monthly', updatedAt: Date.now() })
    setPlan('free')
    setMsg('You are on the Free plan.')
  }

  const proPrice =
    interval === 'yearly' ? PLANS.pro.priceYearlyNgn : PLANS.pro.priceMonthlyNgn

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader />

      {/* ═══ Hero band ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-primary">
        
        <div className="relative mx-auto max-w-5xl px-5 pb-14 pt-14 text-center sm:px-8">
          
            <ExamBadgeRow className="justify-center" variant="dark" />
            <h1 className="mt-6 font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold tracking-[-0.03em] text-on-primary">
              Simple pricing
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-on-primary opacity-80">
              Free forever for serious daily practice. Pro when you want timed mocks and unlimited
              drills for JAMB, WAEC and NECO.
            </p>

            {/* Interval toggle */}
            <div className="mt-8 inline-flex rounded-full border border-white/25 bg-white/10 p-1 text-[13px]">
              <button
                type="button"
                onClick={() => setInterval('monthly')}
                className={`rounded-full px-5 py-2 font-medium transition-all duration-300 ${
                  interval === 'monthly'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-primary opacity-70 hover:opacity-100'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setInterval('yearly')}
                className={`rounded-full px-5 py-2 font-medium transition-all duration-300 ${
                  interval === 'yearly'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-primary opacity-70 hover:opacity-100'
                }`}
              >
                Yearly
                <span className="ml-1.5 text-[11px] opacity-75">save ~33%</span>
              </button>
            </div>
          
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        {msg && (
          <p className="mx-auto mb-10 max-w-lg rounded-xl border border-streak/30 bg-streak/[0.08] px-4 py-3 text-center text-[13px] text-ink">
            {msg}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* ── Free ─────────────────────────────────────────────────── */}
          
            <div
              className={`press h-full rounded-2xl border bg-surface p-7 shadow-[var(--shadow-sm)] sm:p-8 ${
                plan === 'free' ? 'border-primary' : 'border-line'
              }`}
            >
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Free
              </p>
              <p className="mt-3 font-display text-4xl font-semibold tracking-tight">
                {formatNgn(0)}
              </p>
              <p className="mt-2 text-[14px] text-ink-muted">{PLANS.free.blurb}</p>

              <ul className="mt-7 space-y-3">
                {PLANS.free.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[13.5px] text-ink">
                    <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-sunken">
                      <Check className="h-3 w-3 text-ink-muted" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={stayFree}
                className="mt-8 w-full rounded-xl border border-line py-3 text-[14px] font-medium transition-colors hover:bg-sunken"
              >
                {plan === 'free' ? 'Current plan' : PLANS.free.cta}
              </button>
            </div>
          

          {/* ── Pro ──────────────────────────────────────────────────── */}
          
            <div className="relative h-full rounded-2xl border-2 border-primary bg-surface p-6 sm:p-7">
              <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-on-primary">
                Most popular
              </span>

              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
                Pro
              </p>
              <p className="mt-3 font-display text-4xl font-semibold tracking-tight">
                {formatNgn(proPrice)}
                <span className="ml-1 text-base font-normal text-ink-muted">
                  /{interval === 'yearly' ? 'year' : 'month'}
                </span>
              </p>
              <p className="mt-2 text-[14px] text-ink-muted">{PLANS.pro.blurb}</p>

              <ul className="mt-7 space-y-3">
                {PLANS.pro.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[13.5px] text-ink">
                    <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-streak/15">
                      <Check className="h-3 w-3 text-correct" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {plan !== 'pro' && (
                <label className="mt-6 block">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    Paystack email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3.5 py-3 text-[14.5px] outline-none transition-shadow focus:border-streak focus:shadow-[0_0_0_4px_rgba(201,168,76,0.15)]"
                  />
                </label>
              )}

              <button
                type="button"
                disabled={loading || plan === 'pro'}
                onClick={upgrade}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-semibold text-on-primary shadow-[var(--shadow-md)] transition-transform duration-200 hover:scale-[1.01] active:scale-100 disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {plan === 'pro' ? 'You are on Pro' : PLANS.pro.cta}
              </button>

              <p className="mt-3.5 text-center text-[11.5px] text-ink-muted">
                Secured by Paystack · NGN · Cancel anytime when live billing is on
              </p>
            </div>
          
        </div>

        
          <p className="mt-12 text-center text-[12px] text-ink-muted">
            Not affiliated with JAMB, WAEC, or NECO. Practice materials are for learning only.
          </p>
          <p className="mt-3 text-center">
            <Link
              href="/dashboard"
              className="text-[14px] font-medium text-primary no-underline hover:underline"
            >
              ← Back to dashboard
            </Link>
          </p>
        
      </div>

      <SiteFooter />
    </main>
  )
}
