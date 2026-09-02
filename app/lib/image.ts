/**
 * Prepares a phone photo for the vision API.
 *
 * A modern phone camera produces 3–6MB JPEGs at 4000px+. Sending that inline
 * is slow on a Nigerian mobile connection and wasteful — Claude downsamples
 * anything over 1568px on the long edge anyway. Resizing client-side turns a
 * ~4MB photo into ~200KB before it ever leaves the device.
 */

export type PreparedImage = {
  mediaType: string
  /** base64 without the data: prefix */
  data: string
  /** object URL for previewing in the composer */
  preview: string
  bytes: number
}

const MAX_EDGE = 1568
const QUALITY = 0.82
/** Refuse absurd inputs before we spend memory decoding them. */
const MAX_INPUT_BYTES = 12 * 1024 * 1024

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('That file is not an image.')
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('That image is too large. Try a smaller photo.')
  }

  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) throw new Error('Could not read that image.')

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process that image.')

  // White base: a transparent PNG would otherwise flatten to black and make
  // pencil work unreadable.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, 'image/jpeg', QUALITY),
  )
  if (!blob) throw new Error('Could not process that image.')

  const buf = await blob.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buf)
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }

  return {
    mediaType: 'image/jpeg',
    data: btoa(binary),
    preview: URL.createObjectURL(blob),
    bytes: blob.size,
  }
}
