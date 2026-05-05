import { BookOpen, CheckCircle2, Lock, Play, Search, Star, TrendingUp, Wrench } from 'lucide-react'
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
import type { MasteryGuide, MasteryGuideStep } from '../../data/schema'
import { useBenchXp } from '../../lib/benchxp/useBenchXp'
import type { BenchXpProgress } from '../../lib/benchxp/benchXpApi'
import { getFamiliarityLabel } from '../../lib/guides/toolMasteryContent'

const tabs = ['All Tools', 'Owned Tools', 'In Progress', 'Completed Guides']

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

  const rows = useMemo(() => guides
    .map((guide) => ({
      guide,
      progress: findGuideProgress(progress, guide.id),
      ownedTool: tools.find((tool) => tool.toolTypeId === guide.toolTypeId),
    }))
    .filter((row) => {
      if (activeTab === 'Owned Tools') return Boolean(row.ownedTool)
      if (activeTab === 'In Progress') return row.progress?.status === 'in_progress'
      if (activeTab === 'Completed Guides') return row.progress?.status === 'completed'
      return true
    })
    .filter((row) => [row.guide.toolName, row.guide.category, row.guide.summary].join(' ').toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(Boolean(b.ownedTool)) - Number(Boolean(a.ownedTool)) || a.guide.sortOrder - b.guide.sortOrder),
  [activeTab, guides, progress, query, tools])

  const requestedGuideId = requestedToolTypeId ? guides.find((guide) => guide.toolTypeId === requestedToolTypeId)?.id : undefined
  const selected = rows.find((row) => row.guide.id === (selectedGuideId ?? requestedGuideId)) ?? rows[0]
  const completedGuideCount = xpSummary.completedGuides
  const inProgress = xpSummary.inProgressGuides
  const ownedGuideCount = guides.filter((guide) => tools.some((tool) => tool.toolTypeId === guide.toolTypeId)).length

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
        description="Build tool familiarity through guides, practice, safety habits, maintenance, and real project evidence."
        icon={Star}
      />

      <div className="grid gap-5 2xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
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
                          {ownedTool && <StatusPill label="Owned" tone="green" />}
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
            <CardTitle title="Your Progress" />
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border-[18px] border-bench-orange bg-white/[0.03]">
              <div className="text-center">
                <p className="text-3xl font-bold">{xpSummary.progressPercent}%</p>
                <p className="text-sm text-bench-muted">Level {xpSummary.level}</p>
              </div>
            </div>
            {[
              ['Completed Guides', completedGuideCount],
              ['In Progress', inProgress],
              ['Not Started', Math.max(0, guides.length - progress.length)],
            ].map(([label, value]) => (
              <div key={label} className="mt-4 flex items-center justify-between border-b border-bench-border pb-3 text-sm last:border-b-0">
                <span className="text-2xl font-bold">{value}</span>
                <span className="text-bench-muted">{label}</span>
              </div>
            ))}
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
            <CardTitle title="Recent Activity" />
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

  return (
    <Card>
      <CardTitle title={guide.toolName} action={<Button size="sm" variant="outline" icon={<BookOpen size={15} />} disabled={disabled} onClick={onOpenGuide}>Open Full Guide</Button>} />
      <p className="text-sm text-bench-muted">{guide.summary}</p>
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
