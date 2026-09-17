'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Wordmark } from '@/components/Mark'
import { Ayo, type AyoPose } from '@/components/mascots/Mascots'
import { Blob } from '@/components/Blob'
import { SUBJECTS } from '@/app/lib/subjects'
import { signInWithGoogle } from '@/app/lib/auth'

/** Shared frame for login / signup / forgot-password / reset-password. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <main className="min-h-dvh bg-paper text-ink lg:grid lg:grid-cols-[1fr_0.85fr]">
      {/* Form side */}
      <div className="flex min-h-dvh flex-col justify-center px-5 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 inline-block no-underline">
            <Wordmark size={30} />
          </Link>

          <h1 className="font-display text-[clamp(2rem,8vw,2.75rem)] leading-[1.02]">{title}</h1>
          <p className="mt-2.5 text-[15.5px] font-medium text-ink-muted">{subtitle}</p>

          {children}

          {footer && <div className="mt-7 text-[15px] font-medium text-ink-muted">{footer}</div>}
        </div>
      </div>

      {/* Brand side — the same confident dark panel the landing page closes
          on, so the two feel like one product. No mascot here: the one
          mascot moment on this screen is Ayo on the password field, a few
          pixels from where the student is actually looking. A second
          character in the panel was decoration competing with that. */}
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <Blob
          id="auth-panel-blob"
          from="#3a67a8"
          to="var(--primary)"
          className="pointer-events-none absolute -right-24 -top-20 h-[420px] w-[480px] opacity-50"
        />
        <div className="relative flex min-h-dvh flex-col justify-center px-12 py-14">
          <span className="h-[3px] w-12 rounded-full bg-on-hero-dim" aria-hidden />
          <p className="mt-8 max-w-sm font-display text-[2.25rem] leading-[1.1] text-on-primary">
            Learn one idea.
            <br />
            Then prove you got it.
          </p>
          <p className="mt-4 max-w-xs text-[15px] font-medium leading-relaxed text-on-hero-dim">
            Short lessons, a real check after each one, and feedback that names exactly what held
            up and what did not.
          </p>
          <div className="mt-8 flex items-center gap-2">
            {SUBJECTS.map((s) => (
              <span
                key={s.id}
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ background: s.accent }}
              />
            ))}
            <span className="ml-1 text-[12.5px] font-semibold text-on-hero-dim">
              All {SUBJECTS.length} subjects, free
            </span>
          </div>
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
        className="mt-2 w-full rounded-xl border-2 border-line-strong bg-surface px-4 py-3.5 text-[15.5px] font-medium outline-none transition-colors placeholder:text-ink-faint focus:border-primary"
      />
    </label>
  )
}

/**
 * Password field, with the character perched on it.
 *
 * Ayo sits on the field rather than in the brand panel. In the panel it was
 * most of a screen away from the cursor, so the one moment it exists for —
 * eyes covered while you type — happened outside where anyone was looking.
 * Perched here it is a few dozen pixels from the caret, on every screen size.
 *
 * It also owns its own pose now: the state never has to travel up to the
 * shell and back down, so there is no prop to forget to wire.
 *
 * Pose follows focus rather than content — someone who has clicked in but not
 * typed yet should already see it look away, or the gag lands a beat late.
 */
export function AuthPassword({
  label = 'Password',
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  placeholder?: string
}) {
  const [shown, setShown] = useState(false)
  const [focused, setFocused] = useState(false)
  const pose: AyoPose = !focused ? 'wave' : shown ? 'peek-through' : 'peek'

  return (
    <label className="block">
      <div className="flex items-end justify-between gap-3">
        <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-muted">
          {label}
        </span>
        {/* Sits on the field's top edge, so covering its eyes happens right
            where the caret is. */}
        <Ayo
          size={78}
          pose={pose}
          className={`-mb-5 shrink-0 ${focused ? '' : 'bob'}`}
        />
      </div>
      <div className="relative mt-2">
        <input
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          required
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-xl border-2 border-line-strong bg-surface px-4 py-3.5 pr-12 text-[15.5px] font-medium outline-none transition-colors placeholder:text-ink-faint focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setShown(!shown)}
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
      className="btn btn-primary press w-full py-4 text-[16px] disabled:opacity-60"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? (loadingLabel ?? 'Working…') : children}
    </button>
  )
}

/** Google, drawn inline rather than pulled from a CDN for one logo. */
export function GoogleButton({
  label = 'Continue with Google',
  redirectPath,
}: {
  label?: string
  /** Where Google sends the browser back to. Signup passes /onboarding so a
   *  new Google account gets the same first-run flow email/password does. */
  redirectPath?: string
}) {
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
          const res = await signInWithGoogle(redirectPath)
          // Only returns on failure; on success the browser is already leaving.
          if (res && !res.ok) {
            setError(res.error)
            setBusy(false)
          }
        }}
        className="btn btn-secondary press w-full gap-2.5 py-4 text-[15.5px] disabled:opacity-60"
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
    <p className="rounded-xl border border-wrong/30 bg-wrong-soft px-4 py-3 text-[14px] font-semibold text-ink">
      {children}
    </p>
  )
}
