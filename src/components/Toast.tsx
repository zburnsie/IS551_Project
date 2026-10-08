import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export type ToastState = { message: string; link?: { to: string; label: string } }

const DISMISS_AFTER_MS = 8000

/**
 * A one-time confirmation that floats over the page, passed through navigation
 * state like `Flash`. It can carry a link for where to go next and clears itself.
 */
export function Toast() {
  const { state, key } = useLocation()
  const toast = (state as { toast?: ToastState } | null)?.toast
  const [dismissedKey, setDismissedKey] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setDismissedKey(key), DISMISS_AFTER_MS)
    return () => clearTimeout(timer)
  }, [toast, key])

  if (!toast || dismissedKey === key) return null
  return (
    <div
      className="pointer-events-none fixed inset-x-4 z-20 flex justify-end"
      style={{ bottom: 'calc(var(--prototype-bar-height, 0px) + 16px)' }}
    >
      <div role="status" className="pointer-events-auto flex max-w-md flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-accent bg-surface p-4">
        <p className="text-body flex-1">{toast.message}</p>
        {toast.link && (
          <Link to={toast.link.to} className="text-label text-accent underline">
            {toast.link.label}
          </Link>
        )}
        <button type="button" aria-label="Dismiss" className="text-label text-ink-muted hover:text-ink" onClick={() => setDismissedKey(key)}>
          ✕
        </button>
      </div>
    </div>
  )
}
