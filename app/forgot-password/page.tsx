'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { getSession, requestPasswordReset, refreshSession } from '@/app/lib/auth'
import { isSupabaseConfigured } from '@/app/lib/supabase'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void refreshSession().then((u) => {
      if (u || getSession()) router.replace('/dashboard')
    })
  }, [router])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const res = await requestPasswordReset(email)
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setMessage(res.message)
    if (!isSupabaseConfigured) {
      // Local mode: go straight to set new password
      router.push('/reset-password')
    }
  }

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2.5 no-underline">
          <img src="/logo-mark.png" alt="Ewin" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-[15px] font-semibold text-ink">Ewin</span>
        </Link>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Forgot password</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {isSupabaseConfigured
            ? 'Enter your email and we will send a reset link.'
            : 'Enter the email you used on this device to set a new password.'}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-ink-muted">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink"
            />
          </label>
          {error && (
            <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-lg border border-ink/30 bg-neutral-100 px-3 py-2 text-[13px] text-ink">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60"
          >
            {loading ? 'Working…' : isSupabaseConfigured ? 'Send reset link' : 'Continue'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          <Link href="/login" className="font-medium text-ink no-underline hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
