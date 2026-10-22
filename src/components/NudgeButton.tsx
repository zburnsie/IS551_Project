import { useApp } from '../data/store'
import type { Chore } from '../data/types'
import { buttonClass } from './Button'

/** Only someone else's open turn can be nudged. */
export function canNudge(chore: Chore, meId: string): boolean {
  return !!chore.assignedTo && chore.assignedTo !== meId && !chore.done
}

/**
 * Sends whoever's turn it is a friendly reminder. Shows nothing on your own
 * chores, done chores or unassigned ones, and turns into "Nudged" once sent today.
 */
export function NudgeButton({ chore, compact = false, onNudged }: { chore: Chore; compact?: boolean; onNudged?: () => void }) {
  const { me, nameOf, nudgeChore, nudgedToday } = useApp()
  if (!canNudge(chore, me!.id)) return null
  const sent = nudgedToday(chore.id)
  const name = nameOf(chore.assignedTo!)
  return (
    <button
      type="button"
      className={buttonClass('secondary')}
      disabled={sent}
      title={sent ? `You nudged ${name} today` : `Send ${name} a gentle reminder`}
      aria-label={sent ? `Already nudged ${name} about “${chore.title}” today` : `Give ${name} a gentle nudge about “${chore.title}”`}
      onClick={() => {
        nudgeChore(chore.id)
        onNudged?.()
      }}
    >
      {sent ? 'Nudged' : compact ? 'Nudge' : 'Gentle nudge'}
    </button>
  )
}
