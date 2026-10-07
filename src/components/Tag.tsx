import type { ReactNode } from 'react'

type Tone = 'brand' | 'accent' | 'neutral'

const tones: Record<Tone, string> = {
  brand: 'bg-brand text-on-color',
  accent: 'bg-accent text-on-color',
  neutral: 'bg-paper text-ink-muted border border-rule',
}

/**
 * Pill-shaped status tag or roommate chip. Always include words —
 * color alone should never say who owes whom.
 */
export function Tag({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`text-caption inline-flex items-center rounded-pill px-2 py-1 whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  )
}
