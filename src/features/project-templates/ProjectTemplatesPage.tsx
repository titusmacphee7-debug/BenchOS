import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StatusPill } from '../../components/ui/StatusPill'
import { createProjectFromTemplate } from '../../data/actions'
import { useActiveMaterials, useActiveUserTools, useAllToolTypeCapabilities, useProjectTemplateData, useWorkshopProfile } from '../../data/hooks'
import { sortTemplatesForWorkshop } from '../../lib/preferences/accountPersonalization'
import { getProjectsBuildableNow } from '../../lib/projects/projectsBuildableNow'

export function ProjectTemplatesPage() {
  const navigate = useNavigate()
  const { templates, requirements } = useProjectTemplateData()
  const tools = useActiveUserTools()
  const materials = useActiveMaterials()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const workshop = useWorkshopProfile()
  const toolTypeCapabilities = useAllToolTypeCapabilities()
  const grouped = useMemo(() => getProjectsBuildableNow({
    templates,
    requirements,
    userTools: tools,
    materials,
    toolTypeCapabilities,
  }), [materials, requirements, templates, toolTypeCapabilities, tools])
  const requirementByTemplateId = useMemo(() => groupBy(requirements, (requirement) => requirement.templateId), [requirements])
  const categories = useMemo(() => ['All', ...new Set(templates.map((template) => template.category))].sort(), [templates])
  const filteredTemplates = sortTemplatesForWorkshop(templates.filter((template) => {
    const text = `${template.name} ${template.description} ${template.category} ${template.tags.join(' ')}`.toLowerCase()
    if (category !== 'All' && template.category !== category) return false
    return !query.trim() || text.includes(query.trim().toLowerCase())
  }), workshop)
  const readinessByTemplateId = new Map([...grouped.buildableNow, ...grouped.almostBuildable, ...grouped.blocked].map((item) => [item.template.id, item.readiness]))

  async function handleCreate(templateId: string) {
    const template = templates.find((item) => item.id === templateId)
    if (!template) return
    const project = await createProjectFromTemplate(template, requirementByTemplateId.get(template.id) ?? [])
    navigate(`/projects/${project.id}`)
  }

  return (
    <div className="grid gap-5">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-bench-text">Project Template Library</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-bench-muted">
            Practical projects with tool, material, accessory, consumable, safety, and step data for BenchOS readiness.
          </p>
        </div>
      </section>

      <Card>
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <label className="relative block">
            <span className="sr-only">Search project templates</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bench-muted" size={16} />
            <input
              className="h-11 w-full rounded-lg border border-bench-border bg-white/[0.035] pl-9 pr-3 text-sm text-bench-text outline-none placeholder:text-bench-muted focus:border-bench-orange/70"
              placeholder="Search shelves, oil change, sink repair..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 rounded-lg border border-bench-border bg-bench-bg px-3 text-sm text-bench-text outline-none"
          >
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTemplates.map((template) => {
          const readiness = readinessByTemplateId.get(template.id)
          const reqs = requirementByTemplateId.get(template.id) ?? []
          return (
            <Card key={template.id} className="transition hover:-translate-y-0.5 hover:border-bench-orange/45">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-bench-text">{template.name}</h2>
                  <p className="mt-1 text-sm leading-6 text-bench-muted">{template.description}</p>
                </div>
                <StatusPill label={readiness?.status ?? 'Checking'} tone={readinessTone(readiness?.status)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill label={template.category} tone="blue" />
                <StatusPill label={template.difficulty} tone={template.difficulty === 'Easy' ? 'green' : template.difficulty === 'Moderate' ? 'yellow' : 'red'} />
                <StatusPill label={template.estimatedTime} tone="muted" />
                {workshop?.projectInterests?.some((interest) => `${template.name} ${template.description} ${template.category} ${template.tags.join(' ')}`.toLowerCase().includes(interest.toLowerCase())) && (
                  <StatusPill label="Matches interests" tone="orange" />
                )}
                {workshop?.skillLevel && template.suggestedSkillLevel !== workshop.skillLevel && (
                  <StatusPill label={`${template.suggestedSkillLevel} skill`} tone={template.suggestedSkillLevel === 'Advanced' ? 'red' : 'yellow'} />
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-bench-muted">
                <MiniStat label="Reqs" value={reqs.length} />
                <MiniStat label="Steps" value={template.steps.length} />
                <MiniStat label="Missing" value={(readiness?.missingTools.length ?? 0) + (readiness?.missingMaterials.length ?? 0)} />
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <Link to={`/project-templates/${template.id}`}><Button size="sm">Open</Button></Link>
                <Button size="sm" variant="outline" icon={<Plus size={15} />} onClick={() => void handleCreate(template.id)}>Create Project</Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-bench-border bg-white/[0.025] p-2">
      <p className="text-base font-bold text-bench-text">{value}</p>
      <p>{label}</p>
    </div>
  )
}

function readinessTone(status?: string): 'green' | 'yellow' | 'red' {
  if (status === 'Buildable Now') return 'green'
  if (status === 'Almost Buildable') return 'yellow'
  return 'red'
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  const grouped = new Map<string, T[]>()
  for (const item of items) grouped.set(getKey(item), [...(grouped.get(getKey(item)) ?? []), item])
  return grouped
}
