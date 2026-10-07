import { Link } from 'react-router-dom'
import { ActivityList } from '../../components/ActivityList'
import { Avatar } from '../../components/Avatar'
import { ButtonLink } from '../../components/Button'
import { Section } from '../../components/Card'
import { ChoreRow } from '../../components/ChoreRow'
import { EmptyState, Flash } from '../../components/PageHeader'
import { Tag } from '../../components/Tag'
import { useApp } from '../../data/store'
import { moneyBalance } from '../../lib/balances'
import { daysUntil, formatMoney } from '../../lib/format'

export function RoomHomePage() {
  const { me, room, members, state, nameOf } = useApp()
  const roomListIds = new Set(state.choreLists.filter((l) => l.roomId === room!.id).map((l) => l.id))
  const roomChores = state.chores.filter((c) => roomListIds.has(c.listId))
  const roomIous = state.ious.filter((i) => i.roomId === room!.id)

  const myChores = roomChores
    .filter((c) => c.assignedTo === me!.id && !c.done)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const dueSoon = myChores.filter((c) => daysUntil(c.dueDate) <= 2).length
  const net = members.slice(1).reduce((sum, m) => sum + moneyBalance(roomIous, me!.id, m.id), 0)
  const needsMe = roomIous.filter((i) => i.status === 'pending' && i.waitingOn === me!.id)
  const feed = state.activity.filter((a) => a.roomId === room!.id).slice(0, 6)

  return (
    <>
      <Flash />
      <header className="flex flex-col gap-2">
        <p className="text-caption text-ink-muted">{room!.name}</p>
        <h1 className="text-title">Hi, {me!.name.split(' ')[0]}</h1>
      </header>

      {/* The two main ways into the app. Olive for chores, terracotta for money, each with a worded call to action. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/chores" className="group flex flex-col overflow-hidden rounded-md border border-rule bg-surface transition hover:border-accent">
          <span className="h-2 bg-accent" aria-hidden />
          <span className="flex flex-1 flex-col gap-2 p-4">
            <span><Tag tone="accent">Your chores</Tag></span>
            <span className="text-heading">
              {myChores.length === 0 ? 'Nothing on your plate' : `${myChores.length} to do`}
            </span>
            <span className="text-body flex-1 text-ink-muted">{dueSoon > 0 ? `${dueSoon} due in the next two days` : 'Nothing due soon'}</span>
            <span className="text-label text-accent group-hover:underline">
              {myChores.length === 0 ? 'Add or assign chores' : 'See your chores'} →
            </span>
          </span>
        </Link>
        <Link to="/money" className="group flex flex-col overflow-hidden rounded-md border border-rule bg-surface transition hover:border-brand">
          <span className="h-2 bg-brand" aria-hidden />
          <span className="flex flex-1 flex-col gap-2 p-4">
            <span><Tag tone="brand">Your balance</Tag></span>
            <span className="text-heading">
              {net === 0 && 'All square'}
              {net > 0 && <>You’re owed <span className="font-mono">{formatMoney(net)}</span></>}
              {net < 0 && <>You owe <span className="font-mono">{formatMoney(-net)}</span></>}
            </span>
            <span className="text-body flex-1 text-ink-muted">Across {members.length - 1} {members.length === 2 ? 'roommate' : 'roommates'}</span>
            <span className="text-label text-brand group-hover:underline">
              {net === 0 ? 'Log an IOU' : 'See balances and settle up'} →
            </span>
          </span>
        </Link>
      </div>

      {needsMe.length > 0 && (
        <Section title="Needs your OK">
          <ul className="flex flex-col gap-2">
            {needsMe.map((iou) => (
              <li key={iou.id}>
                <Link to={`/money/ious/${iou.id}`} className="flex flex-wrap items-center gap-4 rounded-md border border-brand bg-surface p-4 hover:bg-paper">
                  <span className="text-body flex-1">
                    {nameOf(iou.debtor === me!.id ? iou.creditor : iou.debtor)} {iou.previous ? 'suggests' : 'says'} {iou.debtor === me!.id ? 'you owe them' : 'they owe you'}{' '}
                    {iou.kind === 'money' ? <span className="text-amount">{formatMoney(iou.amountCents)}</span> : iou.favor} for “{iou.note}”
                  </span>
                  <span className="text-label underline">Review</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Up next for you" action={<Link to="/chores" className="text-label underline">All chores</Link>}>
        {myChores.length === 0 ? (
          <EmptyState title="You’re clear">
            <p className="text-body text-ink-muted">When someone assigns you a chore, it shows up here.</p>
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {myChores.slice(0, 4).map((c) => (
              <li key={c.id}><ChoreRow chore={c} showList /></li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Roommates" action={<Link to="/room/invite" className="text-label underline">Invite</Link>}>
        <ul className="flex flex-wrap gap-2">
          {members.map((m) => (
            <li key={m.id} className="text-label flex items-center gap-2 rounded-pill border border-rule bg-surface py-1 pl-1 pr-4">
              <Avatar user={m} size="sm" />
              {m.id === me!.id ? 'You' : m.name}
            </li>
          ))}
        </ul>
        {members.length === 1 && (
          <ButtonLink to="/room/invite" variant="secondary" className="self-start">Invite your roommates</ButtonLink>
        )}
      </Section>

      <Section title="Room activity" action={<Link to="/inbox" className="text-label underline">Inbox</Link>}>
        {feed.length > 0 ? <ActivityList items={feed} /> : <p className="text-body text-ink-muted">Nothing yet.</p>}
      </Section>
    </>
  )
}
