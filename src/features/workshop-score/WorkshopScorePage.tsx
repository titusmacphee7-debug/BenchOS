import { ArrowRight, Gauge, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { IconTile } from '../../components/ui/IconTile'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatusPill } from '../../components/ui/StatusPill'
import { useWorkshopDiagnostics } from '../../data/hooks'
import type { WorkshopCapabilityScore } from '../../data/schema'
import type { StatusTone } from '../../data/mock/types'

export function WorkshopScorePage() {
  const { gapAnalysis, workshopScore } = useWorkshopDiagnostics()

  return (
    <div className="grid gap-5">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-bench-text">Workshop Score</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-bench-muted">
            A live readiness score built from capability coverage, project readiness, materials, safety, accessories, compatibility, and tool condition.
          </p>
        </div>
        <Link to="/gap-analyzer">
          <Button variant="outline" icon={<ArrowRight size={16} />}>Open Gap Analyzer</Button>
        </Link>
      </section>

      <div className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4">
              <IconTile icon={Gauge} tone={scoreTone(workshopScore.score)} size="lg" />
              <StatusPill label="Live Local Score" tone="orange" />
            </div>
            <p className="mt-6 text-6xl font-bold leading-none text-bench-text">{workshopScore.score}</p>
            <p className="mt-2 text-sm text-bench-muted">Workshop Readiness Score / 100</p>
          </div>
          <div className="mt-6">
            <ProgressBar value={workshopScore.score} tone={scoreTone(workshopScore.score)} />
            <p className="mt-3 text-sm leading-6 text-bench-muted">
              {gapAnalysis.quickWinCount} quick wins and {gapAnalysis.safetyGapCount} safety gaps are shaping this score.
            </p>
          </div>
        </Card>

        <Card>
          <CardTitle title="Score Breakdown" />
          <div className="grid gap-3">
            {workshopScore.breakdown.map((item) => (
              <div key={item.key} className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-bench-text">{item.label}</p>
                    <p className="mt-1 text-xs text-bench-muted">{item.detail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-bench-text">{item.score}</p>
                    <p className="text-xs text-bench-muted">weight {item.weight}</p>
                  </div>
                </div>
                <ProgressBar className="mt-3" value={item.score} tone={scoreTone(item.score)} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle title="Capability Map" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {workshopScore.capabilityScores.map((capability) => (
            <CapabilityCard key={capability.category} capability={capability} />
          ))}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardTitle title="Quick Improvements" />
          <div className="grid gap-3">
            {workshopScore.quickImprovements.length === 0 ? (
              <p className="text-sm text-bench-muted">No quick improvements detected yet.</p>
            ) : workshopScore.quickImprovements.map((gap) => (
              <div key={gap.id} className="flex items-start justify-between gap-3 rounded-lg border border-bench-border bg-white/[0.025] p-3">
                <div className="min-w-0">
                  <p className="font-semibold text-bench-text">{gap.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-bench-muted">{gap.description}</p>
                </div>
                <StatusPill label={gap.kind} tone="orange" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle title="Repair / Maintenance Warnings" />
          <div className="grid gap-3">
            {workshopScore.repairWarnings.length === 0 ? (
              <p className="text-sm text-bench-muted">No repair or maintenance warnings right now.</p>
            ) : workshopScore.repairWarnings.map((gap) => (
              <div key={gap.id} className="flex items-start gap-3 rounded-lg border border-bench-border bg-white/[0.025] p-3">
                <IconTile icon={Wrench} tone={gap.severity === 'high' ? 'red' : 'yellow'} size="sm" />
                <div className="min-w-0">
                  <p className="font-semibold text-bench-text">{gap.name}</p>
                  <p className="mt-1 text-xs leading-5 text-bench-muted">{gap.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function CapabilityCard({ capability }: { capability: WorkshopCapabilityScore }) {
  return (
    <div className="rounded-xl border border-bench-border bg-white/[0.025] p-4 transition hover:-translate-y-0.5 hover:border-bench-orange/45">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-bench-text">{capability.category}</p>
          <p className="mt-1 text-xs text-bench-muted">{capability.ownedCount} owned / {capability.requiredCount} required</p>
        </div>
        <StatusPill label={`${capability.score}%`} tone={scoreTone(capability.score)} />
      </div>
      <ProgressBar className="mt-4" value={capability.score} tone={scoreTone(capability.score)} />
      {capability.highestImpactGap ? (
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-bench-muted">
          Next gap: <span className="text-bench-text">{capability.highestImpactGap.name}</span>
        </p>
      ) : (
        <p className="mt-3 text-xs leading-5 text-bench-muted">No major gap detected for this capability.</p>
      )}
      {(capability.affectedProjects.length > 0 || capability.affectedTemplates.length > 0) && (
        <p className="mt-2 line-clamp-1 text-xs text-bench-muted">
          Affects {[...capability.affectedProjects, ...capability.affectedTemplates].join(', ')}
        </p>
      )}
    </div>
  )
}

function scoreTone(score: number): StatusTone {
  if (score >= 75) return 'green'
  if (score >= 55) return 'yellow'
  if (score >= 35) return 'orange'
  return 'red'
}
