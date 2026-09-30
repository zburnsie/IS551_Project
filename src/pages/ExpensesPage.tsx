import { useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { Card, Section } from '../components/Card'
import { Field, Select, TextInput } from '../components/fields'
import { Tag } from '../components/Tag'
import { useHousehold, useRoommateName } from '../data/household'
import { formatDate, formatMoney, todayIso } from '../lib/format'

export function ExpensesPage() {
  const { household, addExpense } = useHousehold()
  const nameOf = useRoommateName()
  const everyone = household.roommates.map((r) => r.id)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(household.meId)
  const [splitAmong, setSplitAmong] = useState<string[]>(everyone)

  const amountCents = Math.round(Number(amount) * 100)
  const canSubmit = description.trim() !== '' && amountCents > 0 && splitAmong.length > 0

  const toggleSplit = (id: string) =>
    setSplitAmong((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    addExpense({ description: description.trim(), amountCents, paidBy, splitAmong, date: todayIso() })
    setDescription('')
    setAmount('')
    setSplitAmong(everyone)
  }

  return (
    <>
      <h1 className="text-title">Expenses</h1>

      <Section title="Add an expense">
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="What was it for?">
                <TextInput value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Groceries" />
              </Field>
              <Field label="Amount">
                <TextInput
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-amount bg-surface border border-rule rounded-sm px-2 py-1"
                />
              </Field>
              <Field label="Paid by">
                <Select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
                  {household.roommates.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="text-label">Split evenly between</legend>
              <div className="flex flex-wrap gap-2">
                {household.roommates.map((r) => (
                  <label key={r.id} className="text-label flex items-center gap-1 rounded-pill border border-rule bg-paper px-2 py-1">
                    <input type="checkbox" checked={splitAmong.includes(r.id)} onChange={() => toggleSplit(r.id)} />
                    {r.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <Button type="submit" disabled={!canSubmit}>Add expense</Button>
            </div>
          </form>
        </Card>
      </Section>

      <Section title="History">
        <ul className="flex flex-col gap-2">
          {household.expenses.map((expense) => (
            <li key={expense.id}>
              <Card className="flex items-center gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-body">{expense.description}</span>
                  <span className="text-caption text-ink-muted">
                    {formatDate(expense.date)} · {expense.paidBy === household.meId ? 'You paid' : `${nameOf(expense.paidBy)} paid`} · split {expense.splitAmong.length} ways
                  </span>
                </div>
                {expense.paidBy === household.meId && <Tag tone="accent">You paid</Tag>}
                <span className="text-amount text-right">{formatMoney(expense.amountCents)}</span>
              </Card>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
