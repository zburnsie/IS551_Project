import { addDays, todayIso } from '../lib/format'
import type { Activity, AppState, ChoreCompletion } from './types'

export const emptyState: AppState = {
  users: [],
  rooms: [],
  choreLists: [],
  chores: [],
  completions: [],
  ious: [],
  activity: [],
  sessionUserId: null,
  pendingCode: null,
}

/** A filled-in room for demos, signed in as Alex. Dates are relative to today. */
export function demoState(): AppState {
  const today = todayIso()
  const d = (n: number) => addDays(today, n)
  const at = (daysAgo: number, hour: number) => {
    const t = new Date()
    t.setDate(t.getDate() - daysAgo)
    t.setHours(hour, 0, 0, 0)
    return t.toISOString()
  }
  const room = 'demo-room'
  const everyone = ['alex', 'maya', 'sam', 'jordan']
  const done = (c: Omit<ChoreCompletion, 'roomId'>): ChoreCompletion => ({ roomId: room, ...c })
  const feed = (a: Omit<Activity, 'roomId' | 'readBy'> & { readBy?: string[] }): Activity => ({
    roomId: room,
    readBy: everyone,
    ...a,
  })

  return {
    sessionUserId: 'alex',
    pendingCode: null,
    users: [
      { id: 'alex', email: 'alex@school.edu', method: 'school', name: 'Alex Rivera', dorm: 'Heritage Halls, Building 12', photo: null, roomId: room },
      { id: 'maya', email: 'maya@school.edu', method: 'school', name: 'Maya Chen', dorm: 'Heritage Halls, Building 12', photo: null, roomId: room },
      { id: 'sam', email: 'sam@example.com', method: 'email', name: 'Sam Okafor', dorm: 'Heritage Halls, Building 12', photo: null, roomId: room },
      { id: 'jordan', email: 'jordan@school.edu', method: 'school', name: 'Jordan Lee', dorm: 'Heritage Halls, Building 12', photo: null, roomId: room },
    ],
    rooms: [{ id: room, name: 'Dorm 204', code: 'KTX-482', memberIds: everyone }],
    choreLists: [
      { id: 'kitchen', roomId: room, name: 'Kitchen', memberIds: [] },
      { id: 'bathroom', roomId: room, name: 'Front bathroom', memberIds: ['alex', 'jordan'] },
      { id: 'back-bath', roomId: room, name: 'Back bathroom', memberIds: ['maya', 'sam'] },
      { id: 'common', roomId: room, name: 'Common area', memberIds: [] },
    ],
    chores: [
      { id: 'trash', listId: 'kitchen', title: 'Take out trash and recycling', notes: 'Bins go to the chute at the end of the hall.', dueDate: d(0), repeat: 'weekly', rotation: everyone, assignedTo: 'alex', done: false },
      { id: 'dishes', listId: 'kitchen', title: 'Run and empty the dishwasher', notes: '', dueDate: d(1), repeat: 'daily', rotation: ['maya', 'sam'], assignedTo: 'maya', done: false },
      { id: 'fridge', listId: 'kitchen', title: 'Clear out the fridge', notes: 'Anything unlabeled and older than a week goes.', dueDate: d(5), repeat: 'none', rotation: [], assignedTo: null, done: false },
      { id: 'counters', listId: 'kitchen', title: 'Wipe down counters and stove', notes: '', dueDate: d(-2), repeat: 'weekly', rotation: everyone, assignedTo: 'jordan', done: false },
      { id: 'bath', listId: 'bathroom', title: 'Clean the bathroom', notes: 'Sink, mirror, toilet and shower.', dueDate: d(2), repeat: 'weekly', rotation: ['alex', 'jordan'], assignedTo: 'jordan', done: false },
      { id: 'back-clean', listId: 'back-bath', title: 'Clean the bathroom', notes: 'Sink, mirror, toilet and shower.', dueDate: d(3), repeat: 'weekly', rotation: ['maya', 'sam'], assignedTo: 'maya', done: false },
      { id: 'tp', listId: 'back-bath', title: 'Restock toilet paper', notes: '', dueDate: d(-1), repeat: 'none', rotation: ['sam'], assignedTo: 'sam', done: true },
      { id: 'vacuum', listId: 'common', title: 'Vacuum the common room', notes: '', dueDate: d(4), repeat: 'biweekly', rotation: ['sam', 'jordan', 'alex', 'maya'], assignedTo: 'sam', done: false },
    ],
    completions: [
      done({ id: 'c1', choreId: 'tp', listId: 'back-bath', title: 'Restock toilet paper', doneBy: 'sam', turnOf: 'sam', dueDate: d(-1), at: at(1, 18) }),
      done({ id: 'c2', choreId: 'dishes', listId: 'kitchen', title: 'Run and empty the dishwasher', doneBy: 'sam', turnOf: 'sam', dueDate: d(0), at: at(0, 9) }),
      done({ id: 'c3', choreId: 'trash', listId: 'kitchen', title: 'Take out trash and recycling', doneBy: 'jordan', turnOf: 'jordan', dueDate: d(-7), at: at(6, 19) }),
      done({ id: 'c4', choreId: 'bath', listId: 'bathroom', title: 'Clean the bathroom', doneBy: 'alex', turnOf: 'alex', dueDate: d(-5), at: at(5, 14) }),
      done({ id: 'c5', choreId: 'back-clean', listId: 'back-bath', title: 'Clean the bathroom', doneBy: 'sam', turnOf: 'sam', dueDate: d(-4), at: at(2, 11) }),
      done({ id: 'c6', choreId: 'vacuum', listId: 'common', title: 'Vacuum the common room', doneBy: 'maya', turnOf: 'maya', dueDate: d(-10), at: at(10, 16) }),
      done({ id: 'c7', choreId: 'counters', listId: 'kitchen', title: 'Wipe down counters and stove', doneBy: 'alex', turnOf: 'sam', dueDate: d(-9), at: at(9, 20) }),
      done({ id: 'c8', choreId: 'trash', listId: 'kitchen', title: 'Take out trash and recycling', doneBy: 'sam', turnOf: 'sam', dueDate: d(-14), at: at(14, 18) }),
      done({ id: 'c9', choreId: 'bath', listId: 'bathroom', title: 'Clean the bathroom', doneBy: 'jordan', turnOf: 'jordan', dueDate: d(-12), at: at(11, 12) }),
    ],
    ious: [
      { id: 'pizza', roomId: room, debtor: 'maya', creditor: 'alex', kind: 'money', amountCents: 2000, favor: '', note: 'Pizza on Friday', createdBy: 'alex', waitingOn: 'maya', date: d(-3), status: 'open', paidMarks: [] },
      { id: 'detergent', roomId: room, debtor: 'alex', creditor: 'sam', kind: 'money', amountCents: 1250, favor: '', note: 'Laundry detergent', createdBy: 'sam', waitingOn: 'alex', date: d(-5), status: 'open', paidMarks: [] },
      { id: 'dinner', roomId: room, debtor: 'jordan', creditor: 'alex', kind: 'favor', amountCents: 0, favor: 'a dinner', note: 'Covered my shift on dishes', createdBy: 'alex', waitingOn: 'jordan', date: d(-6), status: 'open', paidMarks: [] },
      { id: 'uber', roomId: room, debtor: 'alex', creditor: 'sam', kind: 'money', amountCents: 800, favor: '', note: 'Uber back from the game', createdBy: 'sam', waitingOn: 'alex', date: d(-1), status: 'pending', paidMarks: [] },
      { id: 'tickets', roomId: room, debtor: 'jordan', creditor: 'maya', kind: 'money', amountCents: 1500, favor: '', note: 'Movie ticket', createdBy: 'maya', waitingOn: 'jordan', date: d(-9), status: 'settled', paidMarks: ['jordan', 'maya'] },
    ],
    activity: [
      feed({ id: 'a1', at: at(1, 21), kind: 'iou-logged', actor: 'sam', subject: 'alex', label: '$8.00 · Uber back from the game', iouId: 'uber', notify: ['alex'], readBy: ['sam'] }),
      feed({ id: 'a2', at: at(1, 18), kind: 'chore-done', actor: 'sam', label: 'Restock toilet paper', choreId: 'tp', notify: [] }),
      feed({ id: 'a2b', at: at(2, 11), kind: 'chore-done', actor: 'sam', subject: 'maya', label: 'Clean the bathroom', choreId: 'back-clean', notify: [] }),
      feed({ id: 'a3', at: at(2, 9), kind: 'chore-assigned', actor: 'maya', subject: 'alex', label: 'Take out trash and recycling', choreId: 'trash', notify: ['alex'], readBy: ['maya'] }),
      feed({ id: 'a4', at: at(3, 20), kind: 'iou-confirmed', actor: 'maya', subject: 'alex', label: '$20.00 · Pizza on Friday', iouId: 'pizza', notify: ['alex'] }),
      feed({ id: 'a5', at: at(4, 12), kind: 'iou-settled', actor: 'maya', subject: 'jordan', label: '$15.00 · Movie ticket', iouId: 'tickets', notify: ['jordan'] }),
      feed({ id: 'a6', at: at(6, 10), kind: 'list-created', actor: 'alex', label: 'Common area', listId: 'common', notify: [] }),
      feed({ id: 'a6b', at: at(6, 9), kind: 'list-created', actor: 'maya', label: 'Back bathroom', listId: 'back-bath', notify: [] }),
      feed({ id: 'a7', at: at(7, 10), kind: 'joined', actor: 'jordan', label: 'Dorm 204', notify: [] }),
      feed({ id: 'a8', at: at(8, 10), kind: 'room-created', actor: 'alex', label: 'Dorm 204', notify: [] }),
    ],
  }
}
