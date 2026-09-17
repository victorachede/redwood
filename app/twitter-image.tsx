import { renderOgImage, OG_SIZE } from '@/app/lib/ogImage'

export const alt = 'Ewin — learn one idea, then prove it'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  return renderOgImage()
}
