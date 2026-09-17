'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { updateProfile } from '@/app/lib/auth'
import { SUBJECTS } from '@/app/lib/subjects'
import { SubjectIcon } from '@/components/SubjectIcon'
import { AuthShell } from '@/components/AuthShell'

const EXAM_OPTIONS = ['WAEC & JAMB', 'WAEC only', 'JAMB only', 'NECO']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [examFocus, setExamFocus] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<string[]>([])

  function finish(patch: { examFocus?: string; focusSubjects?: string[] }) {
    updateProfile(patch)
    router.push('/dashboard')
  }

  function toggleSubject(id: string) {
    setSubjects((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  if (step === 1) {
    return (
      <AuthShell
        title="Which exam are you sitting?"
        subtitle="Practice questions default to your board's style — you can change this anytime in Settings."
        footer={
          <button
            type="button"
            onClick={() => finish({})}
            className="font-semibold text-primary no-underline hover:underline"
          >
            Skip for now
          </button>
        }
      >
        <div className="mt-8 space-y-2.5">
          {EXAM_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setExamFocus(opt)}
              className={`press flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-[15px] font-medium transition-colors ${
                examFocus === opt
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-line bg-surface text-ink hover:border-line-strong'
              }`}
            >
              {opt}
              {examFocus === opt && <Check className="h-[18px] w-[18px]" />}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!examFocus}
          onClick={() => setStep(2)}
          className="press mt-6 w-full rounded-full bg-primary py-3.5 text-[15px] font-semibold text-on-primary transition-opacity disabled:opacity-40"
        >
          Continue
        </button>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Pick a few subjects to start with"
      subtitle="They'll show first on your dashboard — every subject stays free to study anytime."
      footer={
        <button
          type="button"
          onClick={() => finish({ examFocus: examFocus ?? undefined })}
          className="font-semibold text-primary no-underline hover:underline"
        >
          Skip for now
        </button>
      }
    >
      <div className="mt-8 grid grid-cols-2 gap-2.5">
        {SUBJECTS.map((s) => {
          const on = subjects.includes(s.id)
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleSubject(s.id)}
              className={`press flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-colors ${
                on ? 'border-primary bg-primary-soft' : 'border-line bg-surface hover:border-line-strong'
              }`}
            >
              <SubjectIcon icon={s.icon} accent={s.accent} size={30} tone="solid" />
              <span className={`text-[13.5px] font-semibold ${on ? 'text-primary' : 'text-ink'}`}>
                {s.name}
              </span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => finish({ examFocus: examFocus ?? undefined, focusSubjects: subjects })}
        className="press mt-6 w-full rounded-full bg-primary py-3.5 text-[15px] font-semibold text-on-primary"
      >
        Let&rsquo;s go
      </button>
    </AuthShell>
  )
}
