'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import {
  AVATAR_COLORS,
  colorForName,
  loadAvatar,
  prepareAvatar,
  saveAvatar,
  type Avatar as AvatarData,
} from '@/app/lib/avatar'
import { Avatar } from './Avatar'

/** Photo upload plus a colour fallback, for the settings screen. */
export function AvatarPicker({ name, onDone }: { name: string; onDone?: (msg: string) => void }) {
  const [avatar, setAvatar] = useState<AvatarData>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setAvatar(loadAvatar())
  }, [])

  async function pick(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const photo = await prepareAvatar(file)
      const next = { ...loadAvatar(), photo }
      saveAvatar(next)
      setAvatar(next)
      onDone?.('Photo updated')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not use that image.')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function setColor(color: string) {
    const next = { ...loadAvatar(), color }
    saveAvatar(next)
    setAvatar(next)
  }

  function removePhoto() {
    const next = { ...loadAvatar(), photo: undefined }
    saveAvatar(next)
    setAvatar(next)
    onDone?.('Photo removed')
  }

  const active = avatar.color || colorForName(name || 'You')

  return (
    <div className="flex items-start gap-4">
      <Avatar name={name} size={64} ring />

      <div className="min-w-0 flex-1">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void pick(e.target.files)}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="press inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] font-medium text-ink disabled:opacity-60"
          >
            <Camera className="h-3.5 w-3.5" />
            {busy ? 'Working…' : avatar.photo ? 'Change photo' : 'Add photo'}
          </button>

          {avatar.photo && (
            <button
              type="button"
              onClick={removePhoto}
              className="press inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] font-medium text-ink-muted"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>

        {!avatar.photo && (
          <>
            <p className="mt-3 text-[12px] text-ink-muted">Or pick a colour</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Use this colour`}
                  onClick={() => setColor(c)}
                  className="press h-7 w-7 rounded-full"
                  style={{
                    background: c,
                    outline: active === c ? '2px solid var(--ink)' : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </>
        )}

        {error && <p className="mt-2 text-[12.5px] text-wrong">{error}</p>}
      </div>
    </div>
  )
}
