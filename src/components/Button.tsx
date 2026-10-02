import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'accent'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-on-color border-brand hover:brightness-95',
  accent: 'bg-accent text-on-color border-accent hover:brightness-95',
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
