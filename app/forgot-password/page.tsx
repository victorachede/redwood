'use client'

import Link from 'next/link'
import { AuthShell, AuthField, AuthSubmit, AuthError } from '@/components/AuthShell'
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
    <AuthShell
      title="Forgot password"
      subtitle={
        isSupabaseConfigured
          ? 'Enter your email and we will send a reset link.'
          : 'Enter the email you used on this device to set a new password.'
      }
      footer={
        <Link href="/login" className="font-semibold text-navy-700 no-underline hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          required
        />

        {error && <AuthError>{error}</AuthError>}
        {message && (
          <p className="rounded-xl border border-line bg-paper-sunken px-3.5 py-2.5 text-[13px] text-ink">
            {message}
          </p>
        )}

        <AuthSubmit loading={loading}>
          {isSupabaseConfigured ? 'Send reset link' : 'Continue'}
        </AuthSubmit>
      </form>
    </AuthShell>
  )
}
