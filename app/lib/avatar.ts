/**
 * Profile pictures.
 *
 * Stored as a small data URL in localStorage (and mirrored to Supabase when
 * signed in). A 256px avatar is roughly 15–30KB, which is fine to keep
 * locally and avoids standing up an image bucket and its access rules for
 * something this small.
 */

import { getSession } from '@/app/lib/auth'
import { createBrowserClient, isSupabaseConfigured } from '@/app/lib/supabase'

const KEY = 'ewin-avatar-v1'
const SIZE = 256
const QUALITY = 0.85

/** Preset colours, so a student without a photo still gets an identity. */
export const AVATAR_COLORS = [
  '#3b6fd4',
  '#7c4dd4',
  '#16a394',
  '#2f9e5f',
  '#d4763b',
  '#c4485f',
] as const

export type Avatar = {
  /** data URL of an uploaded photo, if any */
  photo?: string
  /** fallback colour behind the initial */
  color?: string
}

export function loadAvatar(): Avatar {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Avatar
  } catch {
    return {}
  }
}

export function saveAvatar(a: Avatar) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(a))
  } catch {
    /* quota — a photo that will not fit is simply not saved */
  }
  window.dispatchEvent(new Event('ewin-avatar'))

  const uid = getSession()?.id
  if (uid && isSupabaseConfigured) {
    const sb = createBrowserClient()
    void sb
      ?.from('profiles')
      .update({ avatar_url: a.photo ?? null, avatar_color: a.color ?? null })
      .eq('id', uid)
      .then(({ error }) => {
        if (error) console.warn('[sync] avatar failed', error)
      })
  }
}

/** Pulls the saved avatar down on sign-in, so it follows the student. */
export async function hydrateAvatarFromCloud(): Promise<void> {
  const uid = getSession()?.id
  if (!uid || !isSupabaseConfigured) return
  const sb = createBrowserClient()
  if (!sb) return

  const { data } = await sb
    .from('profiles')
    .select('avatar_url, avatar_color')
    .eq('id', uid)
    .maybeSingle()
  if (!data) return

  const local = loadAvatar()
  // Only take the remote copy when this device has nothing, so a photo just
  // set here is not clobbered by a slower round trip.
  if (!local.photo && !local.color && (data.avatar_url || data.avatar_color)) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({ photo: data.avatar_url ?? undefined, color: data.avatar_color ?? undefined }),
        )
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new Event('ewin-avatar'))
    }
  }
}

export function clearAvatarPhoto() {
  const a = loadAvatar()
  saveAvatar({ ...a, photo: undefined })
}

/** Subscribes to avatar changes. Returns an unsubscribe function. */
export function onAvatarChange(fn: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('ewin-avatar', fn)
  window.addEventListener('storage', fn)
  return () => {
    window.removeEventListener('ewin-avatar', fn)
    window.removeEventListener('storage', fn)
  }
}

/**
 * Crops to a centred square and shrinks to 256px.
 *
 * Cropping here rather than with CSS means the stored bytes are the bytes we
 * actually show — a 4000px portrait would otherwise be carried around in full
 * just to be displayed in a 40px circle.
 */
export async function prepareAvatar(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('That file is not an image.')
  if (file.size > 12 * 1024 * 1024) throw new Error('That image is too large.')

  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) throw new Error('Could not read that image.')

  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process that image.')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, SIZE, SIZE)
  bitmap.close?.()

  return canvas.toDataURL('image/jpeg', QUALITY)
}

/** Stable colour for a name, so an avatar-less student is still recognisable. */
export function colorForName(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
