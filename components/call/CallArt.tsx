/**
 * Illustrations for the voice call.
 *
 * Drawn as inline SVG in a flat editorial style, lit from the upper left, so
 * they stay sharp at any size and cost no network request. Colours are
 * literal rather than theme tokens for the same reason as the mascots: a
 * person drawn in theme colours stops looking like a person.
 *
 * The shared parts (gradients, the grain texture, the tutor) are defined once
 * in <CallArtDefs/> and placed with <use>, so the tutor in the corner tile and
 * the tutor in the start scene are the same drawing.
 */

/** Render once per page, before any of the scenes below. */
export function CallArtDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <linearGradient id="vc-g-blazer" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#28497f"/><stop offset="1" stopColor="#172e55"/></linearGradient>
        <linearGradient id="vc-g-skin" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stopColor="#94603f"/><stop offset="1" stopColor="#7e4c30"/></linearGradient>
        <linearGradient id="vc-g-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9a24c"/><stop offset="1" stopColor="#b47826"/></linearGradient>
        <linearGradient id="vc-g-wall-cool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9eef6"/><stop offset="1" stopColor="#dbe2ee"/></linearGradient>
        <linearGradient id="vc-g-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".55"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/></linearGradient>
        <filter id="vc-grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n"/>
              <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.09 0"/>
              <feComposite in2="SourceGraphic" operator="in"/>
            </filter>
        <symbol id="vc-tutor" viewBox="0 0 240 280">
              <ellipse cx="120" cy="100" rx="58" ry="54" fill="#1b1411"/>
              <circle cx="120" cy="38" r="28" fill="#1b1411"/>
              <path d="M100 22 C108 14 128 12 138 20 M96 34 C102 26 112 24 118 26 M126 26 C134 24 142 30 144 38 M104 46 C110 42 118 42 122 44" stroke="#2e2420" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              <path d="M98 26 C104 16 118 12 128 14" stroke="#4a3b33" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7"/>
              <path d="M66 96 C66 80 72 68 80 60 M160 60 C168 68 174 80 174 96" stroke="#2e2420" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M18 280 C22 228 58 206 120 202 C182 206 218 228 222 280 Z" fill="url(#vc-g-blazer)"/>
              <path d="M188 222 C206 234 218 254 222 280 L196 280 C194 256 192 238 188 222 Z" fill="#132748" opacity=".55"/>
              <path d="M92 206 L120 254 L148 206 C138 202 128 201 120 201 C112 201 102 202 92 206 Z" fill="#f2ece0"/>
              <path d="M120 254 L148 206 L140 204 L120 240 Z" fill="#ddd1bd"/>
              <path d="M92 206 C82 218 80 240 96 266 L111 240 L100 216 Z" fill="#2f5290"/>
              <path d="M148 206 C158 218 160 240 144 266 L129 240 L140 216 Z" fill="#1a335f"/>
              <path d="M58 230 C70 222 80 216 90 212" stroke="#33589a" strokeWidth="1.5" fill="none" opacity=".6"/>
              <path d="M103 156 L103 202 C110 214 130 214 137 202 L137 156 Z" fill="url(#vc-g-skin)"/>
              <path d="M103 164 C112 182 128 182 137 164 L137 156 L103 156 Z" fill="#5f3720" opacity=".75"/>
              <path d="M107 206 C113 216 127 216 133 206" stroke="#d9b062" strokeWidth="1.4" fill="none"/>
              <circle cx="120" cy="216.5" r="2.6" fill="#e2bc6e"/>
              <ellipse cx="73" cy="118" rx="7" ry="11" fill="#7e4c30"/>
              <ellipse cx="167" cy="118" rx="7" ry="11" fill="#6e412a"/>
              <path d="M71 112 C68 116 69 122 72 124" stroke="#5f3720" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              <circle cx="72" cy="132" r="3.2" fill="url(#vc-g-gold)"/><circle cx="168" cy="132" r="3.2" fill="url(#vc-g-gold)"/>
              <path d="M120 64 C150 64 166 86 166 116 C166 146 150 170 120 174 C90 170 74 146 74 116 C74 86 90 64 120 64 Z" fill="url(#vc-g-skin)"/>
              <path d="M140 68 C158 76 166 96 166 116 C166 146 150 170 120 174 C140 164 153 144 153 118 C153 96 148 80 140 68 Z" fill="#6a3e26" opacity=".45"/>
              <path d="M92 76 C84 86 80 98 80 110" stroke="#b07b56" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".35"/>
              <ellipse cx="94" cy="136" rx="9" ry="5" fill="#b0603f" opacity=".28"/><ellipse cx="146" cy="136" rx="9" ry="5" fill="#9a4f33" opacity=".25"/>
              <path d="M72 112 C70 78 94 56 122 56 C150 56 171 78 168 112 C162 92 150 80 132 77 C118 75 100 77 90 85 C82 92 76 100 72 112 Z" fill="#1b1411"/>
              <path d="M90 84 C100 76 116 73 130 75 M80 96 C86 88 94 82 104 79" stroke="#3a2e28" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".8"/>
              <path d="M89 99 C95 94 105 94 112 97" stroke="#1b1411" strokeWidth="3.4" strokeLinecap="round" fill="none"/>
              <path d="M128 97 C135 94 145 94 151 99" stroke="#1b1411" strokeWidth="3.4" strokeLinecap="round" fill="none"/>
              <path d="M92 114 C97 108 107 108 112 114 C107 118 97 118 92 114 Z" fill="#fbf6ef"/>
              <path d="M128 114 C133 108 143 108 148 114 C143 118 133 118 128 114 Z" fill="#f1e9de"/>
              <circle cx="102" cy="113.4" r="4.3" fill="#2a1810"/><circle cx="138" cy="113.4" r="4.3" fill="#2a1810"/>
              <circle cx="103.4" cy="112" r="1.3" fill="#fff"/><circle cx="139.4" cy="112" r="1.3" fill="#fff"/>
              <path d="M91 114 C96 106 108 106 113 113" stroke="#1b1411" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
              <path d="M127 113 C132 106 144 106 149 114" stroke="#1b1411" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
              <rect x="85" y="103" width="32" height="22" rx="8.5" fill="#ffffff" fillOpacity=".1" stroke="#2a2420" strokeWidth="2.2"/>
              <rect x="123" y="103" width="32" height="22" rx="8.5" fill="#ffffff" fillOpacity=".1" stroke="#2a2420" strokeWidth="2.2"/>
              <path d="M117 111 C119 108.5 121 108.5 123 111" stroke="#2a2420" strokeWidth="2" fill="none"/>
              <path d="M85 109 L74 107 M155 109 L166 107" stroke="#2a2420" strokeWidth="2" strokeLinecap="round"/>
              <path d="M90 121 L98 106 M95 121 L101 110" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity=".35"/>
              <path d="M128 121 L136 106" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity=".25"/>
              <path d="M121 120 C123 130 127 136 126 140 C124 142 118 142 115 140 C113 139 113 137 115 136 C118 132 120 126 121 120 Z" fill="#5f3720" opacity=".42"/>
              <path d="M113 139 C115 141 117 141 118 140 M122 140 C123 141 125 141 127 139" stroke="#4e2c19" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
              <path d="M118 124 C117 129 116 133 117 135" stroke="#c48b62" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".55"/>
              <g className="vc-mouth">
                <path d="M105 152 C111 147.5 116.5 148.5 120 150 C123.5 148.5 129 147.5 135 152 C128 154.5 112 154.5 105 152 Z" fill="#5a2820"/>
                <path d="M106 152.4 C111 161 129 161 134 152.4 C127 155.2 113 155.2 106 152.4 Z" fill="#7d3a2e"/>
                <path d="M115 157 C118.5 158 121.5 158 125 157" stroke="#a65e4f" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".8"/>
              </g>
              <path d="M100 150 C101 152 102 153 104 153.5 M136 153.5 C138 153 139 152 140 150" stroke="#5f3720" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity=".6"/>
            </symbol>
        <symbol id="vc-spark" viewBox="0 0 24 24"><path d="M12 0 L13.6 10.4 L24 12 L13.6 13.6 L12 24 L10.4 13.6 L0 12 L10.4 10.4 Z"/></symbol>
        <symbol id="vc-books" viewBox="0 0 120 40">
              <rect x="0" y="6" width="10" height="34" rx="1.5" fill="#1f3a68"/><rect x="11" y="2" width="8" height="38" rx="1.5" fill="#c98a2e"/>
              <rect x="20" y="10" width="12" height="30" rx="1.5" fill="#0f6b63"/><rect x="33" y="4" width="7" height="36" rx="1.5" fill="#c4485f"/>
              <rect x="44" y="12" width="9" height="30" rx="1.5" fill="#e6dccb" transform="rotate(-12 48 40)"/>
              <rect x="62" y="8" width="11" height="32" rx="1.5" fill="#3b6fd4"/><rect x="74" y="3" width="9" height="37" rx="1.5" fill="#7c4dd4" opacity=".8"/>
              <rect x="84" y="12" width="14" height="28" rx="1.5" fill="#d4763b"/><rect x="99" y="6" width="9" height="34" rx="1.5" fill="#2f9e5f"/>
            </symbol>
      </defs>
    </svg>
  )
}

/** The tutor in the corner of the board, like a video call tile. */
export function TutorTile() {
  return (
    <svg viewBox="0 0 120 140" className="block h-auto w-full" aria-hidden>
      <rect width="120" height="140" fill="url(#vc-g-wall-cool)" />
      <use href="#vc-books" x="66" y="24" width="54" height="18" />
      <rect x="62" y="42" width="58" height="3" fill="#c9bfae" />
      <use href="#vc-tutor" x="-4" y="12" width="128" height="150" />
    </svg>
  )
}

const MATH = 'var(--font-math), Cambria Math, Times New Roman, serif'

/** Before the call: the tutor at a whiteboard with today's rule on it. */
export function StartScene() {
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
      <use href="#vc-tutor" x="36" y="22" width="136" height="158" />
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
