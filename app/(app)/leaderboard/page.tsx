'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Flame, Lock, Trophy } from 'lucide-react'
import { AppHeader } from '@/components/ui/AppHeader'
import { Avatar } from '@/components/ui/Avatar'
import {
  cachedBoard,
  fetchBoard,
  isOptedIn,
  setOptedIn,
  canJoin,
  daysLeftInWeek,
  type LeaderboardRow,
} from '@/app/lib/leaderboard'
import { onSync } from '@/app/lib/sync'

/**
 * The weekly board.
 *
 * Deliberately ranked on this week only. An all-time board would mean anyone
 * joining later is permanently invisible behind whoever was early, which is
 * the thing that makes a leaderboard discouraging rather than motivating —
 * and this app's whole argument is that showing up again tomorrow is what
 * works. Every Monday, everyone is level.
 *
 * A student appears only if they switched it on, and only their display name
 * leaves their device. They are fourteen to eighteen; that is not a default
 * anyone else gets to pick for them.
 */
export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [optedIn, setOpted] = useState(false)
  const [joinable, setJoinable] = useState(true)
  const [loading, setLoading] = useState(true)
  const [unreachable, setUnreachable] = useState(false)
  const [days, setDays] = useState(7)

  useEffect(() => {
    const load = () => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRows(cachedBoard())
      setOpted(isOptedIn())
      setJoinable(canJoin())
      setDays(daysLeftInWeek())
      void fetchBoard().then((r) => {
        if (r === null) setUnreachable(true)
        else {
          setUnreachable(false)
          setRows(r)
        }
        setLoading(false)
      })
    }
    load()
    return onSync(load)
  }, [])

  const me = rows.find((r) => r.isMe)

  return (
    <main className="bg-paper text-ink">
      <AppHeader title="Leaderboard" back="/dashboard" />

      <div className="mx-auto max-w-2xl px-4 pb-6 pt-6">
        <header className="mb-6">
          <p className="margin-label">
            This week · {days} {days === 1 ? 'day' : 'days'} left
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.875rem,7vw,2.5rem)] leading-[1.05]">
            Everyone starts level
            <br />
            <span className="text-primary">on Monday.</span>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
            Ranked on questions you got right this week. Answer at least ten to place — one
            lucky answer is not a podium.
          </p>
        </header>

        {/* ── Join ─────────────────────────────────────────────────────── */}
        {!optedIn && (
          <section className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-start gap-3">
              <Trophy className="mt-0.5 h-[18px] w-[18px] shrink-0" style={{ color: 'var(--streak)' }} />
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-medium text-ink">
                  {joinable ? 'You are not on the board' : 'Sign in to join the board'}
                </p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
                  {joinable
                    ? 'Only your display name shows — never your school, your email or your photo. You can leave any time and your name disappears immediately.'
                    : 'The board ranks accounts, so your work follows you between devices.'}
                </p>
                {joinable ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOptedIn(true)
                      setOpted(true)
                      void fetchBoard().then((r) => r && setRows(r))
                    }}
                    className="press mt-4 rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-semibold text-on-primary"
                  >
                    Join the board
                  </button>
                ) : (
                  <Link
                    href="/signup"
                    className="press mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-semibold text-on-primary no-underline"
                  >
                    Create an account
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Your standing ────────────────────────────────────────────── */}
        {optedIn && me && (
          <section className="rounded-2xl bg-hero p-5 text-on-hero">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--on-hero-dim)' }}>
              Your week
            </p>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="tnum font-display text-[38px] leading-none">#{me.rank}</span>
              <span className="text-[14.5px]" style={{ color: 'var(--on-hero-dim)' }}>
                {me.correct} right of {me.total} · {me.accuracy}%
              </span>
            </div>
          </section>
        )}

        {optedIn && !me && !loading && (
          <section className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-[14.5px] font-medium text-ink">Ten questions to place</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
              You are on the board, but this week has not started for you yet. Answer ten and
              you will appear.
            </p>
            <Link
              href="/practice/mathematics"
              className="press mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-semibold text-on-primary no-underline"
            >
              Start practising
            </Link>
          </section>
        )}

        {/* ── The board ────────────────────────────────────────────────── */}
        <h3 className="mb-2.5 mt-8 margin-label">This week</h3>

        {loading && rows.length === 0 ? (
          <ul className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="skeleton h-[62px] rounded-2xl" />
            ))}
          </ul>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface p-5 text-[14px] leading-relaxed text-ink-muted">
            {unreachable
              ? 'Could not reach the board just now. Your practice still counts — it will show up here when you are back on.'
              : 'Nobody has answered ten questions yet this week. Be first.'}
          </p>
        ) : (
          <ul className="border-t border-line">
            {rows.map((r) => (
              <li
                key={`${r.rank}-${r.name}`}
                className="flex items-center gap-3.5 border-b border-line py-3.5"
                style={r.isMe ? { background: 'var(--primary-soft)' } : undefined}
              >
                <span
                  className="tnum w-9 shrink-0 text-right font-display text-[20px] leading-none"
                  style={{ color: r.rank <= 3 ? 'var(--streak)' : 'var(--ink-faint)' }}
                >
                  {r.rank}
                </span>
                <Avatar name={r.name} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-medium text-ink">
                    {r.name}
                    {r.isMe && <span className="ml-1.5 text-[12px] text-primary">you</span>}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-[12.5px] text-ink-muted">
                    <span className="tnum">{r.accuracy}% of {r.total}</span>
                    {r.streak > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Flame className="h-3 w-3" style={{ color: 'var(--streak)' }} />
                        <span className="tnum">{r.streak}</span>
                      </span>
                    )}
                  </p>
                </div>
                <span className="tnum shrink-0 font-display text-[19px] text-ink">{r.correct}</span>
              </li>
            ))}
          </ul>
        )}

        {optedIn && (
          <button
            type="button"
            onClick={() => {
              setOptedIn(false)
              setOpted(false)
              void fetchBoard().then((r) => r && setRows(r))
            }}
            className="press mt-6 flex items-center gap-2 text-[13px] font-medium text-ink-muted"
          >
            <Lock className="h-3.5 w-3.5" />
            Leave the board
          </button>
        )}

        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-faint">
          Scores are counted on the server from your real practice results, so they cannot be
          edited from a phone.
        </p>
      </div>
    </main>
  )
}
