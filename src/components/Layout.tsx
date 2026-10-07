import { useEffect, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../data/store'
import { Avatar } from './Avatar'
import { buttonClass } from './Button'
import { useHomePath } from './guards'
import { PrototypeBar } from './PrototypeBar'

/** No logo yet — the name is set in `title` type until one exists. */
function Wordmark({ to }: { to: string }) {
  return (
    <Link to={to} className="text-title font-display">
      Common Room
    </Link>
  )
}

function Shell({ header, children }: { header: ReactNode; children: ReactNode }) {
  const { pathname } = useLocation()
  // Start each new screen at the top, like a fresh page load.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="border-b border-rule bg-surface">{header}</header>
      <div className="flex-1">{children}</div>
      <PrototypeBar />
    </div>
  )
}

export function PublicLayout() {
  const { me } = useApp()
  const home = useHomePath()
  const { pathname } = useLocation()
  return (
    <Shell
      header={
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Wordmark to="/" />
          <nav className="flex gap-2" aria-label="Account">
            {me ? (
              <Link to={home} className={buttonClass('primary')}>Open your room</Link>
            ) : (
              <>
                {pathname !== '/login' && <Link to="/login" className={buttonClass('secondary')}>Log in</Link>}
                {pathname !== '/signup' && <Link to="/signup" className={buttonClass('primary')}>Sign up</Link>}
              </>
            )}
          </nav>
        </div>
      }
    >
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
        <Outlet />
      </main>
    </Shell>
  )
}

const steps = [
  { path: '/welcome/profile', label: 'Profile' },
  { path: '/welcome/room', label: 'Room' },
  { path: '/welcome/invite', label: 'Invite' },
]

export function OnboardingLayout() {
  const { pathname } = useLocation()
  const { logOut } = useApp()
  const current = Math.max(0, steps.findIndex((s) => pathname.startsWith(s.path) || (s.path === '/welcome/room' && pathname === '/welcome/join')))
  return (
    <Shell
      header={
        <div className="mx-auto flex max-w-xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Wordmark to="/" />
          <button className="text-label text-ink-muted hover:text-ink" onClick={logOut}>Log out</button>
        </div>
      }
    >
      <main className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-8">
        <ol className="flex gap-2" aria-label="Setup steps">
          {steps.map((s, i) => (
            <li key={s.path} className="flex flex-1 flex-col gap-1" aria-current={i === current ? 'step' : undefined}>
              <span className={`h-1 rounded-pill ${i <= current ? 'bg-brand' : 'bg-rule'}`} />
              <span className={`text-caption ${i === current ? 'text-ink' : 'text-ink-muted'}`}>
                {i + 1}. {s.label}
              </span>
            </li>
          ))}
        </ol>
        <Outlet />
      </main>
    </Shell>
  )
}

export function AppLayout() {
  const { me, room, state } = useApp()
  const unread = state.activity.filter((a) => a.notify.includes(me!.id) && !a.readBy.includes(me!.id)).length
  const links = [
    { to: '/room', label: 'Home' },
    { to: '/chores', label: 'Chores' },
    { to: '/money', label: 'Money' },
    { to: '/inbox', label: unread ? `Inbox (${unread})` : 'Inbox' },
  ]
  return (
    <Shell
      header={
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <Wordmark to="/room" />
              <p className="text-caption text-ink-muted">{room!.name}</p>
            </div>
            <Link to="/settings" className="flex items-center gap-2 rounded-md border border-rule px-4 py-2 hover:bg-paper transition" aria-label="Profile and room settings">
              <span className="text-label hidden sm:inline">{me!.name}</span>
              <Avatar user={me!} />
            </Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto" aria-label="Main">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-label whitespace-nowrap rounded-md px-4 py-2 ${isActive ? 'bg-accent text-on-color' : 'text-ink-muted hover:text-ink'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      }
    >
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
        <Outlet />
      </main>
    </Shell>
  )
}
