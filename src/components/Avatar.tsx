import type { User } from '../data/types'
import { initials } from '../lib/format'

const tones = ['bg-brand text-on-color', 'bg-accent text-on-color', 'bg-highlight text-ink', 'bg-ink text-on-color']

function toneFor(id: string) {
  let hash = 0
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return tones[hash % tones.length]
}

/** Round photo, or initials on a color picked from the roommate's id. */
export function Avatar({ user, size = 'md' }: { user: Pick<User, 'id' | 'name' | 'photo'>; size?: 'sm' | 'md' | 'lg' }) {
  const box = { sm: 'size-8 text-caption', md: 'size-8 text-label', lg: 'size-24 text-title' }[size]
  if (user.photo) {
    return <img src={user.photo} alt="" className={`${box} shrink-0 rounded-pill border border-rule object-cover`} />
  }
  return (
    <span aria-hidden className={`${box} ${toneFor(user.id)} inline-flex shrink-0 items-center justify-center rounded-pill font-sans`}>
      {initials(user.name)}
    </span>
  )
}
