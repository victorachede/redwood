/**
 * The Ewin cast.
 *
 * Three drawn characters, not a logo wearing a face. Each has a distinct
 * silhouette so it still reads at 40px in a card corner: Ayo is round with
 * ears, Kito is a tall egg, Zuri is squat and wide.
 *
 * All three are inline SVG with literal colours rather than theme tokens —
 * a character that changes colour between light and dark stops being a
 * character. They sit on coloured blocks that are chosen to work in both.
 *
 * Parts carry data-part attributes so GSAP can animate a limb or an eye
 * without the animation code needing to know how the drawing is built.
 */

type MascotProps = {
  size?: number
  className?: string
  /** Give a title only where the character is the sole thing being named. */
  title?: string
}

/**
 * What Ayo is doing.
 *
 * `peek` covers the eyes completely — used while a password is being typed,
 * so the character is visibly not looking. `peek-through` drops the hands
 * just far enough for the eyes to show over them, which is what happens when
 * the student reveals the password themselves.
 */
export type AyoPose = 'wave' | 'peek' | 'peek-through'

const INK = '#1a1714'

function Frame({ size, className, title, children }: MascotProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  )
}

/** Ayo — the tutor. Waves, and does most of the talking. */
export function Ayo({
  size = 160,
  className,
  title,
  pose = 'wave',
}: MascotProps & { pose?: AyoPose }) {
  const covering = pose !== 'wave'
  // Hands sit right on the eyes to cover them, and drop 13 units to let the
  // eyes show over the top when the student reveals the password.
  const handY = pose === 'peek-through' ? 126 : 104
  return (
    <Frame size={size} className={className} title={title}>
      <ellipse cx="100" cy="184" rx="44" ry="7.5" fill={INK} opacity=".12" data-part="shadow" />
      <g data-part="body">
        <path d="M63 72 L54 34 L89 58 Z" fill="#E8A33D" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d="M137 72 L146 34 L111 58 Z" fill="#E8A33D" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <ellipse cx="78" cy="174" rx="15" ry="9.5" fill="#C9862C" stroke={INK} strokeWidth="5" />
        <ellipse cx="122" cy="174" rx="15" ry="9.5" fill="#C9862C" stroke={INK} strokeWidth="5" />
        <path
          d="M100 52 C137 52 160 79 160 112 C160 150 133 170 100 170 C67 170 40 150 40 112 C40 79 63 52 100 52 Z"
          fill="#E8A33D"
          stroke={INK}
          strokeWidth="5.5"
        />
        <ellipse cx="100" cy="132" rx="33" ry="26" fill="#F6CE8B" opacity=".8" />
        {/* Arms first when they are down, so the body reads in front of them;
            when they come up to the face they are drawn after the eyes. */}
        {!covering && (
          <>
            <g data-part="arm-wave" style={{ transformOrigin: '158px 106px' }}>
              <path d="M158 106 C176 92 186 70 180 56" stroke={INK} strokeWidth="12" strokeLinecap="round" />
              <path d="M158 106 C176 92 186 70 180 56" stroke="#E8A33D" strokeWidth="6" strokeLinecap="round" />
              <circle cx="180" cy="52" r="11" fill="#E8A33D" stroke={INK} strokeWidth="5" />
            </g>
            <path d="M42 118 C28 122 22 136 30 144" stroke={INK} strokeWidth="12" strokeLinecap="round" />
            <path d="M42 118 C28 122 22 136 30 144" stroke="#E8A33D" strokeWidth="6" strokeLinecap="round" />
            <circle cx="31" cy="146" r="10" fill="#E8A33D" stroke={INK} strokeWidth="5" />
          </>
        )}

        <g data-part="eyes">
          <circle cx="79" cy="104" r="14.5" fill="#fff" stroke={INK} strokeWidth="4" />
          <circle cx="126" cy="104" r="14.5" fill="#fff" stroke={INK} strokeWidth="4" />
          <circle cx="82" cy="107" r="7.2" fill={INK} />
          <circle cx="129" cy="107" r="7.2" fill={INK} />
          <circle cx="78" cy="101" r="3.4" fill="#fff" />
          <circle cx="125" cy="101" r="3.4" fill="#fff" />
        </g>

        <path d="M87 130 C94 148 113 148 119 130 Z" fill={INK} />
        <path d="M97 142 C100 147 107 147 110 141" fill="#E36A5C" />

        {/* Hands over the eyes. Drawn last so they cover, and animated by
            their y position alone so the two covered poses are one drawing. */}
        {covering && (
          <g data-part="hands" style={{ transition: 'transform 180ms cubic-bezier(0.2,0,0,1)' }}>
            <path
              d={`M44 132 C40 112 56 ${handY - 2} 72 ${handY}`}
              stroke={INK}
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M44 132 C40 112 56 ${handY - 2} 72 ${handY}`}
              stroke="#E8A33D"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M156 132 C160 112 144 ${handY - 2} 128 ${handY}`}
              stroke={INK}
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M156 132 C160 112 144 ${handY - 2} 128 ${handY}`}
              stroke="#E8A33D"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="76" cy={handY} r="18" fill="#E8A33D" stroke={INK} strokeWidth="5" />
            <circle cx="128" cy={handY} r="18" fill="#E8A33D" stroke={INK} strokeWidth="5" />
          </g>
        )}
        <circle cx="59" cy="126" r="6" fill="#E36A5C" opacity=".35" />
        <circle cx="144" cy="126" r="6" fill="#E36A5C" opacity=".35" />
      </g>
    </Frame>
  )
}

/** Kito — thinks before answering. Used wherever a question is being asked. */
export function Kito({ size = 160, className, title }: MascotProps) {
  return (
    <Frame size={size} className={className} title={title}>
      <ellipse cx="100" cy="184" rx="40" ry="7.5" fill={INK} opacity=".12" data-part="shadow" />
      <g data-part="body">
        <path d="M100 28 C105 41 114 45 109 55" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
        <ellipse cx="80" cy="175" rx="14" ry="9" fill="#3A6FB5" stroke={INK} strokeWidth="5" />
        <ellipse cx="120" cy="175" rx="14" ry="9" fill="#3A6FB5" stroke={INK} strokeWidth="5" />
        <path
          d="M100 44 C132 44 152 72 152 110 C152 150 128 172 100 172 C72 172 48 150 48 110 C48 72 68 44 100 44 Z"
          fill="#4E8FE0"
          stroke={INK}
          strokeWidth="5.5"
        />
        <ellipse cx="100" cy="134" rx="30" ry="24" fill="#8FB9EE" opacity=".75" />
        <path d="M50 126 C36 132 32 146 41 152" stroke={INK} strokeWidth="12" strokeLinecap="round" />
        <path d="M50 126 C36 132 32 146 41 152" stroke="#4E8FE0" strokeWidth="6" strokeLinecap="round" />
        <circle cx="42" cy="154" r="10" fill="#4E8FE0" stroke={INK} strokeWidth="5" />
        <path d="M150 126 C160 136 150 146 136 144" stroke={INK} strokeWidth="12" strokeLinecap="round" />
        <path d="M150 126 C160 136 150 146 136 144" stroke="#4E8FE0" strokeWidth="6" strokeLinecap="round" />
        <circle cx="132" cy="142" r="10" fill="#4E8FE0" stroke={INK} strokeWidth="5" />
        <path d="M66 84 C72 78 84 78 90 82" stroke={INK} strokeWidth="5" strokeLinecap="round" data-part="brow" />
        <g data-part="eyes">
          <circle cx="79" cy="108" r="14" fill="#fff" stroke={INK} strokeWidth="4" />
          <circle cx="124" cy="108" r="14" fill="#fff" stroke={INK} strokeWidth="4" />
          <circle cx="83" cy="111" r="7" fill={INK} />
          <circle cx="128" cy="111" r="7" fill={INK} />
          <circle cx="79" cy="105" r="3.3" fill="#fff" />
          <circle cx="124" cy="105" r="3.3" fill="#fff" />
        </g>
        <path d="M92 138 Q102 144 112 137" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      </g>
    </Frame>
  )
}

/** Zuri — celebrates. Shows up when something has been got right. */
export function Zuri({ size = 160, className, title }: MascotProps) {
  return (
    <Frame size={size} className={className} title={title}>
      <ellipse cx="100" cy="184" rx="46" ry="7.5" fill={INK} opacity=".12" data-part="shadow" />
      <g data-part="body">
        <ellipse cx="76" cy="176" rx="15" ry="9" fill="#128577" stroke={INK} strokeWidth="5" />
        <ellipse cx="124" cy="176" rx="15" ry="9" fill="#128577" stroke={INK} strokeWidth="5" />
        <path
          d="M100 62 C142 62 166 84 166 118 C166 152 136 174 100 174 C64 174 34 152 34 118 C34 84 58 62 100 62 Z"
          fill="#19A394"
          stroke={INK}
          strokeWidth="5.5"
        />
        <ellipse cx="100" cy="138" rx="36" ry="26" fill="#6ED0C4" opacity=".7" />
        <g data-part="arm-left" style={{ transformOrigin: '40px 100px' }}>
          <path d="M40 100 C26 82 26 62 34 54" stroke={INK} strokeWidth="12" strokeLinecap="round" />
          <path d="M40 100 C26 82 26 62 34 54" stroke="#19A394" strokeWidth="6" strokeLinecap="round" />
          <circle cx="33" cy="50" r="11" fill="#19A394" stroke={INK} strokeWidth="5" />
        </g>
        <g data-part="arm-right" style={{ transformOrigin: '160px 100px' }}>
          <path d="M160 100 C174 82 174 62 166 54" stroke={INK} strokeWidth="12" strokeLinecap="round" />
          <path d="M160 100 C174 82 174 62 166 54" stroke="#19A394" strokeWidth="6" strokeLinecap="round" />
          <circle cx="167" cy="50" r="11" fill="#19A394" stroke={INK} strokeWidth="5" />
        </g>
        <g data-part="eyes">
          <path d="M66 102 Q78 90 90 102" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
          <path d="M112 102 Q124 90 136 102" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
        </g>
        <path d="M78 126 C86 152 116 152 124 126 Z" fill={INK} />
        <path d="M94 146 C98 152 106 152 110 145" fill="#E36A5C" />
        <circle cx="58" cy="126" r="6.5" fill="#F08E80" opacity=".55" />
        <circle cx="144" cy="126" r="6.5" fill="#F08E80" opacity=".55" />
      </g>
    </Frame>
  )
}

/** Little shapes that get scattered behind the cast. */
export function Sparkle({ size = 24, color = '#E8A33D', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill={color} />
    </svg>
  )
}
