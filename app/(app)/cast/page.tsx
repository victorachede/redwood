'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppHeader } from '@/components/ui/AppHeader'
import { Check, Mic, X } from '@/components/icons'
import { Portrait } from '@/components/cast/Portrait'
import { useCharacterVoice } from '@/components/cast/useCharacterVoice'
import {
  CAST,
  MOMENTS,
  chooseTeacher,
  teacherFor,
  type CastGroup,
  type Character,
  type Moment,
} from '@/app/lib/cast'
import { getSubject } from '@/app/lib/subjects'

/**
 * Meet the cast, and pick who teaches you.
 *
 * Opened from Me, or from the start of a voice call with ?subject=<id>, in
 * which case choosing a teacher sets who takes that subject's calls and the
 * page offers a way straight back to the call.
 */

const FILTERS: { id: 'all' | CastGroup; label: string }[] = [
  { id: 'all', label: 'Everyone' },
  { id: 'teacher', label: 'Teachers' },
  { id: 'coach', label: 'Coaches' },
  { id: 'mate', label: 'Classmates' },
]
const DIALS = ['Warmth', 'Energy', 'Humour']

export default function CastPage() {
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Character>(CAST[0])
  const [moment, setMoment] = useState<Moment>('hello')
  const [filter, setFilter] = useState<'all' | CastGroup>('all')
  // Bumped when a choice is saved, so the 'teaches your calls' state re-reads storage.
  const [saved, setSaved] = useState(0)
  const [mounted, setMounted] = useState(false)
  const voice = useCharacterVoice()

  useEffect(() => {
    // The subject comes from the URL and the current choice from storage,
    // both only readable in the browser.
    const s = new URLSearchParams(window.location.search).get('subject')
    const subject = s && getSubject(s) ? s : null
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true)
    setSubjectId(subject)
    if (subject) {
      setSelected(teacherFor(subject))
      setFilter('teacher')
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const subjectName = subjectId ? getSubject(subjectId)?.name : undefined
  // Which subject choosing this character would set: the one we came from,
  // or the teacher's own subject.
  const target = selected.group === 'teacher' ? (subjectId ?? selected.subject ?? null) : null
  const targetName = target ? getSubject(target)?.name : undefined
  // Storage is only read after mount, so the server and first client render agree.
  const isChosen = mounted && saved >= 0 && target ? teacherFor(target).id === selected.id : false

  function pick(c: Character) {
    setSelected(c)
    setMoment('hello')
    voice.say(c, c.lines.hello)
  }

  function play(m: Moment) {
    setMoment(m)
    voice.say(selected, selected.lines[m])
  }

  function choose() {
    if (!target) return
    chooseTeacher(target, selected.id)
    setSaved((n) => n + 1)
  }

  const line = selected.lines[moment].split(' ')
  const list = CAST.filter((c) => filter === 'all' || c.group === filter)

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <AppHeader
        title={subjectName ? `Who teaches ${subjectName}?` : 'The cast'}
        subtitle={subjectName ? 'Pick the teacher for your calls' : 'Sixteen voices, one tutor'}
        back={subjectId ? `/call/${subjectId}` : '/settings'}
      />

      <div className="mx-auto max-w-3xl px-4 py-5">
        <section className="ct-stage" aria-label={`${selected.name}, ${selected.role}`}>
          <div className="ct-stage-art">
            <Portrait character={selected} talking={voice.talking} className="ct-stage-portrait" />
            <p className="ct-bubble" aria-live="polite">
              {line.map((w, i) => (
                <span key={i} className={!voice.talking || i < voice.shown ? 'ct-on' : undefined}>
                  {w}{' '}
                </span>
              ))}
            </p>
          </div>

          <div className="ct-stage-info">
            <p className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: selected.dot }} aria-hidden />
              {selected.role}
            </p>
            <h2 className="mt-1.5 font-display text-[26px] font-semibold leading-tight">{selected.name}</h2>
            <p className="mt-1.5 text-[14.5px] italic text-ink-muted">&ldquo;{selected.catch}&rdquo;</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {selected.traits.map((t) => (
                <span key={t} className="rounded-full border border-line bg-paper px-2.5 py-1 text-[12px] font-semibold text-ink-muted">{t}</span>
              ))}
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-3">
              {selected.dials.map((v, i) => (
                <div key={DIALS[i]}>
                  <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-faint">{DIALS[i]}</dt>
                  <dd className="mt-1.5 flex gap-1" aria-label={`${v} out of 5`}>
                    {[1, 2, 3, 4, 5].map((k) => (
                      <i key={k} className={`h-1.5 flex-1 rounded-full ${k <= v ? 'bg-primary' : 'bg-line'}`} aria-hidden />
                    ))}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-correct"><Check className="h-3.5 w-3.5" />Sounds like</p>
                <ul className="mt-1.5 space-y-1 text-[13px] leading-snug text-ink-muted">{selected.yes.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-wrong"><X className="h-3.5 w-3.5" />Never</p>
                <ul className="mt-1.5 space-y-1 text-[13px] leading-snug text-ink-muted">{selected.no.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Hear them">
              {MOMENTS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => play(m.id)}
                  aria-pressed={moment === m.id}
                  className="ct-moment press"
                >
                  {m.label}
                </button>
              ))}
            </div>

            {target && targetName && (
              <div className="mt-4 flex flex-wrap gap-2">
                {isChosen ? (
                  <span className="ct-chosen"><Check className="h-4 w-4" />Teaches your {targetName} calls</span>
                ) : (
                  <button type="button" onClick={choose} className="ct-choose press">
                    Make {selected.name} my {targetName} teacher
                  </button>
                )}
                {subjectId && isChosen && (
                  <Link href={`/call/${subjectId}`} className="ct-call press no-underline">
                    <Mic className="h-4 w-4" />Back to the call
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-1.5" role="group" aria-label="Show">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className="ct-filter press">
              {f.label}
            </button>
          ))}
        </div>

        <ul className="ct-grid">
          {list.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => pick(c)} aria-pressed={selected.id === c.id} className="ct-card">
                <Portrait character={c} className="ct-card-portrait" />
                <span className="block px-3 pb-3 pt-2.5">
                  <b className="block text-[14px] font-semibold text-ink">{c.name}</b>
                  <span className="mt-0.5 block text-[12px] leading-snug text-ink-faint">{c.role}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-[12.5px] leading-relaxed text-ink-faint">
          Every character is a voice of EWIN, the same AI tutor, and will say so if you ask. They all follow the same rules:
          they point at the step that went wrong, give hints rather than answers, and never laugh at you. The preview uses
          your device&rsquo;s own voice; on calls each teacher has a voice of their own.
        </p>
      </div>
    </main>
  )
}
