import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2, ClipboardCheck, ClipboardList, Edit3, Heart, Package, Plus, Trash2, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { MaterialUsageFormModal } from '../../components/logging/MaterialUsageFormModal'
import { ToolUsageFormModal } from '../../components/logging/ToolUsageFormModal'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { Field, SelectInput, TextArea, TextInput } from '../../components/ui/FormControls'
import { IconTile } from '../../components/ui/IconTile'
import { Modal } from '../../components/ui/Modal'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatusPill } from '../../components/ui/StatusPill'
import {
  addMissingItemsToWishlist,
  archiveProjectRequirement,
  createProjectRequirement,
  projectDefaults,
  projectFormSchema,
  projectRequirementFormSchema,
  requirementDefaults,
  setProjectStepCompleted,
  updateProject,
  updateProjectRequirement,
} from '../../data/actions'
import {
  useActiveMaterials,
  useActiveProjects,
  useActiveUserTools,
  useProjectActivity,
  useProjectRequirements,
  useProjectSteps,
  useToolLibraryData,
} from '../../data/hooks'
import type { Project, ProjectFormValues, ProjectRequirement, ProjectRequirementFormValues, RequirementKind } from '../../data/schema'
import { projectStatuses, requirementKinds, toolCategories } from '../../data/schema'
import { calculateReadinessConfidence } from '../../lib/benchxp/readinessConfidence'
import { useBenchXp } from '../../lib/benchxp/useBenchXp'
import { calculateProjectReadiness } from '../../lib/readiness/readinessEngine'
import { readinessTone } from '../../lib/utils/status'

export function ProjectDetailPage() {
  const { projectId } = useParams()
  const projects = useActiveProjects()
  const project = projects.find((item) => item.id === projectId)
  const requirements = useProjectRequirements(project?.id)
  const steps = useProjectSteps(project?.id)
  const activity = useProjectActivity(project?.id)
  const userTools = useActiveUserTools()
  const materials = useActiveMaterials()
  const { items: toolTypes, capabilities, typeCapabilities } = useToolLibraryData()
  const benchXp = useBenchXp()
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [requirementModalOpen, setRequirementModalOpen] = useState(false)
  const [toolUsageModalOpen, setToolUsageModalOpen] = useState(false)
  const [materialUsageModalOpen, setMaterialUsageModalOpen] = useState(false)
  const [requirementModalItem, setRequirementModalItem] = useState<ProjectRequirement | undefined>()
  const [newRequirementKind, setNewRequirementKind] = useState<RequirementKind>('ToolType')

  const readiness = useMemo(() => project
    ? calculateProjectReadiness({ project, requirements, userTools, materials, toolTypeCapabilities: typeCapabilities })
    : undefined,
  [materials, project, requirements, typeCapabilities, userTools])
  const readinessConfidence = useMemo(() => calculateReadinessConfidence({
    requirements,
    ownedToolTypeIds: userTools.map((tool) => tool.toolTypeId).filter((toolTypeId): toolTypeId is string => Boolean(toolTypeId)),
    progress: benchXp.state.progress,
  }), [benchXp.state.progress, requirements, userTools])

  if (!project || !readiness) {
    return (
      <Card>
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-bench-muted hover:text-bench-text">
          <ArrowLeft size={16} />
          Back to Projects
        </Link>
        <p className="mt-4 text-bench-muted">Project not found.</p>
      </Card>
    )
  }

  const toolRequirements = requirements.filter((requirement) => requirement.requirementKind !== 'Material')
  const materialRequirements = requirements.filter((requirement) => requirement.requirementKind === 'Material')
  const missingItems = [...readiness.missingTools, ...readiness.missingMaterials]

  return (
    <div>
      <Link to="/projects" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-bench-muted hover:text-bench-text">
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      <div className="mb-6 grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <IconTile icon={ClipboardList} tone="orange" size="lg" />
                <div>
                  <h1 className="text-3xl font-bold text-bench-text">{project.name}</h1>
                  <p className="mt-1 text-bench-muted">{project.description}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill label={project.status} tone="blue" />
                <StatusPill label={readiness.status} tone={readinessTone(readiness.status)} />
                {project.tags.map((tag) => <StatusPill key={tag} label={tag} tone="purple" />)}
              </div>
            </div>
            <div className="min-w-60">
              <div className="flex items-center justify-between text-sm">
                <span className="text-bench-muted">Progress</span>
                <span className="font-semibold">{project.progress}%</span>
              </div>
              <ProgressBar className="mt-2" value={project.progress} tone="orange" />
              <p className="mt-3 text-sm text-bench-muted">Updated {new Date(project.updatedAt).toLocaleDateString()}</p>
              <div className="mt-4 grid gap-2">
                <Button icon={<Edit3 size={16} />} onClick={() => setProjectModalOpen(true)}>Edit Project</Button>
                <Button icon={<Wrench size={16} />} onClick={() => setToolUsageModalOpen(true)}>Log Tool Use</Button>
                <Button icon={<Package size={16} />} onClick={() => setMaterialUsageModalOpen(true)}>Log Material Usage</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-bench-orange/35">
          <CardTitle title="Readiness Panel" />
          <div className="flex items-center gap-4">
            <IconTile icon={readiness.status === 'Buildable Now' ? CheckCircle2 : ClipboardCheck} tone={readinessTone(readiness.status)} size="lg" />
            <div>
              <StatusPill label={readiness.status} tone={readinessTone(readiness.status)} />
              <p className="mt-2 text-sm text-bench-muted">{readinessSummary(readiness)}</p>
            </div>
          </div>
          {readiness.cautions.length > 0 && (
            <div className="mt-4 rounded-lg border border-bench-yellow/30 bg-bench-yellow/10 p-3 text-sm text-bench-yellow">
              {readiness.cautions[0]}
            </div>
          )}
          {readinessConfidence.warnings.length > 0 && (
            <div className="mt-4 rounded-lg border border-bench-yellow/30 bg-bench-yellow/10 p-3 text-sm text-bench-yellow">
              <p className="font-semibold">Balanced Warning</p>
              <p className="mt-1">{readinessConfidence.warnings[0].title}</p>
            </div>
          )}
          {readinessConfidence.weakestLink && (
            <p className="mt-3 text-xs text-bench-muted">Weakest BenchXP signal: {readinessConfidence.weakestLink.detail}</p>
          )}
          <Button
            className="mt-5 w-full"
            variant="outline"
            icon={<Heart size={17} />}
            onClick={() => void addMissingItemsToWishlist(project, [...readiness.missingTools, ...readiness.optionalMissingTools], [...readiness.missingMaterials, ...readiness.optionalMissingMaterials])}
          >
            Add Missing Items to Wishlist
          </Button>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_.9fr]">
        <Card>
          <CardTitle title="Required Tools and Capabilities" action={<Button size="sm" icon={<Plus size={16} />} onClick={() => { setNewRequirementKind('ToolType'); setRequirementModalItem(undefined); setRequirementModalOpen(true) }}>Add Requirement</Button>} />
          <div className="space-y-3">
            {toolRequirements.map((requirement) => (
              <RequirementRow
                key={requirement.id}
                requirement={requirement}
                missing={readiness.missingTools.some((item) => item.requirementId === requirement.id) || readiness.optionalMissingTools.some((item) => item.requirementId === requirement.id)}
                onEdit={() => { setRequirementModalItem(requirement); setRequirementModalOpen(true) }}
              />
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle title="Required Materials" action={<Button size="sm" icon={<Plus size={16} />} onClick={() => { setNewRequirementKind('Material'); setRequirementModalItem(undefined); setRequirementModalOpen(true) }}>Add Material</Button>} />
          <div className="space-y-3">
            {materialRequirements.map((requirement) => {
              const missing = [...readiness.missingMaterials, ...readiness.optionalMissingMaterials].find((item) => item.requirementId === requirement.id)
              return (
                <RequirementRow
                  key={requirement.id}
                  requirement={requirement}
                  missing={Boolean(missing)}
                  detail={missing ? `${missing.onHand} on hand, short ${missing.shortage}` : `${requirement.quantity ?? 1} ${requirement.unit ?? ''}`}
                  onEdit={() => { setRequirementModalItem(requirement); setRequirementModalOpen(true) }}
                />
              )
            })}
          </div>
        </Card>

        <Card>
          <CardTitle title="Build Steps" />
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => void setProjectStepCompleted(step.id, !step.completed)}
              className="flex w-full items-center gap-3 border-b border-bench-border/70 py-3 text-left last:border-b-0"
            >
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${step.completed ? 'border-bench-green/40 bg-bench-green/10 text-bench-green' : 'border-bench-border text-bench-muted'}`}>
                {step.sortOrder}
              </span>
              <span className={step.completed ? 'text-bench-text' : 'text-bench-muted'}>{step.title}</span>
            </button>
          ))}
        </Card>

        <Card>
          <CardTitle title="Missing Items" />
          {missingItems.length > 0 ? (
            <div className="space-y-3">
              {readiness.missingTools.map((missing) => <MissingRow key={missing.requirementId} name={missing.name} detail={missing.notes ?? 'Required tool is missing.'} />)}
              {readiness.missingMaterials.map((missing) => <MissingRow key={missing.requirementId} name={missing.name} detail={`Short ${missing.shortage} ${missing.unit ?? ''}`.trim()} />)}
            </div>
          ) : (
            <p className="text-sm text-bench-muted">No required blockers found.</p>
          )}
        </Card>

        <Card className="xl:col-span-2">
          <CardTitle title="Activity" />
          <div className="grid gap-3 md:grid-cols-2">
            {activity.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-lg border border-bench-border bg-white/[0.025] p-3 text-sm">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-bench-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <RequirementFormModal
        open={requirementModalOpen}
        requirement={requirementModalItem}
        initialKind={newRequirementKind}
        projectId={project.id}
        toolTypes={toolTypes}
        capabilities={capabilities}
        materials={materials}
        onClose={() => { setRequirementModalOpen(false); setRequirementModalItem(undefined) }}
      />
      <ProjectFormModal open={projectModalOpen} project={project} onClose={() => setProjectModalOpen(false)} />
      <ToolUsageFormModal open={toolUsageModalOpen} defaultProjectId={project.id} onClose={() => setToolUsageModalOpen(false)} />
      <MaterialUsageFormModal open={materialUsageModalOpen} defaultProjectId={project.id} onClose={() => setMaterialUsageModalOpen(false)} />
    </div>
  )
}

function RequirementRow({ requirement, missing, detail, onEdit }: { requirement: ProjectRequirement; missing: boolean; detail?: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-bench-border bg-white/[0.025] p-4">
      <div className="flex min-w-0 items-center gap-3">
        <IconTile icon={requirement.requirementKind === 'Material' ? Package : Wrench} size="sm" tone={missing ? 'red' : 'green'} />
        <div>
          <p className="font-semibold text-bench-text">{requirement.displayName}</p>
          <p className="text-sm text-bench-muted">{detail ?? `${requirement.requirementKind} ${requirement.required ? 'required' : 'optional'}`}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusPill label={missing ? 'Missing' : 'Satisfied'} tone={missing ? 'red' : 'green'} />
        <Button size="icon" variant="secondary" aria-label="Edit requirement" onClick={onEdit}><Edit3 size={16} /></Button>
        <Button size="icon" variant="ghost" aria-label="Archive requirement" onClick={() => void archiveProjectRequirement(requirement.id)}><Trash2 size={16} /></Button>
      </div>
    </div>
  )
}

function MissingRow({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-bench-red/25 bg-bench-red/5 p-4">
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-bench-muted">{detail}</p>
      </div>
      <Heart className="text-bench-orange" size={18} />
    </div>
  )
}

function RequirementFormModal({
  open,
  requirement,
  initialKind,
  projectId,
  toolTypes,
  capabilities,
  materials,
  onClose,
}: {
  open: boolean
  requirement?: ProjectRequirement
  initialKind: RequirementKind
  projectId: string
  toolTypes: Array<{ id: string; name: string; category: string }>
  capabilities: Array<{ id: string; name: string }>
  materials: Array<{ id: string; name: string; category: string; unit: string }>
  onClose: () => void
}) {
  const defaultValues = requirement ? requirementDefaults(requirement) : { ...requirementDefaults(), requirementKind: initialKind }
  const form = useForm<ProjectRequirementFormValues>({
    resolver: zodResolver(projectRequirementFormSchema),
    defaultValues,
    values: defaultValues,
  })
  const requirementKind = useWatch({ control: form.control, name: 'requirementKind' }) as RequirementKind
  const required = useWatch({ control: form.control, name: 'required' })
  const selectedToolTypeId = useWatch({ control: form.control, name: 'toolTypeId' })
  const selectedCapabilityId = useWatch({ control: form.control, name: 'capabilityId' })
  const selectedCategory = useWatch({ control: form.control, name: 'category' })
  const selectedMaterialId = useWatch({ control: form.control, name: 'materialId' })

  async function submit(values: ProjectRequirementFormValues) {
    if (requirement) await updateProjectRequirement(requirement.id, values)
    else await createProjectRequirement(projectId, values)
    form.reset(requirementDefaults())
    onClose()
  }

  return (
    <Modal open={open} title={requirement ? 'Edit Requirement' : 'Add Requirement'} description="Add a tool, capability, category, or material need." onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Requirement Kind">
            <SelectInput {...form.register('requirementKind')}>
              {requirementKinds.map((kind) => <option key={kind}>{kind}</option>)}
            </SelectInput>
          </Field>
          <Field label="Required?">
            <SelectInput value={required ? 'Required' : 'Optional'} onChange={(event) => form.setValue('required', event.target.value === 'Required')}>
              <option>Required</option>
              <option>Optional</option>
            </SelectInput>
          </Field>
          {requirementKind === 'ToolType' && (
            <Field label="Tool Type">
              <SelectInput value={selectedToolTypeId ?? ''} onChange={(event) => {
                const tool = toolTypes.find((item) => item.id === event.target.value)
                form.setValue('toolTypeId', event.target.value)
                form.setValue('displayName', tool?.name ?? '')
                form.setValue('category', tool?.category ?? '')
              }}>
                <option value="">Choose tool</option>
                {toolTypes.map((tool) => <option key={tool.id} value={tool.id}>{tool.name}</option>)}
              </SelectInput>
            </Field>
          )}
          {requirementKind === 'Capability' && (
            <Field label="Capability">
              <SelectInput value={selectedCapabilityId ?? ''} onChange={(event) => {
                const capability = capabilities.find((item) => item.id === event.target.value)
                form.setValue('capabilityId', event.target.value)
                form.setValue('displayName', capability?.name ?? '')
              }}>
                <option value="">Choose capability</option>
                {capabilities.map((capability) => <option key={capability.id} value={capability.id}>{capability.name}</option>)}
              </SelectInput>
            </Field>
          )}
          {requirementKind === 'ToolCategory' && (
            <Field label="Tool Category">
              <SelectInput value={selectedCategory ?? ''} onChange={(event) => {
                form.setValue('category', event.target.value)
                form.setValue('displayName', `Any ${event.target.value}`)
              }}>
                <option value="">Choose category</option>
                {toolCategories.map((category) => <option key={category}>{category}</option>)}
              </SelectInput>
            </Field>
          )}
          {requirementKind === 'Material' && (
            <Field label="Existing Material">
              <SelectInput value={selectedMaterialId ?? ''} onChange={(event) => {
                const material = materials.find((item) => item.id === event.target.value)
                form.setValue('materialId', event.target.value)
                form.setValue('displayName', material?.name ?? '')
                form.setValue('category', material?.category ?? '')
                form.setValue('unit', material?.unit ?? '')
              }}>
                <option value="">Typed / not tracked yet</option>
                {materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
              </SelectInput>
            </Field>
          )}
          <Field label="Display Name" error={form.formState.errors.displayName?.message}>
            <TextInput {...form.register('displayName')} placeholder="Circular Saw or 3/4 inch Plywood" />
          </Field>
          {requirementKind === 'Material' && (
            <>
              <Field label="Quantity">
                <TextInput type="number" step="0.01" {...form.register('quantity', { valueAsNumber: true })} />
              </Field>
              <Field label="Unit">
                <TextInput {...form.register('unit')} placeholder="Pieces, Sheets, Box" />
              </Field>
            </>
          )}
        </div>
        <Field label="Notes">
          <TextArea {...form.register('notes')} placeholder="Alternatives, safety notes, or buying context..." />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{requirement ? 'Save Requirement' : 'Add Requirement'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function ProjectFormModal({ open, project, onClose }: { open: boolean; project: Project; onClose: () => void }) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: projectDefaults(project),
    values: projectDefaults(project),
  })

  async function submit(values: ProjectFormValues) {
    await updateProject(project.id, values)
    onClose()
  }

  return (
    <Modal open={open} title="Edit Project" description="Update project status, progress, tags, and description." onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Project Name" error={form.formState.errors.name?.message}>
            <TextInput {...form.register('name')} placeholder="Floating Shelves" />
          </Field>
          <Field label="Status">
            <SelectInput {...form.register('status')}>
              {projectStatuses.map((status) => <option key={status}>{status}</option>)}
            </SelectInput>
          </Field>
          <Field label="Progress">
            <TextInput type="number" min="0" max="100" {...form.register('progress', { valueAsNumber: true })} />
          </Field>
          <Field label="Category">
            <TextInput {...form.register('category')} placeholder="Furniture" />
          </Field>
        </div>
        <Field label="Description">
          <TextArea {...form.register('description')} placeholder="What are you building?" />
        </Field>
        <Field label="Tags">
          <TextInput {...form.register('tagsText')} placeholder="Indoor, Storage, Shelving" />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Project</Button>
        </div>
      </form>
    </Modal>
  )
}

function readinessSummary(readiness: NonNullable<ReturnType<typeof calculateProjectReadiness>>) {
  if (readiness.status === 'Buildable Now') return 'All required tools and materials are available.'
  if (readiness.status === 'Almost Buildable') return 'Required items are ready; optional items are missing.'
  if (readiness.status === 'Missing Tools') return `${readiness.missingTools.length} required tool item(s) missing.`
  if (readiness.status === 'Missing Materials') return `${readiness.missingMaterials.length} material item(s) missing or short.`
  return 'Required tools and materials are both missing.'
}
