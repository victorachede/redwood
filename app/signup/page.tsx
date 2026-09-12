'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
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
import type { AyoPose } from '@/components/mascots/Mascots'

export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pose, setPose] = useState<AyoPose>('wave')

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
      title="Start for free."
      subtitle="No card. Six subjects, the tutor and practice, all free."
      pose={pose}
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
        <GoogleButton label="Sign up with Google" />
        <AuthDivider />
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
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
        <AuthPassword
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          onPoseChange={setPose}
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
