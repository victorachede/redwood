/**
 * Illustrations for the voice call.
 *
 * Drawn as inline SVG in a flat editorial style, lit from the upper left, so
 * they stay sharp at any size and cost no network request. Colours are
 * literal rather than theme tokens for the same reason as the mascots: a
 * person drawn in theme colours stops looking like a person.
 *
 * The shared parts (gradients, the grain texture) are defined once in
 * <CallArtDefs/>. The teacher is drawn by the cast's own drawCharacter, so the
 * person in the start scene is the same person as in the call tile.
 */

import type { Look } from '@/app/lib/cast'
import { drawCharacterParts } from '@/components/cast/drawCharacter'

/** Render once per page, before any of the scenes below. */
export function CallArtDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <linearGradient id="vc-g-wall-cool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9eef6"/><stop offset="1" stopColor="#dbe2ee"/></linearGradient>
        <linearGradient id="vc-g-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".55"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/></linearGradient>
        <filter id="vc-grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n"/>
              <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.09 0"/>
              <feComposite in2="SourceGraphic" operator="in"/>
            </filter>
        <symbol id="vc-spark" viewBox="0 0 24 24"><path d="M12 0 L13.6 10.4 L24 12 L13.6 13.6 L12 24 L10.4 13.6 L0 12 L10.4 10.4 Z"/></symbol>
      </defs>
    </svg>
  )
}

const MATH = 'var(--font-math), Cambria Math, Times New Roman, serif'

/** Before the call: the student's teacher at a whiteboard with a rule on it. */
export function StartScene({ teacher }: { teacher: Look }) {
  return (
    <svg viewBox="0 0 360 180" className="block h-auto w-full rounded-2xl" aria-hidden>
      <rect width="360" height="180" fill="url(#vc-g-wall-cool)" />
      <path d="M250 0 L330 0 L240 180 L160 180 Z" fill="url(#vc-g-light)" opacity=".7" />
      <rect x="150" y="22" width="186" height="112" rx="6" fill="#ffffff" />
      <rect x="150" y="22" width="186" height="112" rx="6" fill="none" stroke="#c9cfd9" strokeWidth="1.5" />
      <rect x="146" y="134" width="194" height="6" rx="3" fill="#b9b3a6" />
      <rect x="290" y="129" width="22" height="5" rx="2" fill="#c0392b" />
      <rect x="262" y="129" width="22" height="5" rx="2" fill="#1f3a68" />
      <text x="172" y="58" fontFamily={MATH} fontSize="19" fill="#1f3a68"><tspan fontStyle="italic">x</tspan> + 5 = 12</text>
      <text x="172" y="86" fontFamily={MATH} fontSize="19" fill="#1f3a68"><tspan fontStyle="italic">x</tspan> = 12 − 5</text>
      <text x="172" y="114" fontFamily={MATH} fontSize="19" fill="#0f6b63"><tspan fontStyle="italic">x</tspan> = 7</text>
      <path d="M229 104 l6 6 l12 -14" stroke="#1b7a4c" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M248 72 C234 70 230 80 232 88 C235 96 256 95 260 86 C263 77 254 70 246 72" stroke="#c0392b" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="0" y="160" width="360" height="20" fill="#cfc6b6" />
      <rect x="0" y="160" width="360" height="3" fill="#e1dacd" />
      <path d="M14 160 l-4 -22 h22 l-4 22 z" fill="#b97f2a" />
      <path d="M21 138 C10 120 13 104 22 98 C27 112 25 126 21 138 Z" fill="#2f6b4f" />
      <path d="M21 138 C30 122 40 118 44 120 C40 132 30 138 21 138 Z" fill="#3d8462" />
      <path d="M21 138 C14 128 4 126 0 128 C4 136 12 140 21 138 Z" fill="#265a42" />
      {/* Built only from the constant cast data; see drawCharacter.ts. */}
      <svg x="36" y="22" width="136" height="158" viewBox="0 0 240 280" dangerouslySetInnerHTML={{ __html: drawCharacterParts(teacher) }} />
      <use href="#vc-spark" x="128" y="20" width="12" height="12" fill="#c98a2e" />
      <rect width="360" height="180" filter="url(#vc-grain)" />
    </svg>
  )
}

/** After the call: a marked worksheet. */
export function EndScene() {
  return (
    <svg viewBox="0 0 360 120" className="block h-auto w-full rounded-2xl" aria-hidden>
      <rect width="360" height="120" fill="#e7f3ec" />
      <circle cx="60" cy="100" r="70" fill="#d6ecdf" />
      <g transform="rotate(-4 180 60)">
        <rect x="128" y="16" width="104" height="96" rx="8" fill="#ffffff" stroke="#cfccc4" />
        <rect x="164" y="10" width="32" height="12" rx="4" fill="#1f3a68" />
        <path d="M144 44 h56 M144 60 h44 M144 76 h52 M144 92 h30" stroke="#e3e1db" strokeWidth="5" strokeLinecap="round" />
        <circle cx="212" cy="88" r="16" fill="#1b7a4c" />
        <path d="M205 88 l5 5 l9 -11" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <use href="#vc-spark" x="252" y="26" width="16" height="16" fill="#c98a2e" />
      <use href="#vc-spark" x="104" y="70" width="10" height="10" fill="#1b7a4c" />
      <rect width="360" height="120" filter="url(#vc-grain)" />
    </svg>
  )
}
