import type { ProjectRequirement, UserTool } from '../../data/schema'
import { normalize } from '../readiness/readinessEngine'

export type SubstitutionSuggestion = {
  requirementId: string
  requirementName: string
  status: 'available' | 'missing'
  label: string
  missingToolTypeIds: string[]
}

const substitutionRules: Array<{
  match: string[]
  label: string
  requiredToolTypeIds: string[]
}> = [
  {
    match: ['miter saw', 'miter-saw'],
    label: 'Circular saw + speed square can handle many straight crosscuts.',
    requiredToolTypeIds: ['circular-saw', 'speed-square'],
  },
  {
    match: ['track saw', 'track-saw'],
    label: 'Circular saw + straight edge guide can substitute for rough sheet-goods cuts.',
    requiredToolTypeIds: ['circular-saw'],
  },
  {
    match: ['table saw', 'table-saw'],
    label: 'Circular saw + clamps can handle many breakdown cuts.',
    requiredToolTypeIds: ['circular-saw', 'bar-clamp'],
  },
  {
    match: ['impact driver', 'impact-driver'],
    label: 'Cordless drill can drive lighter screws when paired with driver bits.',
    requiredToolTypeIds: ['cordless-drill'],
  },
]

export function findRequirementSubstitutions(
  requirement: ProjectRequirement,
  userTools: UserTool[],
): SubstitutionSuggestion[] {
  const text = normalize(`${requirement.toolTypeId ?? ''} ${requirement.displayName}`)
  const ownedToolTypeIds = new Set(
    userTools
      .filter((tool) => !tool.archivedAt && tool.condition !== 'Needs Repair' && tool.condition !== 'Broken')
      .map((tool) => tool.toolTypeId)
      .filter((toolTypeId): toolTypeId is string => Boolean(toolTypeId)),
  )

  return substitutionRules
    .filter((rule) => rule.match.some((term) => text.includes(normalize(term))))
    .map((rule) => {
      const missingToolTypeIds = rule.requiredToolTypeIds.filter((toolTypeId) => !ownedToolTypeIds.has(toolTypeId))
      return {
        requirementId: requirement.id,
        requirementName: requirement.displayName,
        status: missingToolTypeIds.length === 0 ? 'available' : 'missing',
        label: rule.label,
        missingToolTypeIds,
      }
    })
}
