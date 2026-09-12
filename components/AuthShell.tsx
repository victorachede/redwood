'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Wordmark } from '@/components/Mark'
import { Ayo, Sparkle, type AyoPose } from '@/components/mascots/Mascots'
import { signInWithGoogle } from '@/app/lib/auth'

/**
 * Shared frame for login / signup / forgot-password / reset-password.
 *
 * Ayo watches the form and covers its eyes while a password is being typed —
 * and peeks through its fingers when the student reveals it themselves. It is
 * a joke, but it is also the only honest way to say "nobody is looking at
 * this" to an audience that has been told that by every app they have ever
 * used.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  pose = 'wave',
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  pose?: AyoPose
}) {
  return (
    <main className="min-h-dvh bg-paper text-ink lg:grid lg:grid-cols-[1fr_0.85fr]">
      {/* Form side */}
      <div className="flex min-h-dvh flex-col justify-center px-5 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 inline-block no-underline">
            <Wordmark size={30} />
          </Link>

          {/* On phones the character sits above the form, because the brand
              panel it normally lives in is gone at this width. */}
          <div className="mb-5 lg:hidden">
            <Ayo size={104} pose={pose} className="bob" />
          </div>

          <h1 className="font-display text-[clamp(2rem,8vw,2.75rem)] leading-[1.02]">{title}</h1>
          <p className="mt-2.5 text-[15.5px] font-medium text-ink-muted">{subtitle}</p>

          {children}

          {footer && <div className="mt-7 text-[15px] font-medium text-ink-muted">{footer}</div>}
        </div>
      </div>

      {/* Brand side */}
      <div
        className="on-play relative hidden overflow-hidden border-l-[3px] border-ink lg:block"
        style={{ background: 'var(--play-sky)' }}
      >
        <div className="relative flex min-h-dvh flex-col items-center justify-center px-10 py-14 text-center">
          <Sparkle size={24} color="var(--play-marigold)" className="twinkle absolute left-14 top-24" />
          <Sparkle size={18} color="var(--play-coral-deep)" className="twinkle absolute right-16 top-40" />
          <Sparkle size={20} color="var(--play-mint-deep)" className="twinkle absolute bottom-28 left-20" />

          <Ayo size={230} pose={pose} className="bob" />

          <p className="mt-8 max-w-sm font-display text-[2rem] leading-[1.06] text-ink">
            Learn one idea.
            <br />
            Then prove you got it.
          </p>
          <p className="mt-4 max-w-xs text-[15px] font-medium leading-relaxed text-ink opacity-80">
            Short lessons, a real check after each one, and feedback that names exactly what held
            up and what did not.
          </p>
        </div>
      </div>
    </main>
  )
}

/** Labelled text input. */
export function AuthField({
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  required,
  placeholder,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </span>
      <input
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border-[2.5px] border-ink bg-surface px-4 py-3.5 text-[15.5px] font-medium outline-none transition-shadow placeholder:text-ink-faint focus:shadow-[3px_3px_0_var(--ink)]"
      />
    </label>
  )
}

/**
 * Password field that tells the shell what the character should be doing.
 *
 * The pose is driven by focus rather than by content: a student who has
 * clicked into the box but not typed yet should already see it look away,
 * otherwise the gag lands a beat late.
 */
export function AuthPassword({
  label = 'Password',
  value,
  onChange,
  autoComplete,
  onPoseChange,
  placeholder,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  onPoseChange?: (pose: AyoPose) => void
  placeholder?: string
}) {
  const [shown, setShown] = useState(false)
  const [focused, setFocused] = useState(false)

  function report(nextShown: boolean, nextFocused: boolean) {
    if (!onPoseChange) return
    onPoseChange(!nextFocused ? 'wave' : nextShown ? 'peek-through' : 'peek')
  }

  return (
    <label className="block">
      <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </span>
      <div className="relative mt-2">
        <input
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          required
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setFocused(true)
            report(shown, true)
          }}
          onBlur={() => {
            setFocused(false)
            report(shown, false)
          }}
          className="w-full rounded-xl border-[2.5px] border-ink bg-surface px-4 py-3.5 pr-12 text-[15.5px] font-medium outline-none transition-shadow placeholder:text-ink-faint focus:shadow-[3px_3px_0_var(--ink)]"
        />
        <button
          type="button"
          onClick={() => {
            const next = !shown
            setShown(next)
            report(next, focused)
          }}
          aria-label={shown ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted hover:text-ink"
        >
          {shown ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </div>
    </label>
  )
}

/** Primary submit button. */
export function AuthSubmit({
  loading,
  children,
  loadingLabel,
}: {
  loading?: boolean
  children: ReactNode
  loadingLabel?: string
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="ink-btn flex w-full items-center justify-center gap-2 bg-primary py-4 text-[16px] font-bold text-on-primary disabled:opacity-60"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? (loadingLabel ?? 'Working…') : children}
    </button>
  )
}

/** Google, drawn inline rather than pulled from a CDN for one logo. */
export function GoogleButton({ label = 'Continue with Google' }: { label?: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setError('')
          setBusy(true)
          const res = await signInWithGoogle()
          // Only returns on failure; on success the browser is already leaving.
          if (res && !res.ok) {
            setError(res.error)
            setBusy(false)
          }
        }}
        className="ink-btn flex w-full items-center justify-center gap-2.5 bg-surface py-4 text-[15.5px] font-bold text-ink disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51Z" />
          </svg>
        )}
        {busy ? 'Opening Google…' : label}
      </button>
      {error && <AuthError>{error}</AuthError>}
    </>
  )
}

/** "or" divider between the social and email routes. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-line-strong" />
      <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-faint">or</span>
      <span className="h-px flex-1 bg-line-strong" />
    </div>
  )
}

/** Error banner. */
export function AuthError({ children }: { children: ReactNode }) {
  return (
    <p
      className="ink-card-sm px-4 py-3 text-[14px] font-semibold text-ink"
      style={{ background: 'var(--play-coral)' }}
    >
      {children}
    </p>
  )
}
