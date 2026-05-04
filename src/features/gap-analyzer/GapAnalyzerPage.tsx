import { AlertTriangle, Heart, Search, ShieldCheck, SlidersHorizontal, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { IconTile } from '../../components/ui/IconTile'
import { StatCard } from '../../components/ui/StatCard'
import { StatusPill } from '../../components/ui/StatusPill'
import { addGapItemToWishlist } from '../../data/actions'
import { useWorkshopDiagnostics } from '../../data/hooks'
import type { GapItem, GapKind } from '../../data/schema'
import type { StatusTone } from '../../data/mock/types'

const filters: Array<{ label: string; value: 'all' | GapKind }> = [
  { label: 'All', value: 'all' },
  { label: 'Tools', value: 'tool' },
  { label: 'Capabilities', value: 'capability' },
  { label: 'Materials', value: 'material' },
  { label: 'Accessories', value: 'accessory' },
  { label: 'Consumables', value: 'consumable' },
  { label: 'Safety', value: 'safety' },
  { label: 'Repair', value: 'repair' },
  { label: 'Compatibility', value: 'compatibility' },
]

export function GapAnalyzerPage() {
  const { gapAnalysis } = useWorkshopDiagnostics()
  const [filter, setFilter] = useState<'all' | GapKind>('all')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const visibleGaps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return gapAnalysis.gaps.filter((gap) => {
      if (filter !== 'all' && gap.kind !== filter) return false
      if (!normalizedQuery) return true
      return `${gap.name} ${gap.description} ${gap.category ?? ''} ${gap.projectNames.join(' ')} ${gap.templateNames.join(' ')}`
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [filter, gapAnalysis.gaps, query])

  async function addToWishlist(gap: GapItem) {
    const result = await addGapItemToWishlist(gap)
    setNotice(result.created ? `Added ${gap.name} to Wishlist.` : `${gap.name} is already on your Wishlist.`)
  }

  return (
    <div className="grid gap-5">
      {notice && (
        <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-xl border border-bench-green/40 bg-bench-green/15 px-5 py-3 text-sm font-semibold text-bench-green shadow-panel">
          {notice}
        </div>
      )}

      <section>
        <h1 className="text-3xl font-bold text-bench-text">Gap Analyzer</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-bench-muted">
          Live workshop diagnostics across your tools, materials, projects, templates, safety gear, condition, and compatibility.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={SlidersHorizontal} label="Total Gaps" value={gapAnalysis.totalGaps} detail="Live diagnostic findings" tone="orange" />
        <StatCard icon={AlertTriangle} label="Blocked Items" value={gapAnalysis.blockedProjectCount} detail="Projects and templates affected" tone="red" />
        <StatCard icon={ShieldCheck} label="Safety Gaps" value={gapAnalysis.safetyGapCount} detail="Baseline and project safety" tone="yellow" />
        <StatCard icon={Heart} label="Quick Wins" value={gapAnalysis.quickWinCount} detail="Good wishlist candidates" tone="green" />
      </div>

      <Card>
        <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Search gaps</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bench-muted" size={16} />
            <input
              className="h-11 w-full rounded-lg border border-bench-border bg-white/[0.035] pl-9 pr-3 text-sm text-bench-text outline-none placeholder:text-bench-muted focus:border-bench-orange/70"
              placeholder="Search saw blade, safety, charger, plywood..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.value}
                className={`min-h-10 rounded-lg border px-3 text-sm font-semibold transition ${filter === item.value ? 'border-bench-orange/60 bg-bench-orange/12 text-bench-orange shadow-glow' : 'border-bench-border bg-white/[0.025] text-bench-muted hover:border-bench-orange/40 hover:text-bench-text'}`}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_.8fr]">
        <Card>
          <CardTitle title="Diagnostic Findings" />
          {visibleGaps.length === 0 ? (
            <p className="text-sm text-bench-muted">No matching gaps found.</p>
          ) : (
            <div className="grid gap-3">
              {visibleGaps.slice(0, 80).map((gap) => (
                <GapRow key={gap.id} gap={gap} onWishlist={addToWishlist} />
              ))}
            </div>
          )}
        </Card>

        <div className="grid gap-5">
          <Card>
            <CardTitle title="Top Missing Categories" />
            <div className="grid gap-3">
              {gapAnalysis.topMissingCapabilityCategories.length === 0 ? (
                <p className="text-sm text-bench-muted">No capability category gaps yet.</p>
              ) : gapAnalysis.topMissingCapabilityCategories.map((item) => (
                <div key={item.category} className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-bench-text">{item.category}</p>
                    <StatusPill label={`${item.count} gaps`} tone="orange" />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-bench-muted">{item.gapNames.join(', ')}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle title="Project Blockers" />
            <div className="grid gap-3">
              {gapAnalysis.projectBlockers.slice(0, 8).map((blocker) => (
                <div key={`${blocker.source}-${blocker.id}`} className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-bench-text">{blocker.name}</p>
                      <p className="text-xs text-bench-muted">{blocker.source === 'template' ? 'Template' : 'Project'} - {blocker.missingCount} missing</p>
                    </div>
                    <StatusPill label={blocker.status} tone={blocker.status === 'Buildable Now' ? 'green' : blocker.status === 'Almost Buildable' ? 'yellow' : 'red'} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-bench-muted">
                    {[...blocker.missingTools, ...blocker.missingMaterials, ...blocker.safetyGaps].slice(0, 4).join(', ') || 'No blocker detail'}
                  </p>
                </div>
              ))}
              {gapAnalysis.projectBlockers.length === 0 && <p className="text-sm text-bench-muted">No blocked projects or templates right now.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function GapRow({ gap, onWishlist }: { gap: GapItem; onWishlist: (gap: GapItem) => Promise<void> }) {
  return (
    <div className="rounded-xl border border-bench-border bg-white/[0.025] p-4 transition hover:-translate-y-0.5 hover:border-bench-orange/45">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <IconTile icon={gapIcon(gap.kind)} tone={gapTone(gap)} size="md" />
          <div className="min-w-0">
            <h2 className="font-semibold text-bench-text">{gap.name}</h2>
            <p className="mt-1 text-sm leading-6 text-bench-muted">{gap.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <StatusPill label={gap.kind} tone={gapTone(gap)} />
          <StatusPill label={gap.severity} tone={gap.severity === 'high' ? 'red' : gap.severity === 'medium' ? 'yellow' : 'green'} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {gap.category && <StatusPill label={gap.category} tone="blue" />}
          <StatusPill label={`${gap.impactCount} affected`} tone="orange" />
          {gap.alreadyWishlisted && <StatusPill label="Wishlisted" tone="green" />}
        </div>
        <Button size="sm" variant="outline" icon={<Heart size={15} />} disabled={gap.alreadyWishlisted} onClick={() => void onWishlist(gap)}>
          Add to Wishlist
        </Button>
      </div>
      {(gap.projectNames.length > 0 || gap.templateNames.length > 0) && (
        <p className="mt-3 text-xs leading-5 text-bench-muted">
          Affects {[...gap.projectNames, ...gap.templateNames].slice(0, 5).join(', ')}
        </p>
      )}
    </div>
  )
}

function gapTone(gap: Pick<GapItem, 'kind' | 'severity'>): StatusTone {
  if (gap.kind === 'safety') return 'yellow'
  if (gap.kind === 'repair') return gap.severity === 'high' ? 'red' : 'yellow'
  if (gap.kind === 'compatibility') return 'purple'
  if (gap.kind === 'material' || gap.kind === 'consumable') return 'green'
  if (gap.kind === 'accessory') return 'blue'
  return 'orange'
}

function gapIcon(kind: GapKind) {
  if (kind === 'safety') return ShieldCheck
  if (kind === 'repair' || kind === 'tool') return Wrench
  if (kind === 'compatibility') return SlidersHorizontal
  return AlertTriangle
}
