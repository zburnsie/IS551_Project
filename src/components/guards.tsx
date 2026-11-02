import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useMatch } from 'react-router-dom'
import { useApp } from '../data/store'

/** Signs a logged-out visitor in to the demo room. RequireRoom re-renders once they're in. */
function EnterDemo() {
  const { enterDemo } = useApp()
  useEffect(() => enterDemo(), [enterDemo])
  return null
}

/** Signed-in pages. Sends everyone else to log in. */
export function RequireAuth() {
  const { me } = useApp()
  const location = useLocation()
  if (!me) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/**
 * Room pages. Sends people who haven't finished onboarding to the next step.
 * Logged-out visitors to /room itself go into the demo room instead of logging in.
 */
export function RequireRoom() {
  const { me, room } = useApp()
  const atRoomHome = useMatch('/room')
  if (!me) return atRoomHome ? <EnterDemo /> : <Navigate to="/login" replace />
  if (!me.name) return <Navigate to="/welcome/profile" replace />
  if (!room) return <Navigate to="/welcome/room" replace />
  return <Outlet />
}

/** Where a signed-in person should land next. */
export function useHomePath() {
  const { me, room } = useApp()
  if (!me) return '/'
  if (!me.name) return '/welcome/profile'
  if (!room) return '/welcome/room'
  return '/room'
}
