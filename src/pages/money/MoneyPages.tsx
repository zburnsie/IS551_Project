import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ActivityList } from '../../components/ActivityList'
import { Avatar } from '../../components/Avatar'
import { Button, ButtonLink } from '../../components/Button'
import { Card, Section } from '../../components/Card'
import { ChoiceRow, Field, Select, TextInput } from '../../components/fields'
import { EmptyState, Flash, PageHeader } from '../../components/PageHeader'
import { IouStatusTag } from '../../components/status'
import { Tag } from '../../components/Tag'
import { useApp } from '../../data/store'
import type { Iou } from '../../data/types'
import { iouValue, moneyBalance, openIousBetween } from '../../lib/balances'
import { formatDate, formatMoney } from '../../lib/format'

function useRoomIous() {
  const { state, room } = useApp()
  return state.ious.filter((i) => i.roomId === room!.id)
}

/** "Maya owes you" / "You owe Sam" — always in words, never color alone. */
function useIouSentence() {
  const { nameOf } = useApp()
  return (iou: Iou) => `${nameOf(iou.debtor)} ${nameOf(iou.debtor) === 'You' ? 'owe' : 'owes'} ${nameOf(iou.creditor, true)}`
}

function IouRow({ iou }: { iou: Iou }) {
  const { me } = useApp()
  const sentence = useIouSentence()
  const owedToMe = iou.creditor === me!.id
  return (
    <Link to={`/money/ious/${iou.id}`} className="flex flex-wrap items-center gap-4 rounded-md border border-rule bg-surface p-4 hover:border-accent">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-body">{sentence(iou)}{iou.kind === 'favor' && ` ${iou.favor}`}</span>
        <span className="text-caption text-ink-muted">{formatDate(iou.date)} · {iou.note}</span>
      </div>
      <IouStatusTag iou={iou} />
      {iou.kind === 'money' && (
        <span className={`text-amount text-right ${owedToMe ? 'text-accent' : 'text-brand'}`}>{formatMoney(iou.amountCents)}</span>
      )}
    </Link>
  )
}

/** Track balances: who owes whom, per roommate. */
export function MoneyPage() {
  const { me, members } = useApp()
  const ious = useRoomIous()
  const others = members.slice(1)
  const mine = ious.filter((i) => i.debtor === me!.id || i.creditor === me!.id)
  const net = others.reduce((sum, m) => sum + moneyBalance(ious, me!.id, m.id), 0)
  const pending = mine.filter((i) => i.status === 'pending')
  const settled = mine.filter((i) => i.status === 'settled' || i.status === 'declined')

  return (
    <>
      <PageHeader title="Money and IOUs" action={<ButtonLink to="/money/new">Log an IOU</ButtonLink>} />
      <Flash />

      <section className="flex flex-col gap-2">
        <p className="text-caption text-ink-muted">Overall</p>
        <p className="text-heading">
          {net === 0 && 'You’re all square'}
          {net > 0 && <>You’re owed <span className="font-mono text-accent">{formatMoney(net)}</span></>}
          {net < 0 && <>You owe <span className="font-mono text-brand">{formatMoney(-net)}</span></>}
        </p>
      </section>

      <Section title="Balances">
        {others.length === 0 ? (
          <EmptyState title="Just you so far">
            <p className="text-body text-ink-muted">Invite your roommates to start logging IOUs.</p>
            <ButtonLink to="/room/invite" variant="secondary">Invite roommates</ButtonLink>
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {others.map((m) => {
              const cents = moneyBalance(ious, me!.id, m.id)
              const open = openIousBetween(ious, me!.id, m.id)
              const favors = open.filter((i) => i.kind === 'favor')
              const name = m.name.split(' ')[0]
              return (
                <li key={m.id}>
                  <Card className="flex flex-wrap items-center gap-4">
                    <Avatar user={m} />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-body">
                        {cents > 0 && `${name} owes you`}
                        {cents < 0 && `You owe ${name}`}
                        {cents === 0 && `You and ${name} are even on money`}
                      </span>
                      <span className="flex flex-wrap gap-1">
                        {cents > 0 && <Tag tone="accent">Owed to you</Tag>}
                        {cents < 0 && <Tag tone="brand">You owe</Tag>}
                        {cents === 0 && open.length === 0 && <Tag>Settled</Tag>}
                        {favors.map((f) => (
                          <Tag key={f.id}>{f.debtor === me!.id ? `You owe ${f.favor}` : `Owes you ${f.favor}`}</Tag>
                        ))}
                      </span>
                    </div>
                    <span className="text-amount text-right">{formatMoney(Math.abs(cents))}</span>
                    {open.length > 0 ? (
                      <ButtonLink to={`/money/settle/${m.id}`} variant="secondary">Settle up</ButtonLink>
                    ) : (
                      <Button variant="secondary" disabled>Settle up</Button>
                    )}
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </Section>

      {pending.length > 0 && (
        <Section title="Waiting to be confirmed">
          <ul className="flex flex-col gap-2">
            {pending.map((i) => <li key={i.id}><IouRow iou={i} /></li>)}
          </ul>
        </Section>
      )}

      <Section title="Open IOUs">
        {mine.filter((i) => i.status === 'open').length === 0 ? (
          <p className="text-body text-ink-muted">Nothing open right now.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {mine.filter((i) => i.status === 'open').map((i) => <li key={i.id}><IouRow iou={i} /></li>)}
          </ul>
        )}
      </Section>

      {settled.length > 0 && (
        <Section title="History">
          <ul className="flex flex-col gap-2">
            {settled.map((i) => <li key={i.id}><IouRow iou={i} /></li>)}
          </ul>
        </Section>
      )}
    </>
  )
}

export function LogIouPage() {
  const { me, members, logIou } = useApp()
  const navigate = useNavigate()
  const others = members.slice(1)
  const [other, setOther] = useState(others[0]?.id ?? '')
  const [direction, setDirection] = useState<'they-owe' | 'i-owe'>('they-owe')
  const [kind, setKind] = useState<Iou['kind']>('money')
  const [amount, setAmount] = useState('')
  const [favor, setFavor] = useState('')
  const [note, setNote] = useState('')

  if (others.length === 0) {
    return (
      <>
        <PageHeader title="Log an IOU" back={{ to: '/money', label: 'Money' }} />
        <EmptyState title="No roommates yet">
          <p className="text-body text-ink-muted">IOUs are between you and a roommate. Invite someone first.</p>
          <ButtonLink to="/room/invite">Invite roommates</ButtonLink>
        </EmptyState>
      </>
    )
  }

  const otherName = members.find((m) => m.id === other)?.name.split(' ')[0] ?? 'them'
  const amountCents = Math.round(Number(amount) * 100)
  const valueOk = kind === 'money' ? amountCents > 0 : favor.trim() !== ''
  const canSubmit = other !== '' && valueOk && note.trim() !== ''

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const id = logIou({
      debtor: direction === 'they-owe' ? other : me!.id,
      creditor: direction === 'they-owe' ? me!.id : other,
      kind,
      amountCents: kind === 'money' ? amountCents : 0,
      favor: kind === 'favor' ? favor.trim() : '',
      note: note.trim(),
    })
    navigate(`/money/ious/${id}`, { state: { flash: `Sent to ${otherName} to confirm.` } })
  }

  return (
    <>
      <PageHeader title="Log an IOU" back={{ to: '/money', label: 'Money' }}>
        {otherName} will get a request to confirm it before it counts toward your balance.
      </PageHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <Card className="flex flex-col gap-4">
          <Field label="With">
            <Select value={other} onChange={(e) => setOther(e.target.value)}>
              {others.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
          </Field>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-label pb-1">Who owes whom?</legend>
            <ChoiceRow type="radio" name="direction" checked={direction === 'they-owe'} onChange={() => setDirection('they-owe')}>
              <span className="text-body">{otherName} owes me</span>
            </ChoiceRow>
            <ChoiceRow type="radio" name="direction" checked={direction === 'i-owe'} onChange={() => setDirection('i-owe')}>
              <span className="text-body">I owe {otherName}</span>
            </ChoiceRow>
          </fieldset>
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex gap-1 self-start rounded-md border border-rule bg-paper p-1" role="radiogroup" aria-label="What kind of IOU">
            {(['money', 'favor'] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={`text-label rounded-sm px-4 py-1 ${kind === k ? 'bg-accent text-on-color' : 'text-ink-muted'}`}
              >
                {k === 'money' ? 'Money' : 'Something else'}
              </button>
            ))}
          </div>
          {kind === 'money' ? (
            <Field label="Amount">
              <TextInput type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="20.00" className="text-amount" />
            </Field>
          ) : (
            <Field label="What’s owed" hint="Like “a dinner”, “a coffee” or “a ride to the airport”.">
              <TextInput value={favor} onChange={(e) => setFavor(e.target.value)} placeholder="a dinner" />
            </Field>
          )}
          <Field label="What’s it for?">
            <TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="Pizza on Friday" />
          </Field>
        </Card>

        {canSubmit && (
          <p className="text-body">
            Preview: <strong>{direction === 'they-owe' ? `${otherName} owes you` : `You owe ${otherName}`} {kind === 'money' ? formatMoney(amountCents) : favor.trim()}</strong> for “{note.trim()}”.
          </p>
        )}
        <div>
          <Button type="submit" disabled={!canSubmit}>Send to {otherName}</Button>
        </div>
      </form>
    </>
  )
}

/** Lets the roommate being asked propose a different amount (or a different favor) instead. */
function SuggestChangeForm({ iou, otherName, onCancel }: { iou: Iou; otherName: string; onCancel: () => void }) {
  const { suggestIouChange } = useApp()
  const [amount, setAmount] = useState(iou.kind === 'money' ? (iou.amountCents / 100).toFixed(2) : '')
  const [favor, setFavor] = useState(iou.favor)
  const amountCents = Math.round(Number(amount) * 100)
  const changed = iou.kind === 'money' ? amountCents > 0 && amountCents !== iou.amountCents : favor.trim() !== '' && favor.trim() !== iou.favor

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!changed) return
    suggestIouChange(iou.id, iou.kind === 'money' ? { amountCents, favor: '' } : { amountCents: 0, favor: favor.trim() })
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {iou.kind === 'money' ? (
        <Field label="What you think it should be" hint={`${otherName} will be asked to confirm the new amount.`}>
          <TextInput autoFocus type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-amount" />
        </Field>
      ) : (
        <Field label="What you think it should be" hint={`${otherName} will be asked to confirm the change.`}>
          <TextInput autoFocus value={favor} onChange={(e) => setFavor(e.target.value)} placeholder="a coffee" />
        </Field>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={!changed}>Send to {otherName}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

/** One IOU. Whoever it's waiting on confirms it, declines it, or suggests a different amount. */
export function IouDetailPage() {
  const { iouId = '' } = useParams()
  const { state, me, nameOf, userOf, respondToIou, withdrawIou } = useApp()
  const navigate = useNavigate()
  const sentence = useIouSentence()
  const [suggesting, setSuggesting] = useState(false)
  const iou = state.ious.find((i) => i.id === iouId)
  if (!iou) return <Navigate to="/money" replace />

  const otherId = iou.debtor === me!.id ? iou.creditor : iou.debtor
  const involved = iou.debtor === me!.id || iou.creditor === me!.id
  const iConfirm = iou.status === 'pending' && iou.waitingOn === me!.id
  const previousValue = iou.previous && iouValue({ ...iou, ...iou.previous })
  const history = state.activity.filter((a) => a.iouId === iou.id)

  return (
    <>
      <PageHeader eyebrow={`IOU · ${formatDate(iou.date)}`} title={`${sentence(iou)} ${iouValue(iou)}`} back={{ to: '/money', label: 'Money' }} />
      <Flash />

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <IouStatusTag iou={iou} />
          {iou.creditor === me!.id && <Tag tone="accent">Owed to you</Tag>}
          {iou.debtor === me!.id && <Tag tone="brand">You owe</Tag>}
        </div>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <dt className="text-caption text-ink-muted">Amount</dt>
            <dd className={iou.kind === 'money' ? 'text-amount' : 'text-body'}>{iouValue(iou)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-caption text-ink-muted">For</dt>
            <dd className="text-body">{iou.note}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-caption text-ink-muted">Logged by</dt>
            <dd className="flex items-center gap-2">
              <Avatar user={userOf(iou.createdBy)!} size="sm" />
              <span className="text-body">{nameOf(iou.createdBy)}</span>
            </dd>
          </div>
        </dl>

        {iou.previous && iou.status === 'pending' && (
          <p className="text-body">
            {nameOf(iou.previous.suggestedBy)} suggested <strong>{iouValue(iou)}</strong> instead of {previousValue}.
          </p>
        )}
        {iConfirm && (
          <div className="flex flex-col gap-4 rounded-md border border-brand bg-paper p-4">
            {suggesting ? (
              <SuggestChangeForm iou={iou} otherName={nameOf(otherId)} onCancel={() => setSuggesting(false)} />
            ) : (
              <>
                <p className="text-body">
                  {iou.previous ? `Does ${iouValue(iou)} work for you?` : `${nameOf(iou.createdBy)} logged this. Does it look right to you?`}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="accent" onClick={() => respondToIou(iou.id, true)}>Yes, confirm</Button>
                  <Button variant="secondary" onClick={() => setSuggesting(true)}>
                    {iou.kind === 'money' ? 'Suggest a different amount' : 'Suggest something else'}
                  </Button>
                  <Button variant="secondary" onClick={() => respondToIou(iou.id, false)}>Decline</Button>
                </div>
              </>
            )}
          </div>
        )}
        {iou.status === 'pending' && involved && !iConfirm && (
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-body flex-1 text-ink-muted">Waiting for {nameOf(otherId)} to confirm.</p>
            {iou.createdBy === me!.id && <Button
              variant="secondary"
              onClick={() => {
                withdrawIou(iou.id)
                navigate('/money', { state: { flash: 'IOU withdrawn.' } })
              }}
            >
              Withdraw
            </Button>}
          </div>
        )}
        {iou.status === 'open' && involved && (
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-body flex-1 text-ink-muted">
              {iou.paidMarks.length === 0 && 'Confirmed by both of you. It counts toward your balance until you settle up.'}
              {iou.paidMarks.includes(me!.id) && `You marked it paid. Waiting for ${nameOf(otherId)}.`}
              {iou.paidMarks.includes(otherId) && `${nameOf(otherId)} marked it paid. Confirm on the settle-up screen.`}
            </p>
            <ButtonLink to={`/money/settle/${otherId}`}>Settle up</ButtonLink>
          </div>
        )}
        {iou.status === 'declined' && <p className="text-body text-ink-muted">This IOU was declined, so it doesn’t count toward anyone’s balance.</p>}
        {iou.status === 'settled' && <p className="text-body text-ink-muted">Both of you marked this as paid.</p>}
      </Card>

      <Section title="History">
        {history.length > 0 ? <ActivityList items={history} /> : <p className="text-body text-ink-muted">No activity yet.</p>}
      </Section>
    </>
  )
}

/** Settle up with one roommate. Both of you mark it paid before it clears. */
export function SettleUpPage() {
  const { userId = '' } = useParams()
  const { me, userOf, markPaidWith } = useApp()
  const ious = useRoomIous()
  const [justSettled, setJustSettled] = useState(false)
  const other = userOf(userId)
  if (!other || other.id === me!.id) return <Navigate to="/money" replace />

  const name = other.name.split(' ')[0]
  const open = openIousBetween(ious, me!.id, other.id)
  const cents = moneyBalance(ious, me!.id, other.id)
  const iMarked = open.length > 0 && open.every((i) => i.paidMarks.includes(me!.id))
  const theyMarked = open.length > 0 && open.every((i) => i.paidMarks.includes(other.id))

  if (open.length === 0) {
    return (
      <>
        <PageHeader title={`Settle up with ${name}`} back={{ to: '/money', label: 'Money' }} />
        {justSettled ? (
          <section className="flex flex-col items-start gap-4 rounded-md border border-accent bg-surface p-8">
            <Tag tone="accent">Settled</Tag>
            <h2 className="text-title">You and {name} are all square</h2>
            <p className="text-body text-ink-muted">You both marked everything as paid.</p>
            <ButtonLink to="/money">Back to money</ButtonLink>
          </section>
        ) : (
          <EmptyState title="Nothing to settle">
            <p className="text-body text-ink-muted">You and {name} don’t have any open IOUs.</p>
            <ButtonLink to="/money" variant="secondary">Back to money</ButtonLink>
          </EmptyState>
        )}
      </>
    )
  }

  return (
    <>
      <PageHeader title={`Settle up with ${name}`} back={{ to: '/money', label: 'Money' }}>
        Pay {name} back however you like — cash, Venmo, or that dinner. Then you both mark it paid here.
      </PageHeader>

      <Card className="flex flex-col gap-2">
        <span className="text-caption text-ink-muted">Money</span>
        <p className="text-heading">
          {cents > 0 && <>{name} owes you <span className="font-mono">{formatMoney(cents)}</span></>}
          {cents < 0 && <>You owe {name} <span className="font-mono">{formatMoney(-cents)}</span></>}
          {cents === 0 && 'Even on money'}
        </p>
      </Card>

      <Section title="What you’re settling">
        <ul className="flex flex-col divide-y divide-rule rounded-md border border-rule bg-surface">
          {open.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-body">{i.note}</span>
                <span className="text-caption text-ink-muted">{formatDate(i.date)} · {i.creditor === me!.id ? `${name} owes you` : `You owe ${name}`}</span>
              </div>
              <span className={i.kind === 'money' ? 'text-amount' : 'text-body'}>{iouValue(i)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Mark as paid">
        <ol className="flex flex-col gap-2">
          {[
            { user: me!, label: 'You', done: iMarked },
            { user: other, label: name, done: theyMarked },
          ].map((row) => (
            <li key={row.user.id} className="flex items-center gap-4 rounded-md border border-rule bg-surface p-4">
              <Avatar user={row.user} />
              <span className="text-body flex-1">{row.label}</span>
              {row.done ? <Tag tone="accent">Marked paid</Tag> : <Tag>Not yet</Tag>}
            </li>
          ))}
        </ol>
        {iMarked ? (
          <p className="text-body text-ink-muted">
            Waiting for {name} to mark it paid too. Prototype: use “Acting as” in the bar below to switch to {name}.
          </p>
        ) : (
          <Button
            variant="accent"
            className="self-start"
            onClick={() => {
              if (theyMarked) setJustSettled(true)
              markPaidWith(other.id)
            }}
          >
            {theyMarked ? `Confirm and settle with ${name}` : 'Mark as paid'}
          </Button>
        )}
      </Section>
    </>
  )
}

export function InboxPage() {
  const { state, me, room, markInboxRead } = useApp()
  const items = state.activity.filter((a) => a.roomId === room!.id && a.notify.includes(me!.id))
  const hasUnread = items.some((a) => !a.readBy.includes(me!.id))

  return (
    <>
      <PageHeader
        title="Inbox"
        action={hasUnread ? <Button variant="secondary" onClick={markInboxRead}>Mark all as read</Button> : undefined}
      >
        Chores assigned to you, IOUs to confirm, and payments from roommates.
      </PageHeader>
      {items.length === 0 ? (
        <EmptyState title="Nothing new">
          <p className="text-body text-ink-muted">You’ll see a note here when a roommate assigns you a chore or logs an IOU with you.</p>
        </EmptyState>
      ) : (
        <ActivityList items={items} showUnread />
      )}
    </>
  )
}
