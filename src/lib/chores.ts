import type { Chore, Repeat, UserId } from '../data/types'
import { addDays, addMonths } from './format'

export const repeatLabels: Record<Repeat, string> = {
  none: 'Does not repeat',
  daily: 'Every day',
  weekly: 'Every week',
  biweekly: 'Every 2 weeks',
  monthly: 'Every month',
}

export function nextDueDate(isoDate: string, repeat: Repeat): string {
  switch (repeat) {
    case 'daily':
      return addDays(isoDate, 1)
    case 'weekly':
      return addDays(isoDate, 7)
    case 'biweekly':
      return addDays(isoDate, 14)
    case 'monthly':
      return addMonths(isoDate, 1)
    case 'none':
      return isoDate
  }
}

/** Whoever comes after `current` in the rotation, wrapping around. */
export function nextInRotation(rotation: UserId[], current: UserId | null): UserId | null {
  if (rotation.length === 0) return current
  const i = current ? rotation.indexOf(current) : -1
  return rotation[(i + 1) % rotation.length]
}

/** The next few turns for a repeating chore, starting with the current one. */
export function upcomingTurns(chore: Chore, count: number): { who: UserId; due: string }[] {
  if (!chore.assignedTo) return []
  const turns = [{ who: chore.assignedTo, due: chore.dueDate }]
  if (chore.repeat === 'none') return turns
  while (turns.length < count) {
    const prev = turns[turns.length - 1]
    turns.push({ who: nextInRotation(chore.rotation, prev.who) ?? prev.who, due: nextDueDate(prev.due, chore.repeat) })
  }
  return turns
}
