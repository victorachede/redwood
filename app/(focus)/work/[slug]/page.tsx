'use client'

import Link from 'next/link'
import { use, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Camera, Lock, Send, X } from 'lucide-react'
import { EwinAvatar } from '@/components/EwinAvatar'
import { addCard } from '@/app/lib/cards'
import { readTutorStream, type TutorEvent } from '@/app/lib/tutorProtocol'
import type { SaveStudyCardInput, RecordMasteryInput } from '@/app/lib/tutorProtocol'
import { recordMastery } from '@/app/lib/progress'
import { prepareImage, type PreparedImage } from '@/app/lib/image'
import { consumeWorkTicket, clearWorkTicket, type WorkKind } from '@/app/lib/workGate'
import { completeLatestOpen } from '@/app/lib/assignments'

type Msg = { role: 'tutor' | 'student'; content: string; photos?: string[] }

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

  const kind = (slug === 'classwork' || slug === 'homework' ? slug : null) as WorkKind | null

  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [ticketBrief, setTicketBrief] = useState<string | undefined>()

  useEffect(() => {
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
  }, [kind])

  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggested, setSuggested] = useState<{ front: string; back: string }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<PreparedImage[]>([])

  async function onPickPhotos(files: FileList | null) {
    if (!files?.length) return
    const next: PreparedImage[] = []
    for (const file of Array.from(files).slice(0, Math.max(0, 3 - photos.length))) {
      try {
        next.push(await prepareImage(file))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not read that photo.')
      }
    }
    if (next.length) setPhotos((p) => [...p, ...next].slice(0, 3))
    if (photoRef.current) photoRef.current.value = ''
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    if ((!input.trim() && photos.length === 0) || loading) return
    const snapshot = [...photos]
    const userMsg: Msg = {
      role: 'student',
      content: input.trim() || 'Here is my work — please mark it.',
      photos: snapshot.map((p) => p.preview),
    }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setPhotos([])
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
          messages: updated.map((m, i) =>
            i === updated.length - 1 && snapshot.length
              ? { ...m, images: snapshot.map((p) => ({ mediaType: p.mediaType, data: p.data })) }
              : m,
          ),
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
      setPhotos(snapshot)
    } finally {
      setLoading(false)
    }
  }

  if (allowed === null) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
        <div className="w-full max-w-sm space-y-3">
          <div className="skeleton h-11 w-11 rounded-2xl" />
          <div className="skeleton h-5 w-2/3" />
          <div className="skeleton h-4 w-full" />
        </div>
      </main>
    )
  }

  if (allowed === false) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-5 text-ink">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-7 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
            <Lock className="h-6 w-6 text-primary" />
          </span>
          <h1 className="font-display text-[20px] text-ink">Ewin opens this for you</h1>
          <p className="mx-auto mt-2.5 max-w-xs text-[14px] leading-relaxed text-ink-muted">
            Classwork and homework are not a menu. When Ewin decides during a lesson that you are
            ready to practise, it will open this screen.
          </p>
          <Link
            href="/dashboard"
            className="press mt-6 inline-block rounded-full bg-primary px-6 py-3 text-[14.5px] font-medium text-on-primary no-underline"
          >
            Back to Today
          </Link>
          <p className="mt-3.5 text-[13px] text-ink-muted">
            Or{' '}
            <Link href="/learn/mathematics" className="font-medium text-primary no-underline">
              start a lesson
            </Link>
          </p>
        </div>
      </main>
    )
  }

  const canSend = Boolean(input.trim() || photos.length) && !loading

  // The exit only appears once Ewin has actually marked something. Before
  // that there is nothing to finish, and offering "Done" would invite the
  // student to leave before getting the part they came for.
  const marked = messages.some((m) => m.role === 'tutor')

  function finish() {
    if (kind) completeLatestOpen(kind)
    clearWorkTicket()
    window.location.href = '/dashboard'
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <header className="shrink-0 border-b border-line bg-paper">
        <div className="mx-auto flex min-h-[56px] max-w-2xl items-center gap-2.5 px-3 py-2.5">
          <Link
            href="/dashboard"
            className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted no-underline hover:bg-sunken"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <EwinAvatar size={30} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14.5px] font-semibold leading-tight text-ink">
              {meta.title}
            </p>
            <p className="truncate text-[12px] leading-tight text-ink-muted">Ewin marks your work</p>
          </div>
          {marked && (
            <button
              type="button"
              onClick={finish}
              className="press shrink-0 rounded-full bg-primary px-4 py-2 text-[13.5px] font-semibold text-on-primary"
            >
              Done
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-4 px-3 py-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="font-display text-[18px] text-ink">{meta.title}</p>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{meta.blurb}</p>

              {ticketBrief && (
                <div className="mt-3.5 rounded-xl border-l-[3px] border-primary bg-primary-soft px-3.5 py-3">
                  <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-primary">
                    What Ewin set
                  </p>
                  <p className="text-[14px] leading-relaxed text-ink">{ticketBrief}</p>
                </div>
              )}

              <p className="mt-3.5 text-[13px] text-ink-muted">
                Type your answer, or photograph it straight from your book.
              </p>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === 'student' ? (
              <div key={i} className="rise flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5">
                  {m.photos && m.photos.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {m.photos.map((src) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={src} src={src} alt="Your work" className="h-24 w-24 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-[15px] leading-[1.5] text-on-primary">
                    {m.content}
                  </p>
                </div>
              </div>
            ) : (
              <div key={i} className="rise flex gap-2.5">
                <EwinAvatar size={28} className="mt-0.5 shrink-0" />
                <p className="min-w-0 flex-1 whitespace-pre-wrap pt-0.5 text-[15px] leading-[1.6] text-ink">
                  {m.content}
                </p>
              </div>
            ),
          )}

          {loading && messages[messages.length - 1]?.role !== 'tutor' && (
            <div className="flex items-center gap-2.5">
              <EwinAvatar size={28} className="shrink-0" />
              <span className="flex items-center gap-1.5">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </span>
            </div>
          )}

          {suggested.length > 0 && (
            <div className="rise rounded-2xl border border-line bg-surface p-4">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Save for revision
              </p>
              <ul className="mt-2.5 space-y-2">
                {suggested.map((c) => (
                  <li
                    key={c.front}
                    className="flex items-start justify-between gap-3 rounded-xl bg-sunken px-3 py-2.5"
                  >
                    <span className="min-w-0 flex-1 text-[13.5px] leading-snug text-ink">
                      {c.front}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        addCard({ front: c.front, back: c.back, subject: meta.title, source: 'work' })
                        setSuggested((s) => s.filter((x) => x.front !== c.front))
                      }}
                      className="press shrink-0 rounded-full bg-primary px-3 py-1 text-[11.5px] font-medium text-on-primary"
                    >
                      Save
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="rise rounded-xl bg-wrong-soft px-3.5 py-3">
              <p className="text-[13.5px] text-wrong">{error}</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-line bg-paper px-3 pb-safe pt-2.5">
        <div className="mx-auto max-w-2xl">
          {photos.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {photos.map((ph, i) => (
                <span key={ph.preview} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ph.preview}
                    alt=""
                    className="h-16 w-16 rounded-lg border border-line object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => setPhotos((p) => p.filter((_, k) => k !== i))}
                    className="press absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-paper"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => void onPickPhotos(e.target.files)}
          />

          <div className="flex items-end gap-1.5 rounded-[22px] border border-line bg-surface p-1.5 focus-within:border-primary">
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={loading || photos.length >= 3}
              className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-faint hover:bg-sunken hover:text-ink disabled:opacity-30"
              aria-label="Photograph your work"
            >
              <Camera className="h-[19px] w-[19px]" />
            </button>

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
              placeholder={photos.length ? 'Add a note, or just send…' : 'Paste or type your work…'}
              disabled={loading}
              className="max-h-[120px] min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-[16px] leading-snug text-ink outline-none placeholder:text-ink-faint disabled:opacity-50"
            />

            <button
              type="button"
              onClick={() => void send()}
              disabled={!canSend}
              className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                background: canSend ? 'var(--primary)' : 'var(--sunken)',
                color: canSend ? 'var(--on-primary)' : 'var(--ink-faint)',
              }}
              aria-label="Send"
            >
              <Send className="h-[17px] w-[17px]" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
