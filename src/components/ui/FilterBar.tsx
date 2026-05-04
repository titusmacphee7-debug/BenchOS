import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'
import { Button } from './Button'

export type FilterOption = {
  label: string
  value?: string
  options?: string[]
  onChange?: (value: string) => void
}

export function FilterBar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters,
  actions,
  className,
}: {
  searchPlaceholder: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters: FilterOption[]
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-end gap-3', className)}>
      <label className="relative min-w-64 flex-1">
        <span className="sr-only">{searchPlaceholder}</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-bench-muted" size={18} />
        <input
          className="h-12 w-full rounded-lg border border-bench-border bg-white/[0.035] pl-11 pr-4 text-sm text-bench-text outline-none transition placeholder:text-bench-muted focus:border-bench-orange/70"
          placeholder={searchPlaceholder}
          value={searchValue ?? ''}
          onChange={(event) => onSearchChange?.(event.target.value)}
          readOnly={!onSearchChange}
        />
      </label>
      {filters.map((filter) => (
        <label key={filter.label} className="min-w-36">
          <span className="mb-1 block text-xs font-medium text-bench-muted">{filter.label}</span>
          <select
            className="h-11 w-full rounded-lg border border-bench-border bg-bench-bg px-3 text-sm text-bench-text outline-none focus:border-bench-orange/70"
            value={filter.value ?? 'All'}
            onChange={(event) => filter.onChange?.(event.target.value)}
          >
            {(filter.options ?? ['All']).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      ))}
      {actions ?? <Button>Clear Filters</Button>}
    </div>
  )
}
