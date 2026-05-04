import { BookOpen, Heart, Layers3, Plus, Search, ShieldCheck, Wrench, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AddToolFormModal } from '../../components/tool-picker/AddToolFormModal'
import { ToolIconTile } from '../../components/tool-picker/ToolIconTile'
import { toolCategoryTone } from '../../components/tool-picker/toolIconRules'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { SelectInput } from '../../components/ui/FormControls'
import { Modal } from '../../components/ui/Modal'
import { StatusPill } from '../../components/ui/StatusPill'
import {
  createProjectRequirement,
  createUserTool,
  createWishlistItem,
  userToolDefaultsFromLibrary,
} from '../../data/actions'
import { useActiveProjects, useToolBuyingPreferences, useToolCatalogData } from '../../data/hooks'
import type { Project, SkillLevel, ToolCatalogLibraryItem } from '../../data/schema'
import { skillLevels } from '../../data/schema'
import { sortCatalogForPreferences } from '../../lib/preferences/accountPersonalization'
import { searchToolCatalog } from '../../lib/search/toolSearch'

const TOOL_CARD_HEIGHT = 250
const TOOL_CARD_GAP = 16
const TOOL_CARD_OVERSCAN_ROWS = 16

export function ToolLibraryPage() {
  const navigate = useNavigate()
  const { items } = useToolCatalogData()
  const projects = useActiveProjects()
  const preferences = useToolBuyingPreferences()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [skillLevel, setSkillLevel] = useState('All')
  const [selectedId, setSelectedId] = useState<string>()
  const [highlightedId, setHighlightedId] = useState<string>()
  const [customToolOpen, setCustomToolOpen] = useState(false)
  const [expandedTool, setExpandedTool] = useState<ToolCatalogLibraryItem>()
  const [projectRequirementTool, setProjectRequirementTool] = useState<ToolCatalogLibraryItem>()
  const [projectRequirementProjectId, setProjectRequirementProjectId] = useState('')
  const [notice, setNotice] = useState<{ id: number; message: string; tone: 'green' | 'yellow' }>()
  const [viewport, setViewport] = useState({ width: 0, height: 0, scrollTop: 0 })
  const resultsViewportRef = useRef<HTMLDivElement>(null)
  const scrollFrame = useRef<number | undefined>(undefined)
  const noticeTimeout = useRef<number | undefined>(undefined)
  const highlightTimeout = useRef<number | undefined>(undefined)
  const noticeId = useRef(0)
  const categories = useMemo(() => ['All', ...new Set(items.map((tool) => tool.toolType.category))].sort(), [items])
  const filteredTools = useMemo(() => {
    const searchResults = searchToolCatalog(items, query, { category, skillLevel })
    return query.trim() ? searchResults : sortCatalogForPreferences(searchResults, preferences)
  }, [category, items, preferences, query, skillLevel])
  const columnCount = getToolLibraryColumnCount(viewport.width)
  const rowStride = TOOL_CARD_HEIGHT + TOOL_CARD_GAP
  const rowCount = Math.ceil(filteredTools.length / columnCount)
  const { startRow, endRow } = getBufferedToolRows(viewport.scrollTop, viewport.height, rowCount, rowStride)
  const visibleStartIndex = startRow * columnCount
  const visibleEndIndex = Math.min(filteredTools.length, Math.max(endRow, startRow + 1) * columnCount)
  const visibleTools = filteredTools.slice(visibleStartIndex, visibleEndIndex)
  const topSpacerHeight = startRow * rowStride
  const bottomSpacerHeight = Math.max(0, (rowCount - endRow) * rowStride - TOOL_CARD_GAP)

  useEffect(() => {
    return () => {
      if (noticeTimeout.current) window.clearTimeout(noticeTimeout.current)
      if (highlightTimeout.current) window.clearTimeout(highlightTimeout.current)
      if (scrollFrame.current) window.cancelAnimationFrame(scrollFrame.current)
    }
  }, [])

  useEffect(() => {
    const node = resultsViewportRef.current
    if (!node) return

    const observer = new ResizeObserver(([entry]) => {
      setViewport((current) => {
        const width = entry.contentRect.width
        const height = entry.contentRect.height
        if (current.width === width && current.height === height) return current
        return { ...current, width, height }
      })
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  function showNotice(message: string, tone: 'green' | 'yellow' = 'green') {
    noticeId.current += 1
    const id = noticeId.current
    if (noticeTimeout.current) window.clearTimeout(noticeTimeout.current)
    setNotice({ id, message, tone })
    noticeTimeout.current = window.setTimeout(() => {
      setNotice((current) => current?.id === id ? undefined : current)
    }, 3000)
  }

  function selectTool(toolId: string) {
    setSelectedId(toolId)
    setHighlightedId(toolId)
    if (highlightTimeout.current) window.clearTimeout(highlightTimeout.current)
    highlightTimeout.current = window.setTimeout(() => {
      setHighlightedId((current) => current === toolId ? undefined : current)
    }, 5000)
  }

  function resetResultsScroll() {
    if (resultsViewportRef.current) resultsViewportRef.current.scrollTop = 0
    setViewport((current) => current.scrollTop === 0 ? current : { ...current, scrollTop: 0 })
  }

  function handleResultsScroll(event: UIEvent<HTMLDivElement>) {
    const nextScrollTop = event.currentTarget.scrollTop
    const nextRows = getBufferedToolRows(nextScrollTop, viewport.height, rowCount, rowStride)
    if (nextRows.startRow === startRow && nextRows.endRow === endRow) return

    if (scrollFrame.current) window.cancelAnimationFrame(scrollFrame.current)
    scrollFrame.current = window.requestAnimationFrame(() => {
      setViewport((current) => {
        const currentRows = getBufferedToolRows(current.scrollTop, current.height, rowCount, rowStride)
        if (currentRows.startRow === nextRows.startRow && currentRows.endRow === nextRows.endRow) return current
        return { ...current, scrollTop: nextScrollTop }
      })
    })
  }

  async function handleAddToMyTools(tool: ToolCatalogLibraryItem) {
    const defaults = userToolDefaultsFromLibrary(tool)
    await createUserTool({
      ...defaults,
      storageLocation: defaults.storageLocation || 'Unassigned',
      notes: defaults.notes || 'Added from Tool Library.',
    })
    showNotice(`Successfully added ${tool.displayName} to your tools.`)
  }

  async function handleAddToWishlist(tool: ToolCatalogLibraryItem) {
    await createWishlistItem({
      itemType: 'Tool',
      name: tool.displayName,
      status: 'Not Purchased',
      priority: 'Medium',
      toolTypeId: tool.internalToolTypeId,
      catalogItemId: tool.id,
      addedFor: 'Tool Library',
      notes: `Added from Tool Library. Category: ${tool.toolType.category}.`,
    })
    showNotice(`Successfully added ${tool.displayName} to your wishlist.`)
  }

  function openProjectRequirementModal(tool: ToolCatalogLibraryItem) {
    if (projects.length === 0) {
      showNotice('Create a project before adding tool requirements.', 'yellow')
      return
    }
    setProjectRequirementProjectId(projects[0].id)
    setProjectRequirementTool(tool)
  }

  async function handleAddProjectRequirement() {
    if (!projectRequirementTool || !projectRequirementProjectId) return
    const project = projects.find((item) => item.id === projectRequirementProjectId)
    if (!project) return
    await createProjectRequirement(project.id, {
      requirementKind: 'ToolType',
      displayName: projectRequirementTool.toolType.name,
      required: true,
      toolTypeId: projectRequirementTool.internalToolTypeId,
      category: projectRequirementTool.toolType.category,
      notes: `Added from Tool Library catalog item: ${projectRequirementTool.displayName}.`,
    })
    setProjectRequirementTool(undefined)
    showNotice(`Added ${projectRequirementTool.toolType.name} as a requirement for ${project.name}.`)
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-h-[560px] flex-col overflow-hidden">
      {notice && (
        <div
          className={`fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-panel backdrop-blur ${
            notice.tone === 'green'
              ? 'border-bench-green/40 bg-bench-green/15 text-bench-green'
              : 'border-bench-yellow/40 bg-bench-yellow/15 text-bench-yellow'
          }`}
          role="status"
        >
          {notice.message}
        </div>
      )}

      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-bench-text">Tool Library</h1>
            <Wrench className="text-bench-muted" size={22} />
          </div>
          <p className="mt-1 text-xs text-bench-muted sm:text-sm">Brand/model catalog search. Filters stay put while the catalog cards scroll.</p>
        </div>
        <Button size="sm" variant="outline" icon={<Plus size={15} />} onClick={() => setCustomToolOpen(true)}>
          Add Custom Tool
        </Button>
      </div>

      <Card className="mb-3 p-3">
        <div className="grid gap-2 xl:grid-cols-[1fr_180px_180px]">
          <label className="relative block">
            <span className="sr-only">Search tool library</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bench-muted" size={16} />
            <input
              className="h-10 w-full rounded-lg border border-bench-border bg-white/[0.035] pl-9 pr-3 text-sm text-bench-text outline-none placeholder:text-bench-muted focus:border-bench-orange/70"
              placeholder="Search dewalt drill, cut plywood, sink repair..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                resetResultsScroll()
              }}
            />
          </label>
          <SelectInput
            value={category}
            onChange={(event) => {
              setCategory(event.target.value)
              resetResultsScroll()
            }}
            className="h-10 rounded-lg text-sm"
          >
            {categories.map((categoryOption) => <option key={categoryOption}>{categoryOption}</option>)}
          </SelectInput>
          <SelectInput
            value={skillLevel}
            onChange={(event) => {
              setSkillLevel(event.target.value)
              resetResultsScroll()
            }}
            className="h-10 rounded-lg text-sm"
          >
            {['All', ...skillLevels].map((level) => <option key={level}>{level}</option>)}
          </SelectInput>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-bench-muted">
          <span>{filteredTools.length} matching catalog tools</span>
          <span>{items.length} catalog records</span>
        </div>
      </Card>

      <Card className="min-h-0 flex-1 overflow-hidden p-0">
        <div
          ref={resultsViewportRef}
          className="custom-scrollbar h-full overflow-auto p-3"
          onScroll={handleResultsScroll}
        >
          {topSpacerHeight > 0 && <div aria-hidden="true" style={{ height: topSpacerHeight }} />}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visibleTools.map((tool) => (
              <CompactToolCard
                key={tool.id}
                tool={tool}
                active={selectedId === tool.id}
                selected={highlightedId === tool.id}
                onSelect={() => selectTool(tool.id)}
                onOpen={() => setExpandedTool(tool)}
                onAddToMyTools={() => void handleAddToMyTools(tool)}
                onAddToWishlist={() => void handleAddToWishlist(tool)}
              />
            ))}
          </div>
          {bottomSpacerHeight > 0 && <div aria-hidden="true" style={{ height: bottomSpacerHeight }} />}
        </div>
      </Card>

      {filteredTools.length === 0 && (
        <Card className="mt-3 border-dashed border-bench-orange/45 bg-bench-orange/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-bench-text">No matching catalog tool.</h2>
              <p className="mt-1 text-xs text-bench-muted">Add a custom tool and BenchOS can still map it internally later.</p>
            </div>
            <Button size="sm" variant="outline" icon={<Plus size={15} />} onClick={() => setCustomToolOpen(true)}>
              Add Custom Tool
            </Button>
          </div>
        </Card>
      )}

      <AddToolFormModal
        open={customToolOpen}
        onClose={() => setCustomToolOpen(false)}
        onSaved={(toolName) => showNotice(`Successfully added custom tool ${toolName} to your tools.`)}
      />
      <ToolDetailModal
        tool={expandedTool}
        onClose={() => setExpandedTool(undefined)}
        onAddToMyTools={(tool) => void handleAddToMyTools(tool)}
        onAddToWishlist={(tool) => void handleAddToWishlist(tool)}
        onAddToProject={openProjectRequirementModal}
        onOpenGuide={(tool) => navigate(`/tool-guides/${tool.internalToolTypeId}`)}
      />
      <ProjectRequirementQuickModal
        tool={projectRequirementTool}
        projects={projects}
        selectedProjectId={projectRequirementProjectId}
        onProjectChange={setProjectRequirementProjectId}
        onClose={() => setProjectRequirementTool(undefined)}
        onSubmit={() => void handleAddProjectRequirement()}
      />
    </div>
  )
}

function CompactToolCard({
  tool,
  active,
  selected,
  onSelect,
  onOpen,
  onAddToMyTools,
  onAddToWishlist,
}: {
  tool: ToolCatalogLibraryItem
  active: boolean
  selected: boolean
  onSelect: () => void
  onOpen: () => void
  onAddToMyTools: () => void
  onAddToWishlist: () => void
}) {
  const capabilities = tool.capabilities.slice(0, 3).map((capability) => capability.name).join(', ')

  return (
    <Card
      className={`h-[250px] cursor-pointer overflow-hidden p-4 ring-1 ring-white/[0.03] transition hover:-translate-y-0.5 hover:border-bench-orange/45 hover:bg-white/[0.035] hover:shadow-[0_12px_30px_rgba(0,0,0,.22)] ${
        selected
          ? 'border-bench-orange bg-bench-orange/5 ring-2 ring-bench-orange/55 shadow-[0_0_0_1px_rgba(255,106,0,.65),0_0_20px_rgba(255,106,0,.12)]'
          : active
            ? 'border-bench-orange/35 bg-bench-orange/[0.03]'
            : ''
      }`}
      onClick={onSelect}
      onDoubleClick={onOpen}
      title="Double-click for full details"
    >
      <div className="flex h-full flex-col gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 gap-3">
              <ToolIconTile tool={tool} />
              <div className="min-w-0">
                <h2 className="line-clamp-2 text-base font-semibold leading-snug text-bench-text">{tool.displayName}</h2>
                <p className="mt-1 truncate text-[11px] font-medium text-bench-muted">
                  {tool.brand} - {tool.toolType.name}
                </p>
              </div>
            </div>
            <SkillPill level={tool.toolType.skillLevel} />
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-5 text-bench-muted">{tool.toolType.description}</p>

          <div className="mt-3 flex min-w-0 flex-wrap gap-2">
            <StatusPill label={tool.brand} tone="orange" />
            <StatusPill label={tool.toolType.category} tone={toolCategoryTone(tool.toolType.category)} />
            <StatusPill label={tool.powerType} tone="purple" />
          </div>
        </div>

        <div className="mt-auto grid gap-3 border-t border-bench-border/70 pt-3">
          <div>
            <p className="text-xs font-semibold uppercase text-bench-muted">Capabilities</p>
            <p className="mt-1 line-clamp-1 text-sm leading-5 text-bench-text">{capabilities || 'General workshop use'}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<Plus size={16} />}
              onClick={(event) => {
                event.stopPropagation()
                onAddToMyTools()
              }}
              onDoubleClick={(event) => event.stopPropagation()}
            >
              My Tools
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Heart size={16} />}
              onClick={(event) => {
                event.stopPropagation()
                onAddToWishlist()
              }}
              onDoubleClick={(event) => event.stopPropagation()}
            >
              Wishlist
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function SkillPill({ level }: { level: SkillLevel }) {
  return (
    <span className="group relative inline-flex shrink-0" tabIndex={0}>
      <StatusPill label={level} tone={skillTone(level)} />
      <span className="pointer-events-none absolute right-0 top-[calc(100%+0.5rem)] z-30 hidden w-64 rounded-lg border border-bench-border bg-bench-surface-raised p-3 text-left text-xs leading-5 text-bench-muted shadow-panel group-hover:block group-focus:block">
        <span className="block font-semibold text-bench-text">{level} rating</span>
        {skillLevelDescription(level)}
      </span>
    </span>
  )
}

function ToolDetailModal({
  tool,
  onClose,
  onAddToMyTools,
  onAddToWishlist,
  onAddToProject,
  onOpenGuide,
}: {
  tool?: ToolCatalogLibraryItem
  onClose: () => void
  onAddToMyTools: (tool: ToolCatalogLibraryItem) => void
  onAddToWishlist: (tool: ToolCatalogLibraryItem) => void
  onAddToProject: (tool: ToolCatalogLibraryItem) => void
  onOpenGuide: (tool: ToolCatalogLibraryItem) => void
}) {
  if (!tool) return null
  const toolType = tool.toolType

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm">
      <section className="panel-surface custom-scrollbar max-h-[92vh] w-full max-w-6xl overflow-auto rounded-2xl p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4 border-b border-bench-border pb-5">
          <div className="flex min-w-0 items-start gap-4">
            <ToolIconTile tool={tool} size="lg" />
            <div className="min-w-0">
              <h2 className="text-3xl font-bold text-bench-text">{tool.displayName}</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-bench-muted">{toolType.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill label={tool.brand} tone="orange" />
                <SkillPill level={toolType.skillLevel} />
                <StatusPill label={toolType.category} tone={toolCategoryTone(toolType.category)} />
                <StatusPill label={tool.powerType} tone="purple" />
              </div>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close tool details">
            <X size={18} />
          </Button>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.8fr]">
          <Card>
            <CardTitle title="What This Tool Does" />
            <p className="text-sm leading-6 text-bench-muted">
              Use {tool.displayName} when a project needs {tool.capabilities.slice(0, 3).map((capability) => capability.name).join(', ') || 'general workshop capability'}.
              It is commonly useful for {toolType.commonProjects.join(', ') || 'shop work'} and works with {toolType.materials.join(', ') || 'typical workshop materials'}.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
                <p className="text-xs font-semibold uppercase text-bench-muted">Skill Load</p>
                <p className="mt-2 text-sm text-bench-text">{toolType.skillLevel}</p>
                <p className="mt-1 text-xs leading-5 text-bench-muted">{skillLevelDescription(toolType.skillLevel)}</p>
              </div>
              <div className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
                <p className="text-xs font-semibold uppercase text-bench-muted">Power Type</p>
                <p className="mt-2 text-sm text-bench-text">{tool.powerType}</p>
                <p className="mt-1 text-xs leading-5 text-bench-muted">Useful for filtering inventory and matching project readiness.</p>
              </div>
              <div className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
                <p className="text-xs font-semibold uppercase text-bench-muted">Best Fit</p>
                <p className="mt-2 text-sm text-bench-text">{toolType.category}</p>
                <p className="mt-1 text-xs leading-5 text-bench-muted">{toolType.commonProjects.slice(0, 2).join(', ') || 'General workshop tasks'}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-bench-text">Capability Details</h3>
              <div className="mt-3 grid gap-3">
                {tool.capabilities.map((capability) => (
                  <div key={capability.id} className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill label={capability.name} tone="orange" />
                      {capability.materials.slice(0, 2).map((material) => <StatusPill key={material} label={material} tone="blue" />)}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-bench-muted">{capability.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <section>
                <h3 className="text-sm font-semibold text-bench-text">Aliases</h3>
                <p className="mt-2 text-sm leading-6 text-bench-muted">{tool.aliases.join(', ') || 'No aliases yet.'}</p>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-bench-text">Common Projects</h3>
                <p className="mt-2 text-sm leading-6 text-bench-muted">{toolType.commonProjects.join(', ')}</p>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-bench-text">Search Tags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tool.searchTags.slice(0, 16).map((tag) => (
                    <StatusPill key={tag} label={tag} tone="muted" />
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-bench-text">Common Materials</h3>
                <p className="mt-2 text-sm leading-6 text-bench-muted">{toolType.materials.join(', ')}</p>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-bench-text">Catalog Metadata</h3>
                <div className="mt-2 grid gap-2">
                  <div className="rounded-lg border border-bench-border bg-white/[0.025] px-3 py-2 text-sm">Internal type: {toolType.name}</div>
                  <div className="rounded-lg border border-bench-border bg-white/[0.025] px-3 py-2 text-sm">Brand: {tool.brand}</div>
                  {tool.model && <div className="rounded-lg border border-bench-border bg-white/[0.025] px-3 py-2 text-sm">Model/platform: {tool.model}</div>}
                  {tool.batteryPlatform && <div className="rounded-lg border border-bench-border bg-white/[0.025] px-3 py-2 text-sm">Battery platform: {tool.batteryPlatform}</div>}
                </div>
              </section>
            </div>
          </Card>

          <div className="grid gap-5">
            <Card className="bg-bench-orange/5">
              <CardTitle title="Safety Notes" />
              <div className="space-y-2">
                {toolType.safety.map((item) => (
                  <p key={item} className="flex items-center gap-2 text-sm text-bench-muted">
                    <ShieldCheck className="text-bench-green" size={16} />
                    {item}
                  </p>
                ))}
              </div>
            </Card>
            <Card>
              <CardTitle title="Actions" />
              <div className="grid gap-3">
                <Button variant="outline" icon={<BookOpen size={18} />} onClick={() => onOpenGuide(tool)}>Open Tool Guide</Button>
                <Button variant="primary" icon={<Plus size={18} />} onClick={() => onAddToMyTools(tool)}>Add to My Tools</Button>
                <Button icon={<Heart size={18} />} onClick={() => onAddToWishlist(tool)}>Add to Wishlist</Button>
                <Button variant="secondary" icon={<Layers3 size={18} />} onClick={() => onAddToProject(tool)}>Add to Project Requirement</Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProjectRequirementQuickModal({
  tool,
  projects,
  selectedProjectId,
  onProjectChange,
  onClose,
  onSubmit,
}: {
  tool?: ToolCatalogLibraryItem
  projects: Project[]
  selectedProjectId: string
  onProjectChange: (projectId: string) => void
  onClose: () => void
  onSubmit: () => void
}) {
  if (!tool) return null

  return (
    <Modal
      open={Boolean(tool)}
      title={`Add ${tool.toolType.name} to a project`}
      description={`Choose which project should require this internal tool type. Catalog source: ${tool.displayName}.`}
      onClose={onClose}
    >
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-bench-text">
          Project
          <SelectInput value={selectedProjectId} onChange={(event) => onProjectChange(event.target.value)}>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </SelectInput>
        </label>
        <div className="rounded-lg border border-bench-border bg-white/[0.025] p-4 text-sm text-bench-muted">
          This will add <span className="font-semibold text-bench-text">{tool.toolType.name}</span> as a required tool type requirement.
        </div>
        <div className="flex justify-end gap-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={<Layers3 size={16} />} onClick={onSubmit}>Add Requirement</Button>
        </div>
      </div>
    </Modal>
  )
}

function skillTone(level: SkillLevel) {
  if (level === 'Beginner') return 'green'
  if (level === 'Intermediate') return 'yellow'
  return 'red'
}

function getToolLibraryColumnCount(width: number) {
  if (width >= 1536) return 4
  if (width >= 1280) return 3
  if (width >= 640) return 2
  return 1
}

function getBufferedToolRows(scrollTop: number, viewportHeight: number, rowCount: number, rowStride: number) {
  if (rowCount <= 0) return { startRow: 0, endRow: 0 }

  const firstVisibleRow = Math.floor(scrollTop / rowStride)
  const lastVisibleRow = Math.ceil((scrollTop + viewportHeight) / rowStride)

  return {
    startRow: Math.min(Math.max(0, rowCount - 1), Math.max(0, firstVisibleRow - TOOL_CARD_OVERSCAN_ROWS)),
    endRow: Math.min(rowCount, lastVisibleRow + TOOL_CARD_OVERSCAN_ROWS),
  }
}

function skillLevelDescription(level: SkillLevel) {
  if (level === 'Beginner') return 'Basic setup, forgiving operation, and easy safety checks make this approachable for new workshop users.'
  if (level === 'Intermediate') return 'Needs steadier setup, accessory choices, or technique control before results feel predictable.'
  return 'Higher risk, tighter calibration, or specialized technique means this tool rewards practice before project use.'
}
