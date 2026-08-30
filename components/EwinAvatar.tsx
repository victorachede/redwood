/** Simple mark for Ewin — leaf/book hybrid in forest accent */
export function EwinAvatar({
  size = 28,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent text-paper ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3c-2.8 3.2-6 6.4-6 10.2 0 3.4 2.7 6.3 6 6.3s6-2.9 6-6.3C18 9.4 14.8 6.2 12 3z"
          fill="currentColor"
          opacity="0.95"
        />
        <path
          d="M12 8.5v9.5"
          stroke="#faf7f0"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M12 12c1.6-.8 2.8-1.2 4-1.2"
          stroke="#faf7f0"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}
