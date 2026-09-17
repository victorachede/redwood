'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AppHeader } from '@/components/ui/AppHeader'
import { SubjectIcon } from '@/components/SubjectIcon'
import { SUBJECTS } from '@/app/lib/subjects'
import { canJoinRoom, watchRoomCount } from '@/app/lib/rooms'

/**
 * A room for each subject, populated live via Supabase Presence — see
 * app/lib/rooms.ts for why nothing here is persisted.
 */
export default function RoomsPage() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [joinable, setJoinable] = useState(true)

  useEffect(() => {
    setJoinable(canJoinRoom())
    const stops = SUBJECTS.map((s) =>
      watchRoomCount(s.id, (n) => setCounts((prev) => ({ ...prev, [s.id]: n }))),
    )
    return () => stops.forEach((stop) => stop())
  }, [])

  return (
    <main className="bg-paper text-ink">
      <AppHeader title="Study rooms" back="/dashboard" />

      <div className="mx-auto max-w-2xl px-4 pb-6 pt-6">
        <header className="mb-6">
          <p className="margin-label">Right now</p>
          <h2 className="mt-4 font-display text-[clamp(1.875rem,7vw,2.5rem)] leading-[1.05]">
            Study alongside
            <br />
            <span className="text-primary">someone else.</span>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
            See who else is working on a subject right now and focus next to them. No chat —
            just presence, a shared timer, and a few quick reactions.
          </p>
        </header>

        {!joinable && (
          <section className="mb-6 rounded-2xl border border-line bg-surface p-5">
            <p className="text-[14.5px] font-medium text-ink">Sign in to join a room</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
              A room needs a real, stable identity to show who&rsquo;s actually there. You can
              still see how many people are studying each subject without one.
            </p>
            <Link
              href="/signup"
              className="press mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-semibold text-on-primary no-underline"
            >
              Create an account
            </Link>
          </section>
        )}

        <div className="flex flex-col gap-2.5">
          {SUBJECTS.map((s) => {
            const n = counts[s.id] ?? 0
            return (
              <Link
                key={s.id}
                href={`/rooms/${s.id}`}
                className="press flex items-center gap-3.5 rounded-2xl p-3.5 no-underline"
                style={{ background: `color-mix(in srgb, ${s.accent} 10%, var(--paper))` }}
              >
                <SubjectIcon icon={s.icon} accent={s.accent} size={40} tone="solid" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-semibold text-ink">{s.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-ink-muted">
                    {n === 0 ? 'Nobody here yet' : n === 1 ? '1 person studying' : `${n} people studying`}
                  </p>
                </div>
                {n > 0 && (
                  <span
                    aria-hidden
                    className="flex h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: 'var(--correct)' }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
