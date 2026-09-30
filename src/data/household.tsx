import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { seedHousehold } from './seed'
import type { Chore, Expense, Household, Payment } from './types'

const STORAGE_KEY = 'common-room:household'

type HouseholdContextValue = {
  household: Household
  addExpense: (expense: Omit<Expense, 'id'>) => void
  addPayment: (payment: Omit<Payment, 'id'>) => void
  addChore: (chore: Omit<Chore, 'id' | 'done'>) => void
  toggleChore: (id: string) => void
  resetDemoData: () => void
}

const HouseholdContext = createContext<HouseholdContextValue | null>(null)

function load(): Household {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved) as Household
  } catch {
    // Ignore unreadable storage and fall back to the seed data.
  }
  return seedHousehold
}

const newId = () => crypto.randomUUID()

/**
 * Temporary client-side store. Swap this for API calls once there's a backend;
 * components only talk to `useHousehold()`, so they won't need to change.
 */
export function HouseholdProvider({ children }: { children: ReactNode }) {
  const [household, setHousehold] = useState<Household>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(household))
    } catch {
      // Storage may be unavailable (private mode); the app still works in memory.
    }
  }, [household])

  const value: HouseholdContextValue = {
    household,
    addExpense: (expense) =>
      setHousehold((h) => ({ ...h, expenses: [{ ...expense, id: newId() }, ...h.expenses] })),
    addPayment: (payment) =>
      setHousehold((h) => ({ ...h, payments: [{ ...payment, id: newId() }, ...h.payments] })),
    addChore: (chore) =>
      setHousehold((h) => ({ ...h, chores: [...h.chores, { ...chore, id: newId(), done: false }] })),
    toggleChore: (id) =>
      setHousehold((h) => ({
        ...h,
        chores: h.chores.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
      })),
    resetDemoData: () => setHousehold(seedHousehold),
  }

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>
}

export function useHousehold() {
  const ctx = useContext(HouseholdContext)
  if (!ctx) throw new Error('useHousehold must be used inside <HouseholdProvider>')
  return ctx
}

export function useRoommateName() {
  const { household } = useHousehold()
  return (id: string) => household.roommates.find((r) => r.id === id)?.name ?? 'Someone'
}
