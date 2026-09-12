'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { getSession, refreshSession, signIn, subscribeToAuth } from '@/app/lib/auth'
import {
  AuthShell,
  AuthField,
  AuthPassword,
  AuthSubmit,
  AuthError,
  GoogleButton,
  AuthDivider,
} from '@/components/AuthShell'

function safeNext(raw: string | null): string {
  // Only same-origin paths: a `next` that accepts anything is an open
  // redirect, and this one comes straight off the query string.
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard'
  return raw
}

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const next = safeNext(params.get('next'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void refreshSession().then((u) => {
      if (u || getSession()) router.replace(next)
    })
    return subscribeToAuth(() => {
      if (getSession()) router.replace(next)
    })
  }, [router, next])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn({ email, password })
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    router.push(next)
  }

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Pick up where you left off."
      footer={
        <>
          No account?{' '}
          <Link href="/signup" className="font-semibold text-primary no-underline hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <div className="mt-8 space-y-4">
        <GoogleButton label="Sign in with Google" />
        <AuthDivider />
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          required
        />

        <div>
          <AuthPassword
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
          <div className="mt-2 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-[13px] font-semibold text-ink-muted no-underline hover:text-ink hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && <AuthError>{error}</AuthError>}

        <AuthSubmit loading={loading} loadingLabel="Signing in…">
          Sign in
        </AuthSubmit>
      </form>
    </AuthShell>
  )
}
