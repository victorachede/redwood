import Link from 'next/link'

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  return (
    <header
      className={`sticky top-0 z-30 border-b border-line ${
        solid ? 'bg-paper' : 'bg-paper/90 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[13px] font-bold text-paper">
            E
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">Ewin</span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4 text-[13px] text-ink-muted">
          <Link href="/dashboard" className="hover:text-ink no-underline">
            Dashboard
          </Link>
          <Link href="/#subjects" className="hidden sm:inline hover:text-ink no-underline">
            Subjects
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-medium text-paper no-underline hover:bg-accent-hover transition-colors"
          >
            Continue
          </Link>
        </nav>
      </div>
    </header>
  )
}
