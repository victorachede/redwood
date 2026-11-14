/**
 * What the call screen listens to.
 *
 * The screen never talks to a voice provider directly. It starts a
 * CallSession and renders the events that come out of it: the tutor's words,
 * the student's words as they are heard, whose turn it is, and tool calls for
 * the whiteboard. The live Deepgram session (once DEEPGRAM_API_KEY exists, see
 * app/api/voice/token/route.ts) emits exactly these events, so nothing on the
 * screen changes when it lands.
 *
 * Until then there is a scripted demo lesson for development, so the screen
 * can be seen and tested end to end. It is only reachable outside production
 * (see the call page) and it never pretends to be a real call to a student.
 */

export type CallTurn = 'speaking' | 'listening' | 'thinking'

export type CallEvent =
  | { t: 'say'; text: string }
  | { t: 'heard'; text: string }
  | { t: 'turn'; turn: CallTurn }
  | { t: 'tool'; name: string; input: unknown }
  /** Demo only: what the student could say, shown as tappable answers. */
  | { t: 'choices'; options: string[]; label?: string }
  /** Demo only: a nudge shown in the caption while the student is quiet. */
  | { t: 'nudge'; text: string }
  | { t: 'ended' }

export interface CallSession {
  start(): void
  /** The student cut in: stop talking and hand over the turn. */
  interrupt(): void
  setMuted(muted: boolean): void
  /** Demo only: the student picked one of the offered answers. */
  choose(index: number): void
  end(): void
}

/** How long the screen spends on each word of a caption, in ms. */
export const WORD_MS = 250

/* ═══════════════════════════════════════════════════════════════════════════
   Demo session
   ═══════════════════════════════════════════════════════════════════════════ */

class Aborted extends Error {}

type Cue = [atWord: number, tool: string, input: unknown]

/**
 * One scripted lesson on moving terms across the equals sign, with the same
 * branches a real tutor would take: a wrong expansion, the classic sign slip,
 * a check question, and an interruption at any point while it is talking.
 */
export function createDemoSession(onEvent: (e: CallEvent) => void, name = 'there'): CallSession {
  let alive = true
  let interrupted = false
  let speed = 1
  let pick: ((i: number) => void) | null = null

  const emit = (e: CallEvent) => {
    if (alive) onEvent(e)
  }
  const sleep = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      setTimeout(() => (alive ? resolve() : reject(new Aborted())), ms)
    })

  function choose(options: string[], label?: string, nudge?: string): Promise<number> {
    emit({ t: 'turn', turn: 'listening' })
    emit({ t: 'choices', options, label })
    const timer = nudge ? setTimeout(() => emit({ t: 'nudge', text: nudge }), 8000) : null
    return new Promise((resolve) => {
      pick = (i) => {
        if (timer) clearTimeout(timer)
        pick = null
        resolve(i)
      }
    })
  }

  async function hear(text: string) {
    emit({ t: 'heard', text })
    await sleep(text.split(' ').length * 200 + 500)
    emit({ t: 'turn', turn: 'thinking' })
    await sleep(600)
  }

  async function answer(options: string[], nudge?: string): Promise<number> {
    const i = await choose(options, undefined, nudge)
    await hear(options[i])
    return i
  }

  async function sayOnce(text: string, cues: Cue[], fired: Set<number>): Promise<boolean> {
    emit({ t: 'turn', turn: 'speaking' })
    emit({ t: 'say', text })
    const words = text.split(' ').length
    for (let w = 0; w <= words; w++) {
      if (interrupted) return false
      cues.forEach((c, i) => {
        if (c[0] === w && !fired.has(i)) {
          fired.add(i)
          emit({ t: 'tool', name: c[1], input: c[2] })
        }
      })
      await sleep(WORD_MS * speed)
    }
    return true
  }

  async function say(text: string, cues: Cue[] = []) {
    const fired = new Set<number>()
    for (;;) {
      if (await sayOnce(text, cues, fired)) {
        await sleep(450)
        return
      }
      // Cut in: stop, give the floor, then do what was asked.
      interrupted = false
      emit({ t: 'say', text: 'Yes? Go ahead.' })
      const i = await choose(['Say that again', 'Slower, please', 'Carry on'], 'Say')
      await hear(['Say that again', 'Slower, please', 'Carry on'][i])
      if (i === 1) speed = 1.6
      if (i === 2) {
        cues.forEach((c, k) => {
          if (!fired.has(k)) emit({ t: 'tool', name: c[1], input: c[2] })
        })
        return
      }
    }
  }

  const tool = (name: string, input: unknown) => emit({ t: 'tool', name, input })

  async function lesson() {
    tool('set_phase', { phase: 'warm_up' })
    await say(`Hello ${name}. Last time you got stuck moving terms across the equals sign, so let’s fix that properly today.`)

    tool('set_phase', { phase: 'teach' })
    await say('Here’s the one rule. When a term crosses the equals sign, its sign flips. Plus becomes minus. Minus becomes plus.', [
      [0, 'clear_board', { title: 'Moving terms across =' }],
      [8, 'write_step', { id: 'e1', text: 'x + 5 = 12' }],
      [15, 'write_step', { id: 'e2', text: 'x = 12 − 5' }],
      [17, 'mark_step', { id: 'e2', circle: '− 5' }],
      [20, 'mark_step', { id: 'e2', note: '+5 becomes −5' }],
    ])
    await say('So x is seven. Like sharing ₦12 when ₦5 is already spoken for.', [
      [0, 'write_step', { id: 'e3', text: 'x = 7' }],
      [4, 'mark_step', { id: 'e3', mark: 'tick' }],
    ])

    tool('set_phase', { phase: 'your_turn' })
    await say('Your turn. Solve two bracket x minus three, equals x plus four. Start by opening the bracket. Take your time.', [
      [0, 'clear_board', { title: 'Your turn' }],
      [3, 'write_step', { id: 'q', text: '2(x − 3) = x + 4', by: 'question' }],
    ])

    for (let attempt = 0; ; attempt++) {
      const a = await answer(['2x − 6 = x + 4', '2x − 3 = x + 4'], 'Take your time. A hint: the 2 multiplies everything inside the bracket.')
      if (a === 0) {
        tool('write_step', { id: 'y1', text: '2x − 6 = x + 4', by: 'student' })
        tool('mark_step', { id: 'y1', mark: 'tick' })
        await say('Good. The 2 multiplied both terms. Now collect the x terms on one side and the numbers on the other. What do you get?')
        break
      }
      tool('write_step', { id: `y0-${attempt}`, text: '2x − 3 = x + 4', by: 'student' })
      tool('mark_step', { id: `y0-${attempt}`, circle: '− 3', mark: 'cross' })
      await say('Look at this part. The 2 multiplies everything in the bracket, including the 3. Two times three is?')
      tool('mark_step', { id: `y0-${attempt}`, strike: true })
    }

    for (let attempt = 0; ; attempt++) {
      const b = await answer(['x = 10', 'x = −2'], 'No rush. Move the x from the right first, then the minus six.')
      if (b === 0) {
        tool('write_step', { id: 'y2', text: '2x − x = 4 + 6', by: 'student' })
        tool('write_step', { id: 'y3', text: 'x = 10', by: 'student' })
        tool('mark_step', { id: 'y3', mark: 'tick' })
        await say('That’s right, x equals ten. You flipped the sign of the six, which is exactly the step that caught you last time.')
        break
      }
      tool('write_step', { id: `w2-${attempt}`, text: '2x − x = 4 − 6', by: 'student' })
      tool('write_step', { id: `w3-${attempt}`, text: 'x = −2', by: 'student' })
      tool('mark_step', { id: `w3-${attempt}`, mark: 'cross' })
      await say('Let’s stop on this line. The minus six crossed the equals sign. What should happen to its sign?', [
        [2, 'mark_step', { id: `w2-${attempt}`, circle: '− 6' }],
        [4, 'mark_step', { id: `w2-${attempt}`, note: 'sign?' }],
      ])
      const c = await answer(['It becomes plus six', 'It stays minus six'], 'Think about the rule we wrote at the start.')
      if (c === 1) await say('Not quite. Crossing the equals sign flips the sign, so minus six arrives as plus six. Try the whole step again.')
      else await say('Yes. So redo it with plus six. What is x?')
      tool('mark_step', { id: `w2-${attempt}`, strike: true })
      tool('mark_step', { id: `w3-${attempt}`, strike: true })
    }

    tool('set_phase', { phase: 'check' })
    await say('One quick check, so I know it wasn’t luck. Why did the six become positive?')
    for (;;) {
      const d = await answer(['Because it crossed the equals sign', 'Because six is bigger than four'], 'Which rule did we write first?')
      if (d === 0) {
        await say('Exactly. That’s the rule, and you applied it.')
        break
      }
      await say('No, the size doesn’t matter here. Look at the board again. What did the six do?')
    }

    tool('set_phase', { phase: 'recap', recap: 'When a term crosses =, its sign flips: + becomes −, and − becomes +.' })
    tool('record_mastery', { topic: 'Moving terms across the equals sign', level: 'solid' })
    tool('assign_work', { kind: 'homework', brief: 'Three linear equations where a term crosses the equals sign', topic: 'Linear equations' })
    tool('save_study_card', { front: 'What happens to a term when it crosses the equals sign?', back: 'Its sign flips: + becomes −, and − becomes +.' })
    await say('To wrap up: one rule today. I’ve added three questions like this to your Today list, and saved the rule as a study card.')
    await sleep(600)
    emit({ t: 'ended' })
  }

  return {
    start() {
      lesson().catch((e) => {
        if (!(e instanceof Aborted)) throw e
      })
    },
    interrupt() {
      interrupted = true
    },
    setMuted() {
      /* nothing to mute in a scripted lesson */
    },
    choose(i: number) {
      pick?.(i)
    },
    end() {
      alive = false
    },
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Live session
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Opens a real voice call. Throws when voice is not available, and the screen
 * says so honestly instead of pretending a call has started.
 *
 * Once /api/voice/token returns a Deepgram Voice Agent session (Claude as the
 * thinking model, buildCallPrompt() as its instructions, CALL_TOOLS as its
 * tools), this is where the browser opens that session, streams the mic in,
 * plays the voice back, and turns its messages into CallEvents: transcript
 * text into 'say' and 'heard', turn changes into 'turn', and function calls
 * into 'tool'.
 */
export async function connectLiveSession(subjectId: string, onEvent: (e: CallEvent) => void): Promise<CallSession> {
  void onEvent
  const res = await fetch('/api/voice/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: subjectId }),
  })
  if (!res.ok) throw new Error('voice_unavailable')
  throw new Error('voice_client_not_built')
}
