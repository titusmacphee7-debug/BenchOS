import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: string
  description: string
  icon?: LucideIcon
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-bench-text lg:text-4xl">{title}</h1>
          {Icon && <Icon className="text-bench-muted" size={28} />}
        </div>
        <p className="mt-2 max-w-2xl text-sm text-bench-muted lg:text-base">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  )
}
