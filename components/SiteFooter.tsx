import Link from 'next/link'

const LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/support', label: 'Support' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink-muted">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="no-underline hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-[12px] text-ink-muted">
          © {new Date().getFullYear()} Ewin Academy · Not affiliated with WAEC, JAMB or NECO
        </p>
      </div>
    </footer>
  )
}
