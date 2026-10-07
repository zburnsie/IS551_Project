import type { Iou, UserId } from '../data/types'
import { formatMoney } from './format'

/** Confirmed, unpaid IOUs between two roommates (either direction). */
export function openIousBetween(ious: Iou[], a: UserId, b: UserId): Iou[] {
  return ious.filter(
    (i) =>
      i.status === 'open' &&
      ((i.debtor === a && i.creditor === b) || (i.debtor === b && i.creditor === a)),
  )
}

/**
 * Net money between you and another roommate, in cents: positive means they
 * owe you, negative means you owe them. Only confirmed money IOUs count.
 */
export function moneyBalance(ious: Iou[], meId: UserId, otherId: UserId): number {
  return openIousBetween(ious, meId, otherId)
    .filter((i) => i.kind === 'money')
    .reduce((sum, i) => sum + (i.creditor === meId ? i.amountCents : -i.amountCents), 0)
}

/** "$20.00" or "a dinner" — what the IOU is worth, in words. */
export function iouValue(iou: Iou): string {
  return iou.kind === 'money' ? formatMoney(iou.amountCents) : iou.favor
}
