import { Link } from 'react-router-dom'
import { useApp } from '../data/store'
import type { Chore } from '../data/types'
import { repeatLabels } from '../lib/chores'
import { Avatar } from './Avatar'
import { DueTag } from './status'
import { Tag } from './Tag'

export function ChoreRow({ chore, showList = false }: { chore: Chore; showList?: boolean }) {
  const { state, userOf, nameOf } = useApp()
  const assignee = chore.assignedTo ? userOf(chore.assignedTo) : undefined
  const list = state.choreLists.find((l) => l.id === chore.listId)
  return (
    <Link
      to={chore.assignedTo ? `/chores/${chore.id}` : `/chores/${chore.id}/assign`}
      className="flex flex-wrap items-center gap-4 rounded-md border border-rule bg-surface p-4 hover:border-accent"
    >
      {assignee ? <Avatar user={assignee} /> : <span className="size-8 rounded-pill border border-dashed border-ink-muted" aria-hidden />}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={`text-body ${chore.done ? 'text-ink-muted line-through' : ''}`}>{chore.title}</span>
        <span className="text-caption text-ink-muted">
          {assignee ? nameOf(assignee.id) : 'Unassigned'}
          {' · '}
          {repeatLabels[chore.repeat]}
          {showList && list && ` · ${list.name}`}
        </span>
      </div>
      {chore.assignedTo ? <DueTag dueDate={chore.dueDate} done={chore.done} /> : <Tag tone="brand">Needs someone</Tag>}
    </Link>
  )
}
