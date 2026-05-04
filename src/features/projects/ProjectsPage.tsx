import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Briefcase, CalendarClock, ClipboardList, Edit3, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { Field, SelectInput, TextArea, TextInput } from '../../components/ui/FormControls'
import { IconTile } from '../../components/ui/IconTile'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatCard } from '../../components/ui/StatCard'
import { StatusPill } from '../../components/ui/StatusPill'
import { archiveProject, createProject, projectDefaults, projectFormSchema, updateProject } from '../../data/actions'
import { useActiveMaterials, useActiveProjects, useActiveUserTools, useAllProjectRequirements, useToolLibraryData } from '../../data/hooks'
import type { Project, ProjectFormValues, ReadinessResult } from '../../data/schema'
import { projectStatuses } from '../../data/schema'
import { calculateProjectReadiness } from '../../lib/readiness/readinessEngine'
import { readinessTone } from '../../lib/utils/status'

const tabs = ['All Projects', 'In Progress', 'Planning', 'On Hold', 'Completed']
const sortModes = ['Updated', 'Progress', 'Name'] as const

type ProjectWithReadiness = Project & { readiness: ReadinessResult }

export function ProjectsPage() {
  const navigate = useNavigate()
  const projects = useActiveProjects()
  const requirements = useAllProjectRequirements()
  const userTools = useActiveUserTools()
  const materials = useActiveMaterials()
  const { typeCapabilities } = useToolLibraryData()
  const [activeTab, setActiveTab] = useState('All Projects')
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<(typeof sortModes)[number]>('Updated')
  const [modalProject, setModalProject] = useState<Project | undefined>()
  const [modalOpen, setModalOpen] = useState(false)

  const projectRows = useMemo<ProjectWithReadiness[]>(() => projects.map((project) => ({
    ...project,
    readiness: calculateProjectReadiness({
      project,
      requirements: requirements.filter((requirement) => requirement.projectId === project.id),
      userTools,
      materials,
      toolTypeCapabilities: typeCapabilities,
    }),
  })), [materials, projects, requirements, typeCapabilities, userTools])

  const filteredProjects = projectRows
    .filter((project) => activeTab === 'All Projects' || project.status === activeTab)
    .filter((project) => [project.name, project.description, project.category, project.tags.join(' ')].join(' ').toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sortProjects(a, b, sortMode))

  const inProgress = projects.filter((project) => project.status === 'In Progress').length
  const completed = projects.filter((project) => project.status === 'Completed').length
  const onHold = projects.filter((project) => project.status === 'On Hold').length

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Organize builds, track progress, and see what each project needs before you start."
        icon={ClipboardList}
        actions={<Button variant="primary" icon={<Plus size={18} />} onClick={() => { setModalProject(undefined); setModalOpen(true) }}>New Project</Button>}
      />

      <div className="grid gap-5 2xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
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
              <div className="flex flex-wrap gap-3">
                <label className="relative min-w-64">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-bench-muted" size={18} />
                  <input
                    className="h-11 w-full rounded-lg border border-bench-border bg-white/[0.035] pl-11 pr-4 text-sm outline-none placeholder:text-bench-muted focus:border-bench-orange/70"
                    placeholder="Search projects..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <Button onClick={() => setSortMode(nextSortMode(sortMode))}>Sort: {sortMode}</Button>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="panel-surface grid gap-4 rounded-xl p-4 transition hover:border-bench-orange/55 md:grid-cols-[1.4fr_.75fr_1fr_.9fr_auto]"
              >
                <Link to={`/projects/${project.id}`} className="flex min-w-0 items-center gap-4">
                  <IconTile icon={Briefcase} size="lg" tone={project.status === 'Completed' ? 'green' : 'orange'} />
                  <div className="min-w-0">
                    <p className="font-semibold text-bench-text">{project.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-bench-muted">{project.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.tags.map((tag) => <StatusPill key={tag} label={tag} tone="blue" />)}
                    </div>
                  </div>
                </Link>
                <div className="flex flex-col justify-center gap-2">
                  <StatusPill label={project.status} tone={project.status === 'Completed' ? 'green' : project.status === 'On Hold' ? 'yellow' : 'blue'} />
                  <StatusPill label={project.readiness.status} tone={readinessTone(project.readiness.status)} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-10 font-semibold">{project.progress}%</span>
                  <ProgressBar value={project.progress} tone={project.progress === 100 ? 'green' : 'orange'} />
                </div>
                <div className="text-sm text-bench-muted">
                  <p>{new Date(project.updatedAt).toLocaleDateString()}</p>
                  <p>{nextStepLabel(project.readiness)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="secondary" aria-label="Edit project" onClick={() => { setModalProject(project); setModalOpen(true) }}><Edit3 size={16} /></Button>
                  <Button size="icon" variant="secondary" aria-label="Archive project" onClick={() => { if (window.confirm(`Archive ${project.name}?`)) void archiveProject(project.id) }}><Trash2 size={16} /></Button>
                  <Button size="icon" variant="ghost" aria-label="Open project details" onClick={() => navigate(`/projects/${project.id}`)}><ArrowRight size={18} /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={ClipboardList} label="Total Projects" value={projects.length} detail="Across the workshop" tone="orange" />
            <StatCard icon={ArrowRight} label="In Progress" value={inProgress} detail="Active builds" tone="blue" />
            <StatCard icon={Briefcase} label="Completed" value={completed} detail="Finished projects" tone="green" />
            <StatCard icon={CalendarClock} label="On Hold" value={onHold} detail="Waiting on decisions" tone="yellow" />
          </div>

          <Card>
            <CardTitle title="Readiness Summary" />
            {['Buildable Now', 'Almost Buildable', 'Missing Tools', 'Missing Materials', 'Blocked'].map((status) => (
              <div key={status} className="mt-3 flex items-center justify-between text-sm">
                <StatusPill label={status} tone={readinessTone(status)} />
                <span className="font-semibold">{projectRows.filter((project) => project.readiness.status === status).length}</span>
              </div>
            ))}
          </Card>

          <Card>
            <CardTitle title="Top Categories" />
            {categoryCounts(projects).map(([label, value]) => (
              <div key={label} className="mt-3 flex items-center gap-3">
                <span className="w-28 text-sm text-bench-muted">{label}</span>
                <ProgressBar value={(value / Math.max(1, projects.length)) * 100} tone="orange" />
                <span className="w-8 text-right text-sm">{value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <ProjectFormModal open={modalOpen} project={modalProject} onClose={() => setModalOpen(false)} />
    </div>
  )
}

function ProjectFormModal({ open, project, onClose }: { open: boolean; project?: Project; onClose: () => void }) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: projectDefaults(project),
    values: projectDefaults(project),
  })

  async function submit(values: ProjectFormValues) {
    if (project) await updateProject(project.id, values)
    else await createProject(values)
    onClose()
  }

  return (
    <Modal open={open} title={project ? 'Edit Project' : 'New Project'} description="Create a build and BenchOS will track readiness." onClose={onClose}>
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
          <Button type="submit" variant="primary">{project ? 'Save Project' : 'Create Project'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function nextStepLabel(readiness: ReadinessResult) {
  if (readiness.status === 'Buildable Now') return 'Ready to build'
  if (readiness.missingTools.length > 0) return `Need ${readiness.missingTools[0].name}`
  if (readiness.missingMaterials.length > 0) return `Need ${readiness.missingMaterials[0].name}`
  return 'Optional items missing'
}

function categoryCounts(projects: Project[]) {
  const counts = new Map<string, number>()
  for (const project of projects) counts.set(project.category ?? 'Other', (counts.get(project.category ?? 'Other') ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
}

function nextSortMode(current: (typeof sortModes)[number]) {
  const index = sortModes.indexOf(current)
  return sortModes[(index + 1) % sortModes.length]
}

function sortProjects(a: ProjectWithReadiness, b: ProjectWithReadiness, sortMode: (typeof sortModes)[number]) {
  if (sortMode === 'Progress') return b.progress - a.progress || b.updatedAt.localeCompare(a.updatedAt)
  if (sortMode === 'Name') return a.name.localeCompare(b.name)
  return b.updatedAt.localeCompare(a.updatedAt)
}
