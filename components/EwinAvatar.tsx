import { Mark } from '@/components/Mark'

/**
 * The tutor's face in a conversation.
 *
 * Same mark as the brand, on purpose: the thing talking to the student is the
 * product, not a separate character. Kept as its own component so chat can
 * change how the tutor is represented without touching the header logo.
 */
export function EwinAvatar({ size = 28, className = '' }: { size?: number; className?: string }) {
  return <Mark size={size} className={`shrink-0 ${className}`} />
}
