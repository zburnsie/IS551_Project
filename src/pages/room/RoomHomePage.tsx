import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ActivityList } from '../../components/ActivityList'
import { Avatar } from '../../components/Avatar'
import { Button, ButtonLink } from '../../components/Button'
import { Card, Section } from '../../components/Card'
import { ChoreRow } from '../../components/ChoreRow'
import { CompleteButton } from '../../components/CompleteButton'
import { ConfettiToast } from '../../components/ConfettiToast'
import { ChoiceRow } from '../../components/fields'
import { EmptyState, Flash } from '../../components/PageHeader'
import { Tag } from '../../components/Tag'
import { useApp } from '../../data/store'
import type { Chore, HomeLayout, HomeView, HomeWidget } from '../../data/types'
import { moneyBalance } from '../../lib/balances'
import { daysUntil, firstName, formatDate, formatMoney } from '../../lib/format'
import { useFlag } from '../../lib/flags'
import { allWidgets, defaultHomeLayout, featureWidget, homeViews, homeWidgets, moveWidget, normalizeHomeLayout, toggleWidget } from '../../lib/home'

type Size = 'large' | 'compact'

function DueCaption({ dueDate }: { dueDate: string }) {
  const days = daysUntil(dueDate)
  if (days < 0) return <Tag tone="danger">Was due {formatDate(dueDate)}</Tag>
  if (days === 0) return <span className="text-caption text-ink-muted">due today</span>
  if (days === 1) return <span className="text-caption text-ink-muted">due tomorrow</span>
  return <span className="text-caption text-ink-muted">due {formatDate(dueDate)}</span>
}

function ChoresWidget({ size, chores, onComplete }: { size: Size; chores: Chore[]; onComplete: (chore: Chore) => void }) {
  const allDone = chores.length === 0
  // Compact shows just what's next; the rest are a tap away.
  const shown = size === 'large' ? chores : chores.slice(0, 1)
  const more = chores.length - shown.length

  return (
    <section
      className={`flex flex-col gap-4 rounded-md p-4 ${size === 'large' ? 'border-2' : 'border'} ${
        allDone ? 'border-success bg-success' : size === 'large' ? 'border-accent bg-surface' : 'border-rule bg-surface'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className={`text-heading ${allDone ? 'text-success-ink' : 'text-ink'}`}>
          {size === 'large' ? 'Your Chores' : 'Next Chore'}
        </h2>
        <Link to="/chores" className={`text-label underline ${allDone ? 'text-success-ink' : 'text-ink'}`}>All chores</Link>
      </div>
      {allDone ? (
        size === 'large' ? (
          <EmptyState title="All done" className="border-success bg-surface text-success-ink">
            <p className="text-body text-success-ink">When someone assigns you a chore, it shows up here.</p>
          </EmptyState>
        ) : (
          <p className="text-body text-success-ink">All done — nothing assigned to you.</p>
        )
      ) : (
        <ul className="flex flex-col gap-2">
          {shown.map((chore) => (
            <li key={chore.id} className="flex flex-wrap items-center gap-4 rounded-md border border-rule bg-surface p-4">
              <Link to={`/chores/${chore.id}`} className="text-body min-w-0 flex-1 hover:underline">
                {chore.title}
              </Link>
              <DueCaption dueDate={chore.dueDate} />
              <CompleteButton title={chore.title} onClick={() => onComplete(chore)} />
            </li>
          ))}
        </ul>
      )}
      {more > 0 && (
        <Link to="/chores" className="text-label text-ink-muted hover:text-ink">
          + {more} more assigned to you
        </Link>
      )}
    </section>
  )
}

function MoneyWidget({ size }: { size: Size }) {
  const { me, room, members, state, nameOf } = useApp()
  const roomIous = state.ious.filter((i) => i.roomId === room!.id)
  const balances = members
    .filter((m) => m.id !== me!.id)
    .map((m) => ({ user: m, cents: moneyBalance(roomIous, me!.id, m.id) }))
  const netCents = balances.reduce((sum, b) => sum + b.cents, 0)
  const needsOk = roomIous.filter((i) => i.status === 'pending' && i.waitingOn === me!.id).length

  if (size === 'compact') {
    const balanceLabel =
      netCents > 0 ? (
        <>You’re owed <span className="text-amount text-positive">{formatMoney(netCents)}</span></>
      ) : netCents < 0 ? (
        <>You owe <span className="text-amount text-danger">{formatMoney(-netCents)}</span></>
      ) : (
        'You’re even'
      )
    return (
      <section className="flex flex-col gap-2">
        <h2 className="text-caption text-ink-muted">Balance</h2>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/money" className="rounded-md border border-rule bg-paper px-4 py-2 text-body text-ink-muted hover:border-ink">
            {balanceLabel}
          </Link>
          <Link to="/money" className="rounded-md border border-rule bg-paper px-4 py-2 text-body text-ink-muted hover:border-ink">
            Needs OK: <span className="text-amount">{needsOk}</span>
          </Link>
        </div>
      </section>
    )
  }

  const owing = balances.filter((b) => b.cents !== 0)
  return (
    <section className="flex flex-col gap-4 rounded-md border-2 border-accent bg-surface p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-heading">Money</h2>
        <Link to="/money" className="text-label underline">All balances</Link>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-caption text-ink-muted">
          {netCents > 0 ? 'You’re owed' : netCents < 0 ? 'You owe' : 'Balance'}
        </span>
        <span className={`text-display ${netCents > 0 ? 'text-positive' : netCents < 0 ? 'text-danger' : 'text-ink'}`}>
          {netCents === 0 ? 'Even' : formatMoney(Math.abs(netCents))}
        </span>
      </div>
      {owing.length > 0 && (
        <ul className="flex flex-col gap-2">
          {owing.map(({ user, cents }) => (
            <li key={user.id}>
              <Link
                to={`/money/settle/${user.id}`}
                className="flex items-center gap-4 rounded-md border border-rule bg-surface p-2 hover:bg-paper"
              >
                <Avatar user={user} size="sm" />
                <span className="text-body min-w-0 flex-1">
                  {cents > 0 ? `${nameOf(user.id)} owes you` : `You owe ${nameOf(user.id, true)}`}
                </span>
                <span className={`text-amount ${cents > 0 ? 'text-positive' : 'text-danger'}`}>{formatMoney(Math.abs(cents))}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <ButtonLink to="/money/new">Log an IOU</ButtonLink>
        {needsOk > 0 && (
          <ButtonLink to="/money" variant="highlight">
            {needsOk} {needsOk === 1 ? 'IOU needs' : 'IOUs need'} your OK
          </ButtonLink>
        )}
      </div>
    </section>
  )
}

function ActivityWidget({ size }: { size: Size }) {
  const { room, state } = useApp()
  const feed = state.activity
    .filter((a) => a.roomId === room!.id && (a.kind === 'chore-done' || a.kind === 'chore-assigned' || a.kind === 'list-created'))
    .slice(0, size === 'large' ? 10 : 3)
  return (
    <Section title="Room Activity">
      {feed.length > 0 ? <ActivityList items={feed} /> : <p className="text-body text-ink-muted">No chore activity yet.</p>}
    </Section>
  )
}

/** Chores still to do around the room, soonest first, whoever's turn it is. */
function UpcomingWidget({ size, chores }: { size: Size; chores: Chore[] }) {
  const shown = chores.slice(0, size === 'large' ? 8 : 3)
  const more = chores.length - shown.length
  const list = (
    <>
      {shown.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {shown.map((chore) => (
            <li key={chore.id}>
              <ChoreRow chore={chore} showList />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body text-ink-muted">Nothing left to do around the room.</p>
      )}
      {more > 0 && (
        <Link to="/chores/overview" className="text-label text-ink-muted hover:text-ink">
          + {more} more
        </Link>
      )}
    </>
  )
  const overviewLink = <Link to="/chores/overview" className="text-label underline">House overview</Link>
  if (size === 'compact') return <Section title="Upcoming Chores" action={overviewLink}>{list}</Section>
  return (
    <section className="flex flex-col gap-4 rounded-md border-2 border-accent bg-surface p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-heading">Upcoming Chores</h2>
        {overviewLink}
      </div>
      {list}
    </section>
  )
}

/** Switches the room home between your own things and the room's. */
function ViewToggle({ view, onChange }: { view: HomeView; onChange: (view: HomeView) => void }) {
  return (
    <div className="flex gap-1 self-start rounded-md border border-rule bg-surface p-1" role="radiogroup" aria-label="Home view">
      {(Object.keys(homeViews) as HomeView[]).map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={view === v}
          onClick={() => onChange(v)}
          className={`text-label rounded-sm px-4 py-1 ${view === v ? 'bg-sky text-ink' : 'text-ink-muted hover:text-ink'}`}
        >
          {homeViews[v].label}
        </button>
      ))}
    </div>
  )
}

/** Up/down arrow for reordering (16×16). */
function ArrowIcon({ up }: { up: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {up ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
    </svg>
  )
}

function CustomizePanel({
  widgets,
  layout,
  defaultLayout,
  onChange,
  onDone,
}: {
  widgets: HomeWidget[]
  layout: HomeLayout
  defaultLayout: HomeLayout
  onChange: (l: HomeLayout) => void
  onDone: () => void
}) {
  const iconButton = 'rounded-sm border border-rule bg-surface p-1 text-ink hover:bg-paper disabled:opacity-50'
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-heading">Customize Home</h2>
        <Button onClick={onDone}>Done</Button>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-label mb-2">Biggest on the page</legend>
        {widgets.map((w) => (
          <ChoiceRow key={w} type="radio" name="featured" checked={layout.featured === w} onChange={() => onChange(featureWidget(layout, w))}>
            <span className="text-body">{homeWidgets[w].label}</span>
            <span className="text-caption text-ink-muted">{homeWidgets[w].description}</span>
          </ChoiceRow>
        ))}
      </fieldset>

      <div className="flex flex-col gap-2">
        <span className="text-label">Below it</span>
        <ul className="flex flex-col gap-2">
          {layout.order.map((w, i) => {
            const shown = !layout.hidden.includes(w)
            return (
              <li key={w} className="flex items-center gap-2 rounded-md border border-rule p-2">
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                  <input type="checkbox" className="size-4 accent-accent" checked={shown} onChange={() => onChange(toggleWidget(layout, w))} />
                  <span className={`text-body ${shown ? '' : 'text-ink-muted line-through'}`}>{homeWidgets[w].label}</span>
                </label>
                <button type="button" className={iconButton} disabled={i === 0} onClick={() => onChange(moveWidget(layout, w, -1))} aria-label={`Move ${homeWidgets[w].label} up`}>
                  <ArrowIcon up />
                </button>
                <button type="button" className={iconButton} disabled={i === layout.order.length - 1} onClick={() => onChange(moveWidget(layout, w, 1))} aria-label={`Move ${homeWidgets[w].label} down`}>
                  <ArrowIcon up={false} />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <button type="button" className="text-label self-start text-ink-muted hover:text-ink" onClick={() => onChange(defaultLayout)}>
        Reset to default
      </button>
    </Card>
  )
}

export function RoomHomePage() {
  const { me, room, state, completeChore, setHomeLayout, setHomeView } = useApp()
  const [toast, setToast] = useState<string | null>(null)
  const [customizing, setCustomizing] = useState(false)
  // With the flag on, the page splits into a personal and a shared view, each arranged on its own.
  const viewsOn = useFlag('homeViews')
  const view = viewsOn ? (me!.homeView ?? 'personal') : null
  const widgets = view ? homeViews[view].widgets : allWidgets
  const defaultLayout = view ? homeViews[view].defaultLayout : defaultHomeLayout
  const layout = normalizeHomeLayout(view ? me!.homeViews?.[view] : me!.home, widgets, defaultLayout)

  const roomListIds = new Set(state.choreLists.filter((l) => l.roomId === room!.id).map((l) => l.id))
  const toDo = state.chores
    .filter((c) => roomListIds.has(c.listId) && !c.done)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const myChores = toDo.filter((c) => c.assignedTo === me!.id)

  const widget = (w: HomeWidget, size: Size) => {
    switch (w) {
      case 'chores':
        return (
          <ChoresWidget
            key={w}
            size={size}
            chores={myChores}
            onComplete={(chore) => {
              completeChore(chore.id)
              setToast(`Nice — “${chore.title}” is done`)
            }}
          />
        )
      case 'money':
        return <MoneyWidget key={w} size={size} />
      case 'activity':
        return <ActivityWidget key={w} size={size} />
      case 'upcoming':
        return <UpcomingWidget key={w} size={size} chores={toDo} />
    }
  }

  return (
    <>
      {toast && <ConfettiToast message={toast} onDismiss={() => setToast(null)} />}
      <Flash />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-title">Hi, {firstName(me!.name)}</h1>
        {!customizing && (
          <Button variant="secondary" onClick={() => setCustomizing(true)}>
            Customize
          </Button>
        )}
      </header>

      {view && <ViewToggle view={view} onChange={setHomeView} />}

      {customizing && (
        <CustomizePanel
          widgets={widgets}
          layout={layout}
          defaultLayout={defaultLayout}
          onChange={(l) => setHomeLayout(l, view ?? undefined)}
          onDone={() => setCustomizing(false)}
        />
      )}

      {widget(layout.featured, 'large')}
      {layout.order.filter((w) => !layout.hidden.includes(w)).map((w) => widget(w, 'compact'))}
    </>
  )
}
