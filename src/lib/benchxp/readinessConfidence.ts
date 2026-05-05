import type { BenchXpProgress } from './benchXpApi'
import type { SkillDimension } from '../guides/toolMasteryContent'

type ToolRequirementLike = {
  id: string
  requirementKind: string
  displayName: string
  required: boolean
  toolTypeId?: string
  category?: string
  archivedAt?: string
}

export type ReadinessConfidenceWarning = {
  id: string
  severity: 'info' | 'warning'
  title: string
  detail: string
  toolTypeId?: string
}

export type ReadinessConfidenceResult = {
  mode: 'balanced'
  warnings: ReadinessConfidenceWarning[]
  weakestLink?: {
    label: string
    detail: string
    toolTypeId?: string
  }
}

export function calculateReadinessConfidence(input: {
  requirements: ToolRequirementLike[]
  ownedToolTypeIds: string[]
  progress: BenchXpProgress[]
}): ReadinessConfidenceResult {
  const ownedToolTypes = new Set(input.ownedToolTypeIds)
  const warnings: ReadinessConfidenceWarning[] = []
  const weaknessCandidates: Array<{ score: number; dimension: SkillDimension; requirement: ToolRequirementLike; progress: BenchXpProgress }> = []

  for (const requirement of input.requirements) {
    if (requirement.archivedAt || requirement.requirementKind === 'Material' || !requirement.required || !requirement.toolTypeId) continue
    if (!ownedToolTypes.has(requirement.toolTypeId)) continue

    const progress = input.progress.find((item) => item.toolTypeId === requirement.toolTypeId)
    if (!progress) {
      warnings.push({
        id: `guide-missing-${requirement.id}`,
        severity: 'warning',
        title: `Safety review recommended before using ${requirement.displayName}.`,
        detail: 'You own the tool, but BenchXP has no guide, practice, or confidence evidence for it yet.',
        toolTypeId: requirement.toolTypeId,
      })
      continue
    }

    const safetyScore = progress.skillScores.Safety ?? 0
    if (safetyScore < 50) {
      warnings.push({
        id: `safety-${requirement.id}`,
        severity: 'warning',
        title: `Safety familiarity is still thin for ${requirement.displayName}.`,
        detail: 'Balanced Warnings does not block the project, but it recommends a safety/setup pass first.',
        toolTypeId: requirement.toolTypeId,
      })
    }

    if (progress.familiarityScore < 45) {
      warnings.push({
        id: `practice-${requirement.id}`,
        severity: 'info',
        title: `Setup practice is incomplete for ${requirement.displayName}.`,
        detail: 'You own the tool, but guide progress, practice, or confidence evidence is still light.',
        toolTypeId: requirement.toolTypeId,
      })
    }

    for (const [dimension, score] of Object.entries(progress.skillScores) as Array<[SkillDimension, number]>) {
      weaknessCandidates.push({ score, dimension, requirement, progress })
    }
  }

  const weakest = weaknessCandidates.sort((a, b) => a.score - b.score)[0]
  return {
    mode: 'balanced',
    warnings: uniqueWarnings(warnings).slice(0, 5),
    weakestLink: weakest
      ? {
        label: weakest.dimension,
        detail: `${weakest.requirement.displayName} has the lowest BenchXP signal in ${weakest.dimension.toLowerCase()} (${weakest.score}/100).`,
        toolTypeId: weakest.progress.toolTypeId,
      }
      : undefined,
  }
}

function uniqueWarnings(warnings: ReadinessConfidenceWarning[]) {
  const seen = new Set<string>()
  return warnings.filter((warning) => {
    if (seen.has(warning.id)) return false
    seen.add(warning.id)
    return true
  })
}
