import { useState, type FormEvent } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { Button, ButtonLink } from '../../components/Button'
import { Card, Section } from '../../components/Card'
import { DoneByRoommateChart, HouseProgress } from '../../components/ChoreCharts'
import { ChoreRow } from '../../components/ChoreRow'
import { CompletionList } from '../../components/CompletionList'
import { ChoiceRow, Field, Select, TextArea, TextInput } from '../../components/fields'
import { EmptyState, Flash, PageHeader } from '../../components/PageHeader'
import { DueTag } from '../../components/status'
import { Tag } from '../../components/Tag'
import { useApp } from '../../data/store'
import type { Chore, ChoreList, Repeat, UserId } from '../../data/types'
import { areaMembers, daysLate, repeatLabels, upcomingTurns } from '../../lib/chores'
import { addDays, dateOf, daysUntil, formatDate, joinNames, todayIso } from '../../lib/format'

function useRoomLists() {
  const { state, room } = useApp()
  return state.choreLists.filter((l) => l.roomId === room!.id)
}

function useChore() {
  const { choreId = '' } = useParams()
  const { state } = useApp()
  const chore = state.chores.find((c) => c.id === choreId)
  const list = state.choreLists.find((l) => l.id === chore?.listId)
  return { chore, list }
}

const byDueDate = (a: Chore, b: Chore) => a.dueDate.localeCompare(b.dueDate)

/** Switches between the areas and the house overview. */
function ChoresTabs() {
  const tabs = [
    { to: '/chores', label: 'Areas' },
    { to: '/chores/overview', label: 'House overview' },
  ]
  return (
    <nav className="flex gap-1 self-start rounded-md border border-rule bg-surface p-1" aria-label="Chores">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end
          className={({ isActive }) =>
            `text-label rounded-sm px-4 py-1 ${isActive ? 'bg-accent text-on-color' : 'text-ink-muted hover:text-ink'}`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}

/** Who shares an area: "Everyone in the room", or their avatars and names. */
function AreaMembers({ list }: { list: ChoreList }) {
  const { members, nameOf } = useApp()
  if (list.memberIds.length === 0) return <span className="text-caption text-ink-muted">Everyone in the room</span>
  const people = areaMembers(list, members)
  return (
    <span className="flex items-center gap-2">
      <span className="flex -space-x-2">
        {people.map((p) => <Avatar key={p.id} user={p} size="sm" />)}
      </span>
      <span className="text-caption text-ink-muted">{joinNames(people.map((p) => nameOf(p.id)))}</span>
    </span>
  )
}

/** Form state for picking who shares an area. */
function useAreaMembersPicker(list?: ChoreList) {
  const { me } = useApp()
  const [everyone, setEveryone] = useState(!list || list.memberIds.length === 0)
  const [picked, setPicked] = useState<UserId[]>(list && list.memberIds.length > 0 ? list.memberIds : [me!.id])
  const toggle = (id: UserId) => setPicked((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  return {
    everyone,
    setEveryone,
    picked,
    toggle,
    /** What to save: empty means everyone. */
    memberIds: everyone ? [] : picked,
    valid: everyone || picked.length > 0,
  }
}

function AreaMembersPicker({ picker }: { picker: ReturnType<typeof useAreaMembersPicker> }) {
  const { me, members } = useApp()
  // With nobody else in the room yet, there's no one to leave out.
  if (members.length < 2) return null
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-label pb-1">Who shares it?</legend>
      <ChoiceRow type="radio" name="shared" checked={picker.everyone} onChange={() => picker.setEveryone(true)}>
        <span className="text-body">Everyone in the room</span>
        <span className="text-body text-ink-muted">Like a kitchen or living room. Roommates who join later are included.</span>
      </ChoiceRow>
      <ChoiceRow type="radio" name="shared" checked={!picker.everyone} onChange={() => picker.setEveryone(false)}>
        <span className="text-body">Just some of us</span>
        <span className="text-body text-ink-muted">Like a bathroom two of you share.</span>
      </ChoiceRow>
      {!picker.everyone && (
        <div className="flex flex-wrap gap-2 pt-2">
          {members.map((m) => (
            <label key={m.id} className="text-label flex cursor-pointer items-center gap-2 rounded-pill border border-rule bg-paper py-1 pl-1 pr-4 has-[:checked]:border-accent">
              <input type="checkbox" className="sr-only" checked={picker.picked.includes(m.id)} onChange={() => picker.toggle(m.id)} />
              <Avatar user={m} size="sm" />
              {m.id === me!.id ? 'You' : m.name}
              <span className="text-caption text-ink-muted">{picker.picked.includes(m.id) ? 'In' : 'Not in'}</span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  )
}

/** Areas in the room, plus everything assigned to you. */
export function ChoresIndexPage() {
  const { state, me } = useApp()
  const lists = useRoomLists()
  const listIds = new Set(lists.map((l) => l.id))
  const mine = state.chores
    .filter((c) => listIds.has(c.listId) && c.assignedTo === me!.id && !c.done)
    .sort(byDueDate)

  return (
    <>
      <PageHeader title="Chores" action={<ButtonLink to="/chores/lists/new">New area</ButtonLink>}>
        Split the place into areas, like the kitchen or a bathroom, and choose who shares each one.
      </PageHeader>
      <ChoresTabs />
      <Flash />

      {lists.length === 0 ? (
        <EmptyState title="No areas yet">
          <p className="text-body text-ink-muted">Start with the kitchen, a bathroom, or a spare room you all use.</p>
          <ButtonLink to="/chores/lists/new">Add an area</ButtonLink>
        </EmptyState>
      ) : (
        <Section title="Areas">
          <ul className="grid gap-2 sm:grid-cols-2">
            {lists.map((list) => {
              const open = state.chores.filter((c) => c.listId === list.id && !c.done)
              const overdue = open.filter((c) => c.assignedTo && daysUntil(c.dueDate) < 0).length
              const unassigned = open.filter((c) => !c.assignedTo).length
              return (
                <li key={list.id}>
                  <Link to={`/chores/lists/${list.id}`} className="flex h-full flex-col gap-2 rounded-md border border-rule bg-surface p-4 hover:border-accent">
                    <span className="text-heading">{list.name}</span>
                    <AreaMembers list={list} />
                    <span className="flex flex-wrap gap-2">
                      <Tag>{open.length} to do</Tag>
                      {overdue > 0 && <Tag tone="brand">{overdue} overdue</Tag>}
                      {unassigned > 0 && <Tag tone="brand">{unassigned} need someone</Tag>}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      {mine.length > 0 && (
        <Section title="Assigned to you">
          <ul className="flex flex-col gap-2">
            {mine.map((c) => (
              <li key={c.id}><ChoreRow chore={c} showList /></li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}

type Period = 'week' | 'month' | 'all'

const periods: Record<Period, { label: string; days: number | null }> = {
  week: { label: 'Last 7 days', days: 7 },
  month: { label: 'Last 30 days', days: 30 },
  all: { label: 'All time', days: null },
}

/** The whole house at a glance: what's still to do and whose turn it is, and what everyone has done. */
export function ChoresOverviewPage() {
  const { state, me, room, members, nameOf } = useApp()
  const lists = useRoomLists()
  const [period, setPeriod] = useState<Period>('week')
  const [who, setWho] = useState<UserId | ''>('')

  const listIds = new Set(lists.map((l) => l.id))
  const open = state.chores.filter((c) => listIds.has(c.listId) && !c.done).sort(byDueDate)
  const days = periods[period].days
  const since = days === null ? null : addDays(todayIso(), -days)
  const done = state.completions.filter((c) => c.roomId === room!.id && (!since || dateOf(c.at) > since))

  const overdue = (c: Chore) => c.assignedTo !== null && daysUntil(c.dueDate) < 0
  const roommates = members.map((m) => {
    const theirs = open.filter((c) => c.assignedTo === m.id)
    const didIt = done.filter((c) => c.doneBy === m.id)
    return {
      user: m,
      done: didIt.length,
      late: didIt.filter((c) => daysLate(c) > 0).length,
      covered: didIt.filter((c) => c.turnOf && c.turnOf !== m.id).length,
      toDo: theirs.length,
      overdue: theirs.filter(overdue).length,
    }
  })

  const toDo = who ? open.filter((c) => c.assignedTo === who) : open
  const groups = [
    { title: 'Overdue', chores: toDo.filter(overdue) },
    { title: 'Due in the next week', chores: toDo.filter((c) => c.assignedTo && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) < 7) },
    { title: 'Later', chores: toDo.filter((c) => c.assignedTo && daysUntil(c.dueDate) >= 7) },
    { title: 'Needs someone', chores: toDo.filter((c) => !c.assignedTo) },
  ].filter((g) => g.chores.length > 0)
  const doneShown = who ? done.filter((c) => c.doneBy === who) : done
  const whoName = who ? nameOf(who) : ''

  if (lists.length === 0) {
    return (
      <>
        <PageHeader title="Chores" />
        <ChoresTabs />
        <EmptyState title="Nothing to show yet">
          <p className="text-body text-ink-muted">Add an area and some chores, and you’ll see who’s doing what here.</p>
          <ButtonLink to="/chores/lists/new">Add an area</ButtonLink>
        </EmptyState>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Chores">What’s still to do, whose turn it is, and what everyone has done.</PageHeader>
      <ChoresTabs />

      <div className="flex flex-wrap items-end gap-4">
        <Field label="Show">
          <Select value={who} onChange={(e) => setWho(e.target.value)}>
            <option value="">Everyone</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.id === me!.id ? 'You' : m.name}</option>)}
          </Select>
        </Field>
        <div className="flex gap-1 rounded-md border border-rule bg-surface p-1" role="radiogroup" aria-label="Time period for done chores">
          {(Object.keys(periods) as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={period === p}
              onClick={() => setPeriod(p)}
              className={`text-label rounded-sm px-4 py-1 ${period === p ? 'bg-accent text-on-color' : 'text-ink-muted hover:text-ink'}`}
            >
              {periods[p].label}
            </button>
          ))}
        </div>
      </div>

      <HouseProgress
        done={doneShown.length}
        toDo={toDo.length}
        overdue={toDo.filter(overdue).length}
        period={who ? `${whoName} · ${periods[period].label}` : periods[period].label}
      />
      <DoneByRoommateChart
        selected={who}
        rows={roommates.map((r) => ({
          user: r.user,
          label: r.user.id === me!.id ? 'You' : r.user.name.split(' ')[0],
          onTime: r.done - r.late,
          late: r.late,
        }))}
      />

      <Section title="Roommates">
        <ul className="grid gap-2 sm:grid-cols-2">
          {roommates.map((r) => {
            const selected = who === r.user.id
            return (
              <li key={r.user.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setWho(selected ? '' : r.user.id)}
                  className={`flex h-full w-full flex-col gap-4 rounded-md border bg-surface p-4 text-left hover:border-accent ${selected ? 'border-accent' : 'border-rule'}`}
                >
                  <span className="flex items-center gap-2">
                    <Avatar user={r.user} />
                    <span className="text-body flex-1">{r.user.id === me!.id ? 'You' : r.user.name}</span>
                    {selected && <Tag tone="accent">Showing</Tag>}
                  </span>
                  <dl className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <dt className="text-caption text-ink-muted">Done</dt>
                      <dd className="text-amount">{r.done}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-caption text-ink-muted">To do</dt>
                      <dd className="text-amount">{r.toDo}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-caption text-ink-muted">Overdue</dt>
                      <dd className={`text-amount ${r.overdue > 0 ? 'text-brand' : ''}`}>{r.overdue}</dd>
                    </div>
                  </dl>
                  {r.covered > 0 && (
                    <span className="text-caption text-ink-muted">Covered {r.covered} {r.covered === 1 ? 'turn' : 'turns'} for others</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title={who ? `Still to do for ${whoName.toLowerCase() === 'you' ? 'you' : whoName}` : 'Still to do'}>
        {groups.length === 0 ? (
          <EmptyState title="All caught up">
            <p className="text-body text-ink-muted">{who ? `Nothing on ${who === me!.id ? 'your' : `${whoName}’s`} plate right now.` : 'Every chore is done for now.'}</p>
          </EmptyState>
        ) : (
          groups.map((g) => (
            <div key={g.title} className="flex flex-col gap-2">
              <h3 className="text-caption text-ink-muted">{g.title} · {g.chores.length}</h3>
              <ul className="flex flex-col gap-2">
                {g.chores.map((c) => <li key={c.id}><ChoreRow chore={c} showList /></li>)}
              </ul>
            </div>
          ))
        )}
      </Section>

      <Section title={`Done · ${periods[period].label.toLowerCase()}`}>
        {doneShown.length === 0 ? (
          <p className="text-body text-ink-muted">Nothing marked complete in this time.</p>
        ) : (
          <CompletionList items={doneShown} />
        )}
      </Section>
    </>
  )
}

export function CreateChoreListPage() {
  const { createChoreList } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const picker = useAreaMembersPicker()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !picker.valid) return
    const id = createChoreList(name.trim(), picker.memberIds)
    navigate(`/chores/lists/${id}`, { state: { flash: `Added “${name.trim()}”. Add the first chore.` } })
  }

  return (
    <>
      <PageHeader title="New area" back={{ to: '/chores', label: 'Chores' }}>
        A part of the place with its own chores. Choose who shares it, and only they’ll take turns.
      </PageHeader>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Area name">
            <TextInput autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Kitchen" />
          </Field>
          <div className="flex flex-wrap gap-2">
            {['Kitchen', 'Bathroom', 'Living room', 'Spare room', 'Laundry'].map((idea) => (
              <button key={idea} type="button" className="text-caption rounded-pill border border-rule bg-paper px-2 py-1 hover:border-accent" onClick={() => setName(idea)}>
                {idea}
              </button>
            ))}
          </div>
          <AreaMembersPicker picker={picker} />
          <div>
            <Button type="submit" disabled={!name.trim() || !picker.valid}>Add area</Button>
          </div>
        </form>
      </Card>
    </>
  )
}

export function EditChoreListPage() {
  const { listId = '' } = useParams()
  const { state, updateChoreList, deleteChoreList } = useApp()
  const navigate = useNavigate()
  const list = state.choreLists.find((l) => l.id === listId)
  const [name, setName] = useState(list?.name ?? '')
  const picker = useAreaMembersPicker(list)
  if (!list) return <Navigate to="/chores" replace />
  const choreCount = state.chores.filter((c) => c.listId === list.id).length

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !picker.valid) return
    updateChoreList(list.id, { name: name.trim(), memberIds: picker.memberIds })
    navigate(`/chores/lists/${list.id}`, { state: { flash: 'Saved.' } })
  }

  return (
    <>
      <PageHeader eyebrow="Area" title={`Edit ${list.name}`} back={{ to: `/chores/lists/${list.id}`, label: list.name }} />
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Area name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <AreaMembersPicker picker={picker} />
          {!picker.everyone && (
            <p className="text-body text-ink-muted">Anyone you take off is also taken out of this area’s rotations. Chores already on their plate stay theirs until done.</p>
          )}
          <div>
            <Button type="submit" disabled={!name.trim() || !picker.valid}>Save</Button>
          </div>
        </form>
      </Card>
      <Section title="Delete this area">
        <p className="text-body text-ink-muted">
          {choreCount > 0 ? `Its ${choreCount} ${choreCount === 1 ? 'chore goes' : 'chores go'} too.` : 'It has no chores.'} Chores already done stay in the house overview.
        </p>
        <div>
          <Button
            variant="secondary"
            onClick={() => {
              if (!confirm(`Delete “${list.name}” and its chores for everyone in the room?`)) return
              deleteChoreList(list.id)
              navigate('/chores', { state: { flash: `Deleted “${list.name}”.` } })
            }}
          >
            Delete area
          </Button>
        </div>
      </Section>
    </>
  )
}

export function ChoreListPage() {
  const { listId = '' } = useParams()
  const { state } = useApp()
  const list = state.choreLists.find((l) => l.id === listId)
  if (!list) return <Navigate to="/chores" replace />

  const toDo = state.chores.filter((c) => c.listId === list.id && !c.done).sort(byDueDate)
  const done = state.completions.filter((c) => c.listId === list.id)

  return (
    <>
      <PageHeader
        eyebrow="Area"
        title={list.name}
        back={{ to: '/chores', label: 'Chores' }}
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink to={`/chores/lists/${list.id}/edit`} variant="secondary">Edit area</ButtonLink>
            <ButtonLink to={`/chores/lists/${list.id}/add`}>Add a chore</ButtonLink>
          </div>
        }
      >
        <AreaMembers list={list} />
      </PageHeader>
      <Flash />

      <Section title="To do">
        {toDo.length === 0 ? (
          <EmptyState title={done.length > 0 ? 'All caught up' : 'No chores here yet'}>
            <p className="text-body text-ink-muted">Add one, give it a due date, and pick who’s doing it.</p>
            <ButtonLink to={`/chores/lists/${list.id}/add`}>Add a chore</ButtonLink>
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {toDo.map((c) => (
              <li key={c.id}><ChoreRow chore={c} /></li>
            ))}
          </ul>
        )}
      </Section>

      {done.length > 0 && (
        <Section title="Done" action={<Link to="/chores/overview" className="text-label underline">House overview</Link>}>
          <CompletionList items={done.slice(0, 10)} showArea={false} />
        </Section>
      )}
    </>
  )
}

export function AddChorePage() {
  const { listId = '' } = useParams()
  const { state, addChore } = useApp()
  const navigate = useNavigate()
  const list = state.choreLists.find((l) => l.id === listId)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(todayIso())
  const [repeat, setRepeat] = useState<Repeat>('none')
  const [notes, setNotes] = useState('')
  if (!list) return <Navigate to="/chores" replace />

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const id = addChore({ listId: list.id, title: title.trim(), notes: notes.trim(), dueDate, repeat })
    navigate(`/chores/${id}/assign`)
  }

  return (
    <>
      <PageHeader eyebrow={list.name} title="Add a chore" back={{ to: `/chores/lists/${list.id}`, label: list.name }}>
        Next, you’ll pick who’s doing it.
      </PageHeader>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Chore">
            <TextInput autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Take out the trash" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Field label="Due">
                <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="text-amount" />
              </Field>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 7].map((n) => (
                  <button key={n} type="button" className="text-caption rounded-pill border border-rule bg-paper px-2 py-1 hover:border-accent" onClick={() => setDueDate(addDays(todayIso(), n))}>
                    {n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : 'In a week'}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Repeat" hint={repeat === 'none' ? undefined : 'You’ll choose who takes turns next.'}>
              <Select value={repeat} onChange={(e) => setRepeat(e.target.value as Repeat)}>
                {(Object.keys(repeatLabels) as Repeat[]).map((r) => (
                  <option key={r} value={r}>{repeatLabels[r]}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Notes (optional)">
            <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Where things go, what counts as done" />
          </Field>
          <div>
            <Button type="submit" disabled={!title.trim() || !dueDate}>Next: assign</Button>
          </div>
        </form>
      </Card>
    </>
  )
}

export function AssignChorePage() {
  const { chore, list } = useChore()
  const { me, members, nameOf, assignChore } = useApp()
  const navigate = useNavigate()
  // Only roommates who share this area take turns on its chores.
  const people = list ? areaMembers(list, members) : members
  const peopleIds = people.map((m) => m.id)
  const [assignee, setAssignee] = useState(
    chore?.assignedTo && peopleIds.includes(chore.assignedTo) ? chore.assignedTo : peopleIds.includes(me!.id) ? me!.id : peopleIds[0],
  )
  const [rotation, setRotation] = useState<string[]>(
    chore && chore.rotation.length > 0 ? chore.rotation : peopleIds,
  )
  if (!chore || !list) return <Navigate to="/chores" replace />

  const repeating = chore.repeat !== 'none'
  // The assignee is always in the rotation; keep room order for everyone else.
  const finalRotation = repeating
    ? peopleIds.filter((id) => rotation.includes(id) || id === assignee)
    : [assignee]
  const preview = upcomingTurns({ ...chore, assignedTo: assignee, rotation: finalRotation }, 4)

  const toggle = (id: string) =>
    setRotation((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    assignChore(chore.id, assignee, finalRotation)
    navigate(`/chores/${chore.id}`, {
      state: { flash: assignee === me!.id ? 'It’s on your list.' : `${nameOf(assignee)} was notified.` },
    })
  }

  return (
    <>
      <PageHeader eyebrow={list.name} title="Who’s doing it?" back={{ to: `/chores/lists/${list.id}`, label: list.name }}>
        “{chore.title}” · due {formatDate(chore.dueDate)} · {repeatLabels[chore.repeat].toLowerCase()}
      </PageHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-heading pb-2">{repeating ? 'First turn' : 'Assign to'}</legend>
          {list.memberIds.length > 0 && (
            <p className="text-body pb-2 text-ink-muted">
              {list.name} is shared by {joinNames(people.map((p) => nameOf(p.id, true)))}. <Link to={`/chores/lists/${list.id}/edit`} className="underline">Change who shares it</Link>
            </p>
          )}
          {people.map((m) => (
            <ChoiceRow key={m.id} type="radio" name="assignee" checked={assignee === m.id} onChange={() => setAssignee(m.id)}>
              <span className="flex items-center gap-2">
                <Avatar user={m} size="sm" />
                <span className="text-body">{m.id === me!.id ? 'You' : m.name}</span>
              </span>
            </ChoiceRow>
          ))}
        </fieldset>

        {repeating && (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-heading">Rotation</legend>
            <p className="text-body pb-2 text-ink-muted">When a turn is marked complete, the chore moves to the next person here.</p>
            <div className="flex flex-wrap gap-2">
              {people.map((m) => (
                <label key={m.id} className="text-label flex items-center gap-1 rounded-pill border border-rule bg-paper px-2 py-1">
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={finalRotation.includes(m.id)}
                    disabled={m.id === assignee}
                    onChange={() => toggle(m.id)}
                  />
                  {m.id === me!.id ? 'You' : m.name.split(' ')[0]}
                </label>
              ))}
            </div>
            <Card className="mt-2 flex flex-col gap-2">
              <span className="text-caption text-ink-muted">Next turns</span>
              <ol className="flex flex-col gap-1">
                {preview.map((t, i) => (
                  <li key={i} className="flex justify-between gap-4">
                    <span className="text-body">{nameOf(t.who)}</span>
                    <span className="text-amount">{formatDate(t.due)}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </fieldset>
        )}

        <div>
          <Button type="submit">{assignee === me!.id ? 'Assign to me' : `Assign and notify ${nameOf(assignee)}`}</Button>
        </div>
      </form>
    </>
  )
}

export function ChoreDetailPage() {
  const { chore, list } = useChore()
  const { state, me, nameOf, userOf, completeChore, reopenChore, deleteChore } = useApp()
  const navigate = useNavigate()
  if (!chore || !list) return <Navigate to="/chores" replace />

  const assignee = chore.assignedTo ? userOf(chore.assignedTo) : undefined
  const turns = upcomingTurns(chore, 4)
  const done = state.completions.filter((c) => c.choreId === chore.id)

  return (
    <>
      <PageHeader eyebrow={list.name} title={chore.title} back={{ to: `/chores/lists/${list.id}`, label: list.name }} />
      <Flash />

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {assignee && <Avatar user={assignee} />}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-caption text-ink-muted">{chore.done ? 'Was assigned to' : 'Whose turn'}</span>
            <span className="text-body">{assignee ? nameOf(assignee.id) : 'No one yet'}</span>
          </div>
          <DueTag dueDate={chore.dueDate} done={chore.done} />
        </div>
        <dl className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <dt className="text-caption text-ink-muted">Due</dt>
            <dd className="text-amount">{formatDate(chore.dueDate)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-caption text-ink-muted">Repeats</dt>
            <dd className="text-body">{repeatLabels[chore.repeat]}</dd>
          </div>
        </dl>
        {chore.notes && <p className="text-body text-ink-muted">{chore.notes}</p>}
        <div className="flex flex-wrap gap-2">
          {chore.done ? (
            <Button variant="secondary" onClick={() => reopenChore(chore.id)}>Reopen</Button>
          ) : (
            <Button
              variant="accent"
              disabled={!chore.assignedTo}
              onClick={() => {
                const wasAssignedTo = chore.assignedTo
                completeChore(chore.id)
                navigate(`/chores/${chore.id}/done`, { state: { wasAssignedTo } })
              }}
            >
              Mark complete
            </Button>
          )}
          <ButtonLink to={`/chores/${chore.id}/assign`} variant="secondary">
            {chore.assignedTo ? 'Reassign' : 'Assign'}
          </ButtonLink>
          <Button
            variant="secondary"
            onClick={() => {
              if (!confirm(`Delete “${chore.title}” for everyone in the room?`)) return
              deleteChore(chore.id)
              navigate(`/chores/lists/${list.id}`, { state: { flash: `Deleted “${chore.title}”.` } })
            }}
          >
            Delete
          </Button>
        </div>
        {chore.assignedTo && chore.assignedTo !== me!.id && !chore.done && (
          <p className="text-body text-ink-muted">Anyone in the room can mark it complete, for example if you covered for {nameOf(chore.assignedTo)}.</p>
        )}
      </Card>

      {chore.repeat !== 'none' && !chore.done && turns.length > 0 && (
        <Section title="Rotation">
          <ol className="flex flex-col divide-y divide-rule rounded-md border border-rule bg-surface">
            {turns.map((t, i) => (
              <li key={i} className="flex items-center gap-4 p-4">
                <span className="text-caption w-16 text-ink-muted">{i === 0 ? 'Now' : `Next ${i}`}</span>
                <span className="text-body flex-1">{nameOf(t.who)}</span>
                <span className="text-amount">{formatDate(t.due)}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <Section title="Done so far">
        {done.length > 0 ? <CompletionList items={done} showArea={false} /> : <p className="text-body text-ink-muted">Not done yet.</p>}
      </Section>
    </>
  )
}

/** Confirmation after marking a chore complete: the room can see it, and repeating chores show who's next. */
export function ChoreDonePage() {
  const { chore, list } = useChore()
  const { me, room, nameOf } = useApp()
  const { state } = useLocation()
  if (!chore || !list) return <Navigate to="/chores" replace />
  const repeating = chore.repeat !== 'none'
  const wasAssignedTo = (state as { wasAssignedTo?: UserId | null } | null)?.wasAssignedTo
  const covered = wasAssignedTo && wasAssignedTo !== me!.id

  return (
    <>
      <section className="flex flex-col items-start gap-4 rounded-md border border-accent bg-surface p-8">
        <Tag tone="accent">Done</Tag>
        <h1 className="text-title">“{chore.title}” is done</h1>
        <p className="text-body text-ink-muted">
          {covered && `Thanks for covering for ${nameOf(wasAssignedTo)}. `}
          Everyone in {room!.name} can see it in the house overview.
        </p>
      </section>

      {repeating && chore.assignedTo && (
        <Card className="flex flex-col gap-2">
          <span className="text-caption text-ink-muted">Rotation</span>
          <p className="text-body">
            Next up is <strong>{nameOf(chore.assignedTo, true)}</strong>, due <span className="text-amount">{formatDate(chore.dueDate)}</span>.
            {nameOf(chore.assignedTo) !== 'You' && ` We let ${nameOf(chore.assignedTo)} know.`}
          </p>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <ButtonLink to={`/chores/lists/${list.id}`}>Back to {list.name}</ButtonLink>
        <ButtonLink to="/chores/overview" variant="secondary">House overview</ButtonLink>
      </div>
    </>
  )
}
