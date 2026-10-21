import { useSyncExternalStore } from 'react'

/**
 * Feature flags for work that isn't on for everyone yet. Each defaults to its
 * `VITE_FLAG_<NAME>` env var (e.g. `VITE_FLAG_HOME_VIEWS=true npm run dev`), and
 * can be flipped in this browser from the prototype bar.
 */
export const flags = {
  homeViews: {
    env: import.meta.env.VITE_FLAG_HOME_VIEWS,
    label: 'Personal / shared home',
    description: 'A toggle on the room home between your chores and IOUs, and the room’s activity and upcoming chores.',
  },
}

export type Flag = keyof typeof flags

const STORAGE_KEY = 'common-room:flags'
const listeners = new Set<() => void>()

function readOverrides(): Partial<Record<Flag, boolean>> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

let overrides = readOverrides()

export function isFlagOn(flag: Flag): boolean {
  return overrides[flag] ?? flags[flag].env === 'true'
}

export function setFlag(flag: Flag, on: boolean) {
  overrides = { ...overrides, [flag]: on }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch {
    // Storage may be unavailable (private mode); the flag still applies until reload.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useFlag(flag: Flag): boolean {
  return useSyncExternalStore(subscribe, () => isFlagOn(flag))
}
