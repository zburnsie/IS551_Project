import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { Button, ButtonLink } from '../../components/Button'
import { Card } from '../../components/Card'
import { ErrorText, Field, TextInput } from '../../components/fields'
import { BackLink, Flash } from '../../components/PageHeader'
import { ProfileForm } from '../../components/ProfileForm'
import { useApp } from '../../data/store'

function StepHeader({ title, children }: { title: string; children: ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-title">{title}</h1>
      <p className="text-body text-ink-muted">{children}</p>
    </header>
  )
}

export function CreateProfilePage() {
  const { state } = useApp()
  const navigate = useNavigate()
  return (
    <>
      <StepHeader title="Make your profile">This is how your roommates will see you.</StepHeader>
      <Card>
        <ProfileForm submitLabel="Continue" onSaved={() => navigate(state.pendingCode ? '/welcome/join' : '/welcome/room')} />
      </Card>
    </>
  )
}

export function RoomChoicePage() {
  const { me } = useApp()
  return (
    <>
      <StepHeader title={`Nice to meet you, ${me?.name.split(' ')[0]}`}>
        Start a room for your place, or join one a roommate already made.
      </StepHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/welcome/room/new" className="rounded-md hover:opacity-90">
          <Card className="flex h-full flex-col gap-2">
            <span className="text-caption text-ink-muted">First one here</span>
            <span className="text-heading">Create a room</span>
            <span className="text-body text-ink-muted">Name it, then invite your roommates with a link or code.</span>
          </Card>
        </Link>
        <Link to="/welcome/join" className="rounded-md hover:opacity-90">
          <Card className="flex h-full flex-col gap-2">
            <span className="text-caption text-ink-muted">Have a code</span>
            <span className="text-heading">Join a room</span>
            <span className="text-body text-ink-muted">Enter the code a roommate sent you.</span>
          </Card>
        </Link>
      </div>
    </>
  )
}

export function CreateRoomPage() {
  const { createRoom } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createRoom(name.trim())
    navigate('/welcome/invite')
  }

  return (
    <>
      <BackLink to="/welcome/room">Back</BackLink>
      <StepHeader title="Name your room">Something everyone will recognize.</StepHeader>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Room name">
            <TextInput autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Dorm 204" />
          </Field>
          <div className="flex flex-wrap gap-2">
            {['Dorm 204', 'Apt 3B', 'The Blue House'].map((idea) => (
              <button key={idea} type="button" className="text-caption rounded-pill border border-rule bg-paper px-2 py-1 hover:border-ink" onClick={() => setName(idea)}>
                {idea}
              </button>
            ))}
          </div>
          <div>
            <Button type="submit" disabled={!name.trim()}>Create room</Button>
          </div>
        </form>
      </Card>
    </>
  )
}

export function JoinRoomPage() {
  const { joinRoom, state, room } = useApp()
  const navigate = useNavigate()
  const [code, setCode] = useState(state.pendingCode ?? '')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (joinRoom(code)) navigate('/room', { state: { flash: 'You’re in. Say hi to your roommates.' } })
    else setError('That code doesn’t match a room. Check it with whoever sent it.')
  }

  return (
    <>
      <BackLink to={room ? '/room' : '/welcome/room'}>Back</BackLink>
      <StepHeader title="Join a room">Enter the code from your roommate’s invite. It looks like KTX-482.</StepHeader>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Invite code">
            <TextInput
              autoFocus
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError('') }}
              placeholder="ABC-123"
              className="text-amount uppercase"
            />
          </Field>
          {error && <ErrorText>{error}</ErrorText>}
          <div>
            <Button type="submit" disabled={code.trim().length < 3}>Join room</Button>
          </div>
        </form>
      </Card>
      {state.rooms.length > 0 && (
        <p className="text-body text-ink-muted">
          Prototype: rooms on this browser use {state.rooms.map((r) => `${r.code} (${r.name})`).join(', ')}.
        </p>
      )}
    </>
  )
}

export function InviteRoommatesPage({ inApp = false }: { inApp?: boolean }) {
  const { room, members, simulateRoommateJoining } = useApp()
  const navigate = useNavigate()
  const [copied, setCopied] = useState<'link' | 'code' | null>(null)
  const [joinedMessage, setJoinedMessage] = useState('')
  const link = `${window.location.origin}/join/${room!.code}`

  const copy = async (what: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(what === 'link' ? link : room!.code)
      setCopied(what)
    } catch {
      setCopied(null)
    }
  }

  return (
    <>
      {inApp && <BackLink to="/settings">Settings</BackLink>}
      <StepHeader title="Invite your roommates">
        Send them the link, or have them enter the code after they sign up.
      </StepHeader>
      <Flash />
      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-caption text-ink-muted">Room code</span>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-title font-mono tracking-widest">{room!.code}</span>
            <Button variant="secondary" onClick={() => copy('code')}>{copied === 'code' ? 'Copied' : 'Copy code'}</Button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-caption text-ink-muted">Invite link</span>
          <div className="flex flex-wrap items-center gap-2">
            <TextInput readOnly value={link} className="min-w-0 flex-1" onFocus={(e) => e.target.select()} />
            <Button variant="secondary" onClick={() => copy('link')}>{copied === 'link' ? 'Copied' : 'Copy link'}</Button>
          </div>
        </div>
      </Card>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-heading">In {room!.name} ({members.length})</h2>
          <Button
            variant="secondary"
            onClick={() => {
              const name = simulateRoommateJoining()
              setJoinedMessage(name ? `${name} joined ${room!.name}.` : 'No more sample roommates to add.')
            }}
          >
            Simulate a roommate joining
          </Button>
        </div>
        {joinedMessage && <p role="status" className="text-body text-ink-muted">{joinedMessage}</p>}
        <ul className="flex flex-col gap-2">
          {members.map((m, i) => (
            <li key={m.id}>
              <Card className="flex items-center gap-4">
                <Avatar user={m} />
                <span className="text-body flex-1">{i === 0 ? `${m.name} (you)` : m.name}</span>
                <span className="text-caption text-ink-muted">Joined</span>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {!inApp && (
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={() => navigate('/room')}>{members.length > 1 ? 'Go to your room' : 'Skip for now'}</Button>
          <span className="text-body text-ink-muted">You can invite people later from settings.</span>
        </div>
      )}
      {inApp && <ButtonLink to="/room" variant="secondary" className="self-start">Done</ButtonLink>}
    </>
  )
}
