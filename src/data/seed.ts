import type { Household } from './types'

// Placeholder data so the UI has something to show until we have a backend.
export const seedHousehold: Household = {
  name: '14 Linden St',
  meId: 'you',
  roommates: [
    { id: 'you', name: 'You' },
    { id: 'maya', name: 'Maya' },
    { id: 'sam', name: 'Sam' },
    { id: 'priya', name: 'Priya' },
  ],
  expenses: [
    { id: 'e1', description: 'October rent', amountCents: 320000, paidBy: 'you', splitAmong: ['you', 'maya', 'sam', 'priya'], date: '2026-09-28' },
    { id: 'e2', description: 'Groceries — Trader Joe’s', amountCents: 8640, paidBy: 'maya', splitAmong: ['you', 'maya', 'sam', 'priya'], date: '2026-09-26' },
    { id: 'e3', description: 'Internet', amountCents: 6500, paidBy: 'sam', splitAmong: ['you', 'maya', 'sam', 'priya'], date: '2026-09-20' },
    { id: 'e4', description: 'Dish soap and sponges', amountCents: 1236, paidBy: 'priya', splitAmong: ['you', 'priya'], date: '2026-09-18' },
  ],
  payments: [
    { id: 'p1', from: 'priya', to: 'you', amountCents: 80000, date: '2026-09-29' },
  ],
  chores: [
    { id: 'c1', title: 'Take out trash and recycling', assignedTo: 'you', dueDate: '2026-09-30', done: false },
    { id: 'c2', title: 'Clean the bathroom', assignedTo: 'maya', dueDate: '2026-10-02', done: false },
    { id: 'c3', title: 'Vacuum the living room', assignedTo: 'sam', dueDate: '2026-10-05', done: false },
    { id: 'c4', title: 'Wipe down the kitchen', assignedTo: 'priya', dueDate: '2026-09-27', done: true },
  ],
}
