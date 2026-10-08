import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ActivityList } from '../../components/ActivityList'
import { Button } from '../../components/Button'
import { Section } from '../../components/Card'
import { ConfettiToast } from '../../components/ConfettiToast'
import { EmptyState, Flash } from '../../components/PageHeader'
import { useApp } from '../../data/store'
import { daysUntil, firstName, formatDate, formatMoney } from '../../lib/format'

function dueLabel(dueDate: string): string {
  const days = daysUntil(dueDate)
  if (days < 0) return `was due ${formatDate(dueDate)}`
  if (days === 0) return 'due today'
  if (days === 1) return 'due tomorrow'
  return `due ${formatDate(dueDate)}`
}

export function RoomHomePage() {
  const { me, room, state, completeChore } = useApp()
  const [toast, setToast] = useState<string | null>(null)
  const roomListIds = new Set(state.choreLists.filter((l) => l.roomId === room!.id).map((l) => l.id))
  const roomChores = state.chores.filter((c) => roomListIds.has(c.listId))
  const roomIous = state.ious.filter((i) => i.roomId === room!.id)

  const myChores = roomChores
    .filter((c) => c.assignedTo === me!.id && !c.done)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const youOweCents = roomIous
    .filter((i) => i.status === 'open' && i.kind === 'money' && i.debtor === me!.id)
    .reduce((sum, i) => sum + i.amountCents, 0)
  const needsOk = roomIous.filter((i) => i.status === 'pending' && i.waitingOn === me!.id).length

  const choreFeed = state.activity
    .filter((a) => a.roomId === room!.id && (a.kind === 'chore-done' || a.kind === 'chore-assigned' || a.kind === 'list-created'))
    .slice(0, 6)

  return (
    <>
      {toast && <ConfettiToast message={toast} onDismiss={() => setToast(null)} />}
      <Flash />
      <header>
        <h1 className="text-title">Hi, {firstName(me!.name)}</h1>
      </header>

      <Section title="Your chores" action={<Link to="/chores" className="text-label underline">All chores</Link>}>
        {myChores.length === 0 ? (
          <EmptyState title="You’re clear">
            <p className="text-body text-ink-muted">When someone assigns you a chore, it shows up here.</p>
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {myChores.map((chore) => (
              <li
                key={chore.id}
                className="flex flex-wrap items-center gap-4 rounded-md border border-rule bg-surface p-4"
              >
                <Link to={`/chores/${chore.id}`} className="text-body min-w-0 flex-1 hover:underline">
                  {chore.title}
                </Link>
                <span className="text-caption text-ink-muted">{dueLabel(chore.dueDate)}</span>
                <Button
                  variant="accent"
                  type="button"
                  onClick={() => {
                    completeChore(chore.id)
                    setToast(`Nice — “${chore.title}” is done`)
                  }}
                >
                  Done
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <section className="flex flex-col gap-2">
        <h2 className="text-label text-ink-muted">Balance</h2>
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/money"
            className="rounded-md border border-rule bg-surface px-4 py-3 text-body text-ink-muted hover:border-brand"
          >
            {youOweCents > 0 ? (
              <>you owe <span className="text-amount text-ink">{formatMoney(youOweCents)}</span></>
            ) : (
              'you owe nothing'
            )}
          </Link>
          <Link
            to="/money"
            className="rounded-md border border-rule bg-surface px-4 py-3 text-body text-ink-muted hover:border-brand"
          >
            needs OK: <span className="text-amount text-ink">{needsOk}</span>
          </Link>
        </div>
      </section>

      <Section title="Room activity">
        {choreFeed.length > 0 ? (
          <ActivityList items={choreFeed} />
        ) : (
          <p className="text-body text-ink-muted">No chore activity yet.</p>
        )}
      </Section>
    </>
  )
}
