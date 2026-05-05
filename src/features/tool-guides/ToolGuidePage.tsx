import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  GraduationCap,
  Hammer,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Card, CardTitle } from '../../components/ui/Card'
import { IconTile } from '../../components/ui/IconTile'
import { StatusPill } from '../../components/ui/StatusPill'
import { useMasteryGuides, useToolCatalogData, useToolGuideSections } from '../../data/hooks'
import type { ToolGuideSection } from '../../data/schema'
import { getToolMasteryGuideContent, guideSectionsForMode, type GuideDepthMode, type ToolMasteryGuideContent } from '../../lib/guides/toolMasteryContent'
import { resolveToolGuide } from '../../lib/guides/toolGuideLookup'

const depthModes: Array<{ id: GuideDepthMode; label: string; description: string }> = [
  { id: 'quick', label: 'Quick Guide', description: 'Safety, setup, use, and common mistakes.' },
  { id: 'full', label: 'Full Guide', description: 'Complete reference for practice and projects.' },
  { id: 'shop-card', label: 'Shop Card', description: 'Compact checklist for project work.' },
]

const sectionIcons: Record<string, LucideIcon> = {
  Overview: BookOpen,
  'Best Uses': CheckCircle2,
  'When Not To Use It': AlertTriangle,
  PPE: ShieldCheck,
  'Safety First': ShieldCheck,
  Setup: Hammer,
  'Basic Use': Wrench,
  'Common Mistakes': AlertTriangle,
  Accessories: PackageCheck,
  Consumables: PackageCheck,
  Maintenance: ClipboardCheck,
  Comparisons: Gauge,
  Substitutions: Gauge,
  'Project Examples': Wrench,
  'Buying Notes': ShoppingCart,
  Troubleshooting: AlertTriangle,
  'Storage + Care': PackageCheck,
  'Shop Card Checklist': ClipboardCheck,
  'Readiness Warnings': Gauge,
  'Practice Task': GraduationCap,
}

export function ToolGuidePage() {
  const { toolTypeId } = useParams()
  const { items } = useToolCatalogData()
  const guideSections = useToolGuideSections()
  const masteryGuides = useMasteryGuides()
  const [depthMode, setDepthMode] = useState<GuideDepthMode>('quick')

  if (!toolTypeId) return <Navigate to="/tool-library" replace />

  const tool = items.find((item) => item.internalToolTypeId === toolTypeId)
  const legacyGuide = resolveToolGuide(toolTypeId, guideSections, masteryGuides)
  const structuredGuide = getToolMasteryGuideContent(toolTypeId)
  if (!structuredGuide && !legacyGuide && !tool) return <Navigate to="/tool-library" replace />

  const title = structuredGuide?.title ?? tool?.toolType.name ?? masteryGuides.find((item) => item.toolTypeId === toolTypeId)?.toolName ?? toolTypeId
  const category = structuredGuide?.category ?? tool?.toolType.category
  const sections = structuredGuide ? guideSectionsForMode(structuredGuide, depthMode) : legacySections(legacyGuide?.sections ?? [])
  const ownedCatalogCount = items.filter((item) => item.internalToolTypeId === toolTypeId).length

  return (
    <div className="grid gap-5">
      <section>
        <Link to="/tool-library" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-bench-muted hover:text-bench-text">
          <ArrowLeft size={16} /> Tool Library
        </Link>
        <div className="overflow-hidden rounded-3xl border border-bench-border bg-[radial-gradient(circle_at_80%_10%,rgba(255,106,0,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.015))] p-5 shadow-panel md:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusPill label="Tool Mastery Guide" tone="orange" />
                {category && <StatusPill label={category} tone="blue" />}
                {structuredGuide && <StatusPill label={`${structuredGuide.riskClass} risk`} tone={riskTone(structuredGuide.riskClass)} />}
                <StatusPill label="BenchXP familiarity" tone="purple" />
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-bench-text md:text-4xl">{title} Guide</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-bench-muted">
                {structuredGuide?.summary ?? 'Practical guidance connected to readiness, accessories, consumables, and BenchXP familiarity.'}
              </p>
            </div>
            <div className="rounded-2xl border border-bench-orange/25 bg-bench-orange/10 p-4">
              <p className="text-sm font-bold text-bench-orange">Balanced Warnings</p>
              <p className="mt-2 text-sm leading-6 text-bench-muted">
                Guide familiarity adds confidence and next-skill recommendations. BenchOS does not treat BenchXP as certification or a hard safety gate.
              </p>
            </div>
          </div>
        </div>
      </section>

      <DepthSelector value={depthMode} onChange={setDepthMode} disabled={!structuredGuide} />

      <div className="grid gap-5 xl:grid-cols-[280px_1fr_320px]">
        <aside className="space-y-4 xl:sticky xl:top-5 xl:h-fit">
          <Card>
            <CardTitle title="Sections" />
            <nav className="grid gap-2 text-sm" aria-label="Guide sections">
              {sections.map((section) => {
                const Icon = sectionIcons[section.title] ?? BookOpen
                return (
                  <a key={section.title} href={`#${sectionId(section.title)}`} className="flex items-center gap-2 rounded-lg border border-bench-border bg-white/[0.025] px-3 py-2 text-bench-muted hover:border-bench-orange/45 hover:text-bench-text">
                    <Icon size={15} /> {section.title}
                  </a>
                )
              })}
            </nav>
          </Card>

          <Card>
            <CardTitle title="Guide Source" />
            <div className="space-y-3 text-sm text-bench-muted">
              <p>{structuredGuide ? 'Structured v0.02 guide content.' : 'Legacy guide fallback content.'}</p>
              <p>{ownedCatalogCount} catalog item{ownedCatalogCount === 1 ? '' : 's'} currently map to this tool type.</p>
            </div>
          </Card>
        </aside>

        <main className="grid gap-4">
          {structuredGuide && <SafetyCallout guide={structuredGuide} />}
          {sections.map((section) => (
            <GuideSectionCard key={section.title} title={section.title} items={section.items} />
          ))}
        </main>

        <aside className="space-y-4 xl:sticky xl:top-5 xl:h-fit">
          {structuredGuide && <BenchXpPanel guide={structuredGuide} />}
          {structuredGuide && <PracticePanel guide={structuredGuide} />}
          <Card>
            <CardTitle title="Next Step" />
            <p className="text-sm leading-6 text-bench-muted">
              Use this guide before a project, then log real practice or project use from your workshop activity. Production progress persistence belongs in the Auth0-verified Netlify Database API phase.
            </p>
            <Link to={`/mastery?tool=${toolTypeId}`} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-bench-orange/35 px-4 py-3 text-sm font-bold text-bench-orange hover:bg-bench-orange/10">
              Open BenchXP Tracker
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function DepthSelector({ value, onChange, disabled }: { value: GuideDepthMode; onChange: (value: GuideDepthMode) => void; disabled: boolean }) {
  return (
    <Card>
      <div className="grid gap-3 md:grid-cols-3">
        {depthModes.map((mode) => {
          const active = value === mode.id
          return (
            <button
              key={mode.id}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onChange(mode.id)}
              className={`rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-bench-orange/50 ${
                active ? 'border-bench-orange bg-bench-orange/10 text-bench-text' : 'border-bench-border bg-white/[0.025] text-bench-muted hover:border-bench-orange/45 hover:text-bench-text'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <p className="font-bold">{mode.label}</p>
              <p className="mt-1 text-sm leading-6">{mode.description}</p>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

function SafetyCallout({ guide }: { guide: ToolMasteryGuideContent }) {
  return (
    <Card className="border-bench-orange/35 bg-bench-orange/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <IconTile icon={ShieldCheck} tone="orange" size="lg" />
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill label={`${guide.riskClass} risk class`} tone={riskTone(guide.riskClass)} />
            <StatusPill label="No hard gate" tone="muted" />
          </div>
          <h2 className="mt-3 text-xl font-black text-bench-text">Safety familiarity first</h2>
          <p className="mt-2 text-sm leading-7 text-bench-muted">
            Review PPE, setup stability, and the tool manual before project work. BenchXP records familiarity signals; it is not certification or proof of safe competence.
          </p>
        </div>
      </div>
    </Card>
  )
}

function GuideSectionCard({ title, items }: { title: string; items: string[] }) {
  const Icon = sectionIcons[title] ?? BookOpen
  return (
    <Card id={sectionId(title)}>
      <div className="flex items-start gap-3">
        <IconTile icon={Icon} tone={title.includes('Mistakes') || title.includes('Warnings') ? 'yellow' : 'orange'} />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-bench-text">{title}</h2>
          <ul className="mt-4 grid gap-3">
            {items.map((item) => (
              <li key={item} className="flex gap-3 rounded-lg border border-bench-border bg-white/[0.025] p-3 text-sm leading-6 text-bench-muted">
                <CheckCircle2 className="mt-1 shrink-0 text-bench-orange" size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}

function BenchXpPanel({ guide }: { guide: ToolMasteryGuideContent }) {
  const evidenceRows = useMemo(() => [
    ['Positive evidence', 'Guide sections read, practice logged, maintenance recorded, project use confirmed.'],
    ['Missing evidence', 'No confidence check-in, no project use, or no recent maintenance evidence yet.'],
    ['Recommended next skill', guide.practiceTasks[0]?.title ?? 'Complete one controlled practice task.'],
  ], [guide.practiceTasks])

  return (
    <Card>
      <CardTitle title="Explain My Score" />
      <p className="text-sm leading-6 text-bench-muted">
        BenchXP should explain familiarity with evidence, not just a number.
      </p>
      <div className="mt-4 grid gap-3">
        {evidenceRows.map(([label, detail]) => (
          <div key={label} className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
            <p className="text-sm font-bold text-bench-text">{label}</p>
            <p className="mt-1 text-sm leading-6 text-bench-muted">{detail}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

function PracticePanel({ guide }: { guide: ToolMasteryGuideContent }) {
  return (
    <Card>
      <CardTitle title="Practice Task" />
      <div className="space-y-4">
        {guide.practiceTasks.map((task) => (
          <div key={task.title} className="rounded-xl border border-bench-border bg-white/[0.025] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-bench-text">{task.title}</p>
              <StatusPill label={`${task.xp} familiarity XP`} tone="purple" />
            </div>
            <p className="mt-2 text-sm leading-6 text-bench-muted">{task.goal}</p>
            <p className="mt-3 text-xs font-semibold uppercase text-bench-muted">Material</p>
            <p className="mt-1 text-sm text-bench-text">{task.material}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {task.dimensions.map((dimension) => (
                <StatusPill key={dimension} label={dimension} tone="muted" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function legacySections(sections: ToolGuideSection[]) {
  return sections.map((section) => ({ title: section.title, items: [section.body] }))
}

function riskTone(risk: ToolMasteryGuideContent['riskClass']) {
  if (risk === 'High') return 'red'
  if (risk === 'Moderate') return 'yellow'
  return 'green'
}

function sectionId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
