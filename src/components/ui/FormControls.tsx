import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-bench-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-bench-red">{error}</span>}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-lg border border-bench-border bg-white/[0.035] px-3 text-sm text-bench-text outline-none placeholder:text-bench-muted focus:border-bench-orange/70 ${props.className ?? ''}`}
    />
  )
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-24 w-full rounded-lg border border-bench-border bg-white/[0.035] px-3 py-2 text-sm text-bench-text outline-none placeholder:text-bench-muted focus:border-bench-orange/70 ${props.className ?? ''}`}
    />
  )
}

export function SelectInput({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-11 w-full rounded-lg border border-bench-border bg-bench-bg px-3 text-sm text-bench-text outline-none focus:border-bench-orange/70 ${props.className ?? ''}`}
    >
      {children}
    </select>
  )
}
