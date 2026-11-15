'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Character } from '@/app/lib/cast'

/**
 * Lets a cast member say a line out loud with the device's own speech voice,
 * revealing the words as they go and reporting while they are talking.
 *
 * This is the preview voice. Voice calls use the voice provider instead,
 * where each character gets a chosen voice. Where the browser has no speech
 * (or it never starts, as in some embedded views), the words still appear and
 * the mouth still moves for about as long as the line would take.
 */
export function useCharacterVoice() {
  const [talking, setTalking] = useState(false)
  const [shown, setShown] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const stop = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setTalking(false)
    try {
      window.speechSynthesis?.cancel()
    } catch {
      /* no speech engine */
    }
  }, [])

  useEffect(() => stop, [stop])

  const say = useCallback(
    (character: Character, text: string) => {
      stop()
      const words = text.split(' ')
      const perWord = 330 / character.voice.rate
      setShown(0)
      setTalking(true)
      words.forEach((_, i) => timers.current.push(setTimeout(() => setShown(i + 1), perWord * (i + 1))))
      // Upper bound, in case the speech engine never reports that it ended.
      timers.current.push(setTimeout(() => setTalking(false), words.length * perWord + 4000))

      const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
      if (!synth) {
        timers.current.push(setTimeout(() => setTalking(false), words.length * perWord + 200))
        return
      }
      try {
        const u = new SpeechSynthesisUtterance(text)
        u.pitch = character.voice.pitch
        u.rate = character.voice.rate
        const voices = synth.getVoices()
        u.voice =
          voices.find((v) => /en[-_]NG/i.test(v.lang)) ??
          voices.find((v) => /en[-_](GB|ZA|KE)/i.test(v.lang)) ??
          voices.find((v) => /^en/i.test(v.lang)) ??
          null
        u.onend = () => {
          setShown(words.length)
          setTalking(false)
        }
        synth.speak(u)
      } catch {
        timers.current.push(setTimeout(() => setTalking(false), words.length * perWord + 200))
      }
    },
    [stop],
  )

  return { say, stop, talking, shown }
}
