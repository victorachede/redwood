import Link from 'next/link'
import { SUBJECTS } from '@/app/lib/subjects'
import { Wordmark } from '@/components/Mark'

/**
 * Site footer.
 *
 * Four columns rather than one row of four links: a footer is where someone
 * goes when the page above did not answer their question, and a single row
 * answers nothing. Subjects are listed by name because those are the pages
 * people actually want, and they are real routes rather than decoration.
 */

const STUDY = SUBJECTS.map((s) => ({ href: `/learn/${s.id}`, label: s.name }))

const PRODUCT = [
  { href: '/dashboard', label: 'Today' },
  { href: '/practice/mathematics', label: 'Practice' },
  { href: '/cards', label: 'Study cards' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/pricing', label: 'Pricing' },
]

const ACCOUNT = [
  { href: '/login', label: 'Log in' },
  { href: '/signup', label: 'Sign up' },
  { href: '/forgot-password', label: 'Reset password' },
]

const COMPANY = [
  { href: '/support', label: 'Help centre' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
]

/**
 * Brand marks drawn inline.
 *
 * An icon font or a CDN sprite would be a network request and a third party
 * for four glyphs, on a connection where that is a real cost.
 */
const SOCIALS = [
  {
    label: 'WhatsApp',
    href: 'https://wa.me/',
    path: 'M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 5.82 2.42 8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06a6.73 6.73 0 0 1-1.99-1.23 7.5 7.5 0 0 1-1.38-1.71c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42l-.47-.01c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.16 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.59.18 1.13.16 1.55.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.29Z',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/',
    path: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 6.03A3.81 3.81 0 1 0 15.81 12 3.81 3.81 0 0 0 12 8.19Zm0 6.28A2.47 2.47 0 1 1 14.47 12 2.47 2.47 0 0 1 12 14.47Zm4.85-6.43a.89.89 0 1 1-.89-.89.89.89 0 0 1 .89.89Z',
  },
  {
    label: 'X',
    href: 'https://x.com/',
    path: 'M17.53 3h3.02l-6.6 7.54L21.75 21h-6.08l-4.76-6.22L5.45 21H2.43l7.06-8.07L2.25 3h6.23l4.3 5.69L17.53 3Zm-1.06 16.2h1.67L7.6 4.71H5.81l10.66 14.49Z',
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/',
    path: 'M16.6 5.82a4.28 4.28 0 0 1-1.07-2.82h-3.1v12.3a2.59 2.59 0 0 1-2.6 2.5 2.6 2.6 0 0 1 0-5.2c.27 0 .53.04.78.12v-3.2a5.8 5.8 0 0 0-.78-.06 5.74 5.74 0 1 0 5.74 5.74V9.9a7.35 7.35 0 0 0 4.3 1.38v-3.1a4.3 4.3 0 0 1-3.27-2.36Z',
  },
]

function Column({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) {
  return (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-faint">{title}</p>
      <ul className="mt-3.5 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-[14.5px] font-medium text-ink-muted no-underline hover:text-ink"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t-[3px] border-ink bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div>
            <Wordmark size={30} />
            <p className="mt-4 max-w-xs text-[14.5px] leading-relaxed text-ink-muted">
              An AI tutor that teaches one idea, then makes you prove you got it. Built for
              Nigerian students sitting WAEC, NECO and JAMB.
            </p>

            <div className="mt-5 flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="press flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-surface text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <Column title="Study" links={STUDY} />
          <Column title="Product" links={PRODUCT} />
          <Column title="Account" links={ACCOUNT} />
          <Column title="Company" links={COMPANY} />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-ink-muted">
            © {new Date().getFullYear()} EWIN Academy. Made in Nigeria.
          </p>
          <p className="text-[13px] text-ink-faint">
            Not affiliated with WAEC, JAMB or NECO.
          </p>
        </div>
      </div>
    </footer>
  )
}
