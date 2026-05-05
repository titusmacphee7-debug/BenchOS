import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  GraduationCap,
  Hammer,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Star,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { IconTile } from '../../components/ui/IconTile'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatusPill } from '../../components/ui/StatusPill'
import { useActiveUserTools, useMasteryGuides, useToolCatalogData, useToolGuideSections } from '../../data/hooks'
import type { ToolGuideSection } from '../../data/schema'
import { useBenchXp } from '../../lib/benchxp/useBenchXp'
import type { BenchXpEvidence, BenchXpProgress, BenchXpRecommendation } from '../../lib/benchxp/benchXpApi'
import {
  getFamiliarityLabel,
  getToolMasteryGuideContent,
  guideSectionsForMode,
  skillDimensions,
  type GuideDepthMode,
  type ToolMasteryGuideContent,
} from '../../lib/guides/toolMasteryContent'
import { resolveToolGuide } from '../../lib/guides/toolGuideLookup'

const depthModes: Array<{ id: GuideDepthMode; label: string; description: string }> = [
  { id: 'quick', label: 'Quick Guide', description: 'Safety, setup, use, and common mistakes.' },
  { id: 'full', label: 'Full Guide', description: 'Complete reference for practice and projects.' },
  { id: 'shop-card', label: 'Shop Card', description: 'Compact checklist for project work.' },
]

const commonMistakes = [
  { key: 'measurement-off', label: 'Measurement off' },
  { key: 'wrong-bit-or-blade', label: 'Wrong bit/blade' },
  { key: 'hard-to-control', label: 'Hard to control' },
  { key: 'dust-problem', label: 'Dust problem' },
  { key: 'forgot-ppe', label: 'Forgot PPE' },
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
  const ownedTools = useActiveUserTools()
  const benchXp = useBenchXp()
  const [depthMode, setDepthMode] = useState<GuideDepthMode>('quick')
  const [actionNotice, setActionNotice] = useState('')

  if (!toolTypeId) return <Navigate to="/tool-library" replace />

  const tool = items.find((item) => item.internalToolTypeId === toolTypeId)
  const legacyGuide = resolveToolGuide(toolTypeId, guideSections, masteryGuides)
  const structuredGuide = getToolMasteryGuideContent(toolTypeId)
  if (!structuredGuide && !legacyGuide && !tool) return <Navigate to="/tool-library" replace />

  const title = structuredGuide?.title ?? tool?.toolType.name ?? masteryGuides.find((item) => item.toolTypeId === toolTypeId)?.toolName ?? toolTypeId
  const category = structuredGuide?.category ?? tool?.toolType.category
  const sections = structuredGuide ? guideSectionsForMode(structuredGuide, depthMode) : legacySections(legacyGuide?.sections ?? [])
  const ownedCatalogCount = items.filter((item) => item.internalToolTypeId === toolTypeId).length
  const matchingOwnedTools = ownedTools.filter((ownedTool) => ownedTool.toolTypeId === toolTypeId)
  const primaryOwnedTool = matchingOwnedTools[0]
  const guideId = structuredGuide ? guideIdForToolType(structuredGuide.toolTypeId) : undefined
  const progress = guideId ? benchXp.state.progress.find((item) => item.guideId === guideId) : undefined
  const isFavorite = guideId ? benchXp.state.favoriteGuideIds.includes(guideId) : false
  const guideEvidence = progress ? benchXp.state.evidence.filter((item) => item.progressId === progress.id || item.guideId === progress.guideId) : []
  const recommendations = structuredGuide ? benchXp.state.recommendations.filter((item) => item.toolTypeId === structuredGuide.toolTypeId).slice(0, 3) : []
  const familiarityScore = progress?.familiarityScore ?? 0
  const familiarityLabel = getFamiliarityLabel(familiarityScore)

  async function runGuideAction(successMessage: string, action: () => Promise<unknown>) {
    setActionNotice('')
    try {
      await action()
      setActionNotice(successMessage)
    } catch {
      // useBenchXp already exposes the safe error copy in the guide panel.
    }
  }

  function startGuide() {
    if (!structuredGuide || !guideId) return Promise.resolve()
    return runGuideAction('Guide started. BenchXP will now track real evidence for this tool type.', () => benchXp.startGuide({
      guideId,
      toolTypeId: structuredGuide.toolTypeId,
      userToolId: primaryOwnedTool?.id,
    }))
  }

  return (
    <div className="grid gap-5">
      <section>
        <Link to="/tool-library" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-bench-muted hover:text-bench-text">
          <ArrowLeft size={16} /> Tool Library
        </Link>
        <div className="overflow-hidden rounded-3xl border border-bench-border bg-[radial-gradient(circle_at_80%_10%,rgba(255,106,0,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.015))] p-5 shadow-panel md:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusPill label="Tool Mastery Guide" tone="orange" />
                {category && <StatusPill label={category} tone="blue" />}
                {structuredGuide && <StatusPill label={`${structuredGuide.riskClass} risk`} tone={riskTone(structuredGuide.riskClass)} />}
                <StatusPill label={primaryOwnedTool ? `Owned: ${formatOwnedTool(primaryOwnedTool)}` : 'Not in inventory'} tone={primaryOwnedTool ? 'green' : 'muted'} />
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-bench-text md:text-4xl">{title} Guide</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-bench-muted">
                {structuredGuide?.summary ?? 'Practical guidance connected to readiness, accessories, consumables, and BenchXP familiarity.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="primary" icon={<PlayIcon />} disabled={benchXp.loading || !structuredGuide} onClick={() => void startGuide()}>
                  {progress ? 'Continue guide' : 'Start guide'}
                </Button>
                <Link to="/my-tools" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-bench-border bg-white/5 px-4 text-sm font-semibold text-bench-text hover:border-bench-orange/60 hover:bg-white/8">
                  {primaryOwnedTool ? 'View owned tool' : 'Add to inventory'}
                </Link>
                <Link to="/wishlist" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-bench-orange/40 bg-bench-orange/5 px-4 text-sm font-semibold text-bench-orange hover:bg-bench-orange/10">
                  Wishlist support
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-bench-orange/25 bg-bench-orange/10 p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-bench-orange">Familiarity score</p>
                  <p className="mt-2 text-5xl font-black text-bench-text">{familiarityScore}</p>
                  <p className="text-sm text-bench-muted">{familiarityLabel}</p>
                </div>
                <StatusPill label={`${progress?.xp ?? 0} XP`} tone="purple" />
              </div>
              <ProgressBar className="mt-4" value={familiarityScore} tone="orange" />
              <p className="mt-2 text-sm leading-6 text-bench-muted">
                Balanced Warnings add confidence and next-skill recommendations. BenchXP is not certification or a hard safety gate.
              </p>
            </div>
          </div>
        </div>
      </section>

      <DepthSelector value={depthMode} onChange={setDepthMode} disabled={!structuredGuide} />

      {actionNotice && (
        <Card className="border-bench-green/35 bg-bench-green/10">
          <p className="text-sm font-semibold text-bench-green">{actionNotice}</p>
        </Card>
      )}

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
          {structuredGuide && <QuickReferenceCard guide={structuredGuide} ownedCount={matchingOwnedTools.length} />}
          {structuredGuide && <SafetyCallout guide={structuredGuide} />}
          {sections.map((section) => (
            <GuideSectionCard key={section.title} title={section.title} items={section.items} />
          ))}
          {structuredGuide && <ProjectReadinessConnection guide={structuredGuide} recommendations={recommendations} />}
        </main>

        <aside className="space-y-4 xl:sticky xl:top-5 xl:h-fit">
          {structuredGuide && guideId && (
            <BenchXpPanel
              guide={structuredGuide}
              progress={progress}
              evidence={guideEvidence}
              recommendations={recommendations}
              loading={benchXp.loading}
              error={benchXp.error}
              onConfidence={(confidence) => runGuideAction('Confidence check-in saved.', () => benchXp.logConfidence({ guideId, toolTypeId: structuredGuide.toolTypeId, confidence }))}
              isFavorite={isFavorite}
              onToggleFavorite={() => runGuideAction(isFavorite ? 'Guide removed from favorites.' : 'Guide added to favorites.', () => benchXp.toggleFavoriteGuide({ guideId, toolTypeId: structuredGuide.toolTypeId, favorite: !isFavorite }))}
            />
          )}
          {structuredGuide && guideId && (
            <PracticePanel
              guide={structuredGuide}
              disabled={benchXp.loading}
              onLogPractice={(taskIndex) => {
                const task = structuredGuide.practiceTasks[taskIndex]
                return runGuideAction('Practice evidence saved.', () => benchXp.logPractice({
                  guideId,
                  toolTypeId: structuredGuide.toolTypeId,
                  taskId: `${structuredGuide.toolTypeId}-practice-${taskIndex + 1}`,
                  title: task.title,
                  dimensions: task.dimensions,
                  xp: task.xp,
                  result: task.expectedResult,
                  totalStepCount: sections.length,
                }))
              }}
              onLogMistake={(mistakeKey) => runGuideAction('Mistake pattern saved.', () => benchXp.logMistake({ guideId, toolTypeId: structuredGuide.toolTypeId, mistakeKey }))}
              onLogMaintenance={() => runGuideAction('Maintenance evidence saved.', () => benchXp.logMaintenance({ guideId, toolTypeId: structuredGuide.toolTypeId, maintenanceKey: 'guide-maintenance-review' }))}
            />
          )}
          <Card>
            <CardTitle title="Next Step" />
            <p className="text-sm leading-6 text-bench-muted">
              Use this guide before a project, then log real practice, confidence, mistake, or maintenance evidence. BenchXP stores those signals through the Auth0-verified API.
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

function PlayIcon() {
  return <ArrowRight size={16} />
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

function QuickReferenceCard({ guide, ownedCount }: { guide: ToolMasteryGuideContent; ownedCount: number }) {
  const mostImportantSetup = guide.setup[0] ?? 'Confirm the setup is stable before using the tool.'
  const commonMistake = guide.commonMistakes[0] ?? 'Rushing the setup before checking the workpiece.'

  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill label="Quick reference" tone="orange" />
            <StatusPill label={ownedCount > 0 ? `${ownedCount} owned` : 'guide-only'} tone={ownedCount > 0 ? 'green' : 'muted'} />
          </div>
          <h2 className="mt-3 text-2xl font-black text-bench-text">What to check before this tool hits the project.</h2>
          <p className="mt-2 text-sm leading-7 text-bench-muted">{guide.overview[0] ?? guide.summary}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <QuickReferenceItem icon={CheckCircle2} label="Use it for" detail={guide.bestUses.slice(0, 3).join(', ')} />
        <QuickReferenceItem icon={AlertTriangle} label="Do not use it when" detail={guide.avoidWhen[0] ?? 'the setup feels unstable'} />
        <QuickReferenceItem icon={ShieldCheck} label="PPE" detail={guide.ppe.slice(0, 3).join(', ')} />
        <QuickReferenceItem icon={Hammer} label="Key setup check" detail={mostImportantSetup} />
        <QuickReferenceItem icon={Gauge} label="Common mistake" detail={commonMistake} />
        <QuickReferenceItem icon={ClipboardCheck} label="Maintenance habit" detail={guide.maintenance[0] ?? 'Inspect and clean after use.'} />
      </div>
    </Card>
  )
}

function QuickReferenceItem({ icon: Icon, label, detail }: { icon: LucideIcon; label: string; detail: string }) {
  return (
    <div className="rounded-xl border border-bench-border bg-white/[0.025] p-3">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 shrink-0 text-bench-orange" size={17} />
        <div>
          <p className="text-sm font-bold text-bench-text">{label}</p>
          <p className="mt-1 text-sm leading-6 text-bench-muted">{detail}</p>
        </div>
      </div>
    </div>
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
          <p className="mt-2 max-w-3xl text-sm leading-7 text-bench-muted">{guideSectionIntro(title)}</p>
          <div className="mt-4 grid gap-3">
            {items.map((item, index) => (
              <article key={`${title}-${item}`} className="rounded-xl border border-bench-border bg-white/[0.025] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 shrink-0 text-bench-orange" size={16} />
                  <div>
                    <h3 className="text-sm font-bold text-bench-text">{guideSectionItemTitle(title, item, index)}</h3>
                    <p className="mt-2 text-sm leading-7 text-bench-muted">{guideSectionItemBody(title, item)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function guideSectionIntro(title: string) {
  const intros: Record<string, string> = {
    'Safety First': 'Start here before the tool comes out. These notes turn safety into a practical pre-work habit instead of a vague warning at the edge of the page.',
    PPE: 'Protective gear works best when it is part of setup. Treat these items as baseline conditions for the task, especially when dust, chips, noise, or awkward body position are involved.',
    Setup: 'Good setup is where most project mistakes are prevented. Slow down here, confirm the tool and workpiece are ready, then make the actual cut, hole, or fastening step simpler.',
    'Basic Use': 'These are the working habits that keep the tool predictable. Move deliberately, check your position, and give yourself room to stop before a small drift becomes a project problem.',
    'Common Mistakes': 'These patterns are common because they happen fast. Use them as early warning signs: pause, reset the setup, and continue only when the cause is clear.',
    Accessories: 'Accessories should earn their place by improving control, safety, compatibility, or repeatability. BenchOS treats them as readiness helpers, not random add-ons.',
    Consumables: 'Consumables affect results more than they seem to. The right bit, blade, disc, filter, or fastener can be the difference between clean progress and frustrating rework.',
    Maintenance: 'Maintenance keeps the tool predictable for the next project. These are small closeout habits that protect accuracy, safety, and confidence over time.',
    Comparisons: 'Similar tools overlap, but they are not interchangeable in every situation. Use these comparisons to choose the tool that fits the work instead of forcing one tool into every role.',
    Substitutions: 'Substitutions are useful when the ideal tool is missing, but they come with tradeoffs. Pick the option that keeps the work stable and the result honest.',
    'Project Examples': 'These examples show where the guide turns into real work. A project can use the guide as a readiness signal before you start cutting, drilling, fastening, or finishing.',
    'Buying Notes': 'Use these notes as filters before buying. The goal is to buy capability you will actually use, not to collect features that do not change your workshop readiness.',
    Troubleshooting: 'When something feels off, do not just push through it. Use troubleshooting as a reset loop: stop, inspect the setup, correct the cause, and then continue.',
    'Storage + Care': 'Storage is part of tool readiness. A tool that is clean, protected, and easy to find is more likely to be used safely and accurately.',
    'Shop Card Checklist': 'This is the quick pre-project version of the guide. It is short on purpose, but each line should still be treated as a real pause point before work begins.',
    'Readiness Warnings': 'BenchOS uses these as Balanced Warnings, not hard gates. They tell you where confidence, safety, or setup could improve before the project starts.',
    'Practice Task': 'Practice turns guide reading into evidence. Focus on controlled, repeatable results instead of speed, then log the task when it teaches you something real.',
    Overview: 'Use this as the practical overview before going deeper. It explains what the tool is for and what kind of control BenchOS expects before project work.',
    'Best Uses': 'These are strong fits for the tool. When a project matches these uses, the guide can help you turn ownership into better readiness and cleaner execution.',
    'When Not To Use It': 'Knowing when to stop is part of tool familiarity. If one of these conditions is present, improve the setup or choose a safer tool for the job.',
  }
  return intros[title] ?? 'Use these notes as practical guide context before you apply the tool to real project work.'
}

function guideSectionItemTitle(title: string, item: string, index: number) {
  const clean = removeTrailingPunctuation(item.trim())
  if (title === 'Practice Task') return clean.split(':')[0] || `Practice note ${index + 1}`
  if (title === 'Readiness Warnings') return `Readiness note ${index + 1}`
  if (title === 'Common Mistakes') return `Watch for: ${lowerFirst(clean)}`
  if (title === 'When Not To Use It') return `Avoid when: ${lowerFirst(clean)}`
  if (clean.length <= 52) return capitalizeFirst(clean)
  return `${capitalizeFirst(clean.split(' ').slice(0, 8).join(' '))}...`
}

function guideSectionItemBody(title: string, item: string) {
  const clean = ensureSentence(capitalizeFirst(item.trim()))
  switch (title) {
    case 'Safety First':
    case 'PPE':
      return `${clean} Treat this as part of the setup, not something you remember halfway through the job. Confirm it before the tool starts, keep it in place through cleanup, and check the tool manual when the task or material changes.`
    case 'Setup':
      return `${clean} This step reduces wandering, poor fit, unstable workholding, and rushed corrections once the project is underway. A slower setup usually creates a faster and cleaner result.`
    case 'Basic Use':
      return `${clean} Keep the pace controlled enough that you can stop, inspect the result, and correct course before the mistake becomes part of the project.`
    case 'Common Mistakes':
      return `${clean} If you notice this pattern, pause and reset the setup instead of repeating it. BenchXP treats mistake awareness as useful evidence because it points to the next practice target.`
    case 'Accessories':
      return `${clean} Add this when it improves control, compatibility, safety, or repeatability for the work you actually plan to do. It should solve a real readiness gap.`
    case 'Consumables':
      return `${clean} Check that it matches the material and task before you start. Worn, mismatched, or missing consumables can make a good tool feel inaccurate or unsafe.`
    case 'Maintenance':
      return `${clean} Make it a normal closeout habit after the tool is used. Small maintenance checks keep the next project from starting with hidden friction.`
    case 'Comparisons':
      return `${clean} Use that comparison to choose the tool that fits the job, especially when accuracy, force, dust, support, or repeatability matter.`
    case 'Substitutions':
      return `${clean} A substitute can work, but the setup may need more patience or a narrower task scope. Use it only when the result and safety conditions still make sense.`
    case 'Project Examples':
      return `${clean} This is the kind of project where the guide can become a readiness signal, especially when your inventory, accessories, and practice evidence line up.`
    case 'Buying Notes':
      return `${clean} Use this as a buying filter before adding the item to your wishlist. The best purchase is the one that closes a real project or safety gap.`
    case 'Troubleshooting':
      return `${clean} Treat the symptom as feedback from the setup, material, or technique. Stop long enough to inspect the likely cause before you continue.`
    case 'Storage + Care':
      return `${clean} Good storage protects accuracy and makes the tool easier to trust when the next project starts.`
    case 'Shop Card Checklist':
      return `${clean} Confirm this in the last minute before work begins. The checklist is short so it can be used at the bench, not ignored like a long manual.`
    case 'Readiness Warnings':
      return `${clean} BenchOS shows this as a warning, not a hard block, so you can decide whether to practice, add an accessory, improve setup, or proceed carefully.`
    case 'Practice Task':
      return `${clean} Treat the task as evidence: repeat the motion, inspect the result, and log it only when it tells you something about control, setup, or confidence.`
    case 'Best Uses':
      return `${clean} This is a strong fit because the tool can improve control, repeatability, or speed without pretending every job needs the same approach.`
    case 'When Not To Use It':
      return `${clean} Stop and choose a better setup, a different tool, or more practice time before forcing the task forward.`
    default:
      return `${clean} Use this note as practical context before applying the guide to a real BenchOS project.`
  }
}

function ensureSentence(value: string) {
  return /[.!?]$/.test(value) ? value : `${value}.`
}

function removeTrailingPunctuation(value: string) {
  return value.replace(/[.!?]+$/, '')
}

function capitalizeFirst(value: string) {
  if (!value) return value
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

function lowerFirst(value: string) {
  if (!value) return value
  return `${value.charAt(0).toLowerCase()}${value.slice(1)}`
}

function BenchXpPanel({
  guide,
  progress,
  evidence,
  recommendations,
  loading,
  error,
  onConfidence,
  isFavorite,
  onToggleFavorite,
}: {
  guide: ToolMasteryGuideContent
  progress?: BenchXpProgress
  evidence: BenchXpEvidence[]
  recommendations: BenchXpRecommendation[]
  loading: boolean
  error?: string
  onConfidence: (confidence: number) => Promise<unknown>
  isFavorite: boolean
  onToggleFavorite: () => Promise<unknown>
}) {
  const score = progress?.familiarityScore ?? 0
  const label = getFamiliarityLabel(score)
  const positiveEvidence = evidence.filter((item) => item.positive).slice(0, 2)
  const missingEvidence = useMemo(() => {
    const missing: string[] = []
    if (!evidence.some((item) => item.evidenceType === 'practice_task')) missing.push('No practice task logged yet.')
    if (!evidence.some((item) => item.evidenceType === 'confidence_checkin')) missing.push('No confidence check-in yet.')
    if (!evidence.some((item) => item.evidenceType === 'maintenance_log')) missing.push('No maintenance evidence yet.')
    return missing
  }, [evidence])

  return (
    <Card>
      <CardTitle title="Explain My Score" />
      <p className="text-sm leading-6 text-bench-muted">
        BenchXP explains familiarity with evidence, not certification.
      </p>
      <div className="mt-4 rounded-xl border border-bench-orange/25 bg-bench-orange/10 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-black text-bench-text">{score}</p>
            <p className="text-sm text-bench-muted">{label}</p>
          </div>
          <StatusPill label={`${progress?.xp ?? 0} XP`} tone="purple" />
        </div>
        <SkillDimensionBars scores={progress?.skillScores ?? emptySkillScores()} />
      </div>
      {error && (
        <div className="mt-4 rounded-lg border border-bench-yellow/35 bg-bench-yellow/10 p-3 text-sm text-bench-yellow">
          {error}
        </div>
      )}
      <div className="mt-4 grid gap-3">
        <EvidenceRow label="Positive evidence" detail={positiveEvidence.length > 0 ? positiveEvidence.map((item) => item.summary).join(' ') : 'Complete a guide step or practice task to create evidence.'} />
        <EvidenceRow label="Missing evidence" detail={missingEvidence.length > 0 ? missingEvidence.join(' ') : 'Guide, practice, confidence, and maintenance evidence are all represented.'} />
        <EvidenceRow label="Recommended next skill" detail={recommendations[0]?.detail ?? guide.practiceTasks[0]?.title ?? 'Complete one controlled practice task.'} />
      </div>
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase text-bench-muted">Confidence check-in</p>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((confidence) => (
            <Button key={confidence} type="button" size="sm" variant="secondary" disabled={loading} aria-label={`Log ${confidence} out of 5 confidence`} onClick={() => void onConfidence(confidence)}>
              {confidence}
            </Button>
          ))}
        </div>
      </div>
      <Button className="mt-4 w-full" type="button" variant={isFavorite ? 'outline' : 'secondary'} disabled={loading} icon={<Star size={16} />} onClick={() => void onToggleFavorite()}>
        {isFavorite ? 'Remove favorite' : 'Add to favorites'}
      </Button>
    </Card>
  )
}

function SkillDimensionBars({ scores }: { scores: Record<string, number> }) {
  return (
    <div className="mt-4 grid gap-2">
      {skillDimensions.map((dimension) => (
        <div key={dimension}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-bench-muted">{dimension}</span>
            <span className="text-bench-text">{scores[dimension] ?? 0}</span>
          </div>
          <ProgressBar value={scores[dimension] ?? 0} tone={dimension === 'Safety' ? 'green' : dimension === 'Maintenance' ? 'blue' : 'orange'} />
        </div>
      ))}
    </div>
  )
}

function emptySkillScores() {
  return Object.fromEntries(skillDimensions.map((dimension) => [dimension, 0]))
}

function EvidenceRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
      <p className="text-sm font-bold text-bench-text">{label}</p>
      <p className="mt-1 text-sm leading-6 text-bench-muted">{detail}</p>
    </div>
  )
}

function PracticePanel({
  guide,
  disabled,
  onLogPractice,
  onLogMistake,
  onLogMaintenance,
}: {
  guide: ToolMasteryGuideContent
  disabled: boolean
  onLogPractice: (taskIndex: number) => Promise<unknown>
  onLogMistake: (mistakeKey: string) => Promise<unknown>
  onLogMaintenance: () => Promise<unknown>
}) {
  return (
    <Card>
      <CardTitle title="Practice Task" />
      <div className="space-y-4">
        {guide.practiceTasks.map((task, index) => (
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
            <Button className="mt-4 w-full" type="button" size="sm" variant="outline" disabled={disabled} onClick={() => void onLogPractice(index)}>
              Log practice evidence
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-bench-border pt-4">
        <p className="text-sm font-bold text-bench-text">Mistake patterns</p>
        <p className="mt-1 text-sm leading-6 text-bench-muted">Optional, practical notes that improve recommendations.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {commonMistakes.map((mistake) => (
            <Button key={mistake.key} type="button" size="sm" variant="secondary" disabled={disabled} onClick={() => void onLogMistake(mistake.key)}>
              {mistake.label}
            </Button>
          ))}
        </div>
      </div>
      <Button className="mt-4 w-full" type="button" variant="secondary" disabled={disabled} icon={<ClipboardCheck size={16} />} onClick={() => void onLogMaintenance()}>
        Log maintenance review
      </Button>
    </Card>
  )
}

function ProjectReadinessConnection({ guide, recommendations }: { guide: ToolMasteryGuideContent; recommendations: BenchXpRecommendation[] }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <IconTile icon={Gauge} tone="purple" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <StatusPill label="Project readiness connection" tone="purple" />
            <StatusPill label="Balanced Warnings" tone="orange" />
          </div>
          <h2 className="mt-3 text-xl font-bold text-bench-text">How this guide affects build confidence</h2>
          <p className="mt-2 text-sm leading-7 text-bench-muted">
            BenchOS keeps ownership and materials as the base readiness check, then uses guide evidence to explain confidence, weak spots, and next skills.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {guide.readinessWarnings.slice(0, 2).map((warning) => (
              <div key={warning} className="rounded-xl border border-bench-yellow/30 bg-bench-yellow/10 p-3 text-sm leading-6 text-bench-muted">
                {warning}
              </div>
            ))}
            {(recommendations.length > 0 ? recommendations.slice(0, 2) : [{ id: 'starter', title: 'Log one practice task', detail: guide.practiceTasks[0]?.goal ?? 'Create one real evidence signal.' }]).map((recommendation) => (
              <div key={recommendation.id} className="rounded-xl border border-bench-border bg-white/[0.025] p-3 text-sm leading-6 text-bench-muted">
                <span className="font-bold text-bench-text">{recommendation.title}: </span>{recommendation.detail}
              </div>
            ))}
          </div>
        </div>
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

function guideIdForToolType(toolTypeId: string) {
  return `guide-${toolTypeId}`
}

function formatOwnedTool(tool: { brand?: string; model?: string; name: string }) {
  const brandModel = [tool.brand, tool.model].filter(Boolean).join(' ')
  return brandModel || tool.name
}
