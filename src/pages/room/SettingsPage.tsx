import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { Button, ButtonLink } from '../../components/Button'
import { Card, Section } from '../../components/Card'
import { Field, TextInput } from '../../components/fields'
import { Flash, PageHeader } from '../../components/PageHeader'
import { ProfileForm } from '../../components/ProfileForm'
import { useApp } from '../../data/store'

/** Door-with-arrow exit icon (16×16). */
function ExitIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

/** Small inline pencil icon (16×16). */
function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}

export function SettingsPage() {
  const { me, room, members, logOut, updateRoom } = useApp()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [editingDorm, setEditingDorm] = useState(false)
  const [dormName, setDormName] = useState(room!.name)

  return (
    <>
      <PageHeader
        title="Profile Details"
        action={
          <Button
            variant="secondary"
            onClick={() => {
              logOut()
              navigate('/')
            }}
          >
            <ExitIcon /> <span className="ml-2">Log out</span>
          </Button>
        }
      />
      <Flash />

      <Section title="Your profile">
        {editing ? (
          <Card>
            <ProfileForm
              submitLabel="Save profile"
              onSaved={() => {
                setEditing(false)
                navigate('/settings', { replace: true, state: { flash: 'Profile saved.' } })
              }}
            />
            <button
              type="button"
              className="text-label text-ink-muted hover:text-ink mt-2"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </Card>
        ) : (
          <Card className="flex items-center gap-4">
            <Avatar user={me!} size="lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-heading">{me!.name}</span>
              {me!.dorm && <span className="text-body text-ink-muted">{me!.dorm}</span>}
              <span className="text-caption text-ink-muted">
                {me!.email}
              </span>
            </div>
            <Button variant="primary" onClick={() => setEditing(true)}>
              <PencilIcon /> <span className="ml-2">Edit</span>
            </Button>
          </Card>
        )}
      </Section>

      <Section title="Dorm Details" action={<ButtonLink to="/room/invite" variant="secondary">Invite</ButtonLink>}>
        <Card className="flex flex-col gap-4">
          {editingDorm ? (
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault()
                if (!dormName.trim()) return
                updateRoom({ name: dormName.trim() })
                setEditingDorm(false)
                navigate('/settings', { replace: true, state: { flash: 'Dorm name updated.' } })
              }}
              className="flex flex-col gap-2"
            >
              <Field label="Dorm name">
                <TextInput autoFocus value={dormName} onChange={(e) => setDormName(e.target.value)} placeholder="e.g. The Crib" />
              </Field>
              <div className="flex gap-2">
                <Button type="submit" disabled={!dormName.trim()}>Save</Button>
                <button type="button" className="text-label text-ink-muted hover:text-ink" onClick={() => { setDormName(room!.name); setEditingDorm(false) }}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-caption text-ink-muted">Name</span>
                <span className="text-body">{room!.name}</span>
              </div>
              <Button variant="primary" onClick={() => setEditingDorm(true)}>
                <PencilIcon /> <span className="ml-2">Edit</span>
              </Button>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-caption text-ink-muted">Room code</span>
            <span className="text-heading font-mono">{room!.code}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-caption text-ink-muted">Roommates</span>
            <ul className="flex flex-col gap-2 mt-1">
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-4">
                  <Avatar user={m} size="sm" />
                  <span className="text-body">{m.id === me!.id ? `${m.name} (you)` : m.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </Section>

    </>
  )
}