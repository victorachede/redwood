import type { ReactNode } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { EwinAvatar } from '@/components/EwinAvatar'

/**
 * One row in a tutor conversation — flat, grouped by speaker, no bubbles.
 *
 * The chat used to push the student's messages into a blue bubble on the
 * right and leave the tutor's flat on the left — a two-column layout meant
 * for group chats where "which side" carries meaning. With exactly two
 * speakers, an avatar and a name already say who's talking; consecutive
 * messages from the same speaker collapse into one run (avatar/name shown
 * once), the way a real chat thread reads.
 */
function formatTime(at: number) {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(at)
}

export function ChatMessage({
  isStudent,
  grouped,
  at,
  children,
}: {
  isStudent: boolean
  /** True when the previous row was the same speaker — hides the
   *  avatar/name so a run of messages reads as one turn. */
  grouped: boolean
  /** When this message was sent. Messages saved before this field existed
   *  have none — the row just omits the time rather than fake one. */
  at?: number
  children: ReactNode
}) {
  return (
    <div
      className={`group flex gap-3 rounded-lg px-2 py-0.5 hover:bg-sunken/50 ${
        grouped ? 'mt-0.5' : 'mt-4'
      }`}
    >
      <div className="w-8 shrink-0">
        {!grouped && (isStudent ? <Avatar size={32} /> : <EwinAvatar size={32} />)}
      </div>
      <div className="min-w-0 flex-1">
        {!grouped && (
          <p className="flex items-baseline gap-2">
            <span className="text-[13.5px] font-bold text-ink">{isStudent ? 'You' : 'Ewin'}</span>
            {at && <span className="text-[11px] text-ink-faint">{formatTime(at)}</span>}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
