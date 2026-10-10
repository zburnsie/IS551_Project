import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ActivityList } from '../../components/ActivityList'
import { Button } from '../../components/Button'
import { Section } from '../../components/Card'
import { ConfettiToast } from '../../components/ConfettiToast'
import { EmptyState, Flash } from '../../components/PageHeader'
import { Tag } from '../../components/Tag'
import { useApp } from '../../data/store'
import { moneyBalance } from '../../lib/balances'
import { daysUntil, firstName, formatDate, formatMoney } from '../../lib/format'

function DueCaption({ dueDate }: { dueDate: string }) {
  const days = daysUntil(dueDate)
  if (days < 0) return <Tag tone="danger">Was due {formatDate(dueDate)}</Tag>
  if (days === 0) return <span className="text-caption text-ink-muted">due today</span>
  if (days === 1) return <span className="text-caption text-ink-muted">due tomorrow</span>
  return <span className="text-caption text-ink-muted">due {formatDate(dueDate)}</span>
}

export function RoomHomePage() {
  const { me, room, members, state, completeChore } = useApp()
  const [toast, setToast] = useState<string | null>(null)
  const roomListIds = new Set(state.choreLists.filter((l) => l.roomId === room!.id).map((l) => l.id))
  const roomChores = state.chores.filter((c) => roomListIds.has(c.listId))
  const roomIous = state.ious.filter((i) => i.roomId === room!.id)

  const myChores = roomChores
    .filter((c) => c.assignedTo === me!.id && !c.done)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const netCents = members
    .filter((m) => m.id !== me!.id)
    .reduce((sum, m) => sum + moneyBalance(roomIous, me!.id, m.id), 0)
  const needsOk = roomIous.filter((i) => i.status === 'pending' && i.waitingOn === me!.id).length

  const choreFeed = state.activity
    .filter((a) => a.roomId === room!.id && (a.kind === 'chore-done' || a.kind === 'chore-assigned' || a.kind === 'list-created'))
    .slice(0, 6)

  const balanceLabel =
    netCents > 0 ? (
      <>You’re owed <span className="text-amount text-positive">{formatMoney(netCents)}</span></>
    ) : netCents < 0 ? (
      <>You owe <span className="text-amount text-danger">{formatMoney(-netCents)}</span></>
    ) : (
      'You’re even'
    )

  return (
    <>
      {toast && <ConfettiToast message={toast} onDismiss={() => setToast(null)} />}
      <Flash />
      <header>
        <h1 className="text-title">Hi, {firstName(me!.name)}</h1>
      </header>

      <section
        className={`flex flex-col gap-4 rounded-md border-2 p-4 ${
          myChores.length === 0 ? 'border-success bg-success' : 'border-accent bg-surface'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className={`text-heading ${myChores.length === 0 ? 'text-success-ink' : 'text-ink'}`}>Your Chores</h2>
          <Link to="/chores" className={`text-label underline ${myChores.length === 0 ? 'text-success-ink' : 'text-ink'}`}>All chores</Link>
        </div>
        {myChores.length === 0 ? (
          <EmptyState title="All done" className="border-success bg-surface text-success-ink">
            <p className="text-body text-success-ink">When someone assigns you a chore, it shows up here.</p>
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
                <DueCaption dueDate={chore.dueDate} />
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
      </section>

      <section className="flex flex-col gap-2 opacity-80">
        <h2 className="text-caption text-ink-muted">Balance</h2>
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/money"
            className="rounded-md border border-rule bg-paper px-4 py-2 text-body text-ink-muted hover:border-rule"
          >
            {balanceLabel}
          </Link>
          <Link
            to="/money"
            className="rounded-md border border-rule bg-paper px-4 py-2 text-body text-ink-muted hover:border-rule"
          >
            Needs OK: <span className="text-amount">{needsOk}</span>
          </Link>
        </div>
      </section>

      <Section title="Room Activity">
        {choreFeed.length > 0 ? (
          <ActivityList items={choreFeed} />
        ) : (
          <p className="text-body text-ink-muted">No chore activity yet.</p>
        )}
      </Section>
    </>
  )
}
