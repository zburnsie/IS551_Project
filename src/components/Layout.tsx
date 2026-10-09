import { useEffect, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../data/store'
import { Avatar } from './Avatar'
import { buttonClass } from './Button'
import { SkipToDemo } from './SkipToDemo'
import { useHomePath } from './guards'
import { PrototypeBar } from './PrototypeBar'
import { SetupSteps } from './SetupSteps'

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

export function OnboardingLayout() {
  const { pathname } = useLocation()
  const { logOut } = useApp()
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
        <SetupSteps />
        <Outlet />
        {/* The invite step has its own skip, into the room you just made. */}
        {pathname !== '/welcome/invite' && <SkipToDemo />}
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
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-4 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <Wordmark to="/room" />
              <p className="text-caption text-ink-muted">{room!.name}</p>
            </div>
            <Link to="/settings" className="flex items-center gap-2 rounded-pill border border-rule px-4 py-2 hover:bg-paper transition" aria-label="Profile and room settings">
              <span className="text-label hidden sm:inline">{me!.name}</span>
              <Avatar user={me!} />
            </Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto" aria-label="Main">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                // Stay underlined on sub-pages too, like an area under Chores.
                end={false}
                className={({ isActive }) =>
                  `text-label whitespace-nowrap border-b-2 px-4 py-2 ${isActive ? 'border-ink text-ink' : 'border-transparent text-ink-muted hover:text-ink'}`
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