import { useNavigate } from 'react-router-dom'
import { useApp } from '../data/store'

/** Way out of sign-up and onboarding: drops you into the filled-in demo room as Alex. */
export function SkipToDemo() {
  const { loadDemo } = useApp()
  const navigate = useNavigate()
  return (
    <p className="text-body text-center text-ink-muted">
      Just looking around?{' '}
      <button
        type="button"
        className="text-label text-ink underline"
        onClick={() => {
          loadDemo()
          navigate('/room')
        }}
      >
        Skip setup and try the demo room
      </button>
    </p>
  )
}
