import { useNavigate } from 'react-router-dom'
import { Button, ButtonLink } from '../../components/Button'
import { Card } from '../../components/Card'
import { useHomePath } from '../../components/guards'
import { useApp } from '../../data/store'

const steps = [
  {
    title: 'Set up your room',
    body: 'Sign up with your email or school login, make a profile, and start a group for your room. Share a code and your roommates are in.',
  },
  {
    title: 'Share the chores',
    body: 'Make a list, add chores with due dates, and assign them. Repeating chores rotate to the next roommate when one is done.',
  },
  {
    title: 'Keep IOUs fair',
    body: 'Log what you owe each other — $20 cash or “a dinner”. Your roommate confirms it, and you both mark it paid when you settle up.',
  },
]

export function HomePage() {
  const { me, loadDemo } = useApp()
  const home = useHomePath()
  const navigate = useNavigate()

  return (
    <>
      <section className="flex flex-col gap-4 py-8">
        <p className="text-caption text-ink-muted">For dorms and shared apartments</p>
        <h1 className="text-title sm:text-display">Chores and IOUs, sorted between roommates.</h1>
        <p className="text-body max-w-xl text-ink-muted">
          Common Room keeps track of whose turn it is and who owes what, so nobody has to keep score out loud.
        </p>
        <div className="flex flex-wrap gap-2">
          {me ? (
            <ButtonLink to={home}>Open your room</ButtonLink>
          ) : (
            <>
              <ButtonLink to="/signup">Sign up free</ButtonLink>
              <ButtonLink to="/login" variant="secondary">Log in</ButtonLink>
            </>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              loadDemo()
              navigate('/room')
            }}
          >
            Try the demo room
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title}>
              <Card className="flex h-full flex-col gap-2">
                <span className="text-caption text-ink-muted">Step {i + 1}</span>
                <h3 className="text-heading">{step.title}</h3>
                <p className="text-body text-ink-muted">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-heading">Got an invite code?</p>
          <p className="text-body text-ink-muted">Sign up first, then join your roommates’ room with the code.</p>
        </div>
        <ButtonLink to={me ? '/welcome/join' : '/signup'} variant="secondary">Join a room</ButtonLink>
      </Card>
    </>
  )
}
