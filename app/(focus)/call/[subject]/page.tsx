'use client'

import { use, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Caveat, STIX_Two_Text } from 'next/font/google'
import {
  AlertTriangle,
  Calendar,
  Check,
  ClipboardList,
  Hand,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  StickyNote,
  X,
} from '@/components/icons'
import { getSubject } from '@/app/lib/subjects'
import { getSession } from '@/app/lib/auth'
import { buildLearnerProfile } from '@/app/lib/learnerProfile'
import { recordMastery, type MasteryLevel } from '@/app/lib/progress'
import { recordAssignment } from '@/app/lib/assignments'
import { addCard } from '@/app/lib/cards'
import {
  CALL_PHASES,
  EMPTY_BOARD,
  EMPTY_SUMMARY,
  PHASE_LABEL,
  applyBoardOp,
  parseBoardTool,
  phaseIndex,
  type BoardState,
  type CallSummary,
} from '@/app/lib/callBoard'
import {
  WORD_MS,
  connectLiveSession,
  createDemoSession,
  type CallEvent,
  type CallSession,
  type CallTurn,
} from '@/app/lib/callSession'
import { Whiteboard } from '@/components/call/Whiteboard'
import { CallArtDefs, EndScene, StartScene, TutorTile } from '@/components/call/CallArt'

/**
 * The voice call.
 *
 * Laid out like a lesson rather than a phone call: a whiteboard fills the
 * screen, the tutor sits in a small tile in its corner, captions run under it
 * word by word, and the controls are mute, raise a hand, and hang up. Before
 * the call a sheet shows the plan for today; after it, a sheet shows what was
 * saved.
 *
 * Everything on screen is driven by CallEvents (app/lib/callSession.ts), so
 * the live voice session and the development demo render the same way.
 */

const math = STIX_Two_Text({ subsets: ['latin'], weight: ['500'], style: ['normal', 'italic'], variable: '--font-math', display: 'swap' })
const pen = Caveat({ subsets: ['latin'], weight: ['700'], variable: '--font-pen', display: 'swap' })

/** The scripted lesson is for building and testing the screen, never for students. */
const DEMO_ALLOWED = process.env.NODE_ENV !== 'production'

type Screen = 'checking' | 'not-voice-plan' | 'ready' | 'connecting' | 'not-configured' | 'live' | 'ended'
type Caption = { who: 'ewin' | 'you'; words: string[]; shown: number }

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** One line of plan for the start sheet, from what the app already knows. */
function planFor(subjectId: string, subjectName: string): string {
  const p = buildLearnerProfile(subjectId)
  const here = p?.subjects.find((s) => s.id === subjectId)
  if (here?.weak.length) return `Last time ${here.weak[0]} gave you trouble. We'll fix that first, then work an exam-style question together.`
  if (p?.recentMisses[0]?.topic) return `You recently missed a question on ${p.recentMisses[0].topic}. We'll start there, then try one like it.`
  if (p?.lastTopic && p.lastTopic.subject === subjectName) return `We'll pick up from ${p.lastTopic.topic}, check it stuck, then go one step further.`
  return `Tell EWIN what you're working on, or let it pick a WAEC topic to start with.`
}

export default function CallPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params)
  const router = useRouter()
  const meta = getSubject(subject)
  const subjectLabel = meta?.name ?? subject

  const [screen, setScreen] = useState<Screen>('checking')
  const [demo, setDemo] = useState(false)
  const [plan, setPlan] = useState('')
  const [board, setBoard] = useState<BoardState>(EMPTY_BOARD)
  const [caption, setCaption] = useState<Caption | null>(null)
  const [turn, setTurn] = useState<CallTurn>('thinking')
  const [choices, setChoices] = useState<{ options: string[]; label?: string } | null>(null)
  const [muted, setMuted] = useState(false)
  const [handUp, setHandUp] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [summary, setSummary] = useState<CallSummary>(EMPTY_SUMMARY)

  const session = useRef<CallSession | null>(null)
  const tick = useRef<ReturnType<typeof setInterval> | null>(null)
  const reveal = useRef<ReturnType<typeof setInterval> | null>(null)
  const persist = useRef(true)

  useEffect(() => {
    const wantsDemo = DEMO_ALLOWED && new URLSearchParams(window.location.search).get('demo') === '1'
    // Reading the plan and the URL needs the browser, so it happens here
    // rather than during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDemo(wantsDemo)
    setPlan(planFor(subject, subjectLabel))
    setScreen(wantsDemo || getSession()?.plan === 'voice' ? 'ready' : 'not-voice-plan')
    return () => {
      session.current?.end()
      if (tick.current) clearInterval(tick.current)
      if (reveal.current) clearInterval(reveal.current)
    }
  }, [subject, subjectLabel])

  const showCaption = useCallback((who: Caption['who'], text: string, msPerWord: number) => {
    if (reveal.current) clearInterval(reveal.current)
    const words = text.split(' ')
    setCaption({ who, words, shown: 0 })
    reveal.current = setInterval(() => {
      setCaption((c) => {
        if (!c || c.shown >= c.words.length) {
          if (reveal.current) clearInterval(reveal.current)
          return c
        }
        return { ...c, shown: c.shown + 1 }
      })
    }, msPerWord)
  }, [])

  const finish = useCallback(() => {
    session.current?.end()
    session.current = null
    if (tick.current) clearInterval(tick.current)
    if (reveal.current) clearInterval(reveal.current)
    setChoices(null)
    setHandUp(false)
    setScreen('ended')
  }, [])

  const onTool = useCallback(
    (name: string, input: unknown) => {
      const op = parseBoardTool(name, input)
      if (op) {
        setBoard((b) => applyBoardOp(b, op))
        if (op.op === 'mark' && op.input.mark === 'cross') setSummary((s) => ({ ...s, slips: s.slips + 1 }))
        return
      }
      const o = (input ?? {}) as Record<string, unknown>
      if (name === 'record_mastery' && typeof o.topic === 'string' && ['struggling', 'developing', 'solid'].includes(o.level as string)) {
        const level = o.level as MasteryLevel
        if (persist.current) recordMastery(subject, o.topic, level)
        setSummary((s) => ({ ...s, mastery: [...s.mastery.filter((m) => m.topic !== o.topic), { topic: o.topic as string, level }] }))
      } else if (name === 'assign_work' && (o.kind === 'homework' || o.kind === 'classwork')) {
        const brief = typeof o.brief === 'string' ? o.brief : undefined
        if (persist.current) recordAssignment({ kind: o.kind, subjectId: subject, topic: typeof o.topic === 'string' ? o.topic : undefined, brief })
        setSummary((s) => ({ ...s, homework: [...s.homework, brief ?? 'Practice from this call'] }))
      } else if (name === 'save_study_card' && typeof o.front === 'string' && typeof o.back === 'string') {
        if (persist.current) addCard({ front: o.front, back: o.back, subject, source: 'tutor' })
        setSummary((s) => ({ ...s, cards: [...s.cards, o.front as string] }))
      }
    },
    [subject],
  )

  const onEvent = useCallback(
    (e: CallEvent) => {
      switch (e.t) {
        case 'say':
          setChoices(null)
          showCaption('ewin', e.text, WORD_MS)
          break
        case 'heard':
          setChoices(null)
          showCaption('you', e.text, 200)
          break
        case 'nudge':
          if (reveal.current) clearInterval(reveal.current)
          setCaption({ who: 'ewin', words: e.text.split(' '), shown: e.text.split(' ').length })
          break
        case 'turn':
          setTurn(e.turn)
          if (e.turn !== 'speaking') setHandUp(false)
          break
        case 'choices':
          setChoices({ options: e.options, label: e.label })
          break
        case 'tool':
          onTool(e.name, e.input)
          break
        case 'ended':
          finish()
          break
      }
    },
    [finish, onTool, showCaption],
  )

  async function startCall() {
    setBoard(EMPTY_BOARD)
    setSummary(EMPTY_SUMMARY)
    setCaption(null)
    setElapsed(0)
    setMuted(false)
    setScreen('connecting')

    const first = getSession()?.displayName?.split(' ')[0] || 'there'
    try {
      if (demo) {
        persist.current = false
        session.current = createDemoSession(onEvent, first)
      } else {
        persist.current = true
        session.current = await connectLiveSession(subject, onEvent)
      }
    } catch {
      setScreen('not-configured')
      return
    }
    setScreen('live')
    if (tick.current) clearInterval(tick.current)
    tick.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    session.current.start()
  }

  function toggleMute() {
    const next = !muted
    setMuted(next)
    session.current?.setMuted(next)
  }

  function raiseHand() {
    if (turn !== 'speaking') return
    setHandUp(true)
    session.current?.interrupt()
  }

  const fonts = `${math.variable} ${pen.variable}`

  if (screen === 'checking') {
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

  if (screen === 'not-voice-plan' || screen === 'not-configured') {
    const upgrade = screen === 'not-voice-plan'
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-5 text-ink">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-7 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
            <Radio className="h-6 w-6 text-primary" />
          </span>
          <h1 className="font-display text-[20px] text-ink">
            {upgrade ? 'Voice is a Voice-tier feature' : 'Voice is launching soon'}
          </h1>
          <p className="mx-auto mt-2.5 max-w-xs text-[14px] leading-relaxed text-ink-muted">
            {upgrade
              ? 'A teacher on a call, with a whiteboard. Upgrade to unlock it.'
              : 'The call screen is built. We’re still connecting the line. Check back soon.'}
          </p>
          <Link
            href={upgrade ? '/pricing' : '/dashboard'}
            className="press mt-6 inline-block rounded-full bg-primary px-6 py-3 text-[14.5px] font-medium text-on-primary no-underline"
          >
            {upgrade ? 'See pricing' : 'Back to Today'}
          </Link>
          {upgrade && (
            <p className="mt-3.5 text-[13px] text-ink-muted">
              <Link href="/dashboard" className="font-medium text-primary no-underline">
                Back to Today
              </Link>
            </p>
          )}
        </div>
      </main>
    )
  }

  const phase = phaseIndex(board.phase)
  const live = screen === 'live'
  const turnLabel =
    !live ? (screen === 'connecting' ? 'Connecting…' : screen === 'ended' ? 'Call ended' : 'Ready')
    : turn === 'speaking' ? 'EWIN is explaining'
    : turn === 'listening' ? (choices?.label ? 'EWIN paused for you' : 'Your turn')
    : 'Thinking…'

  return (
    <main className={`vc ${fonts} ${live && turn === 'speaking' ? 'vc-speaking' : ''} ${live && turn === 'listening' ? 'vc-listening' : ''}`}>
      <CallArtDefs />

      <header className="vc-bar">
        <button type="button" onClick={live ? finish : () => router.push('/dashboard')} className="vc-icon-btn press" aria-label={live ? 'End call' : 'Close'}>
          <X className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-semibold leading-tight text-ink">{subjectLabel}</p>
          <p className="truncate text-[12px] leading-tight text-ink-muted">{board.title || 'Live call with EWIN'}</p>
        </div>
        {live && (
          <span className="vc-timer tnum" aria-label={`Call time ${formatElapsed(elapsed)}`}>
            <i aria-hidden />
            {formatElapsed(elapsed)}
          </span>
        )}
      </header>

      <div className="vc-plan" aria-label={`Lesson part ${phase + 1} of 5: ${PHASE_LABEL[board.phase]}`}>
        <div className="vc-segs" aria-hidden>
          {CALL_PHASES.map((p, i) => (
            <i key={p} className={i < phase ? 'vc-done' : i === phase && live ? 'vc-now' : ''} />
          ))}
        </div>
        <div className="vc-plan-label" aria-hidden>
          <b>{PHASE_LABEL[board.phase]}</b>
          <span>{phase + 1} of 5</span>
        </div>
      </div>

      <div className="vc-board-wrap">
        <Whiteboard board={board}>
          <div className="vc-tile" aria-hidden>
            <TutorTile />
            <span className="vc-tile-name">
              <span className="vc-bars"><i /><i /><i /></span>
              EWIN
            </span>
          </div>
        </Whiteboard>
      </div>

      <div className="vc-cap" aria-live="polite">
        {caption && (
          <>
            <p className={`vc-cap-who ${caption.who === 'you' ? 'vc-cap-you' : ''}`}>{caption.who === 'you' ? 'You' : 'EWIN'}</p>
            <p className="vc-cap-text">
              {caption.words.map((w, i) => (
                <span key={i} className={i < caption.shown ? 'vc-said' : undefined}>
                  {w}{' '}
                </span>
              ))}
            </p>
          </>
        )}
      </div>

      {live && choices && (
        <div className="vc-answers">
          <p className="vc-answers-label">{choices.label ?? 'Answer out loud'}{demo && ' · demo: tap to speak'}</p>
          {choices.options.map((o, i) => (
            <button key={o} type="button" className="vc-say press" onClick={() => { setChoices(null); session.current?.choose(i) }}>
              <Mic className="h-4 w-4" />
              <span>{o}</span>
            </button>
          ))}
        </div>
      )}

      <footer className="vc-dock pb-safe">
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold text-ink">{turnLabel}</p>
          {live && turn === 'speaking' && <p className="text-[11.5px] text-ink-faint">Speak or raise your hand to interrupt</p>}
          {live && turn === 'listening' && (
            <span className="vc-wave" aria-hidden><i /><i /><i /><i /><i /></span>
          )}
        </div>
        <div className="flex gap-2.5">
          <button type="button" onClick={toggleMute} disabled={!live} className="vc-round press" aria-pressed={muted} aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <button type="button" onClick={raiseHand} disabled={!live || turn !== 'speaking'} className="vc-round vc-hand press" aria-pressed={handUp} aria-label="Raise your hand to interrupt">
            <Hand className="h-5 w-5" />
          </button>
          <button type="button" onClick={finish} disabled={!live} className="vc-round vc-end press" aria-label="End call">
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </footer>

      {(screen === 'ready' || screen === 'connecting') && (
        <div className="vc-sheet">
          <div className="vc-sheet-card">
            <StartScene />
            <h1 className="mt-4 text-[20px] font-semibold text-ink">Call EWIN about {subjectLabel}</h1>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">About ten minutes. Talk out loud and follow the whiteboard.</p>
            <div className="vc-prep">
              <b><Calendar className="h-3.5 w-3.5" />Today&rsquo;s plan</b>
              {plan}
            </div>
            <button type="button" onClick={startCall} disabled={screen === 'connecting'} className="vc-btn press">
              {screen === 'connecting' ? 'Connecting…' : 'Start call'}
            </button>
            {demo && <p className="mt-3 text-center text-[12px] text-ink-faint">Development demo. Nothing from this call is saved.</p>}
          </div>
        </div>
      )}

      {screen === 'ended' && (
        <div className="vc-sheet">
          <div className="vc-sheet-card">
            <EndScene />
            <h1 className="mt-4 text-[20px] font-semibold text-ink">Good session.</h1>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">
              Call ended after {formatElapsed(Math.max(1, elapsed))}. {demo ? 'This was a demo, so nothing was saved.' : 'Here’s what EWIN saved for you.'}
            </p>
            <ul className="vc-sum">
              {summary.mastery.map((m) => (
                <li key={m.topic}><i className="bg-correct"><Check className="h-3.5 w-3.5" /></i><span><b>{m.topic}</b> is now {m.level}</span></li>
              ))}
              <li>
                <i className="vc-bg-learner"><AlertTriangle className="h-3.5 w-3.5" /></i>
                <span>
                  {summary.slips ? <><b>{summary.slips} {summary.slips === 1 ? 'slip' : 'slips'}</b>, each marked on the board. EWIN will check this topic again next time.</> : <><b>No slips.</b> EWIN will still come back to this in a few days.</>}
                </span>
              </li>
              {summary.homework.map((h, i) => (
                <li key={`h${i}`}><i className="bg-streak"><ClipboardList className="h-3.5 w-3.5" /></i><span><b>Homework:</b> {h}</span></li>
              ))}
              {summary.cards.map((c, i) => (
                <li key={`c${i}`}><i className="bg-primary"><StickyNote className="h-3.5 w-3.5" /></i><span><b>Study card saved:</b> {c}</span></li>
              ))}
            </ul>
            <Link href="/dashboard" className="vc-btn press no-underline">Back to Today</Link>
            <button type="button" onClick={() => setScreen('ready')} className="vc-btn vc-btn-quiet press">Call again</button>
          </div>
        </div>
      )}
    </main>
  )
}
