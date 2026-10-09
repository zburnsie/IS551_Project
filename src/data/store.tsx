import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { nextDueDate, nextInRotation } from '../lib/chores'
import { iouValue } from '../lib/balances'
import { firstName, todayIso } from '../lib/format'
import { demoState, emptyState } from './seed'
import type { Activity, AppState, Chore, Iou, Repeat, Room, User, UserId } from './types'

const STORAGE_KEY = 'common-room:app'

const newId = () => crypto.randomUUID().slice(0, 8)

function newRoomCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const pick = () => letters[Math.floor(Math.random() * letters.length)]
  return `${pick()}${pick()}${pick()}-${String(Math.floor(100 + Math.random() * 900))}`
}

function load(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const state = { ...emptyState, ...(JSON.parse(saved) as AppState) }
      // Older saves don't have `waitingOn`; it's whoever didn't log the IOU.
      state.ious = state.ious.map((i) =>
        i.waitingOn ? i : { ...i, waitingOn: i.createdBy === i.debtor ? i.creditor : i.debtor },
      )
      return state
    }
  } catch {
    // Ignore unreadable storage and start fresh.
  }
  return emptyState
}

type NewActivity = Omit<Activity, 'id' | 'at' | 'readBy' | 'notify' | 'roomId'> & { notify?: UserId[] }

type AppContextValue = {
  state: AppState
  me: User | null
  room: Room | null
  /** Everyone in your room, you first. */
  members: User[]
  userOf: (id: UserId) => User | undefined
  /** "You" for you, otherwise the roommate's first name. Use `lower` mid-sentence. */
  nameOf: (id: UserId | null | undefined, lower?: boolean) => string

  // Account
  signUp: (email: string, method: User['method']) => 'ok' | 'exists'
  logIn: (email: string) => boolean
  logOut: () => void
  updateProfile: (patch: Partial<Pick<User, 'name' | 'dorm' | 'photo'>>) => void
  setPendingCode: (code: string | null) => void

  // Room
  createRoom: (name: string) => void
  updateRoom: (patch: Partial<Pick<Room, 'name'>>) => void
  joinRoom: (code: string) => boolean
  simulateRoommateJoining: () => string | null

  // Chores
  createChoreList: (name: string) => string
  addChore: (chore: { listId: string; title: string; notes: string; dueDate: string; repeat: Repeat }) => string
  assignChore: (choreId: string, assignedTo: UserId, rotation: UserId[]) => void
  completeChore: (choreId: string) => void
  reopenChore: (choreId: string) => void
  deleteChore: (choreId: string) => void

  // IOUs
  logIou: (iou: Pick<Iou, 'debtor' | 'creditor' | 'kind' | 'amountCents' | 'favor' | 'note'>) => string
  respondToIou: (iouId: string, accept: boolean) => void
  /** Sends the IOU back to the other roommate with a different amount (or favor) to confirm. */
  suggestIouChange: (iouId: string, change: { amountCents: number; favor: string }) => void
  withdrawIou: (iouId: string) => void
  /** Marks your side as paid on the open IOUs with a roommate — all of them, or just the ones listed. */
  markPaidWith: (otherId: UserId, iouIds?: string[]) => void

  // Inbox
  markInboxRead: () => void

  // Prototype controls
  actAs: (userId: UserId) => void
  loadDemo: () => void
  resetAll: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

/**
 * Temporary client-side store saved to localStorage. Swap this for API calls
 * once there's a backend; pages only talk to `useApp()`.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage may be unavailable (private mode); the app still works in memory.
    }
  }, [state])

  const me = state.users.find((u) => u.id === state.sessionUserId) ?? null
  const room = state.rooms.find((r) => r.id === me?.roomId) ?? null
  const members = room
    ? [me!, ...room.memberIds.filter((id) => id !== me!.id).map((id) => state.users.find((u) => u.id === id)!)]
    : me
      ? [me]
      : []

  const userOf = (id: UserId) => state.users.find((u) => u.id === id)
  const nameOf = (id: UserId | null | undefined, lower = false) => {
    if (!id) return lower ? 'no one' : 'No one'
    if (id === me?.id) return lower ? 'you' : 'You'
    return firstName(userOf(id)?.name ?? 'Someone')
  }

  const meId = me?.id ?? ''
  const roomId = room?.id ?? ''

  /** Adds an activity entry, already read by whoever did it. */
  const withActivity = (s: AppState, a: NewActivity): AppState => ({
    ...s,
    activity: [
      { ...a, id: newId(), roomId, at: new Date().toISOString(), notify: a.notify ?? [], readBy: [a.actor] },
      ...s.activity,
    ],
  })

  const updateChore = (s: AppState, id: string, patch: Partial<Chore>): AppState => ({
    ...s,
    chores: s.chores.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  })

  const value: AppContextValue = {
    state,
    me,
    room,
    members,
    userOf,
    nameOf,

    signUp: (email, method) => {
      const normalized = email.trim().toLowerCase()
      if (state.users.some((u) => u.email === normalized)) return 'exists'
      const user: User = { id: newId(), email: normalized, method, name: '', dorm: '', photo: null, roomId: null }
      setState((s) => ({ ...s, users: [...s.users, user], sessionUserId: user.id }))
      return 'ok'
    },
    logIn: (email) => {
      const user = state.users.find((u) => u.email === email.trim().toLowerCase())
      if (!user) return false
      setState((s) => ({ ...s, sessionUserId: user.id }))
      return true
    },
    logOut: () => setState((s) => ({ ...s, sessionUserId: null })),
    updateProfile: (patch) =>
      setState((s) => ({ ...s, users: s.users.map((u) => (u.id === meId ? { ...u, ...patch } : u)) })),
    setPendingCode: (code) => setState((s) => ({ ...s, pendingCode: code })),

    createRoom: (name) => {
      const newRoom: Room = { id: newId(), name, code: newRoomCode(), memberIds: [meId] }
      setState((s) => ({
        ...s,
        rooms: [...s.rooms, newRoom],
        users: s.users.map((u) => (u.id === meId ? { ...u, roomId: newRoom.id } : u)),
        activity: [
          { id: newId(), roomId: newRoom.id, at: new Date().toISOString(), kind: 'room-created', actor: meId, label: name, notify: [], readBy: [meId] },
          ...s.activity,
        ],
      }))
    },
    updateRoom: (patch) =>
      setState((s) => ({
        ...s,
        rooms: s.rooms.map((r) => (r.id === roomId ? { ...r, ...patch } : r)),
      })),
    joinRoom: (code) => {
      const target = state.rooms.find((r) => r.code.toUpperCase() === code.trim().toUpperCase())
      if (!target) return false
      setState((s) => ({
        ...s,
        pendingCode: null,
        rooms: s.rooms.map((r) =>
          r.id === target.id && !r.memberIds.includes(meId) ? { ...r, memberIds: [...r.memberIds, meId] } : r,
        ),
        users: s.users.map((u) => (u.id === meId ? { ...u, roomId: target.id } : u)),
        activity: [
          { id: newId(), roomId: target.id, at: new Date().toISOString(), kind: 'joined', actor: meId, label: target.name, notify: target.memberIds, readBy: [meId] },
          ...s.activity,
        ],
      }))
      return true
    },
    simulateRoommateJoining: () => {
      if (!room) return null
      const pool = ['Maya Chen', 'Sam Okafor', 'Jordan Lee', 'Priya Shah', 'Theo Martin', 'Ana Ruiz']
      const taken = new Set(members.map((m) => m.name))
      const name = pool.find((n) => !taken.has(n))
      if (!name) return null
      const user: User = {
        id: newId(),
        email: `${firstName(name).toLowerCase()}.${newId().slice(0, 4)}@school.edu`,
        method: 'school',
        name,
        dorm: me?.dorm ?? '',
        photo: null,
        roomId: room.id,
      }
      setState((s) =>
        withActivity(
          {
            ...s,
            users: [...s.users, user],
            rooms: s.rooms.map((r) => (r.id === room.id ? { ...r, memberIds: [...r.memberIds, user.id] } : r)),
          },
          { kind: 'joined', actor: user.id, label: room.name, notify: room.memberIds },
        ),
      )
      return firstName(name)
    },

    createChoreList: (name) => {
      const id = newId()
      setState((s) =>
        withActivity(
          { ...s, choreLists: [...s.choreLists, { id, roomId, name }] },
          { kind: 'list-created', actor: meId, label: name, listId: id },
        ),
      )
      return id
    },
    addChore: (chore) => {
      const id = newId()
      setState((s) => ({ ...s, chores: [...s.chores, { ...chore, id, rotation: [], assignedTo: null, done: false }] }))
      return id
    },
    assignChore: (choreId, assignedTo, rotation) => {
      const chore = state.chores.find((c) => c.id === choreId)
      if (!chore) return
      setState((s) =>
        withActivity(updateChore(s, choreId, { assignedTo, rotation }), {
          kind: 'chore-assigned',
          actor: meId,
          subject: assignedTo,
          label: chore.title,
          choreId,
          notify: assignedTo === meId ? [] : [assignedTo],
        }),
      )
    },
    completeChore: (choreId) => {
      const chore = state.chores.find((c) => c.id === choreId)
      if (!chore) return
      const others = room?.memberIds.filter((id) => id !== meId) ?? []
      if (chore.repeat === 'none') {
        setState((s) =>
          withActivity(updateChore(s, choreId, { done: true }), {
            kind: 'chore-done', actor: meId, label: chore.title, choreId, notify: others,
          }),
        )
        return
      }
      // Repeating chores roll forward to the next date and the next roommate.
      const next = nextInRotation(chore.rotation, chore.assignedTo)
      setState((s) =>
        withActivity(
          updateChore(s, choreId, { assignedTo: next, dueDate: nextDueDate(chore.dueDate, chore.repeat) }),
          { kind: 'chore-done', actor: meId, subject: next ?? undefined, label: chore.title, choreId, notify: others },
        ),
      )
    },
    reopenChore: (choreId) => setState((s) => updateChore(s, choreId, { done: false })),
    deleteChore: (choreId) => setState((s) => ({ ...s, chores: s.chores.filter((c) => c.id !== choreId) })),

    logIou: (iou) => {
      const id = newId()
      const other = iou.debtor === meId ? iou.creditor : iou.debtor
      const full: Iou = { ...iou, id, roomId, createdBy: meId, date: todayIso(), status: 'pending', waitingOn: other, paidMarks: [] }
      setState((s) =>
        withActivity(
          { ...s, ious: [full, ...s.ious] },
          { kind: 'iou-logged', actor: meId, subject: other, label: `${iouValue(full)} · ${iou.note}`, iouId: id, notify: [other] },
        ),
      )
      return id
    },
    respondToIou: (iouId, accept) => {
      const iou = state.ious.find((i) => i.id === iouId)
      if (!iou) return
      const other = iou.debtor === meId ? iou.creditor : iou.debtor
      setState((s) =>
        withActivity(
          { ...s, ious: s.ious.map((i) => (i.id === iouId ? { ...i, status: accept ? 'open' : 'declined' } : i)) },
          {
            kind: accept ? 'iou-confirmed' : 'iou-declined',
            actor: meId,
            subject: other,
            label: `${iouValue(iou)} · ${iou.note}`,
            iouId,
            notify: [other],
          },
        ),
      )
    },
    suggestIouChange: (iouId, change) => {
      const iou = state.ious.find((i) => i.id === iouId)
      if (!iou) return
      const other = iou.debtor === meId ? iou.creditor : iou.debtor
      const updated: Iou = {
        ...iou,
        ...change,
        waitingOn: other,
        previous: { amountCents: iou.amountCents, favor: iou.favor, suggestedBy: meId },
      }
      setState((s) =>
        withActivity(
          { ...s, ious: s.ious.map((i) => (i.id === iouId ? updated : i)) },
          {
            kind: 'iou-countered',
            actor: meId,
            subject: other,
            label: `${iouValue(updated)} instead of ${iouValue(iou)} · ${iou.note}`,
            iouId,
            notify: [other],
          },
        ),
      )
    },
    withdrawIou: (iouId) => setState((s) => ({ ...s, ious: s.ious.filter((i) => i.id !== iouId) })),
    markPaidWith: (otherId, iouIds) => {
      const between = state.ious.filter(
        (i) =>
          i.status === 'open' &&
          (!iouIds || iouIds.includes(i.id)) &&
          ((i.debtor === meId && i.creditor === otherId) || (i.debtor === otherId && i.creditor === meId)),
      )
      if (between.length === 0) return
      const settlesNow = between.every((i) => i.paidMarks.includes(otherId))
      const ids = new Set(between.map((i) => i.id))
      setState((s) =>
        withActivity(
          {
            ...s,
            ious: s.ious.map((i) => {
              if (!ids.has(i.id)) return i
              const paidMarks = i.paidMarks.includes(meId) ? i.paidMarks : [...i.paidMarks, meId]
              return { ...i, paidMarks, status: paidMarks.includes(otherId) ? 'settled' : i.status }
            }),
          },
          {
            kind: settlesNow ? 'iou-settled' : 'iou-marked-paid',
            actor: meId,
            subject: otherId,
            label: between.length === 1 ? `${iouValue(between[0])} · ${between[0].note}` : `${between.length} IOUs`,
            iouId: between.length === 1 ? between[0].id : undefined,
            notify: [otherId],
          },
        ),
      )
    },

    markInboxRead: () =>
      setState((s) => ({
        ...s,
        activity: s.activity.map((a) =>
          a.notify.includes(meId) && !a.readBy.includes(meId) ? { ...a, readBy: [...a.readBy, meId] } : a,
        ),
      })),

    actAs: (userId) => setState((s) => ({ ...s, sessionUserId: userId })),
    loadDemo: () => setState(demoState()),
    resetAll: () => setState(emptyState),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}