'use client'
import { useState, useRef, useEffect, use } from 'react'

type Message = {
  role: 'tutor' | 'student'
  content: string
  type?: 'lesson' | 'question' | 'feedback' | 'response'
}

export default function LearnPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params)
  const subjectLabel = subject.charAt(0).toUpperCase() + subject.slice(1).replace(/-/g, ' ')

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function startSession() {
    setStarted(true)
    setLoading(true)
    const res = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, messages: [], action: 'start' }),
    })
    const data = await res.json()
    setMessages([{ role: 'tutor', content: data.response, type: 'lesson' }])
    setLoading(false)
  }

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'student', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    const res = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, messages: updated, action: 'respond' }),
    })
    const data = await res.json()
    setMessages([...updated, { role: 'tutor', content: data.response, type: data.type }])
    setLoading(false)
  }

  if (!started) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <a href="/" style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.15em', color: 'var(--accent)', textTransform: 'uppercase', textDecoration: 'none' }}>← Ewin</a>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>{subjectLabel}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>
            Ewin will teach you a concept, then test your understanding. Answer in your own words.
          </p>
          <button
            onClick={startSession}
            style={{
              padding: '14px 32px',
              background: 'var(--accent)',
              color: '#0a0f0d',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Begin Session
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a href="/" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>← Back</a>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '14px' }}>{subjectLabel}</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '680px', width: '100%', margin: '0 auto' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: m.role === 'student' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '14px 16px',
              borderRadius: m.role === 'student' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'student' ? 'var(--accent-muted)' : 'var(--bg-card)',
              border: m.role === 'tutor' ? `1px solid ${m.type === 'question' ? 'var(--accent-dim)' : 'var(--border)'}` : 'none',
              color: 'var(--text-primary)',
              fontSize: '15px',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
            }}>
              {m.type === 'question' && (
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px' }}>Question</div>
              )}
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--accent)',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    opacity: 0.6,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', maxWidth: '680px', width: '100%', margin: '0 auto', alignSelf: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type your answer..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '15px',
              outline: 'none',
            }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            style={{
              padding: '12px 20px',
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--border)',
              color: input.trim() && !loading ? '#0a0f0d' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </main>
  )
}
