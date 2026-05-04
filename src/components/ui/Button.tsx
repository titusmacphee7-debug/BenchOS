import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'border-bench-orange bg-bench-orange text-white shadow-glow hover:bg-orange-500',
  secondary: 'border-bench-border bg-white/5 text-bench-text hover:border-bench-orange/60 hover:bg-white/8',
  ghost: 'border-transparent bg-transparent text-bench-muted hover:bg-white/6 hover:text-bench-text',
  outline: 'border-bench-orange/40 bg-bench-orange/5 text-bench-orange hover:bg-bench-orange/10',
  danger: 'border-bench-red/40 bg-bench-red/10 text-bench-red hover:bg-bench-red/15',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
  icon: 'h-11 w-11 p-0',
}

export function Button({ className, variant = 'secondary', size = 'md', icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition focus:outline-none focus:ring-2 focus:ring-bench-orange/50 disabled:cursor-not-allowed disabled:opacity-50',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
