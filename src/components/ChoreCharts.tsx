import { useState } from 'react'
import type { User, UserId } from '../data/types'
import { Avatar } from './Avatar'

/**
 * Chart colors: steps of the brand's olive and mustard with enough color for
 * small marks, checked to stay apart for color-blind readers. Mustard is light
 * on `surface`, so every bar also carries its number and a legend.
 */
const chart = {
  onTime: '#4A7328',
  late: '#D19A2A',
  /** Lighter step of olive for the empty part of a meter. */
  track: '#DCE5D0',
}

const BAR = 20 // px, bar thickness

/** How much of the house's chores are done: done in the period vs still waiting. */
export function HouseProgress({ done, toDo, overdue, period }: { done: number; toDo: number; overdue: number; period: string }) {
  const total = done + toDo
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="flex flex-col gap-2 rounded-md border border-rule bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-body">
          <span className="text-heading">{done}</span> done{' '}
          <span className="text-ink-muted">· {toDo} still to do{overdue > 0 && `, ${overdue} overdue`}</span>
        </p>
        <span className="text-caption text-ink-muted">{period}</span>
      </div>
      <div
        role="meter"
        aria-label="Chores done"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={`${done} done, ${toDo} still to do`}
        className="flex w-full overflow-hidden rounded-sm"
        style={{ height: 12, background: chart.track }}
      >
        <div style={{ width: `${pct}%`, background: chart.onTime }} />
      </div>
    </div>
  )
}

type Row = { user: User; label: string; onTime: number; late: number }
type Hover = { userId: UserId; kind: 'onTime' | 'late' } | null

/** Chores done per roommate, split into on time and late. The selected roommate stays bright; others fade. */
export function DoneByRoommateChart({ rows, selected }: { rows: Row[]; selected: UserId | '' }) {
  const [hover, setHover] = useState<Hover>(null)
  const max = Math.max(1, ...rows.map((r) => r.onTime + r.late))
  const series = [
    { key: 'onTime' as const, label: 'On time', color: chart.onTime },
    { key: 'late' as const, label: 'Late', color: chart.late },
  ]

  return (
    <figure className="flex flex-col gap-4 rounded-md border border-rule bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <figcaption className="text-label">Chores done by each roommate</figcaption>
        <ul className="flex gap-4" aria-label="Legend">
          {series.map((s) => (
            <li key={s.key} className="text-caption flex items-center gap-1 text-ink-muted">
              <span className="inline-block size-2 rounded-sm" style={{ background: s.color }} aria-hidden />
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      <ul className="flex flex-col gap-2">
        {rows.map((r) => {
          const total = r.onTime + r.late
          const faded = selected !== '' && selected !== r.user.id
          return (
            <li key={r.user.id} className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[8rem_minmax(0,1fr)]" style={{ opacity: faded ? 0.35 : 1 }}>
              <span className="text-label flex min-w-0 items-center gap-2">
                <Avatar user={r.user} size="sm" />
                <span className="truncate">{r.label}</span>
              </span>
              <span className="relative flex items-center gap-2">
                {/* Segments sit on the baseline with a 2px surface gap; the far end is rounded. */}
                <span className="flex gap-[2px]" style={{ width: `${(total / max) * 85}%`, height: BAR }}>
                  {series.map((s) => {
                    const n = r[s.key]
                    if (n === 0) return null
                    const last = s.key === 'late' || r.late === 0
                    const active = hover?.userId === r.user.id && hover.kind === s.key
                    return (
                      <span
                        key={s.key}
                        tabIndex={0}
                        aria-label={`${r.label}: ${n} ${s.label.toLowerCase()}`}
                        onPointerEnter={() => setHover({ userId: r.user.id, kind: s.key })}
                        onPointerLeave={() => setHover(null)}
                        onFocus={() => setHover({ userId: r.user.id, kind: s.key })}
                        onBlur={() => setHover(null)}
                        className="relative outline-offset-2"
                        style={{
                          flexGrow: n,
                          flexBasis: 0,
                          background: s.color,
                          borderRadius: last ? '0 4px 4px 0' : 0,
                          filter: active ? 'brightness(1.12)' : undefined,
                        }}
                      >
                        {active && (
                          <span role="tooltip" className="absolute bottom-full left-1/2 z-10 mb-1 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-sm border border-ink-muted bg-surface px-2 py-1 text-ink">
                            <span className="text-amount">{n}</span>
                            <span className="text-caption flex items-center gap-1 text-ink-muted">
                              <span className="inline-block h-[2px] w-2" style={{ background: s.color }} aria-hidden />
                              {s.label}
                            </span>
                          </span>
                        )}
                      </span>
                    )
                  })}
                </span>
                <span className="text-amount text-ink">{total}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </figure>
  )
}
