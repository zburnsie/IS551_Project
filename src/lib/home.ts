import type { HomeLayout, HomeView, HomeWidget } from '../data/types'

export const homeWidgets: Record<HomeWidget, { label: string; description: string }> = {
  chores: { label: 'Your chores', description: 'What’s assigned to you and when it’s due' },
  money: { label: 'Money', description: 'What you owe or are owed, and IOUs waiting on you' },
  activity: { label: 'Room activity', description: 'Chores done and assigned around the room' },
  upcoming: { label: 'Upcoming chores', description: 'What’s due next around the room, and whose turn it is' },
}

export const allWidgets = Object.keys(homeWidgets) as HomeWidget[]

export const defaultHomeLayout: HomeLayout = { featured: 'chores', order: ['money', 'activity', 'upcoming'], hidden: ['upcoming'] }

/** With the personal / shared flag on, each view has its own widgets and layout. */
export const homeViews: Record<HomeView, { label: string; widgets: HomeWidget[]; defaultLayout: HomeLayout }> = {
  personal: { label: 'Personal', widgets: ['chores', 'money'], defaultLayout: { featured: 'chores', order: ['money'], hidden: [] } },
  shared: { label: 'Shared', widgets: ['upcoming', 'activity'], defaultLayout: { featured: 'upcoming', order: ['activity'], hidden: [] } },
}

/**
 * Fills in a saved layout so each of `widgets` has a place: the featured one is
 * never hidden or repeated, and widgets added since it was saved go at the end.
 */
export function normalizeHomeLayout(
  saved: HomeLayout | undefined,
  widgets: HomeWidget[] = allWidgets,
  fallback: HomeLayout = defaultHomeLayout,
): HomeLayout {
  if (!saved || !widgets.includes(saved.featured)) return fallback
  const order = saved.order.filter((w, i) => widgets.includes(w) && w !== saved.featured && saved.order.indexOf(w) === i)
  for (const w of widgets) if (w !== saved.featured && !order.includes(w)) order.push(w)
  return { featured: saved.featured, order, hidden: saved.hidden.filter((w) => order.includes(w)) }
}

/** Makes a widget the big one. The old featured widget takes its place in the order. */
export function featureWidget(layout: HomeLayout, widget: HomeWidget): HomeLayout {
  if (widget === layout.featured) return layout
  return {
    featured: widget,
    order: layout.order.map((w) => (w === widget ? layout.featured : w)),
    hidden: layout.hidden.filter((w) => w !== widget),
  }
}

/** Moves a widget one place up (-1) or down (1) under the featured one. */
export function moveWidget(layout: HomeLayout, widget: HomeWidget, by: -1 | 1): HomeLayout {
  const from = layout.order.indexOf(widget)
  const to = from + by
  if (from < 0 || to < 0 || to >= layout.order.length) return layout
  const order = [...layout.order]
  ;[order[from], order[to]] = [order[to], order[from]]
  return { ...layout, order }
}

export function toggleWidget(layout: HomeLayout, widget: HomeWidget): HomeLayout {
  const hidden = layout.hidden.includes(widget) ? layout.hidden.filter((w) => w !== widget) : [...layout.hidden, widget]
  return { ...layout, hidden }
}
