import type { ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'

export type DataColumn<T> = {
  header: string
  className?: string
  render: (row: T) => ReactNode
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  gridTemplate,
  selectedId,
  className,
  rowClassName,
  onRowClick,
}: {
  columns: DataColumn<T>[]
  data: T[]
  gridTemplate: string
  selectedId?: string
  className?: string
  rowClassName?: string
  onRowClick?: (row: T) => void
}) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-bench-border', className)}>
      <div
        className="table-grid min-h-11 bg-white/[0.04] px-4 text-xs font-semibold uppercase text-bench-muted"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {columns.map((column) => (
          <div key={column.header} className={column.className}>
            {column.header}
          </div>
        ))}
      </div>
      <div className="divide-y divide-bench-border/70">
        {data.map((row) => (
          <div
            key={row.id}
            className={cn(
              'table-grid min-h-16 px-4 text-sm text-bench-text transition hover:bg-white/[0.035]',
              onRowClick && 'cursor-pointer',
              selectedId === row.id && 'bg-bench-orange/8 outline outline-1 outline-bench-orange/55',
              rowClassName,
            )}
            style={{ gridTemplateColumns: gridTemplate }}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((column) => (
              <div key={column.header} className={cn('min-w-0', column.className)}>
                {column.render(row)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
