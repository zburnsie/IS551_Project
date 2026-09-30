export type RoommateId = string

export type Roommate = {
  id: RoommateId
  name: string
}

/** Amounts are stored in cents to avoid floating-point rounding. */
export type Expense = {
  id: string
  description: string
  amountCents: number
  paidBy: RoommateId
  splitAmong: RoommateId[]
  date: string // ISO date, e.g. "2026-09-28"
}

export type Payment = {
  id: string
  from: RoommateId
  to: RoommateId
  amountCents: number
  date: string
}

export type Chore = {
  id: string
  title: string
  assignedTo: RoommateId
  dueDate: string
  done: boolean
}

export type Household = {
  name: string
  meId: RoommateId
  roommates: Roommate[]
  expenses: Expense[]
  payments: Payment[]
  chores: Chore[]
}
