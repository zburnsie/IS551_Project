import { useNavigate } from 'react-router-dom'
import { useApp } from '../data/store'

/**
 * Prototype-only controls, kept visually separate from the app: switch which
 * roommate you're acting as (to confirm IOUs or settle up from both sides),
 * load the demo room, or wipe everything.
 */
export function PrototypeBar() {
  const { me, members, actAs, loadDemo, resetAll } = useApp()
  const navigate = useNavigate()
  return (
    <aside className="fixed inset-x-0 bottom-0 z-10 border-t border-ink bg-ink text-on-color" aria-label="Prototype controls">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 md:px-8">
        <span className="text-caption">Prototype</span>
        {me && members.length > 1 && (
          <label className="text-label flex items-center gap-2">
            Acting as
            <select
              className="text-body rounded-sm border border-on-color bg-ink px-1 text-on-color"
              value={me.id}
              onChange={(e) => actAs(e.target.value)}
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>
        )}
        <span className="flex-1" />
        <button
          className="text-label underline"
          onClick={() => {
            loadDemo()
            navigate('/room')
          }}
        >
          Load demo room
        </button>
        <button
          className="text-label underline"
          onClick={() => {
            if (!confirm('Clear all prototype data on this browser?')) return
            resetAll()
            navigate('/')
          }}
        >
          Reset
        </button>
      </div>
    </aside>
  )
}
