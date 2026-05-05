import { BookOpen, CheckCircle2, Lock, Play, Search, Star, TrendingUp, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { IconTile } from '../../components/ui/IconTile'
import { PageHeader } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatCard } from '../../components/ui/StatCard'
import { StatusPill } from '../../components/ui/StatusPill'
import { completeMasteryGuideStep, startMasteryGuide } from '../../data/actions'
import { useActiveUserTools, useMasteryGuides, useMasteryProgress, useRecentActivityFeed, useXpSummary } from '../../data/hooks'
import type { MasteryGuide, MasteryProgress } from '../../data/schema'
import { getFamiliarityLabel } from '../../lib/guides/toolMasteryContent'

const tabs = ['All Tools', 'Owned Tools', 'In Progress', 'Completed Guides']

export function MasteryPage() {
  const [searchParams] = useSearchParams()
  const guides = useMasteryGuides()
  const progress = useMasteryProgress()
  const tools = useActiveUserTools()
  const xpSummary = useXpSummary()
  const activity = useRecentActivityFeed(4)
  const [activeTab, setActiveTab] = useState('All Tools')
  const [query, setQuery] = useState('')
  const [selectedGuideId, setSelectedGuideId] = useState<string>()
  const requestedToolTypeId = searchParams.get('tool')

  const rows = useMemo(() => guides
    .map((guide) => ({
      guide,
      progress: progress.find((item) => item.guideId === guide.id),
      ownedTool: tools.find((tool) => tool.toolTypeId === guide.toolTypeId),
    }))
    .filter((row) => {
      if (activeTab === 'Owned Tools') return Boolean(row.ownedTool)
      if (activeTab === 'In Progress') return row.progress?.status === 'In Progress'
      if (activeTab === 'Completed Guides') return row.progress?.status === 'Mastered'
      return true
    })
    .filter((row) => [row.guide.toolName, row.guide.category, row.guide.summary].join(' ').toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(Boolean(b.ownedTool)) - Number(Boolean(a.ownedTool)) || a.guide.sortOrder - b.guide.sortOrder),
  [activeTab, guides, progress, query, tools])

  const requestedGuideId = requestedToolTypeId ? guides.find((guide) => guide.toolTypeId === requestedToolTypeId)?.id : undefined
  const selected = rows.find((row) => row.guide.id === (selectedGuideId ?? requestedGuideId)) ?? rows[0]
  const completedGuideCount = progress.filter((item) => item.status === 'Mastered').length
  const inProgress = progress.filter((item) => item.status === 'In Progress').length
  const ownedGuideCount = guides.filter((guide) => tools.some((tool) => tool.toolTypeId === guide.toolTypeId)).length

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
              <Button>{activeTab}</Button>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={BookOpen} label="Guides" value={guides.length} detail="Starter guide set" tone="orange" />
            <StatCard icon={Wrench} label="Owned Guides" value={ownedGuideCount} detail="Matched to inventory" tone="blue" />
            <StatCard icon={Star} label="Completed Guides" value={completedGuideCount} detail={`${inProgress} building familiarity`} tone="green" />
            <StatCard icon={TrendingUp} label="BenchXP" value={xpSummary.totalXp} detail={`Level ${xpSummary.level}`} tone="purple" />
          </div>

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
                      <IconTile icon={Wrench} size="lg" tone={guideProgress?.status === 'Mastered' ? 'green' : ownedTool ? 'orange' : 'muted'} />
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
                      <p className={guideProgress?.status === 'Mastered' ? 'text-bench-green' : 'text-bench-orange'}>
                        {progressStatusLabel(guide, guideProgress)}
                      </p>
                      <ProgressBar className="mt-2" value={percent} tone={guideProgress?.status === 'Mastered' ? 'green' : 'orange'} />
                    </div>
                    <p className="text-sm text-bench-muted">{guideProgress?.xp ?? 0} XP</p>
                    <Button
                      variant={guideProgress ? 'secondary' : 'outline'}
                      icon={guideProgress ? <Play size={16} /> : <Lock size={16} />}
                      onClick={() => {
                        setSelectedGuideId(guide.id)
                        if (!guideProgress) void startMasteryGuide(guide.id, ownedTool?.id)
                      }}
                    >
                      {guideProgress?.status === 'Mastered' ? 'Review' : guideProgress ? 'Continue' : 'Start Guide'}
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

          {selected && <GuideDetail guide={selected.guide} progress={selected.progress} userToolId={selected.ownedTool?.id} />}

          <Card>
            <CardTitle title="Recent Activity" />
            {activity.map((item) => (
              <div key={item.id} className="mt-4 flex items-start gap-3">
                <IconTile icon={Star} tone={item.tone} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-sm text-bench-muted">{item.description}</p>
                </div>
                <span className="text-xs text-bench-muted">{formatDate(item.timestamp)}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}

function GuideDetail({ guide, progress, userToolId }: { guide: MasteryGuide; progress?: MasteryProgress; userToolId?: string }) {
  const completed = new Set(progress?.completedStepIds ?? [])
  const nextStep = guide.steps.find((step) => !completed.has(step.id))

  return (
    <Card>
      <CardTitle title={guide.toolName} />
      <p className="text-sm text-bench-muted">{guide.summary}</p>
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
      {nextStep ? (
        <Button className="mt-5 w-full" variant="primary" icon={<CheckCircle2 size={16} />} onClick={() => void completeMasteryGuideStep(guide.id, nextStep.id, userToolId)}>
          Complete Next Step
        </Button>
      ) : (
        <Button className="mt-5 w-full" variant="outline" icon={<CheckCircle2 size={16} />}>Completed Guide</Button>
      )}
    </Card>
  )
}

function progressStatusLabel(guide: MasteryGuide, progress?: MasteryProgress) {
  if (!progress) return 'Not Started'
  const percent = Math.round((progress.completedStepIds.length / Math.max(1, guide.steps.length)) * 100)
  const familiarity = getFamiliarityLabel(percent)
  if (progress.status === 'Mastered') return `Completed Guide - ${familiarity}`
  if (progress.status === 'In Progress') return `${familiarity} - Level ${progress.level}`
  return `${familiarity} - Not Started`
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}
