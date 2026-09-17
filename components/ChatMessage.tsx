import type { ReactNode } from 'react'
import { Reply } from 'lucide-react'
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

export type ReplySnapshot = { label: string; snippet: string }

/** A day boundary between messages — "January 10, 2026" on a rule, the way
 *  a long-running thread breaks itself up instead of reading as one wall. */
export function DateDivider({ at }: { at: number }) {
  const label = new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(at)
  return (
    <div className="my-4 flex items-center gap-3 px-2" role="separator" aria-label={label}>
      <div className="h-px flex-1 bg-line" />
      <span className="text-[11.5px] font-medium text-ink-faint">{label}</span>
      <div className="h-px flex-1 bg-line" />
    </div>
  )
}

export function ChatMessage({
  isStudent,
  grouped,
  at,
  replyTo,
  onReply,
  children,
}: {
  isStudent: boolean
  /** True when the previous row was the same speaker — hides the
   *  avatar/name so a run of messages reads as one turn. */
  grouped: boolean
  /** When this message was sent. Messages saved before this field existed
   *  have none — the row just omits the time rather than fake one. */
  at?: number
  /** A snapshot of the message this one replied to, if any. */
  replyTo?: ReplySnapshot
  /** Omit to make the row unreplyable — used for the "thinking" placeholder. */
  onReply?: () => void
  children: ReactNode
}) {
  return (
    <div
      className={`group relative flex gap-3 rounded-lg px-2 py-0.5 hover:bg-sunken/50 ${
        grouped && !replyTo ? 'mt-0.5' : 'mt-4'
      }`}
    >
      <div className="w-8 shrink-0">
        {!grouped && (isStudent ? <Avatar size={32} /> : <EwinAvatar size={32} />)}
      </div>
      <div className="min-w-0 flex-1">
        {replyTo && (
          <div className="mb-0.5 flex items-center gap-1.5 pl-3 text-[12.5px] text-ink-faint before:h-3 before:w-3 before:shrink-0 before:-translate-y-[1px] before:rounded-tl-md before:border-l-2 before:border-t-2 before:border-line before:content-['']">
            <span className="font-semibold text-ink-muted">{replyTo.label}</span>
            <span className="min-w-0 truncate">{replyTo.snippet}</span>
          </div>
        )}
        {!grouped && (
          <p className="flex items-baseline gap-2">
            <span className="text-[13.5px] font-bold text-ink">{isStudent ? 'You' : 'EWIN'}</span>
            {at && <span className="text-[11px] text-ink-faint">{formatTime(at)}</span>}
          </p>
        )}
        {children}
      </div>
      {onReply && (
        <button
          type="button"
          onClick={onReply}
          aria-label="Reply"
          className="press absolute right-1 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-faint opacity-40 shadow-sm hover:opacity-100 group-hover:opacity-100"
        >
          <Reply className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
