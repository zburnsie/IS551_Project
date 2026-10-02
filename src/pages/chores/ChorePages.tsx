import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ActivityList } from '../../components/ActivityList'
import { Avatar } from '../../components/Avatar'
import { Button, ButtonLink } from '../../components/Button'
import { Card, Section } from '../../components/Card'
import { ChoreRow } from '../../components/ChoreRow'
import { ChoiceRow, Field, Select, TextArea, TextInput } from '../../components/fields'
import { EmptyState, Flash, PageHeader } from '../../components/PageHeader'
import { DueTag } from '../../components/status'
import { Tag } from '../../components/Tag'
import { useApp } from '../../data/store'
import type { Repeat } from '../../data/types'
import { repeatLabels, upcomingTurns } from '../../lib/chores'
import { addDays, formatDate, todayIso } from '../../lib/format'

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

/** Chore lists for the room, plus everything assigned to you. */
export function ChoresIndexPage() {
  const { state, me } = useApp()
  const lists = useRoomLists()
  const listIds = new Set(lists.map((l) => l.id))
  const mine = state.chores
    .filter((c) => listIds.has(c.listId) && c.assignedTo === me!.id && !c.done)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  return (
    <>
      <PageHeader title="Chores" action={<ButtonLink to="/chores/lists/new">New list</ButtonLink>}>
        Lists are shared with everyone in your room.
      </PageHeader>
      <Flash />

      {lists.length === 0 ? (
        <EmptyState title="No chore lists yet">
          <p className="text-body text-ink-muted">Start one for the kitchen, the bathroom, or a weekly reset.</p>
          <ButtonLink to="/chores/lists/new">Create a chore list</ButtonLink>
        </EmptyState>
      ) : (
        <Section title="Lists">
          <ul className="grid gap-2 sm:grid-cols-2">
            {lists.map((list) => {
              const chores = state.chores.filter((c) => c.listId === list.id)
              const open = chores.filter((c) => !c.done).length
              const unassigned = chores.filter((c) => !c.assignedTo).length
              return (
                <li key={list.id}>
                  <Link to={`/chores/lists/${list.id}`} className="flex h-full flex-col gap-2 rounded-md border border-rule bg-surface p-4 hover:border-ink">
                    <span className="text-heading">{list.name}</span>
                    <span className="flex flex-wrap gap-2">
                      <Tag>{open} open</Tag>
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

export function CreateChoreListPage() {
  const { createChoreList } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const id = createChoreList(name.trim())
    navigate(`/chores/lists/${id}`, { state: { flash: `Your roommates can see “${name.trim()}” now. Add the first chore.` } })
  }

  return (
    <>
      <PageHeader title="New chore list" back={{ to: '/chores', label: 'Chores' }}>
        Group chores by room or by routine. Everyone in your room can see and add to it.
      </PageHeader>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="List name">
            <TextInput autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Kitchen" />
          </Field>
          <div className="flex flex-wrap gap-2">
            {['Kitchen', 'Bathroom', 'Common area', 'Weekly reset'].map((idea) => (
              <button key={idea} type="button" className="text-caption rounded-pill border border-rule bg-paper px-2 py-1 hover:border-ink" onClick={() => setName(idea)}>
                {idea}
              </button>
            ))}
          </div>
          <div>
            <Button type="submit" disabled={!name.trim()}>Create list</Button>
          </div>
        </form>
      </Card>
    </>
  )
}

export function ChoreListPage() {
  const { listId = '' } = useParams()
  const { state } = useApp()
  const list = state.choreLists.find((l) => l.id === listId)
  if (!list) return <Navigate to="/chores" replace />

  const chores = state.chores
    .filter((c) => c.listId === list.id)
    .sort((a, b) => Number(a.done) - Number(b.done) || a.dueDate.localeCompare(b.dueDate))

  return (
    <>
      <PageHeader
        eyebrow="Chore list"
        title={list.name}
        back={{ to: '/chores', label: 'Chores' }}
        action={<ButtonLink to={`/chores/lists/${list.id}/add`}>Add a chore</ButtonLink>}
      />
      <Flash />
      {chores.length === 0 ? (
        <EmptyState title="No chores on this list">
          <p className="text-body text-ink-muted">Add one, give it a due date, and pick who’s doing it.</p>
          <ButtonLink to={`/chores/lists/${list.id}/add`}>Add a chore</ButtonLink>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {chores.map((c) => (
            <li key={c.id}><ChoreRow chore={c} /></li>
          ))}
        </ul>
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
            <Field label="Due">
              <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="text-amount" />
            </Field>
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
          <div className="flex flex-wrap gap-2">
            {[0, 1, 7].map((n) => (
              <button key={n} type="button" className="text-caption rounded-pill border border-rule bg-paper px-2 py-1 hover:border-ink" onClick={() => setDueDate(addDays(todayIso(), n))}>
                {n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : 'In a week'}
              </button>
            ))}
          </div>
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
  const [assignee, setAssignee] = useState(chore?.assignedTo ?? me!.id)
  const [rotation, setRotation] = useState<string[]>(
    chore && chore.rotation.length > 0 ? chore.rotation : members.map((m) => m.id),
  )
  if (!chore || !list) return <Navigate to="/chores" replace />

  const repeating = chore.repeat !== 'none'
  // The assignee is always in the rotation; keep room order for everyone else.
  const finalRotation = repeating
    ? members.map((m) => m.id).filter((id) => rotation.includes(id) || id === assignee)
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
          <legend className="text-heading pb-4">{repeating ? 'First turn' : 'Assign to'}</legend>
          {members.map((m) => (
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
              {members.map((m) => (
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
  const history = state.activity.filter((a) => a.choreId === chore.id)

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

      <Section title="History">
        {history.length > 0 ? <ActivityList items={history} /> : <p className="text-body text-ink-muted">No activity yet.</p>}
      </Section>
    </>
  )
}

/** Confirmation after marking a chore complete: the room can see it, and repeating chores show who's next. */
export function ChoreDonePage() {
  const { chore, list } = useChore()
  const { room, nameOf } = useApp()
  if (!chore || !list) return <Navigate to="/chores" replace />
  const repeating = chore.repeat !== 'none'

  return (
    <>
      <section className="flex flex-col items-start gap-4 rounded-md border border-accent bg-surface p-8">
        <Tag tone="accent">Done</Tag>
        <h1 className="text-title">“{chore.title}” is done</h1>
        <p className="text-body text-ink-muted">Everyone in {room!.name} can see it in the room activity.</p>
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
        <ButtonLink to="/room" variant="secondary">Room home</ButtonLink>
      </div>
    </>
  )
}
