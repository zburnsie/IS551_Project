import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ActivityList } from '../../components/ActivityList'
import { Avatar } from '../../components/Avatar'
import { Button, ButtonLink } from '../../components/Button'
import { Card, Section } from '../../components/Card'
import { ChoiceRow, Field, Select, TextInput } from '../../components/fields'
import { EmptyState, PageHeader } from '../../components/PageHeader'
import { IouStatusTag } from '../../components/status'
import { Tag } from '../../components/Tag'
import { Toast, type ToastState } from '../../components/Toast'
import { useApp } from '../../data/store'
import type { Activity, Iou } from '../../data/types'
import { describeActivity } from '../../lib/activity'
import { iouValue, moneyBalance, openIousBetween, paidMarkNeeded } from '../../lib/balances'
import { formatDate, formatMoney, formatTimestamp } from '../../lib/format'

function useRoomIous() {
  const { state, room } = useApp()
  return state.ious.filter((i) => i.roomId === room!.id)
}

/** "Maya owes you" / "You owe Sam" — always in words, never color alone. */
function useIouSentence() {
  const { nameOf } = useApp()
  return (iou: Iou) => `${nameOf(iou.debtor)} ${nameOf(iou.debtor) === 'You' ? 'owe' : 'owes'} ${nameOf(iou.creditor, true)}`
}

/** Confirmation shown after sending an IOU to a roommate, with a way back to the money page. */
function sentToast(name: string): { toast: ToastState } {
  return { toast: { message: `Sent to ${name} to confirm.`, link: { to: '/money', label: 'Back to money' } } }
}

/** Marks IOUs with a roommate as paid and confirms it with a toast on the current page. */
function useMarkPaid() {
  const { nameOf, markPaidWith } = useApp()
  const navigate = useNavigate()
  return (otherId: string, toMark: Iou[]) => {
    if (toMark.length === 0) return
    const name = nameOf(otherId)
    // An IOU settles once both sides have marked it, so these clear if the roommate already has.
    const settles = toMark.every((i) => i.paidMarks.includes(otherId))
    const what = toMark.length === 1 ? iouValue(toMark[0]) : `${toMark.length} IOUs`
    markPaidWith(otherId, toMark.map((i) => i.id))
    const message = settles ? `Settled ${what} with ${name}.` : `Marked ${what} as paid. Waiting for ${name} to confirm.`
    navigate('.', { replace: true, state: { toast: { message } satisfies ToastState } })
  }
}

/** A non-money IOU ("a dinner"), marked with a gift symbol so it never reads as a dollar amount. */
function FavorMark({ favor, owedToMe, label }: { favor: string; owedToMe: boolean; label?: string }) {
  return (
    <span className={`text-label inline-flex items-center gap-1 ${owedToMe ? 'text-accent' : 'text-brand'}`}>
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <rect x="2" y="6" width="12" height="3" />
        <path d="M3 9v5h10V9M8 6v8M8 6C6.5 6 4.5 5.5 4.5 3.75S7 2 8 6Zm0 0c1.500 0 3.500-.5 3.500-2.250S9 2 8 6Z" />
      </svg>
      {label && <span className="sr-only">{label} </span>}
      {favor}
    </span>
  )
}

/** One IOU in a list. The row opens the IOU; open ones can also be marked paid right here. */
function IouRow({ iou }: { iou: Iou }) {
  const { me } = useApp()
  const markPaid = useMarkPaid()
  const sentence = useIouSentence()
  const owedToMe = iou.creditor === me!.id
  const otherId = owedToMe ? iou.debtor : iou.creditor
  const canMark = iou.status === 'open' && !iou.paidMarks.includes(me!.id)
  const theyMarked = iou.paidMarks.includes(otherId)
  return (
    <div className="flex flex-col rounded-md border border-rule bg-surface hover:border-accent sm:flex-row sm:items-center">
      <Link to={`/money/ious/${iou.id}`} className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 p-4 sm:flex sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-body">{sentence(iou)}{iou.kind === 'favor' && ` ${iou.favor}`}</span>
          <span className="text-caption text-ink-muted">{formatDate(iou.date)} · {iou.note}</span>
        </div>
        {/* On phones the status drops below, so the sentence and amount share the top line. */}
        <span className="order-last col-span-2 sm:order-none"><IouStatusTag iou={iou} /></span>
        {iou.kind === 'money' ? (
          <span className={`text-amount text-right ${owedToMe ? 'text-accent' : 'text-brand'}`}>{formatMoney(iou.amountCents)}</span>
        ) : (
          <FavorMark favor={iou.favor} owedToMe={owedToMe} />
        )}
      </Link>
      {canMark && (
        <div className="flex flex-col px-4 pb-4 sm:py-4 sm:pl-0">
          <Button variant={theyMarked ? 'primary' : 'accent'} onClick={() => markPaid(otherId, [iou])}>
            {theyMarked ? 'Confirm paid' : 'Mark paid'}
          </Button>
        </div>
      )}
    </div>
  )
}

/** Track balances: who owes whom, per roommate. */
export function MoneyPage() {
  const { me, members } = useApp()
  const ious = useRoomIous()
  const others = members.slice(1)
  const mine = ious.filter((i) => i.debtor === me!.id || i.creditor === me!.id)
  const pending = mine.filter((i) => i.status === 'pending')
  const settled = mine.filter((i) => i.status === 'settled' || i.status === 'declined')

  return (
    <>
      <PageHeader title="Money and IOUs" action={<ButtonLink to="/money/new" variant="accent">Log an IOU</ButtonLink>} />
      <Toast />

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
              // Direction is shown by color (green: owed to you, red: you owe), with words for screen readers only.
              const direction = cents > 0 ? `${name} owes you` : cents < 0 ? `You owe ${name}` : ''
              return (
                <li key={m.id}>
                  <Card className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 sm:flex">
                    <Avatar user={m} />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-body">
                        {open.length === 0 ? `No outstanding balance with ${name}` : `Outstanding balance with ${name}`}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {(cents !== 0 || favors.length === 0) && (
                        <span className={`text-amount ${cents > 0 ? 'text-accent' : cents < 0 ? 'text-brand' : ''}`}>
                          {direction && <span className="sr-only">{direction} </span>}
                          {formatMoney(Math.abs(cents))}
                        </span>
                      )}
                      {favors.map((f) => (
                        <FavorMark key={f.id} favor={f.favor} owedToMe={f.creditor === me!.id} label={f.debtor === me!.id ? `You owe ${name}` : `${name} owes you`} />
                      ))}
                    </div>
                    {open.length > 0 ? (
                      <ButtonLink to={`/money/settle/${m.id}`} variant={paidMarkNeeded(ious, me!.id, m.id) ? 'primary' : 'accent'} className="col-span-3">Settle up</ButtonLink>
                    ) : (
                      <Button variant="secondary" disabled className="col-span-3">Settle up</Button>
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
          <ButtonLink to="/room/invite" variant="accent">Invite roommates</ButtonLink>
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
    navigate(`/money/ious/${id}`, { state: sentToast(otherName) })
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
          <Button type="submit" variant="accent" disabled={!canSubmit}>Send to {otherName}</Button>
        </div>
      </form>
    </>
  )
}

/** Lets the roommate being asked propose a different amount (or a different favor) instead. */
function SuggestChangeForm({ iou, otherName, onCancel }: { iou: Iou; otherName: string; onCancel: () => void }) {
  const { suggestIouChange } = useApp()
  const navigate = useNavigate()
  const [amount, setAmount] = useState(iou.kind === 'money' ? (iou.amountCents / 100).toFixed(2) : '')
  const [favor, setFavor] = useState(iou.favor)
  const amountCents = Math.round(Number(amount) * 100)
  const changed = iou.kind === 'money' ? amountCents > 0 && amountCents !== iou.amountCents : favor.trim() !== '' && favor.trim() !== iou.favor

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!changed) return
    suggestIouChange(iou.id, iou.kind === 'money' ? { amountCents, favor: '' } : { amountCents: 0, favor: favor.trim() })
    onCancel()
    navigate('.', { replace: true, state: sentToast(otherName) })
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
        <Button type="submit" variant="accent" disabled={!changed}>Send to {otherName}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

/** One IOU. Whoever it's waiting on confirms it, declines it, or suggests a different amount. */
export function IouDetailPage() {
  const { iouId = '' } = useParams()
  const { state, me, nameOf, userOf, respondToIou, withdrawIou } = useApp()
  const sentence = useIouSentence()
  const [suggesting, setSuggesting] = useState(false)
  const [withdrawn, setWithdrawn] = useState(false)
  const iou = state.ious.find((i) => i.id === iouId)
  // Withdrawing removes the IOU, which lands here; carry the confirmation along with the redirect.
  if (!iou) return <Navigate to="/money" replace state={withdrawn ? { toast: { message: 'IOU withdrawn.' } satisfies ToastState } : undefined} />

  const otherId = iou.debtor === me!.id ? iou.creditor : iou.debtor
  const involved = iou.debtor === me!.id || iou.creditor === me!.id
  const iConfirm = iou.status === 'pending' && iou.waitingOn === me!.id
  const previousValue = iou.previous && iouValue({ ...iou, ...iou.previous })
  const history = state.activity.filter((a) => a.iouId === iou.id)

  return (
    <>
      <PageHeader eyebrow={`IOU · ${formatDate(iou.date)}`} title={`${sentence(iou)} ${iouValue(iou)}`} back={{ to: '/money', label: 'Money' }} />
      <Toast />

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <IouStatusTag iou={iou} />
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
                  <Button variant="primary" onClick={() => respondToIou(iou.id, false)}>Decline</Button>
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
                setWithdrawn(true)
                withdrawIou(iou.id)
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
            <ButtonLink to={`/money/settle/${otherId}`} variant={iou.paidMarks.includes(otherId) && !iou.paidMarks.includes(me!.id) ? 'primary' : 'accent'}>Settle up</ButtonLink>
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
  const { me, userOf } = useApp()
  const markPaidAndToast = useMarkPaid()
  const ious = useRoomIous()
  const [justSettled, setJustSettled] = useState(false)
  const other = userOf(userId)
  if (!other || other.id === me!.id) return <Navigate to="/money" replace />

  const name = other.name.split(' ')[0]
  const open = openIousBetween(ious, me!.id, other.id)
  const toMark = open.filter((i) => !i.paidMarks.includes(me!.id))
  const waiting = open.filter((i) => i.paidMarks.includes(me!.id)).length

  const markPaid = (toMark: Iou[]) => {
    // Nothing will be left open if this covers everything and the other side already marked it all.
    if (open.every((i) => i.paidMarks.includes(other.id) && toMark.includes(i))) setJustSettled(true)
    markPaidAndToast(other.id, toMark)
  }

  if (open.length === 0) {
    return (
      <>
        <PageHeader title={`Settle up with ${name}`} back={{ to: '/money', label: 'Money' }} />
        <Toast />
        {justSettled ? (
          <section className="flex flex-col items-start gap-4 rounded-md border border-accent bg-surface p-8">
            <Tag tone="accent">Settled</Tag>
            <h2 className="text-title">You and {name} are all square</h2>
            <p className="text-body text-ink-muted">You both marked everything as paid.</p>
            <ButtonLink to="/money" variant="accent">Back to money</ButtonLink>
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
        Pay {name} back however you like — cash, Venmo, or that dinner. Then you each mark what’s been paid, one item at a time or all at once.
      </PageHeader>
      <Toast />

      <Section title="What you’re settling">
        <ul className="flex flex-col divide-y divide-rule rounded-md border border-rule bg-surface">
          {open.map((i) => {
            const iMarked = i.paidMarks.includes(me!.id)
            const theyMarked = i.paidMarks.includes(other.id)
            return (
              <li key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4 sm:flex">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-body">{i.note}</span>
                  <span className="text-caption text-ink-muted">
                    {formatDate(i.date)} · {i.creditor === me!.id ? `${name} owes you` : `You owe ${name}`}
                    {theyMarked && ` · ${name} marked it paid`}
                  </span>
                </div>
                {i.kind === 'money' ? <span className="text-amount">{iouValue(i)}</span> : <FavorMark favor={i.favor} owedToMe={i.creditor === me!.id} />}
                {iMarked ? (
                  <span className="col-span-2"><Tag tone="accent">You marked paid</Tag></span>
                ) : (
                  <Button variant={theyMarked ? 'primary' : 'accent'} className="col-span-2" onClick={() => markPaid([i])}>
                    {theyMarked ? 'Confirm paid' : 'Mark paid'}
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
        {toMark.length > 1 && (
          <Button variant="secondary" className="self-start" onClick={() => markPaid(toMark)}>
            Mark all {toMark.length} as paid
          </Button>
        )}
        {waiting > 0 && (
          <p className="text-body text-ink-muted">
            Waiting for {name} to mark {waiting === 1 ? 'it' : 'them'} paid too. Prototype: use “Acting as” in the bar below to switch to {name}.
          </p>
        )}
      </Section>
    </>
  )
}

function inboxDetailLabel(a: Activity): { label: string; link: string | null } {
  if (a.iouId) return { label: 'View in Money', link: `/money/ious/${a.iouId}` }
  if (a.choreId) return { label: 'View in Chores', link: `/chores/${a.choreId}` }
  if (a.listId) return { label: 'View in Chores', link: `/chores/lists/${a.listId}` }
  if (a.kind === 'iou-marked-paid' || a.kind === 'iou-settled') return { label: 'View in Money', link: `/money/settle/${a.actor}` }
  return { label: '', link: null }
}

function InboxItemDetail({ activity }: { activity: Activity }) {
  const { state, me, nameOf } = useApp()
  const { label, link } = inboxDetailLabel(activity)

  let detail: string | null = null
  if (activity.choreId) {
    const chore = state.chores.find((c) => c.id === activity.choreId)
    if (chore) {
      const assignee = chore.assignedTo ? nameOf(chore.assignedTo) : 'Unassigned'
      detail = `Due ${formatDate(chore.dueDate)} \u00b7 ${assignee}${chore.done ? ' \u00b7 Done' : ''}`
    }
  }

  // Build richer detail for IOUs
  let detailNode: React.ReactNode = null
  if (activity.iouId) {
    const iou = state.ious.find((i) => i.id === activity.iouId)
    if (iou) {
      const amount = iou.kind === 'money' ? formatMoney(iou.amountCents) : iou.favor
      const owedToMe = iou.creditor === me?.id
      detailNode = (
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-body font-mono ${owedToMe ? 'text-accent' : 'text-brand'}`}>{amount}</span>
          <IouStatusTag iou={iou} />
          <span className="text-caption text-ink-muted">{nameOf(iou.debtor)} {iou.debtor === me?.id ? 'owe' : 'owes'} {nameOf(iou.creditor, true)}</span>
        </div>
      )
    }
  } else if (detail) {
    detailNode = <p className="text-caption text-ink-muted">{detail}</p>
  }

  return (
    <div className="flex flex-col gap-2 px-4 pb-4 pt-0 ml-12">
      {detailNode}
      {link && (
        <ButtonLink to={link} variant="secondary" className="self-start">
          {label} →
        </ButtonLink>
      )}
    </div>
  )
}

export function InboxPage() {
  const { state, me, room, userOf, nameOf, markInboxRead } = useApp()
  const items = state.activity.filter((a) => a.roomId === room!.id && a.notify.includes(me!.id))
  const hasUnread = items.some((a) => !a.readBy.includes(me!.id))
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
          <p className="text-body text-ink-muted">You'll see a note here when a roommate assigns you a chore or logs an IOU with you.</p>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((a) => {
            const actor = userOf(a.actor)
            const isExpanded = expandedId === a.id
            return (
              <li key={a.id} className="rounded-md border border-rule bg-surface hover:border-accent transition">
                <button
                  type="button"
                  className="flex w-full items-center gap-4 p-4 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : a.id)}
                >
                  {actor && <Avatar user={actor} size="sm" />}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-body">{describeActivity(a, nameOf)}</span>
                    <span className="text-caption text-ink-muted">{formatTimestamp(a.at)}</span>
                  </div>
                  {!a.readBy.includes(me!.id) && <Tag tone="brand">New</Tag>}
                  <span className={`text-ink-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true">▾</span>
                </button>
                {isExpanded && <InboxItemDetail activity={a} />}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}