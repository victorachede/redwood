'use client'

import { useEffect, useState } from 'react'
import { colorForName, loadAvatar, onAvatarChange, type Avatar as AvatarData } from '@/app/lib/avatar'

/**
 * A student's profile picture: their photo if they set one, otherwise their
 * initial on a stable colour.
 */
export function Avatar({
  name,
  size = 40,
  className = '',
  ring = false,
  color,
}: {
  name?: string
  size?: number
  className?: string
  ring?: boolean
  /**
   * Overrides the colour, for someone else's avatar (a room, a leaderboard
   * row) where `loadAvatar()` — this device's own stored photo/colour —
   * would otherwise leak onto every name shown, not just the viewer's own.
   */
  color?: string
}) {
  const [avatar, setAvatar] = useState<AvatarData>({})

  useEffect(() => {
    const read = () => setAvatar(loadAvatar())
    read()
    return onAvatarChange(read)
  }, [])

  const label = (name || 'You').trim()
  const initial = label.slice(0, 1).toUpperCase()
  const photo = color ? undefined : avatar.photo
  const bg = color || avatar.color || colorForName(label)

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${
        ring ? 'ring-2 ring-line' : ''
      } ${className}`}
      style={{ width: size, height: size, background: photo ? undefined : bg }}
      aria-hidden
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="h-full w-full object-cover" />
      ) : (
        <span
          className="font-semibold text-white"
          style={{ fontSize: Math.round(size * 0.42), lineHeight: 1 }}
        >
          {initial}
        </span>
      )}
    </span>
  )
}
