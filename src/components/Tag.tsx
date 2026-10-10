import type { ReactNode } from 'react'

type Tone = 'brand' | 'success' | 'olive' | 'danger' | 'action' | 'neutral'

/**
 * Status tags use light tinted fills + dark text so they never look like primary buttons.
 * - brand: informational (Waiting to confirm, Needs someone)
 * - success: on time / done / settled
 * - olive: completed late
 * - danger: still-open overdue only
 * - action: needs someone (asks for action, not red)
 * - neutral: default due dates, open
 */
const tones: Record<Tone, string> = {
  brand: 'bg-sky text-ink',
  success: 'bg-success text-success-ink',
  olive: 'bg-olive text-olive-ink',
  danger: 'bg-danger-soft text-danger-ink',
  action: 'bg-highlight text-ink border border-ink',
  neutral: 'bg-paper text-ink-muted border border-rule',
}

/**
 * Pill-shaped status tag. Always include words —
 * color alone should never say who owes whom.
 */
export function Tag({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`text-caption inline-flex items-center rounded-pill px-2 py-1 whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  )
}
