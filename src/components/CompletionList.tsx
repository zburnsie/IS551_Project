import { Link } from 'react-router-dom'
import { useApp } from '../data/store'
import type { ChoreCompletion } from '../data/types'
import { daysLate } from '../lib/chores'
import { dateOf, formatDate } from '../lib/format'
import { Avatar } from './Avatar'
import { Tag } from './Tag'

/** Chores that were marked complete, newest first: who did them, when, and whether they were on time. */
export function CompletionList({ items, showArea = true }: { items: ChoreCompletion[]; showArea?: boolean }) {
  const { state, userOf, nameOf } = useApp()
  return (
    <ul className="flex flex-col divide-y divide-rule rounded-md border border-rule bg-surface">
      {[...items].sort((a, b) => b.at.localeCompare(a.at)).map((c) => {
        const doer = userOf(c.doneBy)
        const area = state.choreLists.find((l) => l.id === c.listId)
        const late = daysLate(c)
        const covered = c.turnOf && c.turnOf !== c.doneBy
        const body = (
          <div className="flex flex-wrap items-center gap-4 p-4">
            {doer && <Avatar user={doer} size="sm" />}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-body">
                {nameOf(c.doneBy)} did “{c.title}”{covered && ` for ${nameOf(c.turnOf, true)}`}
              </span>
              <span className="text-caption text-ink-muted">
                {formatDate(dateOf(c.at))}
                {showArea && area && ` · ${area.name}`}
              </span>
            </div>
            {late === 0 ? <Tag tone="accent">On time</Tag> : <Tag>{late} {late === 1 ? 'day' : 'days'} late</Tag>}
          </div>
        )
        // Deleted chores stay in the history but have nowhere to link to.
        const exists = state.chores.some((ch) => ch.id === c.choreId)
        return <li key={c.id}>{exists ? <Link to={`/chores/${c.choreId}`} className="block hover:bg-paper">{body}</Link> : body}</li>
      })}
    </ul>
  )
}
