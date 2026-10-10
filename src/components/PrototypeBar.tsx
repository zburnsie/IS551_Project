import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../data/store'
import { buttonClass } from './Button'

const toolButton = buttonClass('secondary')

/**
 * Prototype-only notice and testing tools, kept visually separate from the
 * app: switch which roommate you're acting as (to confirm IOUs or settle up
 * from both sides), load the demo room, or wipe everything.
 */
export function PrototypeBar() {
  const { me, members, actAs, loadDemo, resetAll } = useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const bar = useRef<HTMLElement>(null)

  // Publish the bar's height so floating UI (toasts) can sit above it.
  useEffect(() => {
    const el = bar.current
    if (!el) return
    const root = document.documentElement
    const observer = new ResizeObserver(() => root.style.setProperty('--prototype-bar-height', `${el.offsetHeight}px`))
    observer.observe(el)
    return () => {
      observer.disconnect()
      root.style.removeProperty('--prototype-bar-height')
    }
  }, [])

  return (
    <aside ref={bar} className="sticky bottom-0 z-10 border-t border-rule bg-surface text-ink" aria-label="Prototype notice and testing tools">
      {/* The notice only needs saying once, on the homepage. */}
      {pathname === '/' && (
        <div className="bg-ink text-on-color">
          <p className="text-label mx-auto flex max-w-3xl flex-wrap items-baseline gap-x-2 px-4 py-1 md:px-8">
            <span className="text-caption font-medium">Prototype · for testing only</span>
            <span>Not a real app yet. Accounts are made up and nothing leaves this browser.</span>
          </p>
        </div>
      )}
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 md:px-8">
        <span className="text-caption text-ink-muted">Testing tools</span>
        {me && members.length > 1 && (
          <label className="text-label flex items-center gap-2">
            Acting as
            <select
              className="text-body rounded-sm border border-rule bg-surface px-1 text-ink"
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
