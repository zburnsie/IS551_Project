import type { Iou } from '../data/types'
import { daysUntil, formatDate } from '../lib/format'
import { Tag } from './Tag'

export function DueTag({ dueDate, done }: { dueDate: string; done: boolean }) {
  if (done) return <Tag tone="success">Done</Tag>
  const days = daysUntil(dueDate)
  if (days < 0) return <Tag tone="danger">Was due {formatDate(dueDate)}</Tag>
  if (days === 0) return <Tag>Due today</Tag>
  if (days === 1) return <Tag>Due tomorrow</Tag>
  return <Tag>Due {formatDate(dueDate)}</Tag>
}

export function IouStatusTag({ iou }: { iou: Iou }) {
  switch (iou.status) {
    case 'pending':
      return <Tag tone="brand">Waiting to confirm</Tag>
    case 'declined':
      return <Tag>Declined</Tag>
    case 'settled':
      return <Tag tone="success">Settled</Tag>
    case 'open':
      return iou.paidMarks.length > 0 ? <Tag tone="brand">Marked paid by one</Tag> : <Tag>Open</Tag>
  }
}
