import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, Edit3, Layers3, Package, Plus, Trash2 } from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { MaterialUsageFormModal } from '../../components/logging/MaterialUsageFormModal'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable, type DataColumn } from '../../components/ui/DataTable'
import { DetailPanel } from '../../components/ui/DetailPanel'
import { Field, SelectInput, TextArea, TextInput } from '../../components/ui/FormControls'
import { IconTile } from '../../components/ui/IconTile'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { StatusPill } from '../../components/ui/StatusPill'
import {
  adjustMaterialStock,
  archiveMaterial,
  createMaterial,
  materialDefaults,
  materialFormSchema,
  updateMaterial,
} from '../../data/actions'
import { useActiveMaterials, useMaterialUsageLogs } from '../../data/hooks'
import type { Material, MaterialFormValues } from '../../data/schema'
import { filterMaterials, getMaterialStockStatus, sortMaterials, uniqueDefined } from '../../lib/inventory/inventory'
import { stockTone } from '../../lib/utils/status'

type MaterialModalState = { mode: 'create' } | { mode: 'edit'; material: Material } | null
type MaterialFilterState = {
  search: string
  category: string
  stockStatus: string
  unit: string
  location: string
}

export function MaterialsPage() {
  const materials = useActiveMaterials()
  const [selectedId, setSelectedId] = useState<string>()
  const [page, setPage] = useState(1)
  const [modalState, setModalState] = useState<MaterialModalState>(null)
  const [stockModalMaterial, setStockModalMaterial] = useState<Material>()
  const [usageModalOpen, setUsageModalOpen] = useState(false)
  const [filters, setFilters] = useState<MaterialFilterState>({
    search: '',
    category: 'All',
    stockStatus: 'All',
    unit: 'All',
    location: 'All',
  })
  const filteredMaterials = useMemo(() => sortMaterials(filterMaterials(materials, filters)), [filters, materials])
  const pageSize = 10
  const pageCount = Math.ceil(filteredMaterials.length / pageSize)
  const safePage = Math.min(page, Math.max(1, pageCount))
  const pagedMaterials = filteredMaterials.slice((safePage - 1) * pageSize, safePage * pageSize)
  const selectedMaterial = filteredMaterials.find((material) => material.id === selectedId) ?? filteredMaterials[0]
  const selectedUsageLogs = useMaterialUsageLogs(selectedMaterial?.id)
  const lowStock = materials.filter((material) => getMaterialStockStatus(material) === 'Low').length
  const inStock = materials.filter((material) => getMaterialStockStatus(material) === 'In Stock').length
  const outStock = materials.filter((material) => getMaterialStockStatus(material) === 'Out').length

  const columns: DataColumn<Material>[] = [
    {
      header: 'Material',
      render: (material) => (
        <div className="flex items-center gap-3">
          <IconTile icon={Package} size="sm" tone="yellow" />
          <div>
            <p className="font-semibold text-bench-text">{material.name}</p>
            <p className="text-xs text-bench-muted">{material.description || 'No description'}</p>
          </div>
        </div>
      ),
    },
    { header: 'Category', render: (material) => <span className="text-bench-muted">{material.category}</span> },
    { header: 'On Hand', render: (material) => <span className="font-semibold">{material.quantity}</span> },
    { header: 'Unit', render: (material) => <span className="text-bench-muted">{material.unit}</span> },
    { header: 'Storage Location', render: (material) => <span className="text-bench-muted">{material.storageLocation}</span> },
    { header: 'Stock Status', render: (material) => <StatusPill label={getMaterialStockStatus(material)} tone={stockTone(getMaterialStockStatus(material))} /> },
    {
      header: 'Actions',
      render: (material) => (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            aria-label="Edit material"
            onClick={(event) => {
              event.stopPropagation()
              setModalState({ mode: 'edit', material })
            }}
          >
            <Edit3 size={16} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            aria-label="Archive material"
            onClick={(event) => {
              event.stopPropagation()
              if (window.confirm(`Archive ${material.name}?`)) void archiveMaterial(material.id)
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
        title="Materials"
        description="Track what you have, what is running low, and where it is stored."
        icon={Layers3}
        actions={
          <>
            <Button icon={<Clock size={18} />} onClick={() => setUsageModalOpen(true)}>Log Usage</Button>
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => setModalState({ mode: 'create' })}>Add Material</Button>
          </>
        }
      />

      <div className="grid gap-5 2xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <MaterialFilters materials={materials} filters={filters} onChange={setFilters} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Layers3} label="Total Materials" value={materials.length} detail="All active materials" tone="orange" />
            <StatCard icon={Package} label="Low Stock" value={lowStock} detail="At or below minimum" tone="yellow" />
            <StatCard icon={Package} label="In Stock" value={inStock} detail="Good inventory levels" tone="green" />
            <StatCard icon={Clock} label="Out" value={outStock} detail="Quantity is zero" tone="red" />
          </div>
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={pagedMaterials}
              gridTemplate="1.25fr .8fr .55fr .85fr 1fr .75fr .65fr"
              selectedId={selectedMaterial?.id}
              className="min-w-[1080px]"
              rowClassName="min-h-[72px] py-2"
              onRowClick={(material) => setSelectedId(material.id)}
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
            <p>Showing {pagedMaterials.length} of {filteredMaterials.length} materials</p>
          </div>
        </div>

        <div className="space-y-5">
          <DetailPanel title="Material Details">
            {selectedMaterial ? (
              <>
                <div className="flex items-start gap-4">
                  <IconTile icon={Package} tone="yellow" size="lg" />
                  <div>
                    <h2 className="text-xl font-bold">{selectedMaterial.name}</h2>
                    <p className="text-sm text-bench-muted">{selectedMaterial.description || selectedMaterial.category}</p>
                    <StatusPill className="mt-2" label={getMaterialStockStatus(selectedMaterial)} tone={stockTone(getMaterialStockStatus(selectedMaterial))} />
                  </div>
                </div>
                <div className="mt-6 grid gap-3 border-t border-bench-border pt-5 text-sm">
                  {[
                    ['Category', selectedMaterial.category],
                    ['Unit', selectedMaterial.unit],
                    ['On Hand', selectedMaterial.quantity],
                    ['Minimum Desired', selectedMaterial.minimumDesired],
                    ['Need', <StatusPill key="need" label={`${materialNeedLevel(selectedMaterial)} Need`} tone={materialNeedTone(selectedMaterial)} />],
                    ['Storage Location', selectedMaterial.storageLocation],
                    ['Last Restocked', selectedMaterial.lastRestockedAt || 'Unknown'],
                    ['Est. Usage Rate', selectedMaterial.estimatedUsageRate || 'Not set'],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between gap-4">
                      <span className="text-bench-muted">{label}</span>
                      <span className="text-right text-bench-text">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-bench-border pt-5">
                  <p className="text-sm font-semibold">Notes</p>
                  <p className="mt-2 text-sm text-bench-muted">{selectedMaterial.notes || 'No notes yet.'}</p>
                </div>
                <div className="mt-5 grid gap-2">
                  <Button variant="primary" icon={<Edit3 size={18} />} onClick={() => setModalState({ mode: 'edit', material: selectedMaterial })}>Edit Material</Button>
                  <Button icon={<Plus size={18} />} onClick={() => setStockModalMaterial(selectedMaterial)}>Add Stock</Button>
                  <Button icon={<Clock size={18} />} onClick={() => setUsageModalOpen(true)}>Log Usage</Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-bench-muted">No materials match the current filters.</p>
            )}
          </DetailPanel>

          <Card>
            <h2 className="text-base font-semibold">Recent Usage</h2>
            {selectedUsageLogs.slice(0, 5).map((item) => (
              <div key={item.id} className="mt-4 flex items-center justify-between gap-3 text-sm">
                <span className="text-bench-muted">{formatDate(item.usedAt)}</span>
                <span>{item.projectId ? 'Project use' : 'General use'}</span>
                <span className="text-bench-muted">-{item.quantityUsed} {item.unit}</span>
              </div>
            ))}
            {selectedUsageLogs.length === 0 && <p className="mt-4 text-sm text-bench-muted">No usage logged yet.</p>}
          </Card>
        </div>
      </div>

      <MaterialFormModal modalState={modalState} onClose={() => setModalState(null)} />
      <StockAdjustmentModal material={stockModalMaterial} onClose={() => setStockModalMaterial(undefined)} />
      <MaterialUsageFormModal open={usageModalOpen} defaultMaterialId={selectedMaterial?.id} onClose={() => setUsageModalOpen(false)} />
    </div>
  )
}

function MaterialFilters({
  materials,
  filters,
  onChange,
}: {
  materials: Material[]
  filters: MaterialFilterState
  onChange: (filters: MaterialFilterState) => void
}) {
  const options = {
    category: ['All', ...uniqueDefined(materials.map((material) => material.category))],
    stockStatus: ['All', 'In Stock', 'Low', 'Out'],
    unit: ['All', ...uniqueDefined(materials.map((material) => material.unit))],
    location: ['All', ...uniqueDefined(materials.map((material) => material.storageLocation))],
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="relative min-w-64 flex-1">
        <span className="sr-only">Search materials</span>
        <TextInput
          placeholder="Search materials..."
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          className="pl-4"
        />
      </label>
      {([
        ['category', 'Category'],
        ['stockStatus', 'Stock Status'],
        ['unit', 'Unit Type'],
        ['location', 'Location'],
      ] as Array<[keyof MaterialFilterState, string]>).map(([key, label]) => (
        <label key={key} className="min-w-36">
          <span className="mb-1 block text-xs font-medium text-bench-muted">{label}</span>
          <SelectInput value={filters[key]} onChange={(event) => onChange({ ...filters, [key]: event.target.value })}>
            {options[key as keyof typeof options].map((option) => <option key={option}>{option}</option>)}
          </SelectInput>
        </label>
      ))}
      <Button onClick={() => onChange({ search: '', category: 'All', stockStatus: 'All', unit: 'All', location: 'All' })}>
        Clear Filters
      </Button>
    </div>
  )
}

function MaterialFormModal({ modalState, onClose }: { modalState: MaterialModalState; onClose: () => void }) {
  const editMaterial = modalState?.mode === 'edit' ? modalState.material : undefined
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: materialDefaults(editMaterial),
  })

  useEffect(() => {
    form.reset(materialDefaults(editMaterial))
  }, [editMaterial, form])

  async function submit(values: MaterialFormValues) {
    if (editMaterial) await updateMaterial(editMaterial.id, values)
    else await createMaterial(values)
    onClose()
  }

  return (
    <Modal
      open={Boolean(modalState)}
      title={editMaterial ? 'Edit Material' : 'Add Material'}
      description="Track stock levels, storage, and reorder thresholds."
      onClose={onClose}
    >
      <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Material Name" error={form.formState.errors.name?.message}>
            <TextInput {...form.register('name')} placeholder="3/4 inch Plywood" />
          </Field>
          <Field label="Category" error={form.formState.errors.category?.message}>
            <TextInput {...form.register('category')} placeholder="Sheet Goods" />
          </Field>
          <Field label="Quantity" error={form.formState.errors.quantity?.message}>
            <TextInput type="number" step="0.01" {...form.register('quantity', { valueAsNumber: true })} />
          </Field>
          <Field label="Unit" error={form.formState.errors.unit?.message}>
            <TextInput {...form.register('unit')} placeholder="Sheets, Pieces, Bottles" />
          </Field>
          <Field label="Minimum Desired" error={form.formState.errors.minimumDesired?.message}>
            <TextInput type="number" step="0.01" {...form.register('minimumDesired', { valueAsNumber: true })} />
          </Field>
          <Field label="Storage Location" error={form.formState.errors.storageLocation?.message}>
            <TextInput {...form.register('storageLocation')} placeholder="Sheet Goods Rack" />
          </Field>
          <Field label="Last Restocked">
            <TextInput {...form.register('lastRestockedAt')} placeholder="May 4, 2024" />
          </Field>
          <Field label="Estimated Usage Rate">
            <TextInput {...form.register('estimatedUsageRate')} placeholder="~1 sheet / week" />
          </Field>
        </div>
        <Field label="Description">
          <TextInput {...form.register('description')} placeholder="Birch plywood sheet goods" />
        </Field>
        <Field label="Notes">
          <TextArea {...form.register('notes')} placeholder="Storage, purchasing, or usage notes..." />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{editMaterial ? 'Save Material' : 'Add Material'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function StockAdjustmentModal({ material, onClose }: { material?: Material; onClose: () => void }) {
  if (!material) return null

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const quantity = Number(new FormData(event.currentTarget).get('quantity'))
    if (!Number.isFinite(quantity) || quantity <= 0 || !material) return
    await adjustMaterialStock(material.id, quantity)
    onClose()
  }

  return (
    <Modal open title={`Add Stock: ${material.name}`} description="Increase the on-hand quantity for this material." onClose={onClose}>
      <form className="grid gap-4" onSubmit={submit}>
        <Field label={`Quantity to add (${material.unit})`}>
          <TextInput
            name="quantity"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={1}
          />
        </Field>
        <div className="rounded-lg border border-bench-border bg-white/[0.025] p-4 text-sm text-bench-muted">
          Current stock is <span className="font-semibold text-bench-text">{material.quantity} {material.unit}</span>.
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" icon={<Plus size={16} />}>Add Stock</Button>
        </div>
      </form>
    </Modal>
  )
}

function materialNeedLevel(material: Material) {
  const status = getMaterialStockStatus(material)
  if (status === 'Out') return 'High'
  if (status === 'Low') {
    const shortage = Math.max(0, material.minimumDesired - material.quantity)
    return shortage >= Math.max(1, material.minimumDesired * 0.4) ? 'High' : 'Medium'
  }
  if (material.minimumDesired > 0 && material.quantity <= material.minimumDesired * 1.5) return 'Medium'
  return 'Low'
}

function materialNeedTone(material: Material) {
  const level = materialNeedLevel(material)
  if (level === 'High') return 'red'
  if (level === 'Medium') return 'yellow'
  return 'green'
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}
