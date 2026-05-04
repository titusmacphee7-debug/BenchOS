import { ArrowLeft, Heart, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { StatusPill } from '../../components/ui/StatusPill'
import { addMissingTemplateItemsToWishlist, createProjectFromTemplate } from '../../data/actions'
import { useActiveMaterials, useActiveUserTools, useAllToolTypeCapabilities, useProjectTemplateData } from '../../data/hooks'
import { calculateProjectTemplateReadiness } from '../../lib/projects/projectTemplateReadiness'

export function ProjectTemplateDetailPage() {
  const navigate = useNavigate()
  const { templateId } = useParams()
  const { templates, requirements } = useProjectTemplateData()
  const tools = useActiveUserTools()
  const materials = useActiveMaterials()
  const toolTypeCapabilities = useAllToolTypeCapabilities()
  const [notice, setNotice] = useState('')
  const template = templates.find((item) => item.id === templateId)
  const templateRequirements = useMemo(
    () => requirements.filter((requirement) => requirement.templateId === templateId).sort((a, b) => a.sortOrder - b.sortOrder),
    [requirements, templateId],
  )
  const readiness = useMemo(() => template ? calculateProjectTemplateReadiness({
    template,
    requirements: templateRequirements,
    userTools: tools,
    materials,
    toolTypeCapabilities,
  }) : undefined, [materials, template, templateRequirements, toolTypeCapabilities, tools])

  if (!template) return <Navigate to="/project-templates" replace />

  async function handleCreateProject() {
    if (!template) return
    const project = await createProjectFromTemplate(template, templateRequirements)
    navigate(`/projects/${project.id}`)
  }

  async function handleWishlist() {
    if (!template || !readiness) return
    const created = await addMissingTemplateItemsToWishlist(template, readiness.missingTools, readiness.missingMaterials)
    setNotice(created.length > 0 ? `Added ${created.length} missing item${created.length === 1 ? '' : 's'} to Wishlist.` : 'Those missing items are already on the Wishlist.')
  }

  const missingCount = (readiness?.missingTools.length ?? 0) + (readiness?.missingMaterials.length ?? 0)

  return (
    <div className="grid gap-5">
      {notice && (
        <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-xl border border-bench-green/40 bg-bench-green/15 px-5 py-3 text-sm font-semibold text-bench-green shadow-panel">
          {notice}
        </div>
      )}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/project-templates" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-bench-muted hover:text-bench-text">
            <ArrowLeft size={16} /> Project Templates
          </Link>
          <h1 className="text-3xl font-bold text-bench-text">{template.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-bench-muted">{template.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" icon={<Heart size={16} />} onClick={() => void handleWishlist()} disabled={missingCount === 0}>Add Missing to Wishlist</Button>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => void handleCreateProject()}>Create Project</Button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_.85fr]">
        <Card>
          <CardTitle title="Template Requirements" />
          <div className="grid gap-3">
            {templateRequirements.map((requirement) => (
              <div key={requirement.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-bench-border bg-white/[0.025] p-3">
                <div>
                  <p className="font-semibold text-bench-text">{requirement.displayName}</p>
                  <p className="mt-1 text-xs text-bench-muted">{requirement.group} - {requirement.requirementKind}{requirement.quantity ? ` - ${requirement.quantity} ${requirement.unit ?? ''}` : ''}</p>
                </div>
                <StatusPill label={requirement.required ? 'Required' : 'Optional'} tone={requirement.required ? 'orange' : 'muted'} />
              </div>
            ))}
          </div>
        </Card>
        <div className="grid gap-5">
          <Card>
            <CardTitle title="Readiness" />
            <div className="flex flex-wrap gap-2">
              <StatusPill label={readiness?.status ?? 'Checking'} tone={readiness?.status === 'Buildable Now' ? 'green' : readiness?.status === 'Almost Buildable' ? 'yellow' : 'red'} />
              <StatusPill label={`${missingCount} missing`} tone={missingCount === 0 ? 'green' : 'orange'} />
              <StatusPill label={template.difficulty} tone={template.difficulty === 'Easy' ? 'green' : template.difficulty === 'Moderate' ? 'yellow' : 'red'} />
            </div>
            <div className="mt-4 grid gap-2 text-sm text-bench-muted">
              {[...(readiness?.missingTools ?? []), ...(readiness?.missingMaterials ?? [])].slice(0, 8).map((item) => (
                <p key={item.requirementId} className="rounded-lg border border-bench-border bg-white/[0.025] px-3 py-2">{item.name}</p>
              ))}
              {missingCount === 0 && <p className="text-bench-green">Your current workshop can handle the required pieces.</p>}
            </div>
          </Card>
          <Card>
            <CardTitle title="Build Steps" />
            <ol className="grid gap-2 text-sm text-bench-muted">
              {template.steps.map((step, index) => (
                <li key={step} className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
                  <span className="mr-2 font-bold text-bench-orange">{index + 1}.</span>{step}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}
