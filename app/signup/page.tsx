'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { getSession, refreshSession, signUp, subscribeToAuth } from '@/app/lib/auth'
import { PasswordField } from '@/components/PasswordField'
import { AuthShell, AuthField, AuthSubmit, AuthError } from '@/components/AuthShell'

export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void refreshSession().then((u) => {
      if (u || getSession()) router.replace('/dashboard')
    })
    return subscribeToAuth(() => {
      if (getSession()) router.replace('/dashboard')
    })
  }, [router])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signUp({ email, password, displayName })
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    router.push('/dashboard')
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever for core study. Upgrade later if you need mocks."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary no-underline hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <AuthField
          label="Name"
          autoComplete="name"
          value={displayName}
          onChange={setDisplayName}
          placeholder="What should Ewin call you?"
        />
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          required
        />
        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={6}
          label="Password"
        />

        {error && <AuthError>{error}</AuthError>}

        <AuthSubmit loading={loading} loadingLabel="Creating…">
          Sign up
        </AuthSubmit>
      </form>
    </AuthShell>
  )
}
