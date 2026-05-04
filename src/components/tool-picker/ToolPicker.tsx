import { Plus, Search, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useActiveUserTools, useToolLibraryData } from '../../data/hooks'
import type { ToolLibraryItem, UserTool } from '../../data/schema'
import { searchToolLibrary } from '../../lib/search/toolSearch'
import { Button } from '../ui/Button'
import { Card, CardTitle } from '../ui/Card'
import { IconTile } from '../ui/IconTile'
import { StatusPill } from '../ui/StatusPill'

export function ToolPicker({
  mode = 'Add to My Tools',
  onSelectToolType,
  onSelectOwnedTool,
  ownedOnly = false,
  selectedToolTypeId,
}: {
  mode?: string
  onSelectToolType?: (tool: ToolLibraryItem) => void
  onSelectOwnedTool?: (tool: UserTool) => void
  ownedOnly?: boolean
  selectedToolTypeId?: string
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const { items } = useToolLibraryData()
  const ownedTools = useActiveUserTools()
  const categories = useMemo(() => ['All', ...new Set(items.map((item) => item.category))].sort(), [items])
  const toolResults = useMemo(() => searchToolLibrary(items, query, { category }).slice(0, 8), [category, items, query])
  const ownedResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return ownedTools
      .filter((tool) => {
        if (!normalizedQuery) return true
        return [tool.name, tool.type, tool.brand, tool.model, tool.category].join(' ').toLowerCase().includes(normalizedQuery)
      })
      .slice(0, 8)
  }, [ownedTools, query])
  const results = ownedOnly ? ownedResults : toolResults

  return (
    <Card>
      <CardTitle title="Tool Picker" action={<StatusPill label={mode} tone="orange" />} />
      <label className="relative block">
        <span className="sr-only">Search library</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-bench-muted" size={18} />
        <input
          className="h-12 w-full rounded-lg border border-bench-border bg-white/[0.035] pl-11 pr-4 text-sm outline-none placeholder:text-bench-muted focus:border-bench-orange/70"
          placeholder="Search circular saw, cut plywood, drill holes..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {!ownedOnly && (
        <select
          className="mt-3 h-11 w-full rounded-lg border border-bench-border bg-bench-bg px-3 text-sm text-bench-text outline-none focus:border-bench-orange/70"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((categoryOption) => (
            <option key={categoryOption}>{categoryOption}</option>
          ))}
        </select>
      )}
      <div className="mt-4 grid gap-3">
        {results.length === 0 && <p className="rounded-lg border border-bench-border bg-white/[0.025] p-4 text-sm text-bench-muted">No matching tools found.</p>}
        {ownedOnly
          ? ownedResults.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between gap-3 rounded-lg border border-bench-border bg-white/[0.025] p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <IconTile icon={Wrench} size="sm" tone="orange" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-bench-text">{tool.name}</p>
                    <p className="truncate text-xs text-bench-muted">{tool.brand} {tool.model}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" icon={<Plus size={16} />} onClick={() => onSelectOwnedTool?.(tool)}>
                  Select
                </Button>
              </div>
            ))
          : toolResults.map((tool) => (
              <div
                key={tool.id}
                className={`flex items-center justify-between gap-3 rounded-lg border bg-white/[0.025] p-3 ${
                  selectedToolTypeId === tool.id ? 'border-bench-orange/60' : 'border-bench-border'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <IconTile icon={Wrench} size="sm" tone="orange" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-bench-text">{tool.name}</p>
                    <p className="truncate text-xs text-bench-muted">{tool.capabilities.slice(0, 2).map((capability) => capability.name).join(', ')}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" icon={<Plus size={16} />} onClick={() => onSelectToolType?.(tool)}>
                  Select
                </Button>
              </div>
            ))}
      </div>
    </Card>
  )
}
