import type { User } from '../data/types'
import { initials } from '../lib/format'

/** Round photo, or initials on the same neutral circle for everyone. */
export function Avatar({ user, size = 'md' }: { user: Pick<User, 'id' | 'name' | 'photo'>; size?: 'sm' | 'md' | 'lg' }) {
  const box = { sm: 'size-8 text-caption', md: 'size-8 text-label', lg: 'size-24 text-title' }[size]
  if (user.photo) {
    return <img src={user.photo} alt="" className={`${box} shrink-0 rounded-pill border border-rule object-cover`} />
  }
  return (
    <span aria-hidden className={`${box} inline-flex shrink-0 border border-rule bg-paper text-ink items-center justify-center rounded-pill font-sans`}>
      {initials(user.name)}
    </span>
  )
}
