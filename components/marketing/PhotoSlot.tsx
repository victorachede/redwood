import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

/**
 * Everywhere a real photograph belongs on this page and doesn't exist yet.
 *
 * Every photo-shaped element on the landing page renders through this one
 * component. That is the entire point of it: dropping in the real
 * photography later means passing `src` at each call site — nothing about
 * layout, radius, or the surrounding card changes. Until then it renders an
 * honest, labelled placeholder rather than faking a photograph with a
 * gradient, which would read as a real asset at a glance and isn't one.
 */
export function PhotoSlot({
  src,
  alt = '',
  label = 'Photo placeholder',
  className = '',
}: {
  /** Pass a real image source once photography exists — everything else
   *  about this component keeps working unchanged. */
  src?: string
  alt?: string
  label?: string
  className?: string
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`relative flex items-end justify-center overflow-hidden bg-[#d8d4c4] bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_2px,transparent_2px,transparent_14px)] ${className}`}
    >
      {/* Small cards (a 150px subject thumbnail with an accent icon
          already centred on it) skip the label — there isn't room for
          both without them colliding, and the accent icon already signals
          "not final content" at that size. Pass label="" to opt out. */}
      {label && (
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-black/40">
          <ImageIcon className="h-3 w-3" strokeWidth={1.5} />
          {label}
        </span>
      )}
    </div>
  )
}
