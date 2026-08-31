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
      const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
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
      <SiteHeader solid />
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <ExamBadgeRow className="justify-center" />
          <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple pricing
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
            Free forever for serious daily practice. Pro when you want timed mocks and unlimited
            drills for JAMB, WAEC and NECO.
          </p>

          <div className="mt-6 inline-flex rounded-full border border-line bg-[var(--paper-elevated)] p-1 text-[13px]">
            <button
              type="button"
              onClick={() => setInterval('monthly')}
              className={`rounded-full px-4 py-1.5 ${
                interval === 'monthly' ? 'bg-accent text-paper' : 'text-ink-muted'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setInterval('yearly')}
              className={`rounded-full px-4 py-1.5 ${
                interval === 'yearly' ? 'bg-accent text-paper' : 'text-ink-muted'
              }`}
            >
              Yearly <span className="text-[11px] opacity-80">save ~33%</span>
            </button>
          </div>
        </div>

        {msg && (
          <p className="mx-auto mt-6 max-w-lg rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-center text-[13px] text-ink">
            {msg}
          </p>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Free */}
          <div
            className={`rounded-2xl border p-6 sm:p-8 ${
              plan === 'free' ? 'border-accent' : 'border-line'
            } bg-[var(--paper-elevated)]`}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Free</p>
            <p className="mt-2 font-serif text-3xl font-semibold">{formatNgn(0)}</p>
            <p className="mt-1 text-sm text-ink-muted">{PLANS.free.blurb}</p>
            <ul className="mt-6 space-y-2.5">
              {PLANS.free.features.map((f) => (
                <li key={f} className="flex gap-2 text-[13px] text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={stayFree}
              className="mt-8 w-full rounded-full border border-line py-2.5 text-sm font-medium hover:border-accent"
            >
              {plan === 'free' ? 'Current plan' : PLANS.free.cta}
            </button>
          </div>

          {/* Pro */}
          <div
            className={`rounded-2xl border p-6 sm:p-8 ${
              plan === 'pro' ? 'border-accent' : 'border-accent/50'
            } bg-[var(--paper-elevated)] relative overflow-hidden`}
          >
            <span className="absolute right-4 top-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-paper">
              Most popular
            </span>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">Pro</p>
            <p className="mt-2 font-serif text-3xl font-semibold">
              {formatNgn(proPrice)}
              <span className="text-base font-normal text-ink-muted">
                /{interval === 'yearly' ? 'year' : 'month'}
              </span>
            </p>
            <p className="mt-1 text-sm text-ink-muted">{PLANS.pro.blurb}</p>
            <ul className="mt-6 space-y-2.5">
              {PLANS.pro.features.map((f) => (
                <li key={f} className="flex gap-2 text-[13px] text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>

            {plan !== 'pro' && (
              <label className="mt-5 block">
                <span className="text-[11px] text-ink-muted">Paystack email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </label>
            )}

            <button
              type="button"
              disabled={loading || plan === 'pro'}
              onClick={upgrade}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-medium text-paper hover:bg-accent-hover disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {plan === 'pro' ? 'You are on Pro' : PLANS.pro.cta}
            </button>
            <p className="mt-3 text-center text-[11px] text-ink-muted">
              Secured by Paystack · NGN · Cancel anytime when live billing is on
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-ink-muted">
          Not affiliated with JAMB, WAEC, or NECO. Practice materials are for learning only.
        </p>
        <p className="mt-2 text-center text-sm">
          <Link href="/dashboard" className="text-accent no-underline hover:underline">
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </main>
  )
}
