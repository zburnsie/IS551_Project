import { useNavigate } from 'react-router-dom'
import { useApp } from '../data/store'

const toolButton = 'text-label rounded-md border border-on-color px-2 py-1 hover:bg-on-color hover:text-ink'

/**
 * Prototype-only notice and testing tools, kept visually separate from the
 * app: switch which roommate you're acting as (to confirm IOUs or settle up
 * from both sides), load the demo room, or wipe everything.
 */
export function PrototypeBar() {
  const { me, members, actAs, loadDemo, resetAll } = useApp()
  const navigate = useNavigate()
  return (
    <aside className="sticky bottom-0 z-10 bg-ink text-on-color" aria-label="Prototype notice and testing tools">
      <div className="bg-highlight text-ink">
        <p className="text-label mx-auto flex max-w-3xl flex-wrap items-baseline gap-x-2 px-4 py-1 md:px-8">
          <span className="text-caption font-medium">Prototype · for testing only</span>
          <span>Not a real app yet. Accounts are made up and nothing leaves this browser.</span>
        </p>
      </div>
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 md:px-8">
        <span className="text-caption">Testing tools</span>
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
          className={toolButton}
          onClick={() => {
            loadDemo()
            navigate('/room')
          }}
        >
          Load demo room
        </button>
        <button
          className={toolButton}
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
