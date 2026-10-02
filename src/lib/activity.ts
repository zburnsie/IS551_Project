import type { Activity, UserId } from '../data/types'

type NameOf = (id: UserId | null | undefined, lower?: boolean) => string

/** One plain sentence for a feed or inbox entry, from the viewer's point of view. */
export function describeActivity(a: Activity, nameOf: NameOf): string {
  const actor = nameOf(a.actor)
  const subject = nameOf(a.subject, true)
  switch (a.kind) {
    case 'room-created':
      return `${actor} created ${a.label}`
    case 'joined':
      return `${actor} joined ${a.label}`
    case 'list-created':
      return `${actor} started the ${a.label} chore list`
    case 'chore-assigned':
      return `${actor} assigned “${a.label}” to ${subject}`
    case 'chore-done':
      return a.subject
        ? `${actor} finished “${a.label}”. Next up: ${subject}`
        : `${actor} finished “${a.label}”`
    case 'iou-logged':
      return `${actor} logged an IOU with ${subject}: ${a.label}`
    case 'iou-confirmed':
      return `${actor} confirmed the IOU: ${a.label}`
    case 'iou-countered':
      return `${actor} suggested ${a.label}`
    case 'iou-declined':
      return `${actor} declined the IOU: ${a.label}`
    case 'iou-marked-paid':
      return `${actor} marked the IOU with ${subject} as paid: ${a.label}`
    case 'iou-settled':
      return `${actor} and ${subject} settled up: ${a.label}`
  }
}

export function activityLink(a: Activity): string | null {
  if (a.choreId) return `/chores/${a.choreId}`
  if (a.iouId) return `/money/ious/${a.iouId}`
  if (a.listId) return `/chores/lists/${a.listId}`
  if (a.kind === 'iou-marked-paid' || a.kind === 'iou-settled') return `/money/settle/${a.actor}`
  return null
}
