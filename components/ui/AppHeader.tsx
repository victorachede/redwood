import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

/** Page header inside the app shell. Title is display-face; actions sit right. */
export function AppHeader({
  title,
  subtitle,
  back,
  action,
}: {
  title: string
  subtitle?: string
  back?: string
  action?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-[56px] max-w-3xl items-center gap-3 px-4 py-2.5">
        {back && (
          <Link
            href={back}
            className="press -ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted no-underline hover:bg-sunken hover:text-ink"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[19px] leading-tight text-ink">{title}</h1>
          {subtitle && (
            <p className="truncate text-[12.5px] leading-tight text-ink-muted">{subtitle}</p>
          )}
        </div>
        {action}
        <ThemeToggle />
      </div>
    </header>
  )
}
