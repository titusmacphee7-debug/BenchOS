import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Card, CardTitle } from '../../components/ui/Card'
import { StatusPill } from '../../components/ui/StatusPill'
import { useMasteryGuides, useToolCatalogData, useToolGuideSections } from '../../data/hooks'
import { resolveToolGuide } from '../../lib/guides/toolGuideLookup'

export function ToolGuidePage() {
  const { toolTypeId } = useParams()
  const { items } = useToolCatalogData()
  const guideSections = useToolGuideSections()
  const masteryGuides = useMasteryGuides()
  if (!toolTypeId) return <Navigate to="/tool-library" replace />
  const tool = items.find((item) => item.internalToolTypeId === toolTypeId)
  const guide = resolveToolGuide(toolTypeId, guideSections, masteryGuides)
  if (!guide && !tool) return <Navigate to="/tool-library" replace />
  const title = tool?.toolType.name ?? masteryGuides.find((item) => item.toolTypeId === toolTypeId)?.toolName ?? toolTypeId
  const sections = guide?.sections ?? []

  return (
    <div className="grid gap-5">
      <section>
        <Link to="/tool-library" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-bench-muted hover:text-bench-text">
          <ArrowLeft size={16} /> Tool Library
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-bench-text">{title} Guide</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-bench-muted">
              Concise, practical guidance connected to readiness, accessories, consumables, and BenchXP.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill label={guide?.source === 'deep-guide' ? 'Deep Guide' : 'Mastery Fallback'} tone="orange" />
            {tool && <StatusPill label={tool.toolType.category} tone="blue" />}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit">
          <CardTitle title="Sections" />
          <nav className="grid gap-2 text-sm">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="flex items-center gap-2 rounded-lg border border-bench-border bg-white/[0.025] px-3 py-2 text-bench-muted hover:border-bench-orange/45 hover:text-bench-text">
                <BookOpen size={15} /> {section.title}
              </a>
            ))}
          </nav>
        </Card>
        <div className="grid gap-4">
          {sections.map((section) => (
            <Card key={section.id} id={section.id}>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 shrink-0 text-bench-orange" size={20} />
                <div>
                  <h2 className="text-xl font-semibold text-bench-text">{section.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-bench-muted">{section.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
