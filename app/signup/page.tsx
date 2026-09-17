'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { getSession, refreshSession, signUp, subscribeToAuth } from '@/app/lib/auth'
import {
  AuthShell,
  AuthField,
  AuthPassword,
  AuthSubmit,
  AuthError,
  GoogleButton,
  AuthDivider,
} from '@/components/AuthShell'

export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // A fresh signUp() fires the same auth-change event the listener below
  // reacts to, which would race it to /dashboard before the explicit
  // post-signup push to /onboarding lands. This flag tells the listener
  // to sit out while a signup submit is in flight.
  const submittingRef = useRef(false)

  useEffect(() => {
    void refreshSession().then((u) => {
      if (u || getSession()) router.replace('/dashboard')
    })
    return subscribeToAuth(() => {
      if (submittingRef.current) return
      if (getSession()) router.replace('/dashboard')
    })
  }, [router])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    submittingRef.current = true
    const res = await signUp({ email, password, displayName })
    setLoading(false)
    if (!res.ok) {
      submittingRef.current = false
      setError(res.error)
      return
    }
    router.push('/onboarding')
  }

  return (
    <AuthShell
      title="Start for free."
      subtitle="Twenty seconds. Six subjects, the tutor and practice, all free."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary no-underline hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="mt-8 space-y-4">
        <GoogleButton label="Sign up with Google" redirectPath="/onboarding" />
        <AuthDivider />
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <AuthField
          label="Name"
          autoComplete="name"
          value={displayName}
          onChange={setDisplayName}
          placeholder="What should EWIN call you?"
        />
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          required
        />
        <AuthPassword
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="At least 6 characters"
        />

        {error && <AuthError>{error}</AuthError>}

        <AuthSubmit loading={loading} loadingLabel="Creating…">
          Create account
        </AuthSubmit>
      </form>
    </AuthShell>
  )
}
