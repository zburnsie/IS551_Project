import type { ReactNode } from 'react'

/** Raised block on `surface` with a 1px `rule` border — no drop shadows. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-surface border border-rule rounded-md p-4 ${className}`}>{children}</div>
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-heading">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
