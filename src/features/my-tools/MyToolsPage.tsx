import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, Briefcase, Clock, Edit3, Plus, Trash2, Wrench, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { MaintenanceFormModal } from '../../components/logging/MaintenanceFormModal'
import { ToolUsageFormModal } from '../../components/logging/ToolUsageFormModal'
import { ToolPicker } from '../../components/tool-picker/ToolPicker'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable, type DataColumn } from '../../components/ui/DataTable'
import { DetailPanel } from '../../components/ui/DetailPanel'
import { Field, SelectInput, TextArea, TextInput } from '../../components/ui/FormControls'
import { IconTile } from '../../components/ui/IconTile'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatCard } from '../../components/ui/StatCard'
import { StatusPill } from '../../components/ui/StatusPill'
import {
  archiveUserTool,
  createUserTool,
  updateUserTool,
  userToolDefaults,
  userToolDefaultsFromLibrary,
  userToolFormSchema,
} from '../../data/actions'
import { useActiveUserTools, useMaintenanceLogs, useToolUsageLogs } from '../../data/hooks'
import type { ToolCondition, ToolLibraryItem, UserTool, UserToolFormValues } from '../../data/schema'
import { powerTypes, toolCategories, toolConditions } from '../../data/schema'
import { toolTypeGuidePath } from '../../lib/guides/allToolsGuideSystem'
import { filterUserTools, sortUserTools, uniqueDefined } from '../../lib/inventory/inventory'
import { conditionTone, usageTone } from '../../lib/utils/status'

type ToolModalState =
  | { mode: 'create'; libraryTool?: ToolLibraryItem }
  | { mode: 'edit'; tool: UserTool }
  | null

type ToolFilterState = {
  search: string
  category: string
  brand: string
  condition: string
  powerType: string
  batteryPlatform: string
  location: string
}

export function MyToolsPage() {
  const navigate = useNavigate()
  const tools = useActiveUserTools()
  const [selectedId, setSelectedId] = useState<string>()
  const [page, setPage] = useState(1)
  const [modalState, setModalState] = useState<ToolModalState>(null)
  const [usageModalOpen, setUsageModalOpen] = useState(false)
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false)
  const [filters, setFilters] = useState<ToolFilterState>({
    search: '',
    category: 'All',
    brand: 'All',
    condition: 'All',
    powerType: 'All',
    batteryPlatform: 'All',
    location: 'All',
  })

  const filteredTools = useMemo(
    () => sortUserTools(filterUserTools(tools, filters)),
    [filters, tools],
  )
  const pageSize = 10
  const pageCount = Math.ceil(filteredTools.length / pageSize)
  const safePage = Math.min(page, Math.max(1, pageCount))
  const pagedTools = filteredTools.slice((safePage - 1) * pageSize, safePage * pageSize)
  const selectedTool = filteredTools.find((tool) => tool.id === selectedId) ?? filteredTools[0]
  const selectedToolUsage = useToolUsageLogs(selectedTool?.id)
  const selectedMaintenance = useMaintenanceLogs(selectedTool?.id)
  const goodTools = tools.filter((tool) => tool.condition === 'Good' || tool.condition === 'New').length
  const repairTools = tools.filter((tool) => tool.condition === 'Needs Repair' || tool.condition === 'Broken' || tool.condition === 'Fair').length
  const batteryPlatforms = uniqueDefined(tools.map((tool) => tool.batteryPlatform)).length

  const columns: DataColumn<UserTool>[] = [
    {
      header: 'Tool',
      render: (tool) => (
        <div className="flex items-center gap-3">
          <IconTile icon={Wrench} size="sm" tone="orange" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-bench-text">{tool.name}</p>
            <p className="truncate text-xs text-bench-muted">{tool.type}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Brand / Model',
      render: (tool) => (
        <div className="min-w-0">
          <p className="truncate">{tool.brand || 'Custom'}</p>
          <p className="truncate text-xs text-bench-muted">{tool.model || 'No model'}</p>
        </div>
      ),
    },
    { header: 'Condition', render: (tool) => <StatusPill label={tool.condition} tone={conditionTone(tool.condition)} /> },
    { header: 'Storage Location', render: (tool) => <span className="block truncate text-bench-muted">{tool.storageLocation}</span> },
    { header: 'Last Used', render: (tool) => <span className="block truncate text-bench-muted">{tool.lastUsedAt || 'Not logged yet'}</span> },
    {
      header: 'Usage Level',
      render: (tool) => (
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-bench-muted">{tool.usageLevel}</span>
          <ProgressBar value={tool.usageLevel === 'High' ? 85 : tool.usageLevel === 'Medium' ? 58 : 28} tone={usageTone(tool.usageLevel)} />
        </div>
      ),
    },
    {
      header: 'Actions',
      render: (tool) => (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            aria-label="Edit tool"
            onClick={(event) => {
              event.stopPropagation()
              setModalState({ mode: 'edit', tool })
            }}
          >
            <Edit3 size={16} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            aria-label="Archive tool"
            onClick={(event) => {
              event.stopPropagation()
              if (window.confirm(`Archive ${tool.name}?`)) void archiveUserTool(tool.id)
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="My Tools"
        description="Track what you own, where it is, and what condition it is in."
        icon={Briefcase}
        actions={
          <>
            <Button icon={<Clock size={18} />} onClick={() => setUsageModalOpen(true)}>Log Tool Use</Button>
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => setModalState({ mode: 'create' })}>Add Tool</Button>
          </>
        }
      />

      <div className="grid gap-5 2xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <ToolFilters tools={tools} filters={filters} onChange={setFilters} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Briefcase} label="Total Tools" value={tools.length} detail="All active tools in inventory" tone="orange" />
            <StatCard icon={Wrench} label="Good Condition" value={goodTools} detail="Ready to get to work" tone="green" />
            <StatCard icon={Wrench} label="Need Repair" value={repairTools} detail="Fair, repair, or broken" tone="yellow" />
            <StatCard icon={Zap} label="Battery Platforms" value={batteryPlatforms} detail="Across your collection" tone="blue" />
          </div>
          <div className="min-w-0">
            <DataTable
              columns={columns}
              data={pagedTools}
              gridTemplate="1.15fr .85fr .65fr .9fr .8fr .85fr 6rem"
              selectedId={selectedTool?.id}
              className="w-full"
              onRowClick={(tool) => setSelectedId(tool.id)}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-bench-muted">
            {pageCount > 1 ? (
              <div className="flex gap-2">
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                  <Button key={pageNumber} size="icon" variant={pageNumber === safePage ? 'outline' : 'secondary'} onClick={() => setPage(pageNumber)}>{pageNumber}</Button>
                ))}
              </div>
            ) : <span />}
            <p>Showing {pagedTools.length} of {filteredTools.length} tools</p>
          </div>
        </div>

        <div className="space-y-5">
          <DetailPanel title="Tool Details">
            {selectedTool ? (
              <>
                <div className="flex items-start gap-4">
                  <IconTile icon={Wrench} tone="orange" size="lg" />
                  <div>
                    <h2 className="text-xl font-bold">{selectedTool.name}</h2>
                    <p className="text-sm text-bench-muted">{selectedTool.type}</p>
                    <StatusPill className="mt-2" label={selectedTool.condition} tone={conditionTone(selectedTool.condition)} />
                  </div>
                </div>
                <div className="mt-6 grid gap-3 border-t border-bench-border pt-5 text-sm">
                  {[
                    ['Brand', selectedTool.brand || 'Custom'],
                    ['Model', selectedTool.model || 'None'],
                    ['Power Type', selectedTool.powerType],
                    ['Battery Platform', selectedTool.batteryPlatform ?? 'None'],
                    ['Purchase Year', selectedTool.purchaseYear ?? 'Unknown'],
                    ['Storage Location', selectedTool.storageLocation],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-bench-muted">{label}</span>
                      <span className="text-right text-bench-text">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <p className="text-sm font-semibold">Usage Level</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-bench-orange">{selectedTool.usageLevel}</span>
                    <ProgressBar value={selectedTool.usageLevel === 'High' ? 85 : selectedTool.usageLevel === 'Medium' ? 58 : 28} tone={usageTone(selectedTool.usageLevel)} />
                  </div>
                </div>
                <div className="mt-5 border-t border-bench-border pt-5">
                  <p className="text-sm font-semibold">Notes</p>
                  <p className="mt-2 text-sm text-bench-muted">{selectedTool.notes || 'No notes yet.'}</p>
                </div>
                <div className="mt-5 grid gap-2">
                  <Button variant="primary" icon={<Edit3 size={18} />} onClick={() => setModalState({ mode: 'edit', tool: selectedTool })}>Edit Tool</Button>
                  {selectedTool.toolTypeId && (
                    <Button variant="outline" icon={<BookOpen size={18} />} onClick={() => navigate(toolTypeGuidePath(selectedTool.toolTypeId!))}>Open Tool Guide</Button>
                  )}
                  <Button icon={<Clock size={18} />} onClick={() => setUsageModalOpen(true)}>Log Tool Use</Button>
                  <Button icon={<Wrench size={18} />} onClick={() => setMaintenanceModalOpen(true)}>Log Maintenance</Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-bench-muted">No tools match the current filters.</p>
            )}
          </DetailPanel>

          <Card>
            <h2 className="text-base font-semibold">Recent Tool Use</h2>
            {selectedToolUsage.slice(0, 4).map((item) => (
              <div key={item.id} className="mt-4 flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-bench-muted"><Clock size={15} /> {formatDate(item.usedAt)}</span>
                <span>{item.usageType}</span>
              </div>
            ))}
            {selectedToolUsage.length === 0 && <p className="mt-4 text-sm text-bench-muted">No tool use logged yet.</p>}
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Recent Maintenance</h2>
            {selectedMaintenance.slice(0, 3).map((item) => (
              <div key={item.id} className="mt-4 flex items-center justify-between gap-3 text-sm">
                <span className="text-bench-muted">{formatDate(item.performedAt)}</span>
                <span>{item.maintenanceType}</span>
              </div>
            ))}
            {selectedMaintenance.length === 0 && <p className="mt-4 text-sm text-bench-muted">No maintenance logged yet.</p>}
          </Card>
        </div>
      </div>

      <ToolFormModal modalState={modalState} onClose={() => setModalState(null)} />
      <ToolUsageFormModal open={usageModalOpen} defaultUserToolId={selectedTool?.id} onClose={() => setUsageModalOpen(false)} />
      <MaintenanceFormModal open={maintenanceModalOpen} defaultUserToolId={selectedTool?.id} onClose={() => setMaintenanceModalOpen(false)} />
    </div>
  )
}

function ToolFilters({
  tools,
  filters,
  onChange,
}: {
  tools: UserTool[]
  filters: ToolFilterState
  onChange: (filters: ToolFilterState) => void
}) {
  const options = {
    category: ['All', ...uniqueDefined([...toolCategories, ...tools.map((tool) => tool.category)])],
    brand: ['All', ...uniqueDefined(tools.map((tool) => tool.brand))],
    condition: ['All', ...toolConditions],
    powerType: ['All', ...powerTypes],
    batteryPlatform: ['All', ...uniqueDefined(tools.map((tool) => tool.batteryPlatform))],
    location: ['All', ...uniqueDefined(tools.map((tool) => tool.storageLocation))],
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="relative min-w-64 flex-1">
        <span className="sr-only">Search my tools</span>
        <TextInput
          placeholder="Search my tools..."
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          className="pl-4"
        />
      </label>
      {([
        ['category', 'Category'],
        ['brand', 'Brand'],
        ['condition', 'Condition'],
        ['powerType', 'Power Type'],
        ['batteryPlatform', 'Battery Platform'],
        ['location', 'Location'],
      ] as Array<[keyof ToolFilterState, string]>).map(([key, label]) => (
        <label key={key} className="min-w-36">
          <span className="mb-1 block text-xs font-medium text-bench-muted">{label}</span>
          <SelectInput value={filters[key]} onChange={(event) => onChange({ ...filters, [key]: event.target.value })}>
            {options[key as keyof typeof options].map((option) => <option key={option}>{option}</option>)}
          </SelectInput>
        </label>
      ))}
      <Button onClick={() => onChange({ search: '', category: 'All', brand: 'All', condition: 'All', powerType: 'All', batteryPlatform: 'All', location: 'All' })}>
        Clear Filters
      </Button>
    </div>
  )
}

function ToolFormModal({ modalState, onClose }: { modalState: ToolModalState; onClose: () => void }) {
  const editTool = modalState?.mode === 'edit' ? modalState.tool : undefined
  const createLibraryTool = modalState?.mode === 'create' ? modalState.libraryTool : undefined
  const form = useForm<UserToolFormValues>({
    resolver: zodResolver(userToolFormSchema),
    defaultValues: editTool ? userToolDefaults(editTool) : userToolDefaultsFromLibrary(createLibraryTool),
  })

  useEffect(() => {
    form.reset(editTool ? userToolDefaults(editTool) : userToolDefaultsFromLibrary(createLibraryTool))
  }, [createLibraryTool, editTool, form])

  async function submit(values: UserToolFormValues) {
    if (editTool) await updateUserTool(editTool.id, values)
    else await createUserTool(values)
    onClose()
  }

  return (
    <Modal
      open={Boolean(modalState)}
      title={editTool ? 'Edit Tool' : 'Add Tool'}
      description={editTool ? 'Update this owned tool.' : 'Pick from the Tool Library or enter a custom tool.'}
      onClose={onClose}
    >
      {!editTool && (
        <div className="mb-5">
          <ToolPicker
            mode="Add to My Tools"
            onSelectToolType={(tool) => {
              form.reset(userToolDefaultsFromLibrary(tool))
            }}
          />
        </div>
      )}
      <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tool Name" error={form.formState.errors.name?.message}>
            <TextInput {...form.register('name')} placeholder="Cordless Drill" />
          </Field>
          <Field label="Tool Type" error={form.formState.errors.type?.message}>
            <TextInput {...form.register('type')} placeholder="Drill / Driver" />
          </Field>
          <Field label="Brand">
            <TextInput {...form.register('brand')} placeholder="Optional" />
          </Field>
          <Field label="Model">
            <TextInput {...form.register('model')} placeholder="Optional" />
          </Field>
          <Field label="Category" error={form.formState.errors.category?.message}>
            <SelectInput {...form.register('category')}>
              <option value="">Choose category</option>
              {toolCategories.map((category) => <option key={category}>{category}</option>)}
            </SelectInput>
          </Field>
          <Field label="Condition" error={form.formState.errors.condition?.message}>
            <SelectInput {...form.register('condition')}>
              {toolConditions.map((condition: ToolCondition) => <option key={condition}>{condition}</option>)}
            </SelectInput>
          </Field>
          <Field label="Power Type" error={form.formState.errors.powerType?.message}>
            <SelectInput {...form.register('powerType')}>
              {powerTypes.map((powerType) => <option key={powerType}>{powerType}</option>)}
            </SelectInput>
          </Field>
          <Field label="Storage Location" error={form.formState.errors.storageLocation?.message}>
            <TextInput {...form.register('storageLocation')} placeholder="Wall Pegboard" />
          </Field>
          <Field label="Battery Platform">
            <TextInput {...form.register('batteryPlatform')} placeholder="Optional" />
          </Field>
          <Field label="Purchase Year">
            <TextInput type="number" {...form.register('purchaseYear', { setValueAs: (value) => value === '' ? undefined : Number(value) })} placeholder="Optional" />
          </Field>
        </div>
        <Field label="Notes">
          <TextArea {...form.register('notes')} placeholder="Care notes, setup tips, accessories..." />
        </Field>
        <Field label="Repair Notes">
          <TextArea {...form.register('repairNotes')} placeholder="Known issues or maintenance notes..." />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{editTool ? 'Save Tool' : 'Add Tool'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}
