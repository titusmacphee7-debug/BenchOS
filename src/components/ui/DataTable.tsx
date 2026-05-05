import type { KeyboardEvent, ReactNode } from 'react'
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
  function handleRowKeyDown(event: KeyboardEvent<HTMLDivElement>, row: T) {
    if (!onRowClick || event.target !== event.currentTarget) return
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    onRowClick(row)
  }

  return (
    <div className={cn('overflow-hidden rounded-xl border border-bench-border', className)} role="table" aria-rowcount={data.length + 1}>
      <div
        className="table-grid min-h-11 bg-white/[0.04] px-4 text-xs font-semibold uppercase text-bench-muted"
        style={{ gridTemplateColumns: gridTemplate }}
        role="row"
      >
        {columns.map((column) => (
          <div key={column.header} className={column.className} role="columnheader">
            {column.header}
          </div>
        ))}
      </div>
      <div className="divide-y divide-bench-border/70" role="rowgroup">
        {data.map((row) => (
          <div
            key={row.id}
            className={cn(
              'table-grid min-h-16 px-4 text-sm text-bench-text transition hover:bg-white/[0.035]',
              onRowClick && 'cursor-pointer focus:outline-none focus-visible:bg-white/[0.045] focus-visible:ring-2 focus-visible:ring-bench-orange/45',
              selectedId === row.id && 'bg-bench-orange/8 outline outline-1 outline-bench-orange/55',
              rowClassName,
            )}
            style={{ gridTemplateColumns: gridTemplate }}
            role="row"
            tabIndex={onRowClick ? 0 : undefined}
            aria-selected={selectedId ? selectedId === row.id : undefined}
            onClick={() => onRowClick?.(row)}
            onKeyDown={(event) => handleRowKeyDown(event, row)}
          >
            {columns.map((column) => (
              <div key={column.header} className={cn('min-w-0', column.className)} role="cell">
                {column.render(row)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
