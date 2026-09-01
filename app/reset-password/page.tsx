'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { setNewPassword } from '@/app/lib/auth'
import { PasswordField } from '@/components/PasswordField'
import { AuthShell, AuthField, AuthSubmit, AuthError } from '@/components/AuthShell'
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
    <AuthShell
      title="Set new password"
      subtitle={
        isSupabaseConfigured
          ? 'Choose a new password for your account.'
          : 'Choose a new password for the account on this device.'
      }
      footer={
        <Link href="/login" className="font-semibold text-navy-700 no-underline hover:underline">
          Back to sign in
        </Link>
      }
    >
      {done ? (
        <p className="mt-8 rounded-xl border border-green-500/30 bg-success-soft px-4 py-3.5 text-[14px] text-green-800">
          Password updated. Redirecting to sign in…
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {!isSupabaseConfigured && (
            <AuthField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />
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

          {error && <AuthError>{error}</AuthError>}

          <AuthSubmit loading={loading} loadingLabel="Saving…">
            Update password
          </AuthSubmit>
        </form>
      )}
    </AuthShell>
  )
}
