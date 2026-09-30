import type { Household, RoommateId } from '../data/types'

/**
 * Splits `amountCents` evenly across `count` people. Any leftover cents go to
 * the first people in the list so the shares always add up to the total.
 */
export function splitEvenly(amountCents: number, count: number): number[] {
  const base = Math.floor(amountCents / count)
  const remainder = amountCents - base * count
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0))
}

/**
 * How much each roommate owes you (positive) or you owe them (negative), in cents.
 */
export function balancesWithMe(household: Household): Map<RoommateId, number> {
  const { meId } = household
  const balances = new Map<RoommateId, number>()
  for (const r of household.roommates) {
    if (r.id !== meId) balances.set(r.id, 0)
  }
  const add = (id: RoommateId, cents: number) => balances.set(id, (balances.get(id) ?? 0) + cents)

  for (const e of household.expenses) {
    const shares = splitEvenly(e.amountCents, e.splitAmong.length)
    e.splitAmong.forEach((person, i) => {
      if (person === e.paidBy) return
      if (e.paidBy === meId) add(person, shares[i]) // they owe me their share
      else if (person === meId) add(e.paidBy, -shares[i]) // I owe the payer my share
    })
  }

  for (const p of household.payments) {
    if (p.from === meId) add(p.to, p.amountCents) // I paid them down
    else if (p.to === meId) add(p.from, -p.amountCents) // they paid me down
  }

  return balances
}
