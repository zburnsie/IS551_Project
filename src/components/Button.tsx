import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'accent' | 'confirm' | 'highlight' | 'danger'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-ink border-accent-edge hover:brightness-95',
  accent: 'bg-accent text-ink border-accent-edge hover:brightness-95',
  confirm: 'bg-positive text-on-color border-positive hover:brightness-95',
  highlight: 'bg-highlight text-ink border-highlight hover:brightness-95',
  danger: 'bg-danger text-on-color border-danger hover:brightness-95',
  secondary: 'bg-surface text-ink border-rule hover:bg-paper',
}

export function buttonClass(variant: Variant = 'primary', className = '') {
  return `text-label font-sans inline-flex items-center justify-center rounded-md border px-4 py-2 text-center transition disabled:opacity-50 ${variants[variant]} ${className}`
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return <button className={buttonClass(variant, className)} {...props} />
}

/** A link that looks like a button, for navigation actions. */
export function ButtonLink({ variant = 'primary', className = '', ...props }: LinkProps & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />
}