import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const inputClass = 'text-body bg-surface border border-rule rounded-sm px-2 py-1 text-ink'

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-label">{label}</span>
      {children}
      {hint && <span className="text-body text-ink-muted">{hint}</span>}
    </label>
  )
}

export function TextInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={inputClass} rows={3} {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputClass} {...props} />
}

/** A bordered row with a radio or checkbox, for picking one of a few options. */
export function ChoiceRow({ children, ...props }: InputHTMLAttributes<HTMLInputElement> & { children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-md border border-rule bg-surface p-4 has-[:checked]:border-ink">
      <input className="size-4 accent-accent" {...props} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">{children}</span>
    </label>
  )
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-body rounded-sm border border-danger bg-surface px-2 py-1 text-danger">
      {children}
    </p>
  )
}
