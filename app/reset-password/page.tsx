'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { setNewPassword } from '@/app/lib/auth'
import { PasswordField } from '@/components/PasswordField'
import { isSupabaseConfigured } from '@/app/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('ewin-reset-email')
    if (stored) setEmail(stored)
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const res = await setNewPassword(password, { email: email || undefined })
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setDone(true)
    setTimeout(() => router.push('/login'), 1200)
  }

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2.5 no-underline">
          <img src="/logo-mark.png" alt="Ewin" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-[15px] font-semibold text-ink">Ewin</span>
        </Link>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Set new password</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {isSupabaseConfigured
            ? 'Choose a new password for your account.'
            : 'Choose a new password for the account on this device.'}
        </p>

        {done ? (
          <p className="mt-8 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink">
            Password updated. Redirecting to sign in…
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {!isSupabaseConfigured && (
              <label className="block">
                <span className="text-xs font-medium text-ink-muted">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </label>
            )}
            <PasswordField
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              minLength={6}
              label="New password"
            />
            <PasswordField
              id="confirm"
              name="confirm"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
              minLength={6}
              label="Confirm password"
            />
            {error && (
              <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-[var(--on-accent)] hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Update password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-muted">
          <Link href="/login" className="font-medium text-accent no-underline hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
