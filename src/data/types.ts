export type UserId = string

export type User = {
  id: UserId
  email: string
  /** How they signed up. School login is simulated in the prototype. */
  method: 'email' | 'school'
  name: string
  dorm: string
  /** Small data-URL image, or null to show initials. */
  photo: string | null
  roomId: string | null
}

export type Room = {
  id: string
  name: string
  /** Invite code roommates type in, e.g. "KTX-482". */
  code: string
  memberIds: UserId[]
}

export type Repeat = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'

export type ChoreList = {
  id: string
  roomId: string
  name: string
}

export type Chore = {
  id: string
  listId: string
  title: string
  notes: string
  dueDate: string // ISO date, e.g. "2026-10-02"
  repeat: Repeat
  /** Who takes turns, in order. Empty until someone is assigned. */
  rotation: UserId[]
  assignedTo: UserId | null
  /** Only one-off chores stay done; repeating chores roll forward instead. */
  done: boolean
}

/**
 * An IOU between two roommates. `debtor` owes `creditor` either money
 * (`amountCents`) or something else (`favor`, like "a dinner").
 */
export type Iou = {
  id: string
  roomId: string
  debtor: UserId
  creditor: UserId
  kind: 'money' | 'favor'
  amountCents: number
  favor: string
  note: string
  createdBy: UserId
  date: string
  /** pending → waiting on the other roommate; open → confirmed and unpaid. */
  status: 'pending' | 'declined' | 'open' | 'settled'
  /** Roommates who have marked it paid. Settled once both have. */
  paidMarks: UserId[]
}

export type ActivityKind =
  | 'room-created'
  | 'joined'
  | 'list-created'
  | 'chore-assigned'
  | 'chore-done'
  | 'iou-logged'
  | 'iou-confirmed'
  | 'iou-declined'
  | 'iou-marked-paid'
  | 'iou-settled'

/** One entry in the room feed. Entries with `notify` also land in those roommates' inboxes. */
export type Activity = {
  id: string
  roomId: string
  at: string // ISO timestamp
  kind: ActivityKind
  actor: UserId
  /** The other roommate involved (assignee, the other side of an IOU, next in rotation). */
  subject?: UserId
  /** Chore title, list name or IOU summary, captured at the time. */
  label: string
  choreId?: string
  iouId?: string
  listId?: string
  notify: UserId[]
  readBy: UserId[]
}

export type AppState = {
  users: User[]
  rooms: Room[]
  choreLists: ChoreList[]
  chores: Chore[]
  ious: Iou[]
  activity: Activity[]
  /** Who is signed in. The prototype bar can switch this to act as another roommate. */
  sessionUserId: UserId | null
  /** Code from an invite link, kept until the person finishes signing up. */
  pendingCode: string | null
}
