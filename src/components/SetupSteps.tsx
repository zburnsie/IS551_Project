import { useLocation } from 'react-router-dom'

const steps = [
  { path: '/signup', label: 'Account' },
  { path: '/welcome/profile', label: 'Profile' },
  { path: '/welcome/room', label: 'Room' },
  { path: '/welcome/invite', label: 'Invite' },
]

/** Progress through sign-up and onboarding: account → profile → room → invite. */
export function SetupSteps() {
  const { pathname } = useLocation()
  const current = Math.max(0, steps.findIndex((s) => pathname.startsWith(s.path) || (s.path === '/welcome/room' && pathname === '/welcome/join')))
  return (
    <ol className="flex gap-2" aria-label="Setup steps">
      {steps.map((s, i) => (
        <li key={s.path} className="flex flex-1 flex-col gap-1" aria-current={i === current ? 'step' : undefined}>
          <span className={`h-1 rounded-pill ${i <= current ? 'bg-brand' : 'bg-rule'}`} />
          <span className={`text-caption ${i === current ? 'text-ink' : 'text-ink-muted'}`}>
            {i + 1}. {s.label}
          </span>
        </li>
      ))}
    </ol>
  )
}
