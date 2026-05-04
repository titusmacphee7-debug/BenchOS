import type { ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'

export function DetailPanel({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <aside className={cn('panel-surface h-fit rounded-xl p-5 shadow-panel', className)}>
      <div className="mb-5 flex items-center justify-between border-b border-bench-border pb-4">
        <h2 className="text-base font-semibold text-bench-text">{title}</h2>
      </div>
      {children}
    </aside>
  )
}
