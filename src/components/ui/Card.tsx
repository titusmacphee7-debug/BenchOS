import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  padded?: boolean
}

export function Card({ children, className, padded = true, ...props }: CardProps) {
  return (
    <section className={cn('panel-surface rounded-xl shadow-panel', padded && 'p-5', className)} {...props}>
      {children}
    </section>
  )
}

export function CardTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-lg font-semibold text-bench-text">{title}</h2>
      {action}
    </div>
  )
}
