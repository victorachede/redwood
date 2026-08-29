import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subject, topic, messages, action } = body as {
      subject?: string
      topic?: string
      messages?: { role: string; content: string }[]
      action?: string
    }

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json({ error: 'subject required' }, { status: 400 })
    }

    const topicLine = topic ? ` Focus on this topic path: ${topic}.` : ''

    const formattedMessages =
      action === 'start'
        ? [
            {
              role: 'user' as const,
              content: `Start teaching me ${subject}.${topicLine} Begin with the most fundamental concept in this area and teach me step by step. After your first explanation, ask me a question to test if I understood.`,
            },
          ]
        : (messages ?? []).map((m) => ({
            role: (m.role === 'student' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.content,
          }))

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
    return NextResponse.json({ error: 'Tutor failed' }, { status: 500 })
  }
}
