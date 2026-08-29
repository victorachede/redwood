import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are Ewin, an expert AI tutor for Nigerian secondary school students preparing for WAEC, NECO, and JAMB exams.

Your teaching style:
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
  const { subject, messages, action } = await req.json()

  const formattedMessages = action === 'start'
    ? [{ role: 'user' as const, content: `Start teaching me ${subject}. Begin with the most fundamental concept and teach me step by step. After your first explanation, ask me a question to test if I understood.` }]
    : messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'student' ? 'user' as const : 'assistant' as const,
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
}
