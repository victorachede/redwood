import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_TEACH = `You are Ewin, a patient AI tutor for Nigerian secondary students (WAEC & JAMB).

Teaching style:
- One concept at a time, short and clear
- After explaining, ALWAYS ask ONE check question
- Specific feedback on their answers
- Nigerian examples when helpful
- Do not dump essays; guide, do not do the work for them
- Mark questions with "Question:" prefix
- No markdown like ** or ##

Study cards:
- When the student struggles or masters a crisp fact (definition, formula, key difference), you MAY end the reply with a STUDY_CARDS block so they can revise later.
- Use this exact format at the end only (optional, 1-2 cards max):

STUDY_CARDS:
Q: short question
A: short answer
`

const SYSTEM_WORK = `You are Ewin helping a Nigerian secondary student with homework or classwork.

Your job:
- Read what they paste (questions and/or their answers)
- Grade fairly in plain language (e.g. score out of the number of parts, or strong/ok/weak per part)
- Correct mistakes and explain why
- Show a better way to write the answer without being overly long
- Suggest what to revise next
- If useful, end with STUDY_CARDS (1-2 cards) in this exact format:

STUDY_CARDS:
Q: short question
A: short answer

No markdown ** or ##. Be kind and clear.`

function demoStart(subject: string, topic?: string, focus?: string): string {
  if (focus?.trim()) {
    return `Let's look at the question you missed:\n\n"${focus.trim()}"\n\nBreak it into smaller steps and name what it is really asking.\n\nQuestion: In your own words, was this testing a definition, a calculation, or a process?\n\nSTUDY_CARDS:\nQ: What should you identify first in an exam question?\nA: What the question is really testing (definition, calc, or process).`
  }
  const area = topic || subject
  return `Welcome. We will take ${area} one small idea at a time.\n\nStart with basic terms and a simple everyday example.\n\nQuestion: What is one thing you already know about ${area}, even if it feels basic?`
}

function demoRespond(lastStudent: string): string {
  const snippet = lastStudent.slice(0, 80)
  return `Thanks for explaining. You wrote: "${snippet}${lastStudent.length > 80 ? '…' : ''}"\n\nThat shows you are thinking in your own words. Next we tighten one detail for WAEC/JAMB wording.\n\nQuestion: Give a short everyday example that matches what you just said.`
}

function demoWork(text: string): string {
  const snip = text.slice(0, 100)
  return `I read what you sent${text.length > 100 ? ' (first part shown in my notes)' : ''}.\n\nWorking from: "${snip}${text.length > 100 ? '…' : ''}"\n\nGrade (rough): You started in the right direction. Fill any missing steps and use the exact terms your teacher expects.\n\nCorrection tip: write one clear sentence for the definition, then one worked step if it is a calculation.\n\nQuestion: Reply with your improved answer for the hardest part only.\n\nSTUDY_CARDS:\nQ: What belongs in a full homework answer?\nA: The idea in your words, plus the key term or step the mark scheme looks for.`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subject, topic, messages, action, focus, documents, workKind } = body as {
      subject?: string
      topic?: string
      messages?: { role: string; content: string }[]
      action?: string
      focus?: string
      documents?: { name: string; text: string }[]
      workKind?: string
    }

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json({ error: 'Subject is required.' }, { status: 400 })
    }

    const isWork = action === 'work_start' || action === 'work_respond'
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      if (isWork) {
        const last = [...(messages ?? [])].reverse().find((m) => m.role === 'student')
        return NextResponse.json({
          response: demoWork(last?.content || ''),
          type: 'feedback',
          demo: true,
        })
      }
      if (action === 'start') {
        return NextResponse.json({
          response: demoStart(subject, topic, focus),
          type: 'question',
          demo: true,
        })
      }
      const lastStudent = [...(messages ?? [])].reverse().find((m) => m.role === 'student')
      return NextResponse.json({
        response: demoRespond(lastStudent?.content || 'your answer'),
        type: 'question',
        demo: true,
      })
    }

    const client = new Anthropic({ apiKey })

    const topicLine = topic ? ` Focus on this topic path: ${topic}.` : ''
    const focusLine =
      typeof focus === 'string' && focus.trim()
        ? ` The student got this practice question wrong and needs it explained clearly: "${focus.trim()}". Start by helping them understand that question, then teach the underlying idea and ask one check question.`
        : ''
    const docs =
      Array.isArray(documents) && documents.length
        ? documents
            .slice(0, 3)
            .map((d) => `--- Document: ${d.name} ---\n${(d.text || '').slice(0, 6000)}`)
            .join('\n\n')
        : ''
    const docsLine = docs
      ? ` The student attached study notes. Use them when helpful:\n${docs}`
      : ''

    let formattedMessages: { role: 'user' | 'assistant'; content: string }[]

    if (isWork) {
      const kind = workKind || topic || 'homework'
      if (action === 'work_start' || (messages?.length ?? 0) <= 1) {
        const first = messages?.[messages.length - 1]?.content || ''
        formattedMessages = [
          {
            role: 'user',
            content: `This is ${kind}. Please grade and correct my work.\n\n${first}`,
          },
        ]
      } else {
        formattedMessages = (messages ?? []).map((m) => ({
          role: (m.role === 'student' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.content,
        }))
      }
    } else if (action === 'start') {
      formattedMessages = [
        {
          role: 'user',
          content: focusLine
            ? `I am studying ${subject}.${topicLine}${focusLine}${docsLine}`
            : `Start teaching me ${subject}.${topicLine}${docsLine} Begin with the most fundamental concept in this area and teach me step by step. After your first explanation, ask me a question to test if I understood.`,
        },
      ]
    } else {
      formattedMessages = (messages ?? []).map((m) => ({
        role: (m.role === 'student' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      }))
      if (docsLine && formattedMessages.length) {
        const last = formattedMessages[formattedMessages.length - 1]
        if (last.role === 'user') last.content = `${last.content}\n\n${docsLine}`
      }
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: isWork ? 900 : 700,
      system: isWork ? SYSTEM_WORK : SYSTEM_TEACH,
      messages: formattedMessages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const isQuestion = text.includes('Question:')

    return NextResponse.json({
      response: text,
      type: isQuestion ? 'question' : 'feedback',
    })
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
      { status: isAuth ? 503 : 500 }
    )
  }
}
