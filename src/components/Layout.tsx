import { NavLink, Outlet } from 'react-router-dom'
import { useHousehold } from '../data/household'

const links = [
  { to: '/', label: 'Balances' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/chores', label: 'Chores' },
]

export function Layout() {
  const { household } = useHousehold()
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-3xl flex-wrap items-end justify-between gap-4 px-4 py-4 md:px-8">
          <div>
            {/* No logo yet — the name is set in `title` type until one exists. */}
            <p className="text-title font-display">Common Room</p>
            <p className="text-caption text-ink-muted">{household.name}</p>
          </div>
          <nav className="flex gap-2" aria-label="Main">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  `text-label rounded-md px-4 py-2 ${isActive ? 'bg-ink text-on-color' : 'text-ink-muted hover:text-ink'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
        <Outlet />
      </main>
    </div>
  )
}
