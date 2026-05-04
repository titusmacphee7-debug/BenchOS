import { zodResolver } from '@hookform/resolvers/zod'
import { CheckSquare, Edit3, Heart, Package, Plus, ShoppingCart, Trash2, Wrench } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { Field, SelectInput, TextArea, TextInput } from '../../components/ui/FormControls'
import { IconTile } from '../../components/ui/IconTile'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusPill } from '../../components/ui/StatusPill'
import {
  archiveWishlistItem,
  convertWishlistItemToInventory,
  createWishlistItem,
  materialConversionDefaults,
  markWishlistPurchased,
  toolConversionDefaults,
  updateWishlistItem,
  userToolFormSchema,
  wishlistMaterialConversionSchema,
  wishlistDefaults,
  wishlistItemFormSchema,
} from '../../data/actions'
import { useActiveMaterials, useActiveProjects, useActiveWishlistItems, useToolLibraryData } from '../../data/hooks'
import type { Material, WishlistItem, WishlistItemFormValues, WishlistMaterialConversionValues, WishlistToolConversionValues } from '../../data/schema'
import { powerTypes, toolCategories, toolConditions, wishlistItemTypes, wishlistPriorities, wishlistStatuses } from '../../data/schema'
import { priorityTone } from '../../lib/utils/status'

const tabs = ['All Items', 'Tools', 'Materials', 'Project Needs']
const sortModes = ['Priority', 'Name', 'Status', 'Added'] as const
const wishlistGridTemplate = 'minmax(220px,1.25fr) minmax(140px,.75fr) minmax(120px,.55fr) minmax(150px,.75fr) minmax(240px,auto)'

export function WishlistPage() {
  const navigate = useNavigate()
  const items = useActiveWishlistItems()
  const projects = useActiveProjects()
  const materials = useActiveMaterials()
  const [activeTab, setActiveTab] = useState('All Items')
  const [sortMode, setSortMode] = useState<(typeof sortModes)[number]>('Priority')
  const [modalItem, setModalItem] = useState<WishlistItem | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [conversionItem, setConversionItem] = useState<WishlistItem | undefined>()

  const filteredItems = useMemo(() => items.filter((item) => {
    if (activeTab === 'Tools') return item.itemType === 'Tool'
    if (activeTab === 'Materials') return item.itemType === 'Material'
    if (activeTab === 'Project Needs') return Boolean(item.linkedProjectId)
    return true
  }).sort((a, b) => sortWishlistItems(a, b, sortMode)), [activeTab, items, sortMode])

  const toolsCount = items.filter((item) => item.itemType === 'Tool').length
  const materialsCount = items.filter((item) => item.itemType === 'Material').length
  const linkedCount = items.filter((item) => item.linkedProjectId).length

  return (
    <div>
      <PageHeader
        title="Wishlist"
        description="Track the tools and materials you want or need."
        icon={Heart}
        actions={<Button variant="primary" icon={<Plus size={18} />} onClick={() => { setModalItem(undefined); setModalOpen(true) }}>Add to Wishlist</Button>}
      />

      <div className="grid gap-5 2xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                    activeTab === tab
                      ? 'border-bench-orange/50 bg-bench-orange/12 text-bench-orange'
                      : 'border-bench-border bg-white/[0.025] text-bench-muted'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Button onClick={() => setSortMode(nextSortMode(sortMode))}>Sort: {sortMode}</Button>
          </div>

          <div className="grid gap-4 border-b border-bench-border px-3 pb-3 text-xs font-semibold uppercase text-bench-muted" style={{ gridTemplateColumns: wishlistGridTemplate }}>
            <span>Item</span>
            <span>Added For</span>
            <span>Priority</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div className="space-y-2 pt-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="grid min-h-24 items-center gap-4 rounded-xl border border-bench-border bg-white/[0.025] px-3 py-3" style={{ gridTemplateColumns: wishlistGridTemplate }}>
                <div className="flex min-w-0 items-center gap-4">
                  <IconTile icon={item.itemType === 'Tool' ? Wrench : Package} tone={item.itemType === 'Tool' ? 'orange' : 'yellow'} size="lg" />
                  <div className="min-w-0">
                    <p className="font-semibold text-bench-text">{item.name}</p>
                    <p className="text-sm text-bench-muted">{item.notes || item.itemType}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p>{projectName(projects, item.linkedProjectId) ?? item.addedFor ?? 'General Use'}</p>
                  <p className="text-bench-muted">{item.linkedProjectId ? 'Project' : 'General Use'}</p>
                </div>
                <StatusPill label={item.priority} tone={priorityTone(item.priority)} />
                <div className="flex items-center gap-2 text-sm">
                  <CheckSquare size={18} className="text-bench-muted" />
                  {item.status}
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'Not Purchased' && <Button size="sm" variant="outline" icon={<CheckSquare size={15} />} onClick={() => void markWishlistPurchased(item.id)}>Mark Purchased</Button>}
                  {item.status === 'Purchased' && <Button size="sm" variant="primary" onClick={() => setConversionItem(item)}>Convert</Button>}
                  <Button size="icon" variant="secondary" aria-label="Edit wishlist item" onClick={() => { setModalItem(item); setModalOpen(true) }}><Edit3 size={16} /></Button>
                  <Button size="icon" variant="ghost" aria-label="Archive wishlist item" onClick={() => void archiveWishlistItem(item.id)}><Trash2 size={16} /></Button>
                </div>
              </div>
            ))}
          </div>

          <Card className="mt-8 border-bench-orange/35 bg-bench-orange/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <IconTile icon={Heart} tone="orange" />
                <div>
                  <h2 className="font-semibold">Project-linked purchase plan</h2>
                  <p className="text-sm text-bench-muted">Missing project items can flow here from readiness checks.</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/projects')}>View Projects</Button>
            </div>
          </Card>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardTitle title="Wishlist Summary" action={<IconTile icon={ShoppingCart} tone="orange" />} />
            <p className="text-4xl font-bold">{items.length}</p>
            <p className="text-sm text-bench-muted">Total Items</p>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-bench-border pt-5">
              <div><p className="text-2xl font-bold">{toolsCount}</p><p className="text-sm text-bench-muted">Tools</p></div>
              <div><p className="text-2xl font-bold">{materialsCount}</p><p className="text-sm text-bench-muted">Materials</p></div>
              <div className="col-span-2"><p className="text-2xl font-bold">{linkedCount}</p><p className="text-sm text-bench-muted">Linked to Projects</p></div>
            </div>
          </Card>

          <Card>
            <CardTitle title="Priority Breakdown" />
            {wishlistPriorities.map((priority) => (
              <div key={priority} className="mt-4 flex items-center justify-between text-sm">
                <StatusPill label={`${priority} Priority`} tone={priorityTone(priority)} />
                <span className="font-semibold">{items.filter((item) => item.priority === priority).length}</span>
              </div>
            ))}
          </Card>

        </div>
      </div>

      <WishlistFormModal open={modalOpen} item={modalItem} projects={projects} onClose={() => setModalOpen(false)} />
      <WishlistConversionModal item={conversionItem} materials={materials} onClose={() => setConversionItem(undefined)} />
    </div>
  )
}

function WishlistFormModal({ open, item, projects, onClose }: { open: boolean; item?: WishlistItem; projects: Array<{ id: string; name: string }>; onClose: () => void }) {
  const { items: toolTypes } = useToolLibraryData()
  const form = useForm<WishlistItemFormValues>({
    resolver: zodResolver(wishlistItemFormSchema),
    defaultValues: wishlistDefaults(item),
    values: wishlistDefaults(item),
  })
  const selectedToolTypeId = useWatch({ control: form.control, name: 'toolTypeId' })

  async function submit(values: WishlistItemFormValues) {
    if (item) await updateWishlistItem(item.id, values)
    else await createWishlistItem(values)
    onClose()
  }

  return (
    <Modal open={open} title={item ? 'Edit Wishlist Item' : 'Add Wishlist Item'} description="Track a tool, material, or accessory you plan to buy." onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Item Type">
            <SelectInput {...form.register('itemType')}>
              {wishlistItemTypes.map((type) => <option key={type}>{type}</option>)}
            </SelectInput>
          </Field>
          <Field label="Name" error={form.formState.errors.name?.message}>
            <TextInput {...form.register('name')} placeholder="Circular Saw or 3/4 inch Plywood" />
          </Field>
          <Field label="Priority">
            <SelectInput {...form.register('priority')}>
              {wishlistPriorities.map((priority) => <option key={priority}>{priority}</option>)}
            </SelectInput>
          </Field>
          <Field label="Status">
            <SelectInput {...form.register('status')}>
              {wishlistStatuses.filter((status) => status !== 'Archived').map((status) => <option key={status}>{status}</option>)}
            </SelectInput>
          </Field>
          <Field label="Linked Project">
            <SelectInput {...form.register('linkedProjectId')}>
              <option value="">None</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </SelectInput>
          </Field>
          <Field label="Library Tool">
            <SelectInput value={selectedToolTypeId ?? ''} onChange={(event) => {
              const tool = toolTypes.find((item) => item.id === event.target.value)
              form.setValue('toolTypeId', event.target.value)
              if (tool) form.setValue('name', tool.name)
            }}>
              <option value="">None / custom</option>
              {toolTypes.map((tool) => <option key={tool.id} value={tool.id}>{tool.name}</option>)}
            </SelectInput>
          </Field>
          <Field label="Quantity">
            <TextInput type="number" step="0.01" {...form.register('quantity', { valueAsNumber: true })} />
          </Field>
          <Field label="Unit">
            <TextInput {...form.register('unit')} placeholder="Box, Each, Sheets" />
          </Field>
        </div>
        <Field label="Added For">
          <TextInput {...form.register('addedFor')} placeholder="Floating Shelves" />
        </Field>
        <Field label="Notes">
          <TextArea {...form.register('notes')} placeholder="Why this item matters or what to buy..." />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{item ? 'Save Item' : 'Add Item'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function priorityWeight(priority: WishlistItem['priority']) {
  return priority === 'High' ? 0 : priority === 'Medium' ? 1 : 2
}

function nextSortMode(current: (typeof sortModes)[number]) {
  const index = sortModes.indexOf(current)
  return sortModes[(index + 1) % sortModes.length]
}

function sortWishlistItems(a: WishlistItem, b: WishlistItem, sortMode: (typeof sortModes)[number]) {
  if (sortMode === 'Name') return a.name.localeCompare(b.name)
  if (sortMode === 'Status') return a.status.localeCompare(b.status) || priorityWeight(a.priority) - priorityWeight(b.priority)
  if (sortMode === 'Added') return b.createdAt.localeCompare(a.createdAt)
  return priorityWeight(a.priority) - priorityWeight(b.priority) || a.name.localeCompare(b.name)
}

function projectName(projects: Array<{ id: string; name: string }>, projectId?: string) {
  return projects.find((project) => project.id === projectId)?.name
}

function WishlistConversionModal({ item, materials, onClose }: { item?: WishlistItem; materials: Material[]; onClose: () => void }) {
  if (!item) return null
  if (item.itemType === 'Material') return <MaterialConversionModal item={item} materials={materials} onClose={onClose} />
  return <ToolConversionModal item={item} onClose={onClose} />
}

function ToolConversionModal({ item, onClose }: { item: WishlistItem; onClose: () => void }) {
  const form = useForm<WishlistToolConversionValues>({
    resolver: zodResolver(userToolFormSchema),
    defaultValues: {
      name: item.name,
      type: item.itemType,
      category: item.itemType === 'Accessory' ? 'Shop Equipment' : 'Custom',
      condition: 'New',
      storageLocation: 'Unassigned',
      powerType: 'Manual',
    },
  })

  useEffect(() => {
    let active = true
    void toolConversionDefaults(item).then((values) => {
      if (active) form.reset(values)
    })
    return () => {
      active = false
    }
  }, [form, item])

  async function submit(values: WishlistToolConversionValues) {
    await convertWishlistItemToInventory(item.id, { tool: values })
    onClose()
  }

  return (
    <Modal open title="Convert to My Tools" description="Review the inventory details before this purchase becomes an owned tool." onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tool Name" error={form.formState.errors.name?.message}>
            <TextInput {...form.register('name')} />
          </Field>
          <Field label="Tool Type" error={form.formState.errors.type?.message}>
            <TextInput {...form.register('type')} />
          </Field>
          <Field label="Brand">
            <TextInput {...form.register('brand')} placeholder="Optional" />
          </Field>
          <Field label="Model">
            <TextInput {...form.register('model')} placeholder="Optional" />
          </Field>
          <Field label="Category" error={form.formState.errors.category?.message}>
            <SelectInput {...form.register('category')}>
              {toolCategories.map((category) => <option key={category}>{category}</option>)}
            </SelectInput>
          </Field>
          <Field label="Condition" error={form.formState.errors.condition?.message}>
            <SelectInput {...form.register('condition')}>
              {toolConditions.map((condition) => <option key={condition}>{condition}</option>)}
            </SelectInput>
          </Field>
          <Field label="Power Type" error={form.formState.errors.powerType?.message}>
            <SelectInput {...form.register('powerType')}>
              {powerTypes.map((powerType) => <option key={powerType}>{powerType}</option>)}
            </SelectInput>
          </Field>
          <Field label="Storage Location" error={form.formState.errors.storageLocation?.message}>
            <TextInput {...form.register('storageLocation')} />
          </Field>
          <Field label="Battery Platform">
            <TextInput {...form.register('batteryPlatform')} placeholder="Optional" />
          </Field>
          <Field label="Purchase Year">
            <TextInput type="number" {...form.register('purchaseYear', { setValueAs: (value) => value === '' ? undefined : Number(value) })} placeholder="Optional" />
          </Field>
        </div>
        <Field label="Notes">
          <TextArea {...form.register('notes')} />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Convert Tool</Button>
        </div>
      </form>
    </Modal>
  )
}

function MaterialConversionModal({ item, materials, onClose }: { item: WishlistItem; materials: Material[]; onClose: () => void }) {
  const form = useForm<WishlistMaterialConversionValues>({
    resolver: zodResolver(wishlistMaterialConversionSchema),
    defaultValues: materialConversionDefaults(item),
    values: materialConversionDefaults(item),
  })
  const existingMaterialId = useWatch({ control: form.control, name: 'existingMaterialId' })

  async function submit(values: WishlistMaterialConversionValues) {
    await convertWishlistItemToInventory(item.id, { material: values })
    onClose()
  }

  return (
    <Modal open title="Convert to Materials" description="Add this purchase as new stock or merge it into an existing material." onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
        <Field label="Add to Existing Material">
          <SelectInput {...form.register('existingMaterialId')}>
            <option value="">Create new material</option>
            {materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
          </SelectInput>
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Material Name" error={form.formState.errors.name?.message}>
            <TextInput {...form.register('name')} disabled={Boolean(existingMaterialId)} />
          </Field>
          <Field label="Category" error={form.formState.errors.category?.message}>
            <TextInput {...form.register('category')} disabled={Boolean(existingMaterialId)} />
          </Field>
          <Field label="Quantity" error={form.formState.errors.quantity?.message}>
            <TextInput type="number" step="0.01" {...form.register('quantity', { valueAsNumber: true })} />
          </Field>
          <Field label="Unit" error={form.formState.errors.unit?.message}>
            <TextInput {...form.register('unit')} />
          </Field>
          <Field label="Minimum Desired" error={form.formState.errors.minimumDesired?.message}>
            <TextInput type="number" step="0.01" {...form.register('minimumDesired', { valueAsNumber: true })} disabled={Boolean(existingMaterialId)} />
          </Field>
          <Field label="Storage Location" error={form.formState.errors.storageLocation?.message}>
            <TextInput {...form.register('storageLocation')} disabled={Boolean(existingMaterialId)} />
          </Field>
        </div>
        <Field label="Notes">
          <TextArea {...form.register('notes')} disabled={Boolean(existingMaterialId)} />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{existingMaterialId ? 'Add Stock' : 'Create Material'}</Button>
        </div>
      </form>
    </Modal>
  )
}
