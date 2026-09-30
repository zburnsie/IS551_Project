import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

const inputClass = 'text-body bg-surface border border-rule rounded-sm px-2 py-1 text-ink'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-label">{label}</span>
      {children}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputClass} {...props} />
}
