import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  const styles =
    variant === 'primary'
      ? 'bg-brand text-on-color border-brand hover:brightness-95'
      : 'bg-surface text-ink border-rule hover:bg-paper'
  return (
    <button
      className={`text-label font-sans rounded-md border px-4 py-2 transition disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  )
}
