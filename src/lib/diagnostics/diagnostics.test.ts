import { beforeEach, describe, expect, it } from 'vitest'
import { addGapItemToWishlist } from '../../data/actions'
import { db } from '../../data/db'
import type {
  Capability,
  GapItem,
  Material,
  Project,
  ProjectRequirement,
  ProjectTemplate,
  ProjectTemplateRequirement,
  ToolCompatibilityRule,
  ToolType,
  ToolTypeCapability,
  UserTool,
} from '../../data/schema'
import { analyzeWorkshopGaps } from './gapAnalyzer'
import { calculateWorkshopScore } from './workshopScoreEngine'

const toolTypes: ToolType[] = [
  toolType('cordless-drill', 'Cordless Drill', 'Drilling'),
  toolType('circular-saw', 'Circular Saw', 'Cutting'),
  toolType('safety-glasses', 'Safety Glasses', 'Safety'),
]

const capabilities: Capability[] = [
  { id: 'cut-plywood', name: 'Cut plywood', description: '', materials: ['Plywood'], projectTypes: ['Cutting'] },
  { id: 'drive-screws', name: 'Drive screws', description: '', materials: ['Lumber'], projectTypes: ['Fastening'] },
]

const toolTypeCapabilities: ToolTypeCapability[] = [
  { id: 'map-cut', toolTypeId: 'circular-saw', capabilityId: 'cut-plywood', strength: 'primary' },
  { id: 'map-drive', toolTypeId: 'cordless-drill', capabilityId: 'drive-screws', strength: 'primary' },
]

const project: Project = {
  id: 'project-1',
  name: 'Garage Shelf',
  status: 'Planning',
  progress: 0,
  tags: [],
  createdAt: '',
  updatedAt: '',
}

const projectRequirements: ProjectRequirement[] = [
  requirement('project-req-saw', 'project-1', 'ToolType', 'Circular Saw', { toolTypeId: 'circular-saw', category: 'Cutting' }),
  requirement('project-req-plywood', 'project-1', 'Material', 'Plywood', { quantity: 2, unit: 'Sheets' }),
]

const template: ProjectTemplate = {
  id: 'template-1',
  name: 'Simple Wall Shelf',
  description: 'A quick starter shelf.',
  category: 'Home Repair',
  difficulty: 'Easy',
  estimatedTime: '2 hours',
  suggestedSkillLevel: 'Beginner',
  tags: [],
  steps: ['Measure', 'Cut', 'Fasten'],
  createdAt: '',
  updatedAt: '',
}

const templateRequirements: ProjectTemplateRequirement[] = [
  templateRequirement('template-req-drill', 'Tool', 'ToolType', 'Cordless Drill', { toolTypeId: 'cordless-drill', category: 'Drilling' }),
  templateRequirement('template-req-glasses', 'Safety', 'ToolType', 'Safety Glasses', { toolTypeId: 'safety-glasses', category: 'Safety' }),
  templateRequirement('template-req-sandpaper', 'Consumable', 'Material', 'Sandpaper', { quantity: 3, unit: 'Sheets' }),
]

describe('workshop diagnostics', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('detects missing tools, capabilities, materials, safety, and consumables', () => {
    const analysis = analyzeWorkshopGaps(baseInput())

    expect(analysis.gaps.some((gap) => gap.kind === 'tool' && gap.name === 'Circular Saw')).toBe(true)
    expect(analysis.gaps.some((gap) => gap.kind === 'material' && gap.name === 'Plywood')).toBe(true)
    expect(analysis.gaps.some((gap) => gap.kind === 'safety' && gap.name === 'Safety Glasses')).toBe(true)
    expect(analysis.gaps.some((gap) => gap.kind === 'consumable' && gap.name === 'Sandpaper')).toBe(true)
    expect(analysis.projectBlockers.length).toBeGreaterThan(0)
  })

  it('does not satisfy readiness with broken tools and reports fair-condition repair cautions', () => {
    const analysis = analyzeWorkshopGaps(baseInput({
      userTools: [
        userTool('broken-saw', 'Circular Saw', 'circular-saw', 'Cutting', 'Broken'),
        userTool('fair-drill', 'Cordless Drill', 'cordless-drill', 'Drilling', 'Fair'),
      ],
    }))

    expect(analysis.gaps.some((gap) => gap.kind === 'tool' && gap.name === 'Circular Saw')).toBe(true)
    expect(analysis.repairGaps.some((gap) => gap.name === 'Circular Saw' && gap.severity === 'high')).toBe(true)
    expect(analysis.repairGaps.some((gap) => gap.name === 'Cordless Drill' && gap.severity === 'medium')).toBe(true)
  })

  it('detects compatibility warnings for battery platforms and explicit rules', () => {
    const rules: ToolCompatibilityRule[] = [{
      id: 'rule-1',
      sourceToolTypeId: 'cordless-drill',
      targetToolTypeId: 'safety-glasses',
      tag: 'Eye protection',
      ruleType: 'requires',
      description: 'Drilling work requires eye protection.',
      createdAt: '',
      updatedAt: '',
    }]
    const analysis = analyzeWorkshopGaps(baseInput({
      userTools: [userTool('dewalt-drill', 'DeWalt Cordless Drill', 'cordless-drill', 'Drilling', 'Good', 'DeWalt 20V MAX')],
      compatibilityRules: rules,
    }))

    expect(analysis.compatibilityGaps.some((gap) => gap.name === 'DeWalt 20V MAX charger')).toBe(true)
    expect(analysis.compatibilityGaps.some((gap) => gap.name === 'Eye protection')).toBe(true)
  })

  it('uses onboarding preferences for safety, space, and platform diagnostics', () => {
    const analysis = analyzeWorkshopGaps(baseInput({
      userTools: [userTool('ryobi-drill', 'Ryobi Drill', 'cordless-drill', 'Drilling', 'Good', 'Ryobi ONE+ 18V')],
      workshopProfile: {
        id: 'local-workshop',
        name: 'Apartment Bench',
        type: 'home-repair',
        skillLevel: 'Beginner',
        spaceType: 'apartment',
        projectInterests: ['Home Repair'],
        safetyPriorities: ['Fire safety', 'Dust protection'],
        cloudBackupEnabled: false,
        localOnly: true,
        createdAt: '',
        updatedAt: '',
      },
      buyingPreferences: {
        id: 'default',
        preferredBrands: ['DeWalt'],
        avoidedBrands: [],
        preferredBatteryPlatforms: ['DeWalt 20V MAX'],
        budgetTier: 'budget',
        workshopType: 'home-repair',
        storageSensitivity: 'high',
        noiseSensitivity: 'high',
        dustSensitivity: 'high',
        preferCordless: true,
        createdAt: '',
        updatedAt: '',
      },
    }))

    expect(analysis.safetyGaps.some((gap) => gap.name === 'Fire extinguisher')).toBe(true)
    expect(analysis.safetyGaps.some((gap) => gap.name === 'Dust collection or respirator')).toBe(true)
    expect(analysis.compatibilityGaps.some((gap) => gap.name.includes('outside preferred platform'))).toBe(true)
    expect(analysis.compatibilityGaps.some((gap) => gap.name === 'Compact storage plan')).toBe(true)
  })

  it('calculates bounded workshop scores that improve as inventory fills gaps', () => {
    const emptyAnalysis = analyzeWorkshopGaps(baseInput())
    const emptyScore = calculateWorkshopScore({ ...scoreInput(), gapAnalysis: emptyAnalysis })
    const filledInput = baseInput({
      userTools: [
        userTool('saw', 'Circular Saw', 'circular-saw', 'Cutting', 'Good'),
        userTool('drill', 'Cordless Drill', 'cordless-drill', 'Drilling', 'Good'),
        userTool('glasses', 'Safety Glasses', 'safety-glasses', 'Safety', 'Good'),
      ],
      materials: [
        material('plywood', 'Plywood', 4, 'Sheets'),
        material('sandpaper', 'Sandpaper', 10, 'Sheets'),
      ],
    })
    const filledAnalysis = analyzeWorkshopGaps(filledInput)
    const filledScore = calculateWorkshopScore({ ...scoreInput(filledInput), gapAnalysis: filledAnalysis })

    expect(emptyScore.score).toBeGreaterThanOrEqual(0)
    expect(emptyScore.score).toBeLessThanOrEqual(100)
    expect(filledScore.score).toBeGreaterThan(emptyScore.score)
    expect(filledScore.capabilityScores.every((score) => score.score >= 0 && score.score <= 100)).toBe(true)
  })

  it('adds onboarding context to workshop score details', () => {
    const input = baseInput({
      workshopProfile: {
        id: 'local-workshop',
        name: 'Dusty Bench',
        type: 'woodworking',
        skillLevel: 'Beginner',
        spaceType: 'small-shop',
        projectInterests: ['Home Repair'],
        safetyPriorities: ['Eye protection', 'Dust protection'],
        cloudBackupEnabled: false,
        localOnly: true,
        createdAt: '',
        updatedAt: '',
      },
      buyingPreferences: {
        id: 'default',
        preferredBrands: [],
        avoidedBrands: [],
        preferredBatteryPlatforms: [],
        budgetTier: 'balanced',
        workshopType: 'woodworking',
        storageSensitivity: 'high',
        noiseSensitivity: 'medium',
        dustSensitivity: 'high',
        preferCordless: true,
        createdAt: '',
        updatedAt: '',
      },
    })
    const analysis = analyzeWorkshopGaps(input)
    const score = calculateWorkshopScore({ ...scoreInput(input), gapAnalysis: analysis, workshopProfile: input.workshopProfile, buyingPreferences: input.buyingPreferences })

    expect(score.breakdown.some((item) => item.detail.includes('dust sensitivity'))).toBe(true)
    expect(analysis.gaps.some((gap) => gap.description.includes('onboarding'))).toBe(true)
  })

  it('prevents duplicate wishlist items when adding a gap', async () => {
    const gap: GapItem = {
      id: 'gap-circular-saw',
      kind: 'tool',
      name: 'Circular Saw',
      description: 'Needed for shelf projects.',
      severity: 'high',
      toolTypeId: 'circular-saw',
      impactCount: 2,
      projectNames: ['Garage Shelf'],
      templateNames: [],
    }

    const first = await addGapItemToWishlist(gap)
    const second = await addGapItemToWishlist(gap)

    expect(first.created).toBe(true)
    expect(second.created).toBe(false)
    expect(await db.wishlistItems.count()).toBe(1)
  })
})

function baseInput(overrides: Partial<Parameters<typeof analyzeWorkshopGaps>[0]> = {}): Parameters<typeof analyzeWorkshopGaps>[0] {
  return {
    userTools: [],
    materials: [],
    projects: [project],
    projectRequirements,
    projectTemplates: [template],
    projectTemplateRequirements: templateRequirements,
    toolTypes,
    capabilities,
    toolTypeCapabilities,
    toolAccessories: [],
    toolConsumables: [],
    compatibilityRules: [],
    wishlistItems: [],
    maintenanceLogs: [],
    ...overrides,
  }
}

function scoreInput(input = baseInput()): Omit<Parameters<typeof calculateWorkshopScore>[0], 'gapAnalysis'> {
  return {
    userTools: input.userTools,
    materials: input.materials,
    projects: input.projects,
    projectRequirements: input.projectRequirements,
    projectTemplates: input.projectTemplates,
    projectTemplateRequirements: input.projectTemplateRequirements,
    toolTypes: input.toolTypes,
    capabilities: input.capabilities,
    toolTypeCapabilities: input.toolTypeCapabilities,
  }
}

function toolType(id: string, name: string, category: string): ToolType {
  return {
    id,
    name,
    category,
    description: '',
    materials: [],
    commonProjects: [],
    powerType: 'Manual',
    skillLevel: 'Beginner',
    safety: [],
    createdAt: '',
    updatedAt: '',
  }
}

function userTool(id: string, name: string, toolTypeId: string, category: string, condition: UserTool['condition'], batteryPlatform?: string): UserTool {
  return {
    id,
    name,
    type: name,
    toolTypeId,
    category,
    condition,
    storageLocation: 'Shop',
    usageLevel: 'Low',
    powerType: batteryPlatform ? 'Battery' : 'Manual',
    batteryPlatform,
    createdAt: '',
    updatedAt: '',
  }
}

function material(id: string, name: string, quantity: number, unit: string): Material {
  return {
    id,
    name,
    category: 'Materials',
    quantity,
    unit,
    minimumDesired: 1,
    storageLocation: 'Shop',
    createdAt: '',
    updatedAt: '',
  }
}

function requirement(id: string, projectId: string, requirementKind: ProjectRequirement['requirementKind'], displayName: string, extra: Partial<ProjectRequirement>): ProjectRequirement {
  return {
    id,
    projectId,
    requirementKind,
    displayName,
    required: true,
    createdAt: '',
    updatedAt: '',
    ...extra,
  }
}

function templateRequirement(
  id: string,
  group: ProjectTemplateRequirement['group'],
  requirementKind: ProjectTemplateRequirement['requirementKind'],
  displayName: string,
  extra: Partial<ProjectTemplateRequirement>,
): ProjectTemplateRequirement {
  return {
    id,
    templateId: template.id,
    group,
    requirementKind,
    displayName,
    required: true,
    sortOrder: 0,
    createdAt: '',
    updatedAt: '',
    ...extra,
  }
}
