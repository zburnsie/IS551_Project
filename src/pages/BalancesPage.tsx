import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card, Section } from '../components/Card'
import { Tag } from '../components/Tag'
import { useHousehold, useRoommateName } from '../data/household'
import { balancesWithMe } from '../lib/balances'
import { daysUntil, formatDate, formatMoney, todayIso } from '../lib/format'

export function BalancesPage() {
  const { household, addPayment } = useHousehold()
  const nameOf = useRoommateName()
  const balances = [...balancesWithMe(household)]
  const net = balances.reduce((sum, [, cents]) => sum + cents, 0)

  const upcomingChores = household.chores
    .filter((c) => !c.done && c.assignedTo === household.meId && daysUntil(c.dueDate) <= 3)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const settleUp = (roommateId: string, cents: number) => {
    // Positive means they owe me, so the payment goes from them to me.
    addPayment(
      cents > 0
        ? { from: roommateId, to: household.meId, amountCents: cents, date: todayIso() }
        : { from: household.meId, to: roommateId, amountCents: -cents, date: todayIso() },
    )
  }

  return (
    <>
      <section className="flex flex-col gap-2">
        <p className="text-caption text-ink-muted">Overall</p>
        <h1 className="text-display">
          {net === 0 ? (
            'You’re all square'
          ) : (
            <>
              {net > 0 ? 'You’re owed ' : 'You owe '}
              <span className="text-display font-mono bg-highlight rounded-md px-2 tabular-nums">
                {formatMoney(Math.abs(net))}
              </span>
            </>
          )}
        </h1>
      </section>

      <Section title="Roommates">
        <ul className="flex flex-col gap-2">
          {balances.map(([id, cents]) => (
            <li key={id}>
              <Card className="flex flex-wrap items-center gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-body">
                    {cents > 0 && `${nameOf(id)} owes you`}
                    {cents < 0 && `You owe ${nameOf(id)}`}
                    {cents === 0 && `You and ${nameOf(id)} are settled up`}
                  </span>
                  <span>
                    {cents > 0 && <Tag tone="accent">Owed to you</Tag>}
                    {cents < 0 && <Tag tone="brand">You owe</Tag>}
                    {cents === 0 && <Tag>Settled</Tag>}
                  </span>
                </div>
                <span className="text-amount text-right">{formatMoney(Math.abs(cents))}</span>
                <Button variant="secondary" disabled={cents === 0} onClick={() => settleUp(id, cents)}>
                  Settle up
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Your chores this week" action={<Link to="/chores" className="text-label underline">See all</Link>}>
        {upcomingChores.length === 0 ? (
          <p className="text-body text-ink-muted">Nothing due in the next few days.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcomingChores.map((chore) => (
              <li key={chore.id}>
                <Card className="flex items-center justify-between gap-4">
                  <span className="text-body">{chore.title}</span>
                  <span className="text-caption text-ink-muted">{formatDate(chore.dueDate)}</span>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  )
}
