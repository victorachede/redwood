'use client'

import Link from 'next/link'
import { use, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { EwinAvatar } from '@/components/EwinAvatar'
import { addCard, parseTutorCards, stripStudyCardsBlock } from '@/app/lib/cards'
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
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      const raw = data.response as string
      const cards = parseTutorCards(raw)
      const clean = stripStudyCardsBlock(raw)
      setMessages([...updated, { role: 'tutor', content: clean }])
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
      <main className="min-h-dvh bg-paper text-ink flex items-center justify-center">
        <p className="text-sm text-ink-muted">Checking access…</p>
      </main>
    )
  }

  if (allowed === false) {
    return (
      <main className="min-h-dvh bg-paper text-ink">
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="font-serif text-xl font-semibold">Ewin opens this when you are ready</p>
          <p className="mt-3 text-sm text-ink-muted leading-relaxed">
            Classwork and homework are not open menus. During a lesson, when Ewin decides you should
            practise or submit work, it will open this screen for you.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-[var(--on-accent)] no-underline hover:bg-accent-hover"
          >
            Back to dashboard
          </Link>
          <p className="mt-4 text-[12px] text-ink-muted">
            Or continue learning —{' '}
            <Link href="/learn/mathematics" className="text-accent no-underline">
              start a tutor session
            </Link>
          </p>
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
            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="font-serif text-lg font-semibold">{meta.title}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{meta.blurb}</p>
              <p className="mt-3 text-[12px] text-ink-muted">
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
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-[10px] font-semibold text-ink-muted">
                  You
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed ${
                  m.role === 'student'
                    ? 'rounded-tr-md bg-accent text-[var(--on-accent)]'
                    : 'rounded-tl-md border border-line bg-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          {suggested.length > 0 && (
            <div className="rounded-2xl border border-accent/30 bg-accent-soft p-4">
              <p className="text-[12px] font-semibold text-accent">Study cards from this work</p>
              <ul className="mt-2 space-y-2">
                {suggested.map((c) => (
                  <li key={c.front} className="flex items-start justify-between gap-2 text-[13px]">
                    <span className="text-ink">{c.front}</span>
                    <button
                      type="button"
                      className="shrink-0 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-[var(--on-accent)]"
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
          <div className="ewin-composer flex items-end gap-1.5 rounded-full bg-[#303036] px-1.5 py-1.5">
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
              className="mb-0 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1a1a1e] disabled:bg-white/15 disabled:text-white/40"
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
