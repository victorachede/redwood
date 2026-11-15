import { useMemo } from 'react'
import type { Character } from '@/app/lib/cast'
import { drawCharacter } from '@/components/cast/drawCharacter'

/**
 * A cast member, drawn on their own background colour. While `talking` is
 * set the mouth moves.
 *
 * The markup comes from drawCharacter(), which builds it only from the
 * constant cast data, so setting it as inner HTML carries no user input.
 */
export function Portrait({
  character,
  talking = false,
  className = '',
}: {
  character: Character
  talking?: boolean
  className?: string
}) {
  const svg = useMemo(() => drawCharacter(character.look), [character])
  return (
    <span
      className={`ct-portrait ${talking ? 'ct-talking' : ''} ${className}`}
      style={{ background: character.bg }}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
