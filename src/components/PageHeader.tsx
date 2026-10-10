import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-label self-start inline-flex items-center gap-2 rounded-md border border-rule bg-surface px-4 py-2 text-ink-muted hover:bg-paper hover:text-ink transition">
      ← {children}
    </Link>
  )
}

export function PageHeader({
  eyebrow,
  title,
  back,
  action,
  children,
}: {
  eyebrow?: string
  title: string
  back?: { to: string; label: string }
  action?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-2">
      {back && <BackLink to={back.to}>{back.label}</BackLink>}
      {eyebrow && <p className="text-caption text-ink-muted">{eyebrow}</p>}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-title">{title}</h1>
        {action}
      </div>
      {children && <div className="text-body text-ink-muted">{children}</div>}
    </header>
  )
}

/** Shows a one-time message passed through navigation state, e.g. "Maya was notified." */
export function Flash() {
  const { state } = useLocation()
  const message = (state as { flash?: string } | null)?.flash
  if (!message) return null
  return (
    <p role="status" className="text-body rounded-md border border-accent bg-surface p-4">
      {message}
    </p>
  )
}

export function EmptyState({ title, children, className = '' }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col items-start gap-2 rounded-md border border-dashed border-rule p-8 ${className}`}>
      <p className="text-heading">{title}</p>
      {children}
    </div>
  )
}