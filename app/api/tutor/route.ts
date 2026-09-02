import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { encodeEvent, type TutorEvent } from '@/app/lib/tutorProtocol'
import { TUTOR_TOOLS, WORK_TOOLS } from '@/app/lib/tutorTools'

export const maxDuration = 60

/* ═══════════════════════════════════════════════════════════════════════════
   System prompts

   Split into a static half (cached) and a volatile half (the learner profile,
   added per request in Phase 2). Only the static half carries cache_control.
   ═══════════════════════════════════════════════════════════════════════════ */

const TEACH_RULES = `You are Ewin, a tutor for Nigerian secondary students preparing for WAEC, NECO and JAMB.

How you teach:
- One idea per reply. Two to four sentences, then a check question. Never a wall of text.
- End every explanation with ONE question on its own line, prefixed exactly "Question:".
- Skip praise words — no "Great", "Excellent", "Well done", "Perfect". React to the idea, not the student.
- Feedback names specifics: what exactly was right, what exactly was wrong, and why. Never "good try".
- If they are wrong, do not simply give the answer. Point at the step that broke and ask again.
- Nigerian examples when they fit naturally. Never forced.
- Plain text only. No markdown, no ** or ##.

Exam awareness:
- WAEC and NECO reward method marks and correct units. Say so when it matters.
- JAMB is multiple choice under time pressure. Mention shortcuts where they are real.

Using your tools:
- They are for real moments, not decoration. A reply with no tool call is normal and usually correct.
- record_mastery is your memory. When their answers show you where they stand on a topic, record it — that is how you will know next session what to revisit.
- Prefer teaching in prose. Reach for a diagram only when a picture is genuinely faster than a sentence.`

const WORK_RULES = `You are Ewin, marking a Nigerian secondary student's homework or classwork.

How you mark:
- Read what they sent — typed, pasted, or photographed — and grade it fairly.
- Give a score in plain language: out of the number of parts, or strong/ok/weak per part.
- Name exactly what is correct and exactly what is wrong. No vague phrases.
- Show a better way to write the answer, briefly. Do not rewrite the whole thing for them.
- Say what to revise next, specifically.
- If a photo is unreadable in part, say which part and ask for a clearer shot of just that bit.
- Skip praise words. Plain text only, no markdown.`

/* ═══════════════════════════════════════════════════════════════════════════
   Demo fallbacks (no API key)
   ═══════════════════════════════════════════════════════════════════════════ */

function demoStart(subject: string, topic?: string, focus?: string): string {
  if (focus?.trim()) {
    return `Let's look at the question you missed:\n\n"${focus.trim()}"\n\nBreak it into steps and name what it is really asking.\n\nQuestion: Was this testing a definition, a calculation, or a process?`
  }
  const area = topic || subject
  return `We will take ${area} one small idea at a time.\n\nStart with the basic terms and one everyday example.\n\nQuestion: What is one thing you already know about ${area}, even if it feels basic?`
}

function demoRespond(last: string): string {
  const snip = last.slice(0, 80)
  return `You wrote: "${snip}${last.length > 80 ? '…' : ''}"\n\nThat is your own wording, which is what we want. Now we tighten one detail for exam phrasing.\n\nQuestion: Give a short everyday example that matches what you just said.`
}

function demoWork(text: string): string {
  const snip = text.slice(0, 100)
  return `Working from: "${snip}${text.length > 100 ? '…' : ''}"\n\nGrade (rough): the direction is right. Fill the missing steps and use the exact terms the mark scheme expects.\n\nQuestion: Send your improved answer for the hardest part only.`
}

function demoStream(text: string): Response {
  const stream = new ReadableStream({
    start(controller) {
      // Chunked so the client's typing behaviour is exercised in demo mode too
      for (const part of text.match(/[\s\S]{1,24}/g) ?? [text]) {
        controller.enqueue(encodeEvent({ t: 'text', v: part }))
      }
      controller.enqueue(encodeEvent({ t: 'done' }))
      controller.close()
    },
  })
  return ndjson(stream)
}

function ndjson(body: ReadableStream): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  })
}

/* ═══════════════════════════════════════════════════════════════════════════
   Request shape
   ═══════════════════════════════════════════════════════════════════════════ */

type ImageAttachment = { mediaType: string; data: string }

type IncomingMessage = {
  role: string
  content: string
  images?: ImageAttachment[]
}

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

function imageBlocks(images?: ImageAttachment[]): Anthropic.ImageBlockParam[] {
  if (!Array.isArray(images)) return []
  return images
    .filter((img) => img?.data && ALLOWED_IMAGE_TYPES.has(img.mediaType))
    .slice(0, 4)
    .map((img) => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: img.mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
        data: img.data,
      },
    }))
}

/** Text + any attached images, as a content block array. */
function toContent(m: IncomingMessage): string | Anthropic.ContentBlockParam[] {
  const imgs = imageBlocks(m.images)
  if (imgs.length === 0) return m.content
  // Images first reads better for the model than trailing them after prose.
  return [...imgs, { type: 'text', text: m.content || 'Here is my work.' }]
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      subject,
      topic,
      messages,
      action,
      focus,
      documents,
      workKind,
      clarifyUsed,
    } = body as {
      subject?: string
      topic?: string
      messages?: IncomingMessage[]
      action?: string
      focus?: string
      documents?: { name: string; text: string }[]
      workKind?: string
      clarifyUsed?: boolean
    }

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json({ error: 'Subject is required.' }, { status: 400 })
    }

    const isWork = action === 'work_start' || action === 'work_respond'
    const apiKey = process.env.ANTHROPIC_API_KEY
    const history = messages ?? []

    /* ── Demo mode ──────────────────────────────────────────────────────── */
    if (!apiKey) {
      const lastStudent = [...history].reverse().find((m) => m.role === 'student')
      if (isWork) return demoStream(demoWork(lastStudent?.content || ''))
      if (action === 'start') return demoStream(demoStart(subject, topic, focus))
      return demoStream(demoRespond(lastStudent?.content || 'your answer'))
    }

    const client = new Anthropic({ apiKey })

    /* ── Build messages ─────────────────────────────────────────────────── */
    const topicLine = topic ? ` Focus on this topic: ${topic}.` : ''
    const focusLine =
      typeof focus === 'string' && focus.trim()
        ? ` They got this practice question wrong and need it explained: "${focus.trim()}". Start there, then teach the underlying idea and check them on it.`
        : ''
    const docs =
      Array.isArray(documents) && documents.length
        ? documents
            .slice(0, 3)
            .map((d) => `--- ${d.name} ---\n${(d.text || '').slice(0, 6000)}`)
            .join('\n\n')
        : ''
    const docsLine = docs ? `\n\nThey attached notes. Use them when relevant:\n${docs}` : ''

    let formatted: Anthropic.MessageParam[]

    if (isWork) {
      const kind = workKind || topic || 'homework'
      if (action === 'work_start' || history.length <= 1) {
        const first = history[history.length - 1]
        formatted = [
          {
            role: 'user',
            content: (() => {
              const imgs = imageBlocks(first?.images)
              const text = `This is my ${kind}. Please grade and correct it.\n\n${first?.content ?? ''}`
              return imgs.length ? [...imgs, { type: 'text' as const, text }] : text
            })(),
          },
        ]
      } else {
        formatted = history.map((m) => ({
          role: (m.role === 'student' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: toContent(m),
        }))
      }
    } else if (action === 'start') {
      formatted = [
        {
          role: 'user',
          content: focusLine
            ? `I am studying ${subject}.${topicLine}${focusLine}${docsLine}`
            : `Teach me ${subject}.${topicLine}${docsLine}\n\nBegin with the most fundamental idea here, then check I understood.`,
        },
      ]
    } else {
      formatted = history.map((m) => ({
        role: (m.role === 'student' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: toContent(m),
      }))
      if (docsLine && formatted.length) {
        const last = formatted[formatted.length - 1]
        if (last.role === 'user' && typeof last.content === 'string') {
          last.content = `${last.content}${docsLine}`
        }
      }
    }

    /* ── Clarifying-question budget ─────────────────────────────────────────
       A prompt instruction alone will not hold this. Allow the tool only at
       the very start of a conversation, or when the student's message is too
       short to act on — and only once per session. Calls outside the budget
       are dropped below rather than forwarded to the UI.                     */
    const lastStudentText =
      [...history].reverse().find((m) => m.role === 'student')?.content ?? ''
    const clarifyAllowed =
      !isWork &&
      !clarifyUsed &&
      (history.length <= 2 || lastStudentText.trim().length < 25)

    const tools = isWork
      ? WORK_TOOLS
      : TUTOR_TOOLS.filter((t) => clarifyAllowed || t.name !== 'ask_clarifying')

    /* ── Stream ─────────────────────────────────────────────────────────── */
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: isWork ? 1200 : 900,
      temperature: 0.6,
      system: [
        {
          type: 'text',
          text: isWork ? WORK_RULES : TEACH_RULES,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools,
      messages: formatted,
    })

    const readable = new ReadableStream({
      async start(controller) {
        const send = (e: TutorEvent) => controller.enqueue(encodeEvent(e))

        // tool_use arrives as a block header then input_json_delta fragments;
        // hold each block until content_block_stop so partial JSON never ships.
        const pending = new Map<number, { name: string; json: string }>()

        try {
          for await (const event of stream) {
            if (event.type === 'content_block_start') {
              if (event.content_block.type === 'tool_use') {
                pending.set(event.index, { name: event.content_block.name, json: '' })
              }
              continue
            }

            if (event.type === 'content_block_delta') {
              if (event.delta.type === 'text_delta') {
                send({ t: 'text', v: event.delta.text })
              } else if (event.delta.type === 'input_json_delta') {
                const p = pending.get(event.index)
                if (p) p.json += event.delta.partial_json
              }
              continue
            }

            if (event.type === 'content_block_stop') {
              const p = pending.get(event.index)
              if (!p) continue
              pending.delete(event.index)
              try {
                const input = p.json ? JSON.parse(p.json) : {}
                send({ t: 'tool', name: p.name as never, input })
              } catch {
                /* drop a tool call we cannot parse rather than break the turn */
              }
            }
          }

          const final = await stream.finalMessage().catch(() => null)
          send({
            t: 'done',
            usage: final
              ? { in: final.usage.input_tokens, out: final.usage.output_tokens }
              : undefined,
          })
          controller.close()
        } catch (err) {
          // Once bytes are on the wire the route's try/catch can no longer
          // respond, so the failure has to travel as an envelope.
          const message =
            err instanceof Error ? err.message : 'The tutor stopped unexpectedly.'
          send({ t: 'error', message })
          controller.close()
        }
      },
    })

    return ndjson(readable)
  } catch (err) {
    console.error('tutor error', err)
    const message = err instanceof Error ? err.message : 'Tutor failed'
    const isAuth = /api.?key|authentication|401|403/i.test(message)
    return NextResponse.json(
      {
        error: isAuth
          ? 'Tutor API key is missing or invalid. Add ANTHROPIC_API_KEY in Vercel.'
          : 'Tutor could not reply right now. Try again in a moment.',
      },
      { status: isAuth ? 503 : 500 },
    )
  }
}
