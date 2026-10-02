import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { Button, ButtonLink } from '../../components/Button'
import { Card, Section } from '../../components/Card'
import { Flash, PageHeader } from '../../components/PageHeader'
import { ProfileForm } from '../../components/ProfileForm'
import { useApp } from '../../data/store'

export function SettingsPage() {
  const { me, room, members, logOut } = useApp()
  const navigate = useNavigate()

  return (
    <>
      <PageHeader title="Profile and room" />
      <Flash />

      <Section title="Your profile">
        <Card>
          <ProfileForm submitLabel="Save profile" onSaved={() => navigate('/settings', { replace: true, state: { flash: 'Profile saved.' } })} />
        </Card>
        <p className="text-body text-ink-muted">
          Signed in as <span className="font-mono">{me!.email}</span> ({me!.method === 'school' ? 'school account' : 'email'})
        </p>
      </Section>

      <Section title={room!.name} action={<ButtonLink to="/room/invite" variant="secondary">Invite</ButtonLink>}>
        <Card className="flex flex-col gap-1">
          <span className="text-caption text-ink-muted">Room code</span>
          <span className="text-heading font-mono">{room!.code}</span>
        </Card>
        <ul className="flex flex-col gap-2">
          {members.map((m) => (
            <li key={m.id}>
              <Card className="flex items-center gap-4">
                <Avatar user={m} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-body">{m.id === me!.id ? `${m.name} (you)` : m.name}</span>
                  {m.dorm && <span className="text-caption text-ink-muted">{m.dorm}</span>}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <div>
        <Button
          variant="secondary"
          onClick={() => {
            logOut()
            navigate('/')
          }}
        >
          Log out
        </Button>
      </div>
    </>
  )
}
