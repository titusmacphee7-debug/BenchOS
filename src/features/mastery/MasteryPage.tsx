import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Gauge,
  Lock,
  Play,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { IconTile } from '../../components/ui/IconTile'
import { PageHeader } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatCard } from '../../components/ui/StatCard'
import { StatusPill } from '../../components/ui/StatusPill'
import { useActiveUserTools, useMasteryGuides } from '../../data/hooks'
import type { MasteryGuide, MasteryGuideStep, UserTool } from '../../data/schema'
import { useBenchXp } from '../../lib/benchxp/useBenchXp'
import type { BenchXpProgress, BenchXpRecommendation } from '../../lib/benchxp/benchXpApi'
import {
  getFamiliarityLabel,
  getToolMasteryGuideContent,
  skillDimensions,
  type SkillDimension,
  type ToolMasteryGuideContent,
} from '../../lib/guides/toolMasteryContent'

const tabs = ['All Tools', 'Owned Tools', 'In Progress', 'Completed Guides']

type MasteryRow = {
  guide: MasteryGuide
  guideContent?: ToolMasteryGuideContent
  progress?: BenchXpProgress
  ownedTool?: UserTool
}

export function MasteryPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const guides = useMasteryGuides()
  const tools = useActiveUserTools()
  const benchXp = useBenchXp()
  const progress = benchXp.state.progress
  const xpSummary = benchXp.state.summary
  const activity = benchXp.state.events.slice(0, 4)
  const [activeTab, setActiveTab] = useState('All Tools')
  const [query, setQuery] = useState('')
  const [selectedGuideId, setSelectedGuideId] = useState<string>()
  const [savingGuideId, setSavingGuideId] = useState<string>()
  const [notice, setNotice] = useState('')
  const requestedToolTypeId = searchParams.get('tool')

  const allRows = useMemo<MasteryRow[]>(() => guides
    .map((guide) => ({
      guide,
      guideContent: getToolMasteryGuideContent(guide.toolTypeId),
      progress: findGuideProgress(progress, guide.id),
      ownedTool: tools.find((tool) => tool.toolTypeId === guide.toolTypeId),
    }))
    .sort((a, b) => Number(Boolean(b.ownedTool)) - Number(Boolean(a.ownedTool)) || a.guide.sortOrder - b.guide.sortOrder),
  [guides, progress, tools])

  const rows = useMemo(() => allRows
    .filter((row) => {
      if (activeTab === 'Owned Tools') return Boolean(row.ownedTool)
      if (activeTab === 'In Progress') return row.progress?.status === 'in_progress'
      if (activeTab === 'Completed Guides') return row.progress?.status === 'completed'
      return true
    })
    .filter((row) => [
      row.guide.toolName,
      row.guide.category,
      row.guide.summary,
      row.ownedTool?.brand,
      row.ownedTool?.model,
      row.ownedTool?.name,
    ].join(' ').toLowerCase().includes(query.toLowerCase())),
  [activeTab, allRows, query])

  const requestedGuideId = requestedToolTypeId ? guides.find((guide) => guide.toolTypeId === requestedToolTypeId)?.id : undefined
  const selected = rows.find((row) => row.guide.id === (selectedGuideId ?? requestedGuideId)) ?? rows[0]
  const completedGuideCount = xpSummary.completedGuides
  const inProgress = xpSummary.inProgressGuides
  const ownedGuideCount = guides.filter((guide) => tools.some((tool) => tool.toolTypeId === guide.toolTypeId)).length
  const averageFamiliarity = xpSummary.averageFamiliarity
  const familiarityLabel = getFamiliarityLabel(averageFamiliarity)
  const topRecommendation = getTopRecommendation(benchXp.state.recommendations, allRows)
  const categoryRows = useMemo(() => buildCategoryRows(allRows), [allRows])
  const ownedRows = allRows.filter((row) => row.ownedTool).slice(0, 4)
  const recommendedPracticeRows = allRows
    .filter((row) => row.guideContent?.practiceTasks.length)
    .sort((a, b) => (a.progress?.familiarityScore ?? 0) - (b.progress?.familiarityScore ?? 0))
    .slice(0, 3)
  const weakestDimension = findWeakestDimension(progress)
  const hasAnyEvidence = benchXp.state.events.length > 0 || benchXp.state.evidence.length > 0

  async function openGuide(guide: MasteryGuide, guideProgress?: BenchXpProgress, userToolId?: string) {
    setSelectedGuideId(guide.id)
    setNotice('')
    setSavingGuideId(guide.id)
    try {
      if (!guideProgress) {
        await benchXp.startGuide({ guideId: guide.id, toolTypeId: guide.toolTypeId, userToolId })
      }
      setNotice(`${guide.toolName} guide is ready.`)
    } catch {
      setNotice(`${guide.toolName} guide opened. BenchXP progress will sync when the server is available.`)
    } finally {
      setSavingGuideId(undefined)
      navigate(`/tool-guides/${guide.toolTypeId}`)
    }
  }

  return (
    <div>
      <PageHeader
        title="Tool Mastery"
        description="BenchXP turns guides, practice, safety habits, maintenance, and real projects into practical familiarity signals."
        icon={Star}
      />

      <div className="grid gap-5 2xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <BenchXpOverviewHero
            averageFamiliarity={averageFamiliarity}
            familiarityLabel={familiarityLabel}
            totalXp={xpSummary.totalXp}
            level={xpSummary.level}
            progressPercent={xpSummary.progressPercent}
            nextRecommendation={topRecommendation}
            onContinue={() => {
              const target = topRecommendation?.toolTypeId ?? selected?.guide.toolTypeId ?? allRows[0]?.guide.toolTypeId
              if (target) navigate(`/tool-guides/${target}`)
            }}
          />

          <RecommendedNextSkillCard
            recommendation={topRecommendation}
            fallbackGuide={selected?.guide ?? allRows[0]?.guide}
            onOpen={() => {
              const target = topRecommendation?.toolTypeId ?? selected?.guide.toolTypeId ?? allRows[0]?.guide.toolTypeId
              if (target) navigate(`/tool-guides/${target}`)
            }}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={BookOpen} label="Guides" value={guides.length} detail="Starter guide set" tone="orange" />
            <StatCard icon={Wrench} label="Owned Guides" value={ownedGuideCount} detail="Matched to inventory" tone="blue" />
            <StatCard icon={Star} label="Completed Guides" value={completedGuideCount} detail={`${inProgress} building familiarity`} tone="green" />
            <StatCard icon={TrendingUp} label="BenchXP" value={xpSummary.totalXp} detail={`Level ${xpSummary.level}`} tone="purple" />
          </div>

          {benchXp.error && (
            <Card className="border-bench-yellow/35 bg-bench-yellow/10">
              <p className="text-sm font-semibold text-bench-yellow">BenchXP server progress is unavailable right now.</p>
              <p className="mt-1 text-sm text-bench-muted">{benchXp.error}</p>
            </Card>
          )}

          {notice && (
            <Card className="border-bench-green/35 bg-bench-green/10">
              <p className="text-sm font-semibold text-bench-green">{notice}</p>
            </Card>
          )}

          <CategoryMasteryGrid rows={categoryRows} onOpenGuide={(toolTypeId) => navigate(`/tool-guides/${toolTypeId}`)} />

          <OwnedToolFamiliarity rows={ownedRows} onOpenGuide={(toolTypeId) => navigate(`/tool-guides/${toolTypeId}`)} onBrowseTools={() => navigate('/tool-library')} />

          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative min-w-72 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-bench-muted" size={18} />
                <input
                  className="h-12 w-full rounded-lg border border-bench-border bg-white/[0.035] pl-11 pr-4 text-sm outline-none placeholder:text-bench-muted focus:border-bench-orange/70"
                  placeholder="Search tools or guides..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <StatusPill label={`${rows.length} shown`} tone="muted" />
            </div>
          </Card>

          <div className="flex flex-wrap gap-3 border-b border-bench-border">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-3 py-3 text-sm font-semibold ${
                  activeTab === tab ? 'border-bench-orange text-bench-orange' : 'border-transparent text-bench-muted'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {rows.length === 0 && (
              <EmptyMasteryState
                title={query ? 'No guides match that search.' : 'No guide evidence here yet.'}
                detail={query ? 'Try a tool type, category, brand, or model name.' : 'Start a guide or add real tools to unlock stronger BenchXP recommendations.'}
                actionLabel={query ? 'Clear search' : 'Start first guide'}
                onAction={() => {
                  if (query) setQuery('')
                  else if (allRows[0]) void openGuide(allRows[0].guide, allRows[0].progress, allRows[0].ownedTool?.id)
                }}
              />
            )}
            {rows.map(({ guide, progress: guideProgress, ownedTool }) => {
              const percent = guideProgress ? Math.round((guideProgress.completedStepIds.length / Math.max(1, guide.steps.length)) * 100) : 0
              return (
                <Card key={guide.id} className={selected?.guide.id === guide.id ? 'border-bench-orange/50' : ''}>
                  <div className="grid gap-4 lg:grid-cols-[1fr_.65fr_.55fr_auto] lg:items-center">
                    <button type="button" className="flex min-w-0 items-center gap-4 text-left" onClick={() => setSelectedGuideId(guide.id)}>
                      <IconTile icon={Wrench} size="lg" tone={guideProgress?.status === 'completed' ? 'green' : ownedTool ? 'orange' : 'muted'} />
                      <div className="min-w-0">
                        <p className="font-semibold text-bench-text">{guide.toolName}</p>
                        <p className="text-sm text-bench-muted">{guide.summary}</p>
                        <div className="mt-2 flex gap-2">
                          <StatusPill label={guide.category} tone="muted" />
                          {ownedTool && <StatusPill label={formatOwnedToolName(ownedTool)} tone="green" />}
                        </div>
                      </div>
                    </button>
                    <div>
                      <p className={guideProgress?.status === 'completed' ? 'text-bench-green' : 'text-bench-orange'}>
                        {progressStatusLabel(guide, guideProgress)}
                      </p>
                      <ProgressBar className="mt-2" value={percent} tone={guideProgress?.status === 'completed' ? 'green' : 'orange'} />
                    </div>
                    <p className="text-sm text-bench-muted">{guideProgress?.xp ?? 0} XP</p>
                    <Button
                      variant={guideProgress ? 'secondary' : 'outline'}
                      icon={guideProgress ? <Play size={16} /> : <Lock size={16} />}
                      disabled={benchXp.loading || savingGuideId === guide.id}
                      onClick={() => void openGuide(guide, guideProgress, ownedTool?.id)}
                    >
                      {savingGuideId === guide.id ? 'Opening...' : guideProgress?.status === 'completed' ? 'Review Guide' : guideProgress ? 'Open Guide' : 'Start Guide'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle title="Explain My Score" />
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border-[18px] border-bench-orange bg-white/[0.03]">
              <div className="text-center">
                <p className="text-3xl font-bold">{averageFamiliarity}</p>
                <p className="text-sm text-bench-muted">{familiarityLabel}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-bench-muted">
              BenchXP is familiarity guidance, not certification. Your score rises from meaningful evidence like guide steps, practice, confidence, maintenance, and project use.
            </p>
            <SkillDimensionBars scores={averageSkillScores(progress)} />
            <div className="mt-4 grid gap-3">
              <EvidenceMiniRow label="Strongest evidence" value={hasAnyEvidence ? benchXpActivityTitle(benchXp.state.events[0]?.sourceType ?? 'evidence') : 'No evidence yet'} />
              <EvidenceMiniRow label="Weakest dimension" value={weakestDimension ? `${weakestDimension} needs the next signal` : 'Start one guide to reveal this'} />
              <EvidenceMiniRow label="Next score action" value={topRecommendation?.title ?? 'Complete one guide step or practice task'} />
            </div>
          </Card>

          {selected && (
            <GuideDetail
              guide={selected.guide}
              progress={selected.progress}
              disabled={benchXp.loading}
              onOpenGuide={() => void openGuide(selected.guide, selected.progress, selected.ownedTool?.id)}
              onCompleteStep={(step) => benchXp.completeStep({
                guideId: selected.guide.id,
                toolTypeId: selected.guide.toolTypeId,
                userToolId: selected.ownedTool?.id,
                stepId: step.id,
                stepTitle: step.title,
                stepCategory: step.category,
                totalStepCount: selected.guide.steps.length,
              })}
            />
          )}

          <Card>
            <CardTitle title="Practice + Evidence" />
            <div className="space-y-3">
              {recommendedPracticeRows.length === 0 && <p className="text-sm text-bench-muted">Practice prompts appear after guide content loads. Open a guide to start creating real BenchXP evidence.</p>}
              {recommendedPracticeRows.map((row) => (
                <button
                  key={row.guide.id}
                  type="button"
                  className="w-full rounded-xl border border-bench-border bg-white/[0.025] p-3 text-left hover:border-bench-orange/45"
                  onClick={() => navigate(`/tool-guides/${row.guide.toolTypeId}`)}
                >
                  <p className="text-sm font-bold text-bench-text">{row.guideContent?.practiceTasks[0]?.title ?? `Practice ${row.guide.toolName}`}</p>
                  <p className="mt-1 text-xs leading-5 text-bench-muted">{row.guideContent?.practiceTasks[0]?.goal ?? row.guide.summary}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle title="Recent Evidence" />
            {activity.length === 0 && <p className="text-sm text-bench-muted">BenchXP evidence will appear here as you complete guide steps, practice tasks, confidence check-ins, and maintenance logs.</p>}
            {activity.map((item) => (
              <div key={item.id} className="mt-4 flex items-start gap-3">
                <IconTile icon={Star} tone="purple" size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{benchXpActivityTitle(item.sourceType)}</p>
                  <p className="text-sm text-bench-muted">{item.description}</p>
                </div>
                <span className="text-xs text-bench-muted">{formatDate(item.createdAt)}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}

function BenchXpOverviewHero({
  averageFamiliarity,
  familiarityLabel,
  totalXp,
  level,
  progressPercent,
  nextRecommendation,
  onContinue,
}: {
  averageFamiliarity: number
  familiarityLabel: string
  totalXp: number
  level: number
  progressPercent: number
  nextRecommendation?: BenchXpRecommendation
  onContinue: () => void
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-bench-border bg-[radial-gradient(circle_at_88%_12%,rgba(255,106,0,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-5 shadow-panel md:p-7">
      <div className="grid gap-6 xl:grid-cols-[1fr_280px] xl:items-end">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill label="BenchXP command center" tone="orange" />
            <StatusPill label="Balanced warnings" tone="purple" />
            <StatusPill label="Not certification" tone="muted" />
          </div>
          <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-bench-text md:text-4xl">Your workshop familiarity is growing.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-bench-muted">
            BenchXP tracks guide progress, controlled practice, safety signals, maintenance, confidence, and project use. It helps you decide what to practice next without pretending to certify tool skill.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="primary" icon={<Play size={16} />} onClick={onContinue}>Continue learning</Button>
            <Button variant="secondary" icon={<Gauge size={16} />} onClick={onContinue}>Why this score?</Button>
          </div>
        </div>
        <div className="rounded-2xl border border-bench-orange/25 bg-bench-orange/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-bench-orange">Overall familiarity</p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-5xl font-black text-bench-text">{averageFamiliarity}</p>
              <p className="text-sm text-bench-muted">{familiarityLabel}</p>
            </div>
            <StatusPill label={`Level ${level}`} tone="purple" />
          </div>
          <ProgressBar className="mt-4" value={progressPercent} tone="orange" />
          <p className="mt-3 text-sm text-bench-muted">{totalXp} BenchXP earned from real evidence.</p>
          {nextRecommendation && <p className="mt-3 text-sm font-semibold text-bench-text">Next: {nextRecommendation.title}</p>}
        </div>
      </div>
    </section>
  )
}

function RecommendedNextSkillCard({
  recommendation,
  fallbackGuide,
  onOpen,
}: {
  recommendation?: BenchXpRecommendation
  fallbackGuide?: MasteryGuide
  onOpen: () => void
}) {
  return (
    <Card className="border-bench-orange/35 bg-bench-orange/10">
      <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <IconTile icon={Target} tone="orange" size="lg" />
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill label="Recommended next skill" tone="orange" />
            <StatusPill label={recommendation?.priority ?? 'starter'} tone={recommendation?.priority === 'high' ? 'red' : recommendation?.priority === 'medium' ? 'yellow' : 'muted'} />
          </div>
          <h3 className="mt-2 text-xl font-black text-bench-text">{recommendation?.title ?? `Start with ${fallbackGuide?.toolName ?? 'one practical guide'}`}</h3>
          <p className="mt-1 text-sm leading-6 text-bench-muted">
            {recommendation?.detail ?? 'BenchOS will make better recommendations after you add real tools, finish guide steps, or log one controlled practice task.'}
          </p>
        </div>
        <Button variant="primary" icon={<ArrowRight size={16} />} onClick={onOpen}>
          Open guide
        </Button>
      </div>
    </Card>
  )
}

function CategoryMasteryGrid({ rows, onOpenGuide }: { rows: CategoryRow[]; onOpenGuide: (toolTypeId: string) => void }) {
  return (
    <Card>
      <CardTitle title="Category Mastery" />
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <button
            key={row.category}
            type="button"
            className="rounded-xl border border-bench-border bg-white/[0.025] p-4 text-left transition hover:border-bench-orange/45 focus:outline-none focus:ring-2 focus:ring-bench-orange/50"
            onClick={() => onOpenGuide(row.recommendedToolTypeId)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-bench-text">{row.category}</p>
                <p className="mt-1 text-sm text-bench-muted">{row.ownedCount} owned guide match{row.ownedCount === 1 ? '' : 'es'}</p>
              </div>
              <StatusPill label={getFamiliarityLabel(row.score)} tone={row.score >= 66 ? 'green' : row.score >= 26 ? 'yellow' : 'muted'} />
            </div>
            <ProgressBar className="mt-4" value={row.score} tone="orange" />
            <p className="mt-3 text-xs font-semibold uppercase text-bench-muted">Weakest signal</p>
            <p className="mt-1 text-sm text-bench-text">{row.weakestDimension}</p>
          </button>
        ))}
      </div>
    </Card>
  )
}

function OwnedToolFamiliarity({ rows, onOpenGuide, onBrowseTools }: { rows: MasteryRow[]; onOpenGuide: (toolTypeId: string) => void; onBrowseTools: () => void }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardTitle title="Owned Tool Familiarity" />
        <EmptyMasteryState
          title="Add your first tool to start building real mastery data."
          detail="Owned-tool familiarity prioritizes real brand/model tools from your inventory, then connects them to guides, practice, and readiness warnings."
          actionLabel="Browse Tool Library"
          onAction={onBrowseTools}
        />
      </Card>
    )
  }

  return (
    <Card>
      <CardTitle title="Owned Tool Familiarity" />
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {rows.map((row) => {
          const score = row.progress?.familiarityScore ?? 0
          return (
            <button
              key={row.ownedTool?.id ?? row.guide.id}
              type="button"
              className="rounded-xl border border-bench-border bg-white/[0.025] p-4 text-left transition hover:border-bench-orange/45 focus:outline-none focus:ring-2 focus:ring-bench-orange/50"
              onClick={() => onOpenGuide(row.guide.toolTypeId)}
            >
              <div className="flex items-start gap-3">
                <IconTile icon={Wrench} tone={score > 0 ? 'orange' : 'muted'} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-bench-text">{formatOwnedToolName(row.ownedTool)}</p>
                  <p className="text-sm text-bench-muted">{row.guide.toolName}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill label={getFamiliarityLabel(score)} tone={score >= 46 ? 'green' : score > 0 ? 'yellow' : 'muted'} />
                    <StatusPill label={row.progress?.status.replace('_', ' ') ?? 'not started'} tone="muted" />
                  </div>
                  <ProgressBar className="mt-3" value={score} tone="orange" />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

function GuideDetail({
  guide,
  progress,
  disabled,
  onOpenGuide,
  onCompleteStep,
}: {
  guide: MasteryGuide
  progress?: BenchXpProgress
  disabled?: boolean
  onOpenGuide: () => void
  onCompleteStep: (step: MasteryGuideStep) => Promise<unknown>
}) {
  const completed = new Set(progress?.completedStepIds ?? [])
  const nextStep = guide.steps.find((step) => !completed.has(step.id))
  const scores = progress?.skillScores ?? emptySkillScores()

  return (
    <Card>
      <CardTitle title={guide.toolName} action={<Button size="sm" variant="outline" icon={<BookOpen size={15} />} disabled={disabled} onClick={onOpenGuide}>Open Full Guide</Button>} />
      <p className="text-sm text-bench-muted">{guide.summary}</p>
      <SkillDimensionBars scores={scores} compact />
      {nextStep ? (
        <div className="mt-4 rounded-xl border border-bench-orange/30 bg-bench-orange/10 p-3">
          <p className="text-xs font-semibold uppercase text-bench-orange">Next BenchXP action</p>
          <p className="mt-1 text-sm font-semibold text-bench-text">{nextStep.title}</p>
          <p className="mt-1 text-xs leading-5 text-bench-muted">{nextStep.description}</p>
          <Button className="mt-3 w-full" variant="primary" icon={<CheckCircle2 size={16} />} disabled={disabled} onClick={() => void onCompleteStep(nextStep)}>
            Complete Next Step
          </Button>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-bench-green/30 bg-bench-green/10 p-3 text-sm font-semibold text-bench-green">
          Guide completed. Use the full guide page for practice, confidence, mistakes, and maintenance evidence.
        </div>
      )}
      <div className="mt-4 space-y-3">
        {guide.steps.map((step) => (
          <div key={step.id} className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="mt-1 text-xs text-bench-muted">{step.description}</p>
              </div>
              {completed.has(step.id) ? <CheckCircle2 className="text-bench-green" size={18} /> : <StatusPill label={`${step.xp} XP`} tone="orange" />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function SkillDimensionBars({ scores, compact = false }: { scores: Record<SkillDimension, number>; compact?: boolean }) {
  return (
    <div className={compact ? 'mt-4 grid gap-2' : 'mt-5 grid gap-3'}>
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

function EvidenceMiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
      <p className="text-xs font-semibold uppercase text-bench-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-bench-text">{value}</p>
    </div>
  )
}

function EmptyMasteryState({ title, detail, actionLabel, onAction }: { title: string; detail: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-bench-border bg-white/[0.02] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <IconTile icon={Sparkles} tone="orange" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-bench-text">{title}</p>
          <p className="mt-1 text-sm leading-6 text-bench-muted">{detail}</p>
        </div>
        <Button type="button" variant="outline" onClick={onAction}>{actionLabel}</Button>
      </div>
    </div>
  )
}

function progressStatusLabel(guide: MasteryGuide, progress?: BenchXpProgress) {
  if (!progress) return 'Not Started'
  const percent = Math.round((progress.completedStepIds.length / Math.max(1, guide.steps.length)) * 100)
  const familiarity = getFamiliarityLabel(percent)
  const level = Math.floor(progress.xp / 500) + 1
  if (progress.status === 'completed') return `Completed Guide - ${familiarity}`
  if (progress.status === 'in_progress') return `${familiarity} - Level ${level}`
  return `${familiarity} - Not Started`
}

function findGuideProgress(progress: BenchXpProgress[], guideId: string) {
  return progress.find((item) => item.guideId === guideId)
}

type CategoryRow = {
  category: string
  score: number
  ownedCount: number
  weakestDimension: SkillDimension
  recommendedToolTypeId: string
}

function buildCategoryRows(rows: MasteryRow[]): CategoryRow[] {
  const grouped = new Map<string, MasteryRow[]>()
  for (const row of rows) {
    const category = row.guideContent?.category ?? row.guide.category
    grouped.set(category, [...(grouped.get(category) ?? []), row])
  }

  return [...grouped.entries()].map(([category, categoryRows]) => {
    const progresses = categoryRows.map((row) => row.progress).filter((item): item is BenchXpProgress => Boolean(item))
    const scores = progresses.map((item) => item.familiarityScore)
    const score = scores.length > 0 ? Math.round(scores.reduce((sum, item) => sum + item, 0) / scores.length) : 0
    const weakestDimension = findWeakestDimension(progresses) ?? 'Safety'
    const recommended = categoryRows.find((row) => row.ownedTool && row.progress?.status !== 'completed') ?? categoryRows.find((row) => row.progress?.status !== 'completed') ?? categoryRows[0]
    return {
      category,
      score,
      ownedCount: categoryRows.filter((row) => row.ownedTool).length,
      weakestDimension,
      recommendedToolTypeId: recommended.guide.toolTypeId,
    }
  }).sort((a, b) => b.ownedCount - a.ownedCount || a.score - b.score).slice(0, 6)
}

function averageSkillScores(progressRows: BenchXpProgress[]) {
  if (progressRows.length === 0) return emptySkillScores()
  const totals = emptySkillScores()
  for (const item of progressRows) {
    for (const dimension of skillDimensions) totals[dimension] += item.skillScores[dimension] ?? 0
  }
  return Object.fromEntries(skillDimensions.map((dimension) => [dimension, Math.round(totals[dimension] / progressRows.length)])) as Record<SkillDimension, number>
}

function emptySkillScores() {
  return Object.fromEntries(skillDimensions.map((dimension) => [dimension, 0])) as Record<SkillDimension, number>
}

function findWeakestDimension(progressRows: BenchXpProgress[]) {
  if (progressRows.length === 0) return undefined
  const averages = averageSkillScores(progressRows)
  return skillDimensions.reduce((weakest, dimension) => averages[dimension] < averages[weakest] ? dimension : weakest, skillDimensions[0])
}

function getTopRecommendation(recommendations: BenchXpRecommendation[], rows: MasteryRow[]) {
  if (recommendations.length > 0) return recommendations[0]
  const starter = rows.find((row) => row.ownedTool && row.progress?.status !== 'completed') ?? rows.find((row) => row.progress?.status === 'in_progress') ?? rows[0]
  if (!starter) return undefined
  return {
    id: `starter-${starter.guide.id}`,
    guideId: starter.guide.id,
    toolTypeId: starter.guide.toolTypeId,
    title: starter.progress ? `Continue ${starter.guide.toolName}` : `Start ${starter.guide.toolName}`,
    detail: starter.ownedTool ? 'This guide matches a real tool in your inventory.' : 'This starter guide builds the first evidence for your BenchXP score.',
    priority: starter.ownedTool ? 'medium' : 'low',
  } satisfies BenchXpRecommendation
}

function formatOwnedToolName(tool?: UserTool) {
  if (!tool) return 'Owned'
  const brandModel = [tool.brand, tool.model].filter(Boolean).join(' ')
  return brandModel || tool.name
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

function benchXpActivityTitle(sourceType: string) {
  if (sourceType === 'guide_step') return 'Guide step completed'
  if (sourceType === 'guide_complete') return 'Guide completed'
  if (sourceType === 'practice_task') return 'Practice logged'
  if (sourceType === 'confidence_checkin') return 'Confidence check-in'
  if (sourceType === 'mistake_log') return 'Mistake pattern logged'
  if (sourceType === 'maintenance_log') return 'Maintenance evidence'
  return 'BenchXP evidence'
}
