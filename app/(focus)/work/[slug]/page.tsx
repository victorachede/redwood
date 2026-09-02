'use client'

import Link from 'next/link'
import { use, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Lock, Send } from 'lucide-react'
import { EwinAvatar } from '@/components/EwinAvatar'
import { addCard } from '@/app/lib/cards'
import { readTutorStream, type TutorEvent } from '@/app/lib/tutorProtocol'
import type { SaveStudyCardInput, RecordMasteryInput } from '@/app/lib/tutorProtocol'
import { recordMastery } from '@/app/lib/progress'
import { consumeWorkTicket, type WorkKind } from '@/app/lib/workGate'

type Msg = { role: 'tutor' | 'student'; content: string }

const LABELS: Record<string, { title: string; blurb: string }> = {
  homework: {
    title: 'Homework',
    blurb: 'Paste the questions or photo text. Ewin checks your work and explains mistakes in chat.',
  },
  classwork: {
    title: 'Classwork',
    blurb: 'Drop what you did in class. Get grades, corrections, and what to revise next.',
  },
}

export default function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const meta = LABELS[slug] || {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    blurb: 'Paste the assignment. Ewin reviews it with you in chat — grades, fixes, and next steps.',
  }

  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [ticketBrief, setTicketBrief] = useState<string | undefined>()

  useEffect(() => {
    const kind = (slug === 'classwork' || slug === 'homework' ? slug : null) as WorkKind | null
    if (!kind) {
      setAllowed(false)
      return
    }
    const ticket = consumeWorkTicket(kind)
    if (!ticket) {
      setAllowed(false)
      return
    }
    setTicketBrief(ticket.brief)
    setAllowed(true)
  }, [slug])

  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggested, setSuggested] = useState<{ front: string; back: string }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Msg = { role: 'student', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    setError(null)
    setSuggested([])
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: meta.title,
          topic: slug,
          messages: updated,
          action: messages.length === 0 ? 'work_start' : 'work_respond',
          workKind: slug,
        }),
      })
      if (!res.ok) {
        let msg = 'Ewin could not mark this right now. Try again.'
        try {
          const data = (await res.json()) as { error?: string }
          if (data?.error) msg = data.error
        } catch {
          /* non-JSON error body */
        }
        throw new Error(msg)
      }

      // The route streams NDJSON. This page previously called res.json() on it,
      // which threw for every user with a real API key — the flow only ever
      // worked in keyless demo mode.
      let text = ''
      let failed: string | null = null
      const cards: { front: string; back: string }[] = []

      await readTutorStream(res, (e: TutorEvent) => {
        if (e.t === 'text') {
          text += e.v
          setMessages([...updated, { role: 'tutor', content: text }])
        } else if (e.t === 'tool') {
          if (e.name === 'save_study_card') {
            const c = e.input as SaveStudyCardInput
            if (c?.front && c?.back) cards.push(c)
          } else if (e.name === 'record_mastery') {
            const m = e.input as RecordMasteryInput
            if (m?.topic && m?.level) recordMastery(slug, m.topic, m.level)
          }
        } else if (e.t === 'error') {
          failed = e.message
        }
      })

      if (failed && !text) throw new Error(failed)
      if (failed) setError(failed)

      setMessages([...updated, { role: 'tutor', content: text }])
      if (cards.length) setSuggested(cards)
      inputRef.current?.blur()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Try again')
      setMessages(messages)
      setInput(userMsg.content)
    } finally {
      setLoading(false)
    }
  }

  if (allowed === null) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper text-ink">
        <div className="w-full max-w-sm space-y-3 px-6">
          <div className="skeleton h-11 w-11 rounded-2xl" />
          <div className="skeleton h-5 w-2/3" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-4/5" />
        </div>
      </main>
    )
  }

  if (allowed === false) {
    return (
      <main className="min-h-dvh bg-paper text-ink">
        <div className="mx-auto flex min-h-dvh max-w-md items-center px-4 py-16">
          <div className="relative w-full overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-navy-700 to-navy-900 px-7 py-10 text-center shadow-[var(--shadow-lg)]">
            <div className="absolute inset-x-0 top-0 h-px" />

            <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-streak/30 bg-streak/10">
              <Lock className="h-6 w-6 text-streak" />
            </span>

            <p className="font-serif text-xl font-semibold text-white">
              Ewin opens this when you are ready
            </p>
            <p className="mx-auto mt-3 max-w-xs text-[13.5px] leading-relaxed text-ink-muted">
              Classwork and homework are not open menus. During a lesson, when Ewin decides you
              should practise or submit work, it will open this screen for you.
            </p>

            <Link
              href="/dashboard"
              className="mt-7 inline-flex rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 px-6 py-3 text-[14px] font-semibold text-primary no-underline shadow-[var(--shadow-md)]"
            >
              Back to dashboard
            </Link>
            <p className="mt-4 text-[12px] text-ink-muted">
              Or continue learning —{' '}
              <Link href="/learn/mathematics" className="text-streak no-underline">
                start a tutor session
              </Link>
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <header className="shrink-0 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link href="/dashboard" className="text-ink-muted hover:text-ink" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <EwinAvatar size={32} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold">{meta.title}</p>
            <p className="truncate text-[11px] text-ink-muted">Ewin checks your work</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
              <p className="font-serif text-lg font-semibold">{meta.title}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{meta.blurb}</p>

              {ticketBrief && (
                <div className="mt-4 rounded-xl border-l-[3px] border-streak bg-streak/[0.07] px-3.5 py-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-streak">
                    What Ewin set
                  </p>
                  <p className="text-[13.5px] leading-relaxed text-ink">{ticketBrief}</p>
                </div>
              )}

              <p className="mt-3.5 text-[12px] text-ink-muted">
                Tip: paste the full question and your answer, or only the question if you want help.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${m.role === 'student' ? 'flex-row-reverse' : ''}`}
            >
              {m.role === 'tutor' ? (
                <EwinAvatar size={28} className="mt-0.5" />
              ) : (
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-[10px] font-semibold text-ink-muted">
                  You
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed ${
                  m.role === 'student'
                    ? 'rounded-tr-md bg-primary text-[var(--on-primary)]'
                    : 'rounded-tl-md border border-line bg-surface'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          {suggested.length > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-primary-soft p-4">
              <p className="text-[12px] font-semibold text-primary">Study cards from this work</p>
              <ul className="mt-2 space-y-2">
                {suggested.map((c) => (
                  <li key={c.front} className="flex items-start justify-between gap-2 text-[13px]">
                    <span className="text-ink">{c.front}</span>
                    <button
                      type="button"
                      className="shrink-0 rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-[var(--on-primary)]"
                      onClick={() => {
                        addCard({ ...c, subject: meta.title, source: 'work' })
                        setSuggested((s) => s.filter((x) => x.front !== c.front))
                      }}
                    >
                      Save
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">
              {error}
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto max-w-2xl px-3">
          <div
            className="ewin-composer flex items-end gap-1.5 rounded-full px-1.5 py-1.5 shadow-[0_4px_18px_-4px_rgba(10,20,40,0.4),0_0_0_1px_rgba(255,255,255,0.07)] transition-shadow focus-within:shadow-[0_4px_18px_-4px_rgba(10,20,40,0.45),0_0_0_1px_rgba(201,168,76,0.45)]"
            style={{ background: 'linear-gradient(180deg, #16223d 0%, #0c1428 100%)' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              rows={1}
              placeholder="Paste homework or your answer…"
              disabled={loading}
              className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent py-3 text-[15px] text-white/95 outline-none placeholder:text-white/35"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              className="mb-0 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-[#1a1a1e] disabled:bg-surface/15 disabled:text-white/40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
