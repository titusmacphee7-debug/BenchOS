import {
  ArrowRight,
  Bell,
  Briefcase,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  Clock,
  Gauge,
  Heart,
  Layers3,
  Package,
  Plus,
  Star,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MaterialUsageFormModal } from '../../components/logging/MaterialUsageFormModal'
import { ToolUsageFormModal } from '../../components/logging/ToolUsageFormModal'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { DataTable, type DataColumn } from '../../components/ui/DataTable'
import { IconTile } from '../../components/ui/IconTile'
import { PageHeader } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatCard } from '../../components/ui/StatCard'
import { StatusPill } from '../../components/ui/StatusPill'
import {
  useActiveMaterials,
  useActiveProjects,
  useActiveUserTools,
  useActiveWishlistItems,
  useActiveNotifications,
  useAuthSessionState,
  useAllProjectRequirements,
  useMasteryGuides,
  useMasteryProgress,
  useProjectTemplateData,
  useRecentActivityFeed,
  useToolLibraryData,
  useToolsNeedingMaintenance,
  useUserProfile,
  useWorkshopProfile,
  useWorkshopDiagnostics,
  useXpSummary,
} from '../../data/hooks'
import { sortTemplatesForWorkshop } from '../../lib/preferences/accountPersonalization'
import type { Material, Project, ReadinessResult, UserTool, WishlistItem } from '../../data/schema'
import { getMaterialStockStatus } from '../../lib/inventory/inventory'
import { calculateProjectReadiness } from '../../lib/readiness/readinessEngine'
import { conditionTone, priorityTone, readinessTone, stockTone, usageTone } from '../../lib/utils/status'

type ProjectDashboardRow = Project & { readiness: ReadinessResult }

const projectColumns: DataColumn<ProjectDashboardRow>[] = [
  {
    header: 'Project',
    render: (project) => (
      <div>
        <p className="font-semibold text-bench-text">{project.name}</p>
        <p className="text-xs text-bench-muted">{new Date(project.updatedAt).toLocaleDateString()}</p>
      </div>
    ),
  },
  {
    header: 'Status',
    render: (project) => <StatusPill label={project.readiness.status} tone={readinessTone(project.readiness.status)} />,
  },
  {
    header: 'Progress',
    render: (project) => (
      <div className="flex items-center gap-3">
        <span className="w-10 text-sm font-semibold">{project.progress}%</span>
        <ProgressBar value={project.progress} tone={project.progress > 60 ? 'green' : project.progress > 0 ? 'yellow' : 'muted'} />
      </div>
    ),
  },
  {
    header: 'Next Step',
    render: (project) => <span className="text-bench-muted">{nextStepLabel(project.readiness)}</span>,
  },
]

const toolColumns: DataColumn<UserTool>[] = [
  {
    header: 'Tool',
    render: (tool) => (
      <div className="flex items-center gap-3">
        <IconTile icon={Wrench} size="sm" tone="orange" />
        <div>
          <p className="font-semibold">{tool.name}</p>
          <p className="text-xs text-bench-muted">{tool.brand} {tool.model}</p>
        </div>
      </div>
    ),
  },
  { header: 'Condition', render: (tool) => <StatusPill label={tool.condition} tone={conditionTone(tool.condition)} /> },
  { header: 'Location', render: (tool) => <span className="text-bench-muted">{tool.storageLocation}</span> },
  { header: 'Last Used', render: (tool) => <span className="text-bench-muted">{tool.lastUsedAt || 'Not logged yet'}</span> },
]

const materialColumns: DataColumn<Material>[] = [
  {
    header: 'Material',
    render: (material) => (
      <div className="flex items-center gap-3">
        <IconTile icon={Package} size="sm" tone="yellow" />
        <span className="font-semibold">{material.name}</span>
      </div>
    ),
  },
  { header: 'On Hand', render: (material) => <span>{material.quantity} {material.unit.split(' ')[0]}</span> },
  { header: 'Location', render: (material) => <span className="text-bench-muted">{material.storageLocation}</span> },
  { header: 'Status', render: (material) => <StatusPill label={getMaterialStockStatus(material)} tone={stockTone(getMaterialStockStatus(material))} /> },
]

function WishlistRow({ item }: { item: WishlistItem }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-bench-border/70 py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <IconTile icon={item.itemType === 'Tool' ? Wrench : Package} size="sm" tone={item.itemType === 'Tool' ? 'red' : 'purple'} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-bench-text">{item.name}</p>
          <p className="truncate text-xs text-bench-muted">{item.addedFor ?? item.itemType}</p>
        </div>
      </div>
      <StatusPill label={item.priority} tone={priorityTone(item.priority)} />
    </div>
  )
}

function nextStepLabel(readiness: ReadinessResult) {
  if (readiness.status === 'Buildable Now') return 'Ready to build'
  if (readiness.missingTools.length > 0) return `Need ${readiness.missingTools[0].name}`
  if (readiness.missingMaterials.length > 0) return `Need ${readiness.missingMaterials[0].name}`
  return 'Optional items missing'
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [toolUsageModalOpen, setToolUsageModalOpen] = useState(false)
  const [materialUsageModalOpen, setMaterialUsageModalOpen] = useState(false)
  const userTools = useActiveUserTools()
  const materials = useActiveMaterials()
  const projects = useActiveProjects()
  const requirements = useAllProjectRequirements()
  const wishlistItems = useActiveWishlistItems()
  const xpSummary = useXpSummary()
  const masteryGuides = useMasteryGuides()
  const masteryProgress = useMasteryProgress()
  const recentActivity = useRecentActivityFeed(6)
  const maintenanceTools = useToolsNeedingMaintenance()
  const notifications = useActiveNotifications()
  const session = useAuthSessionState()
  const userProfile = useUserProfile()
  const workshopProfile = useWorkshopProfile()
  const { templates } = useProjectTemplateData()
  const { gapAnalysis, workshopScore } = useWorkshopDiagnostics()
  const { typeCapabilities } = useToolLibraryData()
  const profileName = userProfile?.displayName?.trim()
  const displayName = profileName && profileName !== 'Local Mode' ? profileName : session?.email?.split('@')[0] ?? 'Builder'
  const lowStock = materials.filter((material) => getMaterialStockStatus(material) !== 'In Stock')
  const goodTools = userTools.filter((tool) => tool.condition === 'Good' || tool.condition === 'New').length
  const projectRows = useMemo<ProjectDashboardRow[]>(() => projects.map((project) => ({
    ...project,
    readiness: calculateProjectReadiness({
      project,
      requirements: requirements.filter((requirement) => requirement.projectId === project.id),
      userTools,
      materials,
      toolTypeCapabilities: typeCapabilities,
    }),
  })), [materials, projects, requirements, typeCapabilities, userTools])
  const buildableCount = projectRows.filter((project) => project.readiness.status === 'Buildable Now').length
  const missingWishlist = wishlistItems.filter((item) => item.status !== 'Converted' && item.status !== 'Archived')
  const activeMastery = masteryProgress.find((progress) => progress.status === 'In Progress') ?? masteryProgress[0]
  const activeGuide = masteryGuides.find((guide) => guide.id === activeMastery?.guideId)
  const suggestedTemplates = useMemo(() => sortTemplatesForWorkshop(templates, workshopProfile).slice(0, 3), [templates, workshopProfile])

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description={`${workshopProfile?.name ?? 'Your workshop'} is tuned for ${workshopProfile?.type ?? 'mixed'} work. Know what you own, what you can build, and what to do next.`}
        icon={Briefcase}
        actions={
          <>
            <Button icon={<Clock size={18} />} onClick={() => setToolUsageModalOpen(true)}>Log Tool Use</Button>
            <Button variant="primary" icon={<Package size={18} />} onClick={() => setMaterialUsageModalOpen(true)}>Log Material Usage</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Briefcase} label="Total Tools" value={userTools.length} detail={`${goodTools} in good condition`} tone="orange" />
        <StatCard icon={Layers3} label="Materials Tracked" value={materials.length} detail={`${lowStock.length} low or out`} tone="yellow" />
        <StatCard icon={CheckCircle2} label="Buildable Now" value={buildableCount} detail="Projects ready to go" tone="green" />
        <StatCard icon={Heart} label="Wishlist Items" value={missingWishlist.length} detail="Across tools and materials" tone="purple" />
      </div>

      {suggestedTemplates.length > 0 && (
        <Card className="mt-5">
          <CardTitle
            title="Suggested From Your Onboarding"
            action={<Button variant="ghost" icon={<ArrowRight size={16} />} onClick={() => navigate('/project-templates')}>Templates</Button>}
          />
          <div className="grid gap-3 md:grid-cols-3">
            {suggestedTemplates.map((template) => (
              <button
                key={template.id}
                className="rounded-lg border border-bench-border bg-white/[0.025] p-3 text-left transition hover:-translate-y-0.5 hover:border-bench-orange/45"
                onClick={() => navigate(`/project-templates/${template.id}`)}
              >
                <p className="font-semibold text-bench-text">{template.name}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-bench-muted">{template.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusPill label={template.category} tone="blue" />
                  <StatusPill label={template.suggestedSkillLevel} tone={template.suggestedSkillLevel === 'Beginner' ? 'green' : 'yellow'} />
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
        <Card>
          <CardTitle
            title="Workshop Score"
            action={<Button variant="ghost" icon={<ArrowRight size={16} />} onClick={() => navigate('/workshop-score')}>View score</Button>}
          />
          <div className="flex items-center gap-4">
            <IconTile icon={Gauge} tone={workshopScore.score >= 75 ? 'green' : workshopScore.score >= 55 ? 'yellow' : 'orange'} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-4xl font-bold leading-none text-bench-text">{workshopScore.score}</p>
                <StatusPill label="Live" tone="orange" />
              </div>
              <ProgressBar className="mt-3" value={workshopScore.score} tone={workshopScore.score >= 75 ? 'green' : workshopScore.score >= 55 ? 'yellow' : 'orange'} />
              <p className="mt-2 text-sm text-bench-muted">{gapAnalysis.quickWinCount} quick wins can improve readiness.</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle
            title="Top Workshop Gaps"
            action={<Button variant="ghost" icon={<ArrowRight size={16} />} onClick={() => navigate('/gap-analyzer')}>Analyze</Button>}
          />
          <div className="grid gap-3 md:grid-cols-3">
            {gapAnalysis.topGaps.slice(0, 3).map((gap) => (
              <button
                key={gap.id}
                className="rounded-lg border border-bench-border bg-white/[0.025] p-3 text-left transition hover:-translate-y-0.5 hover:border-bench-orange/45"
                onClick={() => navigate('/gap-analyzer')}
              >
                <div className="flex items-center gap-2">
                  <ChartNoAxesColumnIncreasing className="text-bench-orange" size={16} />
                  <p className="truncate text-sm font-semibold text-bench-text">{gap.name}</p>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-bench-muted">{gap.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusPill label={gap.kind} tone="orange" />
                  <StatusPill label={`${gap.impactCount} affected`} tone="blue" />
                </div>
              </button>
            ))}
            {gapAnalysis.topGaps.length === 0 && <p className="text-sm text-bench-muted">No diagnostic gaps yet.</p>}
          </div>
        </Card>

      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card padded={false}>
          <div className="p-5 pb-0">
            <CardTitle
              title="Project Readiness"
              action={<Button variant="ghost" icon={<ArrowRight size={16} />} onClick={() => navigate('/projects')}>View all projects</Button>}
            />
          </div>
          <DataTable columns={projectColumns} data={projectRows.slice(0, 4)} gridTemplate="1.15fr .95fr .9fr 1fr" className="rounded-none border-x-0 border-b-0" />
        </Card>

        <Card padded={false}>
          <div className="p-5 pb-0">
            <CardTitle
              title="My Tools"
              action={<Button variant="ghost" icon={<ArrowRight size={16} />} onClick={() => navigate('/my-tools')}>View all tools</Button>}
            />
          </div>
          <DataTable columns={toolColumns} data={userTools.slice(0, 4)} gridTemplate="1.25fr .7fr .9fr .8fr" className="rounded-none border-x-0 border-b-0" />
          <div className="p-4 text-center">
            <Button variant="outline" icon={<Clock size={16} />} onClick={() => setToolUsageModalOpen(true)}>Log Tool Use</Button>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[.95fr_.95fr_1fr]">
        <Card>
          <CardTitle
            title="Wishlist / Missing Items"
            action={<Button variant="ghost" icon={<ArrowRight size={16} />} onClick={() => navigate('/wishlist')}>View all</Button>}
          />
          <div>{missingWishlist.slice(0, 4).map((item) => <WishlistRow key={item.id} item={item} />)}</div>
          <Button className="mt-4 w-full" variant="outline" icon={<Plus size={16} />} onClick={() => navigate('/wishlist')}>Add Missing Items</Button>
        </Card>

        <Card>
          <CardTitle
            title="BenchXP - Tool Mastery"
            action={<Button variant="ghost" icon={<ArrowRight size={16} />} onClick={() => navigate('/mastery')}>View all skills</Button>}
          />
          <div className="flex items-start gap-4">
            <IconTile icon={Star} tone="orange" size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-bench-text">Level {xpSummary.level}</p>
                  <p className="text-sm text-bench-muted">{xpSummary.totalXp} total BenchXP</p>
                </div>
                <p className="text-2xl font-bold">{xpSummary.progressPercent}%</p>
              </div>
              <ProgressBar className="mt-3" value={xpSummary.progressPercent} tone="orange" />
              <p className="mt-3 text-sm text-bench-muted">{xpSummary.xpIntoLevel} / {xpSummary.xpToNextLevel} XP to next level</p>
              {activeMastery && activeGuide && (
                <div className="mt-4 rounded-lg border border-bench-border bg-white/[0.025] p-3">
                  <p className="text-sm font-semibold">{activeGuide.toolName}</p>
                  <p className="text-xs text-bench-muted">{activeMastery.status} - Level {activeMastery.level}</p>
                </div>
              )}
              {[
                ['Safety', activeMastery?.safetyProgress ?? 0],
                ['Setup', activeMastery?.setupProgress ?? 0],
                ['Operation', activeMastery?.operationProgress ?? 0],
                ['Accuracy', activeMastery?.accuracyProgress ?? 0],
                ['Maintenance', activeMastery?.maintenanceProgress ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="mt-3 grid grid-cols-[1fr_1.1fr_3rem] items-center gap-3 text-sm">
                  <span className="text-bench-muted">{label}</span>
                  <ProgressBar value={Number(value)} tone={usageTone(Number(value) > 75 ? 'High' : 'Medium')} />
                  <span className="text-right text-bench-muted">{value}%</span>
                </div>
              ))}
            </div>
          </div>
          <Button className="mt-5 w-full" variant="outline" icon={<Star size={16} />} onClick={() => navigate('/mastery')}>Practice and Log XP</Button>
        </Card>

        <Card padded={false}>
          <div className="p-5 pb-0">
            <CardTitle
              title="Materials Low Stock"
              action={<Button variant="ghost" icon={<ArrowRight size={16} />} onClick={() => navigate('/materials')}>View all</Button>}
            />
          </div>
          <DataTable columns={materialColumns} data={lowStock.slice(0, 5)} gridTemplate="1.1fr .65fr .9fr .7fr" className="rounded-none border-x-0 border-b-0" />
          <div className="p-4 text-center">
            <Button variant="outline" icon={<Plus size={16} />} onClick={() => navigate('/materials')}>Add Material</Button>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardTitle title="Recent Activity" />
          {recentActivity.map((item) => (
            <div key={item.id} className="mt-4 flex items-start gap-3">
              <IconTile icon={Clock} tone={item.tone} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-sm text-bench-muted">{item.description}</p>
              </div>
              <span className="text-xs text-bench-muted">{formatDate(item.timestamp)}</span>
            </div>
          ))}
          {recentActivity.length === 0 && <p className="text-sm text-bench-muted">No workshop activity logged yet.</p>}
        </Card>

        <Card>
          <CardTitle title="Alerts and Maintenance" action={<IconTile icon={Bell} tone="yellow" size="sm" />} />
          {notifications.slice(0, 3).map((notification) => (
            <div key={notification.id} className="mt-4 rounded-lg border border-bench-yellow/25 bg-bench-yellow/10 p-3 text-sm">
              <p className="font-semibold text-bench-yellow">{notification.title}</p>
              <p className="mt-1 text-bench-muted">{notification.description}</p>
            </div>
          ))}
          {maintenanceTools.slice(0, 4).map((tool) => (
            <div key={tool.id} className="mt-4 flex items-center justify-between gap-3 text-sm">
              <span>{tool.name}</span>
              <StatusPill label={tool.condition === 'Needs Repair' || tool.condition === 'Broken' ? tool.condition : 'Check Maintenance'} tone={conditionTone(tool.condition)} />
            </div>
          ))}
          {notifications.length === 0 && maintenanceTools.length === 0 && <p className="text-sm text-bench-muted">No active alerts right now.</p>}
        </Card>
      </div>

      <ToolUsageFormModal open={toolUsageModalOpen} onClose={() => setToolUsageModalOpen(false)} />
      <MaterialUsageFormModal open={materialUsageModalOpen} onClose={() => setMaterialUsageModalOpen(false)} />
    </div>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}
