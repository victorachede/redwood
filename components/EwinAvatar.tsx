import Image from 'next/image'

/** Brand crest mark for Ewin */
export function EwinAvatar({
  size = 28,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src="/logo-mark.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain"
      />
    </span>
  )
}
