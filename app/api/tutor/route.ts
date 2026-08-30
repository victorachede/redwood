import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM = `You are Ewin, a patient and excellent AI tutor for Nigerian secondary school students preparing for WAEC and JAMB exams.

Teaching style:
- Teach one concept at a time, clearly and simply
- After explaining a concept, ALWAYS ask ONE question to test understanding
- When the student answers, give specific feedback — tell them what's right, correct what's wrong, then explain why
- Use Nigerian examples and context where helpful
- Never give away answers — guide through questions (Socratic method)
- Keep explanations short and digestible, not walls of text
- Adapt difficulty based on how the student is performing

Response format:
- For lessons: explain the concept clearly in 3-5 sentences, then end with a test question
- For feedback: acknowledge their answer specifically, correct/affirm, then either go deeper or move to next concept
- Mark questions clearly with "Question:" prefix
- Never use markdown formatting like ** or ##`

function demoStart(subject: string, topic?: string, focus?: string): string {
  if (focus?.trim()) {
    return `Let's look at the question you missed:\n\n"${focus.trim()}"\n\nThe key is to break it into smaller steps and name what the question is really asking. Once that is clear, the options become easier to judge.\n\nQuestion: In your own words, what was this question testing — a definition, a calculation, or a process?`
  }
  const area = topic || subject
  return `Welcome. We will take ${area} one small idea at a time.\n\nStart with the foundation: know the basic terms and what they mean in a simple situation (for example, something you see at home or in class). Do not rush to hard exam questions yet.\n\nQuestion: What is one thing you already know about ${area}, even if it feels basic?`
}

function demoRespond(lastStudent: string): string {
  const snippet = lastStudent.slice(0, 80)
  return `Thanks for explaining that. You wrote: "${snippet}${lastStudent.length > 80 ? '…' : ''}"\n\nThat shows you are thinking in your own words — keep that habit. Next we will tighten one detail so it matches how WAEC/JAMB word the idea.\n\nQuestion: Can you give a short example from everyday life that matches what you just said?`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subject, topic, messages, action, focus, documents } = body as {
      subject?: string
      topic?: string
      messages?: { role: string; content: string }[]
      action?: string
      focus?: string
      documents?: { name: string; text: string }[]
    }

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json({ error: 'Subject is required.' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // Demo path so the chat UI works on Vercel before the key is set
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
            .map(
              (d) =>
                `--- Document: ${d.name} ---\n${(d.text || '').slice(0, 6000)}`
            )
            .join('\n\n')
        : ''
    const docsLine = docs
      ? ` The student attached study notes. Use them when helpful:\n${docs}`
      : ''

    const formattedMessages =
      action === 'start'
        ? [
            {
              role: 'user' as const,
              content: focusLine
                ? `I am studying ${subject}.${topicLine}${focusLine}${docsLine}`
                : `Start teaching me ${subject}.${topicLine}${docsLine} Begin with the most fundamental concept in this area and teach me step by step. After your first explanation, ask me a question to test if I understood.`,
            },
          ]
        : (() => {
            const mapped = (messages ?? []).map((m) => ({
              role: (m.role === 'student' ? 'user' : 'assistant') as 'user' | 'assistant',
              content: m.content,
            }))
            if (docsLine && mapped.length) {
              const last = mapped[mapped.length - 1]
              if (last.role === 'user') {
                last.content = `${last.content}\n\n${docsLine}`
              }
            }
            return mapped
          })()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: SYSTEM,
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
    const message =
      err instanceof Error ? err.message : 'Tutor failed'
    const isAuth =
      /api.?key|authentication|401|403/i.test(message)
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
