import { useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { Card, Section } from '../components/Card'
import { Field, Select, TextInput } from '../components/fields'
import { Tag } from '../components/Tag'
import { useHousehold, useRoommateName } from '../data/household'
import { daysUntil, formatDate, todayIso } from '../lib/format'

function DueTag({ dueDate, done }: { dueDate: string; done: boolean }) {
  if (done) return <Tag tone="accent">Done</Tag>
  const days = daysUntil(dueDate)
  if (days < 0) return <Tag tone="highlight">Was due {formatDate(dueDate)}</Tag>
  if (days === 0) return <Tag tone="highlight">Due today</Tag>
  if (days <= 2) return <Tag tone="highlight">Due {formatDate(dueDate)}</Tag>
  return <Tag>Due {formatDate(dueDate)}</Tag>
}

export function ChoresPage() {
  const { household, addChore, toggleChore } = useHousehold()
  const nameOf = useRoommateName()

  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState(household.meId)
  const [dueDate, setDueDate] = useState(todayIso())

  const chores = [...household.chores].sort(
    (a, b) => Number(a.done) - Number(b.done) || a.dueDate.localeCompare(b.dueDate),
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addChore({ title: title.trim(), assignedTo, dueDate })
    setTitle('')
  }

  return (
    <>
      <h1 className="text-title">Chores</h1>

      <Section title="Add a chore">
        <Card>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3 sm:items-end">
            <Field label="Chore">
              <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Water the plants" />
            </Field>
            <Field label="Who’s doing it">
              <Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                {household.roommates.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Due">
              <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
            <div>
              <Button type="submit" disabled={!title.trim()}>Add a chore</Button>
            </div>
          </form>
        </Card>
      </Section>

      <Section title="This week">
        <ul className="flex flex-col gap-2">
          {chores.map((chore) => (
            <li key={chore.id}>
              <Card className="flex flex-wrap items-center gap-4">
                <input
                  type="checkbox"
                  className="size-4 accent-accent"
                  checked={chore.done}
                  onChange={() => toggleChore(chore.id)}
                  aria-label={`Mark “${chore.title}” as ${chore.done ? 'not done' : 'done'}`}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className={`text-body ${chore.done ? 'text-ink-muted line-through' : ''}`}>{chore.title}</span>
                  <span className="text-caption text-ink-muted">{nameOf(chore.assignedTo)}</span>
                </div>
                <DueTag dueDate={chore.dueDate} done={chore.done} />
              </Card>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
