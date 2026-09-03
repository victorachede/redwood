import Link from 'next/link'
import { Mark, Wordmark } from '@/components/Mark'
import type { ReactNode } from 'react'
import { ExamBadgeRow } from './ExamBadges'

/**
 * Shared frame for login / signup / forgot-password / reset-password.
 *
 * Split layout on large screens: form on paper, navy brand panel beside it.
 * Below `lg` the panel collapses away so the form gets the full width.
 */
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
    <main className="min-h-dvh bg-paper text-ink lg:grid lg:grid-cols-2">
      {/* Form side */}
      <div className="flex min-h-dvh flex-col justify-center px-5 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-9 inline-block no-underline">
            <Wordmark size={28} />
          </Link>

          <h1 className="font-display text-[1.875rem]">{title}</h1>
          <p className="mt-1.5 text-[14.5px] text-ink-muted">{subtitle}</p>

          {children}

          {footer && <div className="mt-7 text-center text-[14px] text-ink-muted">{footer}</div>}
        </div>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-hero lg:block">
        <div className="relative flex min-h-dvh flex-col justify-between px-12 py-14">
          <Mark size={44} />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-hero">
              Ewin Academy
            </p>
            <p className="mt-5 max-w-sm font-display text-[2rem] leading-[1.2] text-on-hero">
              Learn one idea.
              <br />
              <span className="">Then prove you got it.</span>
            </p>
            <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-on-hero opacity-75">
              Short lessons, a real check after each one, and feedback that names exactly what
              held up and what did not.
            </p>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-hero opacity-75">
              Built around
            </p>
            <ExamBadgeRow variant="dark" />
          </div>
        </div>
      </div>
    </main>
  )
}

/** Labelled text input matching the auth styling. */
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
      <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </span>
      <input
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14.5px] outline-none transition-shadow focus:border-primary"
      />
    </label>
  )
}

/** Primary submit button — navy gradient, matching the rest of the app. */
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
      className="press w-full rounded-full bg-primary py-3.5 text-[15px] font-semibold text-on-primary disabled:opacity-60"
    >
      {loading ? (loadingLabel ?? 'Working…') : children}
    </button>
  )
}

/** Error banner. */
export function AuthError({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-danger/30 bg-wrong-soft px-3.5 py-2.5 text-[13px] text-wrong">
      {children}
    </p>
  )
}
