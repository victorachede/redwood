import Link from 'next/link'
import { SUBJECTS, type SubjectId } from '@/app/lib/subjects'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Motion } from '@/components/marketing/Motion'
import { Blob } from '@/components/marketing/Blob'
import { PhotoSlot } from '@/components/marketing/PhotoSlot'
import {
  ArrowIcon,
  AtomIcon,
  BookIcon,
  CrossIcon,
  FlaskIcon,
  LeafIcon,
  MagnifierIcon,
  PencilIcon,
  RingDotIcon,
  SigmaIcon,
  TickIcon,
  TrendIcon,
} from '@/components/marketing/icons'

/**
 * The landing page — third full rebuild.
 *
 * Where this one came from: not a competitor screenshot this time, but a
 * template the founder brought in directly ("Examy") and asked to be
 * matched strictly — the wavy organic blob behind the hero photo, floating
 * info cards, a photo-topped subject grid, a photo/quote/photo trust row,
 * a second wavy-blob close. Rebuilt three times against that reference
 * before this shipped: once adapted too loosely (wrong structure, plain
 * card lists instead of the reference's grey feature cards), once with a
 * CSS border-radius blob that wasn't actually wavy, and this one — a real
 * SVG blob path, and every section matched to the reference's actual
 * layout rather than a reinterpretation of it.
 *
 * What did not get copied from the reference, on purpose:
 * - Their "100+ mentors" and "5.0★" cards are invented trust signals.
 *   Replaced with real content that does the same visual job — a subject
 *   card, the exam-board credential, a "7/10, marked instantly" card that
 *   is actually about what this product does.
 * - Their testimonials (named students, photos, quotes) don't exist here
 *   and won't be invented. The trust-row slot that would hold them instead
 *   carries a pull-quote from the product's own promise.
 * - Their "trusted by LinkedIn / Zoom / GitHub" strip implies partnerships
 *   that don't exist. Swapped for the one credential this product actually
 *   has: the exam boards it's written for.
 *
 * Every photo on the page is a labelled placeholder via <PhotoSlot> —
 * pass `src` at any call site once real photography exists and nothing
 * else about the layout needs to change.
 */

const FEATURES = [
  {
    icon: RingDotIcon,
    title: 'One idea. Not a chapter.',
    body: "A few sentences, plain English, with an example you've actually seen — naira, danfo fares, a market scale.",
  },
  {
    icon: PencilIcon,
    title: 'Then it makes you answer.',
    body: 'Typed out, in your own words — guessing is how you find out in the exam hall you never really knew it.',
  },
  {
    icon: MagnifierIcon,
    title: 'And it names what broke.',
    body: 'Not "good try" — the exact step that went wrong, and the same question again until it holds.',
  },
]

const SUBJECT_ICONS: Record<SubjectId, (props: { size?: number; className?: string }) => React.ReactElement> = {
  mathematics: SigmaIcon,
  physics: AtomIcon,
  chemistry: FlaskIcon,
  biology: LeafIcon,
  english: BookIcon,
  economics: TrendIcon,
}

const NOTS = [
  'Give you answers to copy into your assignment',
  'Replace your teacher, or your textbook',
  'Sit the exam for you — that part is yours',
]

const BOARDS = ['WAEC', 'NECO', 'JAMB']

export default function Home() {
  return (
    <main className="bg-white font-marketing text-ink">
      <Motion />
      <SiteHeader />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-[1240px] px-5 pb-16 pt-14 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-6">
            <div className="max-w-[460px]">
              <p data-hero-item className="lp-eyebrow">
                Free · WAEC · NECO · JAMB
              </p>

              <h1
                data-hero-item
                className="mt-6 font-marketing text-[38px] font-bold leading-[1.12] tracking-tight text-ink lg:text-[46px]"
              >
                You don&rsquo;t need more hours. You need it to stick.
              </h1>

              <p data-hero-item className="mt-5 text-[16px] leading-relaxed text-ink-muted">
                Ewin teaches one thing, makes you prove you got it, then tells you exactly which
                step you fumbled.
              </p>

              <div data-hero-item className="mt-8">
                <Link href="/signup" className="lp-cta press no-underline">
                  Start learning — free
                  <ArrowIcon className="text-on-dark" />
                </Link>
              </div>

              <p data-hero-item className="mt-4 text-[12.5px] font-medium text-ink-faint">
                Free forever — no card, ever.
              </p>
            </div>

            <div data-hero-cast className="lp-stage">
              <Blob id="hero-blob" from="#7ea3e0" to="#2f5a9e" className="lp-blob" />

              <div className="lp-float-card lp-card-subject">
                <div className="lp-swatch">
                  <TickIcon />
                </div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  Mathematics
                </p>
                <p className="mt-1 text-[15px] font-bold text-ink">Algebraic processes</p>
                <p className="mt-0.5 text-[12px] text-ink-faint">5 topics</p>
              </div>

              <div className="lp-float-card lp-card-board">
                <div className="mb-2 flex gap-[7px]">
                  {BOARDS.map((b) => (
                    <span key={b} className="h-5 w-5 rounded-md bg-sunken" aria-hidden />
                  ))}
                </div>
                <p className="text-[11.5px] font-bold text-ink">WAEC · NECO · JAMB</p>
                <p className="mt-0.5 text-[10px] text-ink-faint">Written for all three</p>
              </div>

              <PhotoSlot className="lp-photo-slot" />

              <div className="lp-float-card lp-card-mark">
                <p className="text-[26px] font-bold leading-none text-ink">7/10</p>
                <p className="mt-1.5 text-[11.5px] leading-snug text-ink-faint">
                  Marked instantly, with the step that broke.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How a session goes ───────────────────────────────────────── */}
      <section id="how-it-works" className="lp-section">
        <div data-reveal className="lp-head">
          <span className="lp-eyebrow">How a session goes</span>
          <h2 className="mt-4 font-marketing text-[28px] font-bold leading-[1.18] tracking-tight lg:text-[34px]">
            Ten minutes. One idea. Proof.
          </h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-muted">
            Ewin teaches one topic, checks you actually understood it, then names exactly what
            broke.
          </p>
        </div>

        <div className="lp-how-grid">
          <PhotoSlot className="lp-how-photo" />
          <div data-reveal-group className="flex flex-col gap-3.5">
            {FEATURES.map((f) => (
              <div key={f.title} className="lp-feature">
                <div className="lp-f-icon">
                  <f.icon />
                </div>
                <div>
                  <p className="text-[15.5px] font-bold text-ink">{f.title}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subjects ──────────────────────────────────────────────────── */}
      <section id="subjects" className="lp-section">
        <div data-reveal className="lp-head">
          <span className="lp-eyebrow">What you can study</span>
          <h2 className="mt-4 font-marketing text-[28px] font-bold leading-[1.18] tracking-tight lg:text-[34px]">
            Six subjects. Thirty topics.
          </h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-muted">
            Practice written in the style of each board, so a WAEC theory question reads like one
            and a JAMB objective reads like one.
          </p>
        </div>

        <div data-reveal-group className="lp-subj-grid">
          {SUBJECTS.map((s) => {
            const Icon = SUBJECT_ICONS[s.id]
            return (
              <Link
                key={s.id}
                href="/signup"
                className="card card-interactive block overflow-hidden no-underline"
              >
                <div className="relative">
                  <PhotoSlot className="lp-subj-photo" label="" />
                  {/* Subject accent sits over the placeholder as its own
                      element, not passed into PhotoSlot — that component
                      stays a pure swap target for a real photo, with
                      nothing else depending on its internals. */}
                  <span
                    className="absolute left-1/2 top-1/2 flex h-[36px] w-[36px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[10px]"
                    style={{ background: s.accent }}
                    aria-hidden
                  >
                    <Icon size={17} />
                  </span>
                </div>
                <div className="p-[18px]">
                  <p className="text-[16px] font-bold text-ink">{s.name}</p>
                  <p className="mt-1 text-[12.5px] text-ink-faint">
                    {s.topics.length} topics · {s.exam}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Why it's different (trust row + board credential) ───────── */}
      <section className="lp-section">
        <div data-reveal className="lp-head">
          <span className="lp-eyebrow">Why it&rsquo;s different</span>
          <h2 className="mt-4 font-marketing text-[28px] font-bold leading-[1.18] tracking-tight lg:text-[34px]">
            It refuses to answer until you&rsquo;ve tried.
          </h2>
        </div>

        <div data-reveal-group className="lp-trust-row">
          <PhotoSlot className="lp-trust-photo" />
          <div className="lp-quote-card">
            <p className="text-[16.5px] font-medium leading-snug text-[#16305c]">
              &ldquo;Reading a topic and knowing it are different things. Ewin only counts the
              second one.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              <div className="lp-swatch h-[30px] w-[30px] rounded-[9px]">
                <TickIcon size={14} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-ink">Ewin</p>
                <p className="text-[11.5px] text-[#5c6b8a]">
                  On what makes it different from a search engine
                </p>
              </div>
            </div>
          </div>
          <PhotoSlot className="lp-trust-photo" />
        </div>

        <div data-reveal className="mt-14 text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-faint">
            Written for
          </p>
          <div className="lp-board-row mt-5">
            {BOARDS.map((b) => (
              <div key={b} className="flex items-center gap-2.5 text-[14px] font-semibold text-ink-muted">
                <span className="h-[26px] w-[26px] rounded-[7px] bg-sunken" aria-hidden />
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Where it stops ───────────────────────────────────────────── */}
      <section className="lp-section pt-0">
        <div data-reveal-group className="mx-auto grid max-w-xl gap-2.5">
          {NOTS.map((n) => (
            <div key={n} className="flex items-center gap-3 rounded-2xl bg-wrong-soft px-5 py-4">
              <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-surface">
                <CrossIcon />
              </span>
              <p className="text-[14.5px] font-semibold text-ink">{n}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────────── */}
      <section className="relative mt-5 overflow-hidden bg-sunken pt-24 text-center">
        <div data-reveal className="relative z-[3] mx-auto max-w-[600px] px-5">
          <span className="lp-eyebrow">Before the exam, not the night before</span>
          <h2 className="mt-5 font-marketing text-[28px] font-bold leading-[1.18] tracking-tight lg:text-[34px]">
            The exam is coming either way.
          </h2>
          <p className="mt-3.5 text-[15px] leading-relaxed text-ink-muted">
            Ten honest minutes tonight beat three hours of cramming the week before.
          </p>
          <div className="mt-7 flex justify-center">
            <Link href="/signup" className="lp-cta press no-underline">
              Start with one topic
              <ArrowIcon className="text-on-dark" />
            </Link>
          </div>
        </div>

        <div className="lp-close-stage">
          <Blob id="close-blob" from="#5b86c9" to="#16305c" className="lp-close-blob" />

          <div className="lp-shape lp-shape-a rotate-[18deg] rounded-[10px]" aria-hidden />
          <div className="lp-shape lp-shape-b -rotate-[12deg] rounded-[8px]" aria-hidden />
          <div className="lp-shape lp-shape-c rotate-[10deg]" aria-hidden />

          <PhotoSlot
            className="absolute bottom-[50px] left-1/2 z-[3] h-[290px] w-[230px] -translate-x-1/2 rounded-t-[20px]"
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
