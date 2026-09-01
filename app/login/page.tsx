'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { getSession, refreshSession, signIn, useAuthListener } from '@/app/lib/auth'
import { PasswordField } from '@/components/PasswordField'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void refreshSession().then((u) => {
      if (u || getSession()) router.replace('/dashboard')
    })
    return useAuthListener(() => {
      if (getSession()) router.replace('/dashboard')
    })
  }, [router])

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
    router.push('/dashboard')
  }

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2.5 no-underline">
          <img src="/logo-mark.png" alt="Ewin" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-[15px] font-semibold text-ink">Ewin</span>
        </Link>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-muted">Sign in to continue learning.</p>

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

          <div>
            <PasswordField
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />
            <div className="mt-1.5 flex justify-end">
              <Link
                href="/forgot-password"
                className="text-[12px] font-medium text-ink no-underline hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          No account?{' '}
          <Link href="/signup" className="font-medium text-ink no-underline hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
