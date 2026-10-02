import type { Iou } from '../data/types'
import { daysUntil, formatDate } from '../lib/format'
import { Tag } from './Tag'

export function DueTag({ dueDate, done }: { dueDate: string; done: boolean }) {
  if (done) return <Tag tone="accent">Done</Tag>
  const days = daysUntil(dueDate)
  if (days < 0) return <Tag tone="highlight">Was due {formatDate(dueDate)}</Tag>
  if (days === 0) return <Tag tone="highlight">Due today</Tag>
  if (days === 1) return <Tag tone="highlight">Due tomorrow</Tag>
  return <Tag>Due {formatDate(dueDate)}</Tag>
}

export function IouStatusTag({ iou }: { iou: Iou }) {
  switch (iou.status) {
    case 'pending':
      return <Tag tone="highlight">Waiting to confirm</Tag>
    case 'declined':
      return <Tag>Declined</Tag>
    case 'settled':
      return <Tag tone="accent">Settled</Tag>
    case 'open':
      return iou.paidMarks.length > 0 ? <Tag tone="highlight">Marked paid by one</Tag> : <Tag>Open</Tag>
  }
}
