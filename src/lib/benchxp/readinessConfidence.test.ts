import { describe, expect, it } from 'vitest'
import { calculateReadinessConfidence } from './readinessConfidence'
import type { BenchXpProgress } from './benchXpApi'

describe('calculateReadinessConfidence', () => {
  it('adds balanced warnings without changing readiness status or blocking', () => {
    const result = calculateReadinessConfidence({
      requirements: [toolRequirement('req-1', 'circular-saw', 'Circular Saw')],
      ownedToolTypeIds: ['circular-saw'],
      progress: [],
    })

    expect(result.mode).toBe('balanced')
    expect(result.warnings[0]?.title).toContain('Safety review recommended')
  })

  it('warns when safety familiarity is thin for an owned required tool', () => {
    const result = calculateReadinessConfidence({
      requirements: [toolRequirement('req-1', 'circular-saw', 'Circular Saw')],
      ownedToolTypeIds: ['circular-saw'],
      progress: [progress('guide-circular-saw', 'circular-saw', { Safety: 30, Setup: 70, Control: 70, Accuracy: 70, Maintenance: 70, 'Project Use': 70 }, 60)],
    })

    expect(result.warnings.some((warning) => warning.title.includes('Safety familiarity is still thin'))).toBe(true)
    expect(result.weakestLink?.label).toBe('Safety')
  })

  it('does not warn for a missing tool because ownership readiness already handles it', () => {
    const result = calculateReadinessConfidence({
      requirements: [toolRequirement('req-1', 'miter-saw', 'Miter Saw')],
      ownedToolTypeIds: [],
      progress: [],
    })

    expect(result.warnings).toEqual([])
  })

  it('stays quiet when familiarity evidence is strong', () => {
    const result = calculateReadinessConfidence({
      requirements: [toolRequirement('req-1', 'cordless-drill', 'Cordless Drill')],
      ownedToolTypeIds: ['cordless-drill'],
      progress: [progress('guide-cordless-drill', 'cordless-drill', { Safety: 80, Setup: 80, Control: 78, Accuracy: 76, Maintenance: 72, 'Project Use': 74 }, 78)],
    })

    expect(result.warnings).toEqual([])
  })
})

function toolRequirement(id: string, toolTypeId: string, displayName: string) {
  return {
    id,
    requirementKind: 'ToolType',
    displayName,
    required: true,
    toolTypeId,
  }
}

function progress(guideId: string, toolTypeId: string, skillScores: BenchXpProgress['skillScores'], familiarityScore: number): BenchXpProgress {
  return {
    id: `${guideId}-progress`,
    guideId,
    toolTypeId,
    status: 'in_progress',
    completedStepIds: [],
    skillScores,
    familiarityScore,
    xp: 100,
    createdAt: '2026-05-05T00:00:00.000Z',
    updatedAt: '2026-05-05T00:00:00.000Z',
  }
}
