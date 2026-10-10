import { Link } from 'react-router-dom'
import { useApp } from '../data/store'
import type { Activity } from '../data/types'
import { activityLink, describeActivity } from '../lib/activity'
import { formatTimestamp } from '../lib/format'
import { Avatar } from './Avatar'

export function ActivityList({ items, showUnread = false }: { items: Activity[]; showUnread?: boolean }) {
  const { me, userOf, nameOf } = useApp()
  return (
    <ul className="flex flex-col divide-y divide-rule rounded-md border border-rule bg-surface">
      {items.map((a) => {
        const link = activityLink(a)
        const actor = userOf(a.actor)
        const body = (
          <div className="flex items-start gap-4 p-4">
            {actor && <Avatar user={actor} size="sm" />}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-body">{describeActivity(a, nameOf)}</span>
              <span className="text-caption text-ink-muted">{formatTimestamp(a.at)}</span>
            </div>
            {showUnread && !a.readBy.includes(me!.id) && (
              <span className="inline-flex size-2 shrink-0 items-center justify-center">
                <span className="size-2 rounded-pill bg-sky" aria-hidden="true" />
                <span className="sr-only">Unread</span>
              </span>
            )}
          </div>
        )
        return <li key={a.id}>{link ? <Link to={link} className="block hover:bg-paper">{body}</Link> : body}</li>
      })}
    </ul>
  )
}
