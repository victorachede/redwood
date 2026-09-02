import Image from 'next/image'
import Link from 'next/link'
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
          <Link href="/" className="mb-9 inline-flex items-center gap-2.5 no-underline">
            <Image
              src="/logo-mark.png"
              alt="Ewin"
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-lg object-contain"
              priority
            />
            <span className="text-[16px] font-semibold tracking-tight text-ink">Ewin</span>
          </Link>

          <h1 className="font-serif text-[1.875rem] font-semibold tracking-[-0.025em]">{title}</h1>
          <p className="mt-1.5 text-[14.5px] text-ink-muted">{subtitle}</p>

          {children}

          {footer && <div className="mt-7 text-center text-[14px] text-ink-muted">{footer}</div>}
        </div>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="relative flex min-h-dvh flex-col justify-between px-12 py-14">
          <Image
            src="/logo-mark.png"
            alt=""
            width={52}
            height={52}
            className="h-[52px] w-[52px] rounded-xl object-contain opacity-90"
          />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-streak">
              Ewin Academy
            </p>
            <p className="mt-5 max-w-sm font-serif text-[2rem] font-semibold leading-[1.2] tracking-[-0.02em] text-white">
              Learn one idea.
              <br />
              <span className="">Then prove you got it.</span>
            </p>
            <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-ink-muted">
              Short lessons, a real check after each one, and feedback that names exactly what
              held up and what did not.
            </p>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
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
        className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14.5px] outline-none transition-shadow focus:border-streak focus:shadow-[0_0_0_4px_rgba(201,168,76,0.15)]"
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
      className="w-full rounded-xl bg-gradient-to-br from-[#16274d] to-[#0e1b3a] py-3 text-[14.5px] font-semibold text-[var(--on-primary)] shadow-[var(--shadow-md)] transition-transform duration-200 hover:scale-[1.01] active:scale-100 disabled:opacity-60 disabled:hover:scale-100"
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
