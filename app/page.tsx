'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SUBJECTS = [
  { id: 'mathematics', label: 'Mathematics', icon: '∑' },
  { id: 'english', label: 'English Language', icon: 'Aa' },
  { id: 'chemistry', label: 'Chemistry', icon: '⚗' },
  { id: 'physics', label: 'Physics', icon: '⚡' },
  { id: 'biology', label: 'Biology', icon: '🧬' },
  { id: 'economics', label: 'Economics', icon: '📈' },
  { id: 'government', label: 'Government', icon: '🏛' },
  { id: 'literature', label: 'Literature', icon: '📖' },
]

export default function Home() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  function start() {
    if (!selected) return
    router.push(`/learn/${selected}`)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '560px', width: '100%' }}>
        {/* Logo */}
        <div style={{ marginBottom: '48px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.15em', color: 'var(--accent)', textTransform: 'uppercase' }}>Ewin</span>
          <h1 style={{ fontSize: '36px', fontWeight: 700, lineHeight: 1.15, marginTop: '8px', color: 'var(--text-primary)' }}>
            Your personal tutor.<br />
            <span style={{ color: 'var(--accent)' }}>Available 24/7.</span>
          </h1>
          <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
            Pick a subject. Ewin teaches, tests, and adapts to how you learn.
            Built for WAEC, NECO, and JAMB.
          </p>
        </div>

        {/* Subject Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          {SUBJECTS.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              style={{
                background: selected === s.id ? 'var(--bg-hover)' : 'var(--bg-card)',
                border: `1px solid ${selected === s.id ? 'var(--accent-dim)' : 'var(--border)'}`,
                borderRadius: '10px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                color: selected === s.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: 500,
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={start}
          disabled={!selected}
          style={{
            width: '100%',
            padding: '14px',
            background: selected ? 'var(--accent)' : 'var(--border)',
            color: selected ? '#0a0f0d' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: selected ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
            letterSpacing: '0.01em',
          }}
        >
          {selected ? `Start ${SUBJECTS.find(s => s.id === selected)?.label}` : 'Pick a subject to start'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          No account needed. Just start learning.
        </p>
      </div>
    </main>
  )
}
