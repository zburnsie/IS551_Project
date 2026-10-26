import { useNavigate } from 'react-router-dom'
import { useApp } from '../data/store'
import { describeActivity } from '../lib/activity'
import { Avatar } from './Avatar'
import { Button } from './Button'

/**
 * Pops up when a roommate has nudged you about a chore. Dismissing it or
 * opening the chore marks the nudge read; it stays in your inbox either way.
 */
export function NudgePopup() {
  const { state, me, room, userOf, nameOf, markActivityRead } = useApp()
  const navigate = useNavigate()
  // Newest first, so the first is the latest nudge you haven't seen.
  const unseen = state.activity.filter(
    (a) => a.kind === 'chore-nudged' && a.roomId === room!.id && a.notify.includes(me!.id) && !a.readBy.includes(me!.id),
  )
  const nudge = unseen[0]
  if (!nudge) return null
  const actor = userOf(nudge.actor)
  const more = unseen.length - 1

  return (
    <div
      className="pointer-events-none fixed inset-x-4 z-30 flex justify-end"
      style={{ bottom: 'calc(var(--prototype-bar-height, 0px) + 16px)' }}
    >
      <style>{`
        @keyframes cr-nudge-in {
          0% { transform: translateY(12px); opacity: 0; }
          60% { transform: translateY(0) rotate(-1deg); opacity: 1; }
          80% { transform: rotate(1deg); }
          100% { transform: rotate(0); }
        }
      `}</style>
      <div
        role="alert"
        className="pointer-events-auto flex max-w-md flex-col gap-4 rounded-md border-2 border-accent-edge bg-surface p-4"
        style={{ animation: 'cr-nudge-in 0.5s ease-out' }}
      >
        <div className="flex items-start gap-4">
          {actor && <Avatar user={actor} size="sm" />}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-caption text-ink-muted">Gentle nudge 👋</span>
            <p className="text-body">{describeActivity(nudge, nameOf)}</p>
            {more > 0 && <span className="text-caption text-ink-muted">+ {more} more in your inbox</span>}
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => markActivityRead(nudge.id)}>
            Got it
          </Button>
          {nudge.choreId && (
            <Button
              onClick={() => {
                markActivityRead(nudge.id)
                navigate(`/chores/${nudge.choreId}`)
              }}
            >
              View chore
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
