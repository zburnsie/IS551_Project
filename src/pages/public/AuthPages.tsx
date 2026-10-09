import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { ErrorText, Field, TextInput } from '../../components/fields'
import { SetupSteps } from '../../components/SetupSteps'
import { SkipToDemo } from '../../components/SkipToDemo'
import { useApp } from '../../data/store'

/** Simulated single sign-on: asks for a school email instead of redirecting to a real provider. */
function SchoolLogin({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const valid = /^[^@\s]+@[^@\s]+\.edu$/i.test(email.trim())

  if (!open) {
    return (
      <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        Continue with your school account
      </Button>
    )
  }
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onSubmit(email)
      }}
    >
      <Field label="School email" hint="Prototype: this stands in for your school’s sign-in page.">
        <TextInput type="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" />
      </Field>
      <Button type="submit" variant="secondary" disabled={!valid}>Continue</Button>
    </form>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <span className="h-px flex-1 bg-rule" />
      <span className="text-caption text-ink-muted">or</span>
      <span className="h-px flex-1 bg-rule" />
    </div>
  )
}

export function SignUpPage() {
  const { signUp, logIn } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const canSubmit = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) && password.length >= 8

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    if (signUp(email, 'email') === 'exists') {
      setError('There’s already an account with that email. Log in instead.')
      return
    }
    navigate('/welcome/profile')
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8">
      <SetupSteps />
      <header className="flex flex-col gap-2">
        <h1 className="text-title">Make your account</h1>
        <p className="text-body text-ink-muted">It takes about a minute. Then you’ll set up your room.</p>
      </header>
      <Card className="flex flex-col gap-4">
        <SchoolLogin
          onSubmit={(schoolEmail) => {
            // School sign-in works for new and returning roommates alike.
            if (signUp(schoolEmail, 'school') === 'exists') logIn(schoolEmail)
            navigate('/welcome/profile')
          }}
        />
        <Divider />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email">
            <TextInput type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} placeholder="you@example.com" />
          </Field>
          <Field label="Password" hint="At least 8 characters. Prototype: passwords aren’t saved or checked.">
            <TextInput type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && <ErrorText>{error}</ErrorText>}
          <Button type="submit" disabled={!canSubmit}>Sign up</Button>
        </form>
      </Card>
      <p className="text-body text-center">
        Already have an account? <Link to="/login" className="text-label underline">Log in</Link>
      </p>
      <SkipToDemo />
    </div>
  )
}

export function LogInPage() {
  const { logIn, signUp, state } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (logIn(email)) navigate('/room')
    else setError('We couldn’t find an account with that email. Check the spelling, or sign up.')
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-title">Welcome back</h1>
        <p className="text-body text-ink-muted">Log in to see your room’s chores and IOUs.</p>
      </header>
      <Card className="flex flex-col gap-4">
        <SchoolLogin
          onSubmit={(schoolEmail) => {
            if (!logIn(schoolEmail)) signUp(schoolEmail, 'school')
            navigate('/room')
          }}
        />
        <Divider />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email">
            <TextInput type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} />
          </Field>
          <Field label="Password">
            <TextInput type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && <ErrorText>{error}</ErrorText>}
          <Button type="submit" disabled={!email.trim() || !password}>Log in</Button>
        </form>
      </Card>
      {state.users.length > 0 && (
        <p className="text-body text-center text-ink-muted">
          Prototype accounts on this browser: {state.users.map((u) => u.email).join(', ')}
        </p>
      )}
      <p className="text-body text-center">
        New here? <Link to="/signup" className="text-label underline">Sign up</Link>
      </p>
    </div>
  )
}

/** Invite links (/join/KTX-482) remember the code, then send you to sign up or straight to joining. */
export function InviteLinkPage() {
  const { code = '' } = useParams()
  const { me, setPendingCode } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    setPendingCode(code.toUpperCase())
    if (!me) navigate('/signup', { replace: true })
    else if (!me.name) navigate('/welcome/profile', { replace: true })
    else navigate('/welcome/join', { replace: true })
    // Run once on arrival; the code only needs saving the first time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
