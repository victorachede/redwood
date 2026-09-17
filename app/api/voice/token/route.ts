import { NextResponse } from 'next/server'

/**
 * Mints a short-lived Deepgram Voice Agent session so the browser never
 * holds the real API key. Same "not configured" pattern as the Paystack
 * routes: without DEEPGRAM_API_KEY set, this honestly reports the voice
 * feature as unavailable instead of pretending a call can start.
 *
 * Once the key exists, this is where the actual Deepgram session request
 * goes — Claude as the `think` provider (ANTHROPIC_API_KEY, BYOM), the same
 * tool schemas as tutorTools.ts, and the learner profile for context.
 */
export async function POST() {
  if (!process.env.DEEPGRAM_API_KEY) {
    return NextResponse.json(
      { error: 'not_configured', message: 'Voice tutoring is not connected yet.' },
      { status: 501 },
    )
  }

  // TODO once DEEPGRAM_API_KEY is set: request a Deepgram Voice Agent
  // session token, configured with Claude (BYOM) as the think provider and
  // the tutorTools.ts tool schemas, and return it to the client.
  return NextResponse.json(
    { error: 'not_implemented', message: 'Voice session wiring is not finished yet.' },
    { status: 501 },
  )
}
