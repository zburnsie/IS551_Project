const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatMoney(cents: number): string {
  return currency.format(cents / 100)
}

function parseIso(isoDate: string): Date {
  // Parse as a local date so "2026-09-30" doesn't shift a day in US time zones.
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function formatDate(isoDate: string): string {
  return parseIso(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function todayIso(): string {
  return toIso(new Date())
}

export function addDays(isoDate: string, days: number): string {
  const date = parseIso(isoDate)
  date.setDate(date.getDate() + days)
  return toIso(date)
}

export function addMonths(isoDate: string, months: number): string {
  const date = parseIso(isoDate)
  date.setMonth(date.getMonth() + months)
  return toIso(date)
}

/** Days from today until the given date (negative if past). */
export function daysUntil(isoDate: string): number {
  return Math.round((parseIso(isoDate).getTime() - parseIso(todayIso()).getTime()) / 86_400_000)
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'Someone'
}
