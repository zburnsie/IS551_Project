const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatMoney(cents: number): string {
  return currency.format(cents / 100)
}

export function formatDate(isoDate: string): string {
  // Parse as a local date so "2026-09-30" doesn't shift a day in US time zones.
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function todayIso(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Days from today until the given date (negative if past). */
export function daysUntil(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number)
  const due = new Date(y, m - 1, d)
  const [ty, tm, td] = todayIso().split('-').map(Number)
  const today = new Date(ty, tm - 1, td)
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
}
