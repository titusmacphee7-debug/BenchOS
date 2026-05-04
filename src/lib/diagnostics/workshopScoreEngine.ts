import type {
  Capability,
  GapAnalysisResult,
  GapItem,
  Material,
  Project,
  ProjectRequirement,
  ProjectTemplate,
  ProjectTemplateRequirement,
  ToolType,
  ToolTypeCapability,
  ToolBuyingPreferences,
  UserTool,
  WorkshopProfile,
  WorkshopCapabilityScore,
  WorkshopScore,
} from '../../data/schema'
import { getMaterialStockStatus } from '../inventory/inventory'

export const WORKSHOP_CAPABILITY_CATEGORIES = [
  'Measuring',
  'Layout',
  'Cutting',
  'Drilling',
  'Fastening',
  'Clamping',
  'Sanding',
  'Routing',
  'Finishing',
  'Dust Collection',
  'Safety',
  'Automotive',
  'Electrical',
  'Plumbing',
  'Masonry / Tile / Drywall',
  'Outdoor / Yard',
]

export type WorkshopScoreInput = {
  userTools: UserTool[]
  materials: Material[]
  projects: Project[]
  projectRequirements: ProjectRequirement[]
  projectTemplates: ProjectTemplate[]
  projectTemplateRequirements: ProjectTemplateRequirement[]
  toolTypes: ToolType[]
  capabilities: Capability[]
  toolTypeCapabilities: ToolTypeCapability[]
  gapAnalysis: GapAnalysisResult
  workshopProfile?: WorkshopProfile
  buyingPreferences?: ToolBuyingPreferences
}

const weights = {
  coverage: 35,
  readiness: 25,
  materials: 10,
  safety: 10,
  accessories: 10,
  condition: 10,
} as const

export function calculateWorkshopScore(input: WorkshopScoreInput): WorkshopScore {
  const capabilityScores = calculateCapabilityScores(input)
  const coverageScore = average(capabilityScores.map((item) => item.score))
  const readinessScore = calculateReadinessScore(input.gapAnalysis, input.projects.length + input.projectTemplates.length)
  const materialScore = calculateMaterialScore(input.materials, input.gapAnalysis.gaps)
  const safetyScore = gapPenaltyScore(input.gapAnalysis.safetyGaps, 100, 22)
  const accessoriesScore = gapPenaltyScore(input.gapAnalysis.gaps.filter((gap) => gap.kind === 'accessory' || gap.kind === 'consumable' || gap.kind === 'compatibility'), 100, 12)
  const conditionScore = calculateConditionScore(input.userTools, input.gapAnalysis.repairGaps)
  const weightedTotal =
    coverageScore * weights.coverage
    + readinessScore * weights.readiness
    + materialScore * weights.materials
    + safetyScore * weights.safety
    + accessoriesScore * weights.accessories
    + conditionScore * weights.condition

  return {
    score: clamp(Math.round(weightedTotal / 100)),
    generatedAt: input.gapAnalysis.generatedAt,
    breakdown: [
      {
        key: 'coverage',
        label: 'Capability / Tool Coverage',
        score: Math.round(coverageScore),
        weight: weights.coverage,
        detail: `${capabilityScores.filter((item) => item.score >= 70).length} capability groups are healthy${input.workshopProfile?.skillLevel ? ` for a ${input.workshopProfile.skillLevel.toLowerCase()} ${input.workshopProfile.type ?? 'mixed'} workshop` : ''}.`,
      },
      {
        key: 'readiness',
        label: 'Project Readiness',
        score: Math.round(readinessScore),
        weight: weights.readiness,
        detail: `${input.gapAnalysis.blockedProjectCount} projects or templates need attention.`,
      },
      {
        key: 'materials',
        label: 'Material Stock',
        score: Math.round(materialScore),
        weight: weights.materials,
        detail: `${input.gapAnalysis.gaps.filter((gap) => gap.kind === 'material').length} material gaps detected.`,
      },
      {
        key: 'safety',
        label: 'Safety Coverage',
        score: Math.round(safetyScore),
        weight: weights.safety,
        detail: `${input.gapAnalysis.safetyGapCount} safety gaps detected${input.workshopProfile?.safetyPriorities?.length ? ` across priorities: ${input.workshopProfile.safetyPriorities.join(', ')}` : ''}.`,
      },
      {
        key: 'accessories',
        label: 'Accessories / Consumables',
        score: Math.round(accessoriesScore),
        weight: weights.accessories,
        detail: `${input.gapAnalysis.gaps.filter((gap) => gap.kind === 'accessory' || gap.kind === 'consumable').length} support-item gaps detected${input.buyingPreferences ? ` with ${input.buyingPreferences.storageSensitivity} storage, ${input.buyingPreferences.noiseSensitivity} noise, and ${input.buyingPreferences.dustSensitivity} dust sensitivity` : ''}.`,
      },
      {
        key: 'condition',
        label: 'Tool Condition / Maintenance',
        score: Math.round(conditionScore),
        weight: weights.condition,
        detail: `${input.gapAnalysis.repairGaps.length} repair or maintenance items detected.`,
      },
    ],
    capabilityScores,
    repairWarnings: input.gapAnalysis.repairGaps.slice(0, 8),
    quickImprovements: input.gapAnalysis.quickWins.slice(0, 8),
  }
}

function calculateCapabilityScores(input: WorkshopScoreInput): WorkshopCapabilityScore[] {
  const activeTools = input.userTools.filter((tool) => !tool.archivedAt && !tool.deletedAt && tool.condition !== 'Broken' && tool.condition !== 'Needs Repair')
  const toolTypeById = new Map(input.toolTypes.map((toolType) => [toolType.id, toolType]))
  const capabilityById = new Map(input.capabilities.map((capability) => [capability.id, capability]))
  const ownedToolTypeIds = new Set(activeTools.map((tool) => tool.toolTypeId).filter((toolTypeId): toolTypeId is string => Boolean(toolTypeId)))
  const ownedCapabilityIds = new Set(
    input.toolTypeCapabilities
      .filter((mapping) => ownedToolTypeIds.has(mapping.toolTypeId))
      .map((mapping) => mapping.capabilityId),
  )

  return WORKSHOP_CAPABILITY_CATEGORIES.map((category) => {
    const categoryToolTypes = input.toolTypes.filter((toolType) => categoryMatches(toolType.category, category))
    const requiredToolIds = new Set<string>()
    const requiredCapabilityIds = new Set<string>()
    const affectedProjects = new Set<string>()
    const affectedTemplates = new Set<string>()

    for (const requirement of input.projectRequirements) {
      const matches = requirementMatchesCategory(requirement, category, toolTypeById, capabilityById)
      if (!matches) continue
      if (requirement.toolTypeId) requiredToolIds.add(requirement.toolTypeId)
      if (requirement.capabilityId) requiredCapabilityIds.add(requirement.capabilityId)
      const project = input.projects.find((item) => item.id === requirement.projectId)
      if (project) affectedProjects.add(project.name)
    }

    for (const requirement of input.projectTemplateRequirements) {
      const matches = requirementMatchesCategory(requirement, category, toolTypeById, capabilityById)
      if (!matches) continue
      if (requirement.toolTypeId) requiredToolIds.add(requirement.toolTypeId)
      if (requirement.capabilityId) requiredCapabilityIds.add(requirement.capabilityId)
      const template = input.projectTemplates.find((item) => item.id === requirement.templateId)
      if (template) affectedTemplates.add(template.name)
    }

    const ownedInCategory = activeTools.filter((tool) => categoryMatches(tool.category, category))
    for (const toolType of categoryToolTypes) {
      if (ownedToolTypeIds.has(toolType.id)) requiredToolIds.add(toolType.id)
    }
    const requiredCount = requiredToolIds.size + requiredCapabilityIds.size
    const coveredToolCount = [...requiredToolIds].filter((toolTypeId) => ownedToolTypeIds.has(toolTypeId)).length
    const coveredCapabilityCount = [...requiredCapabilityIds].filter((capabilityId) => ownedCapabilityIds.has(capabilityId)).length
    const ownedCoverage = requiredCount > 0
      ? ((coveredToolCount + coveredCapabilityCount) / requiredCount) * 100
      : ownedInCategory.length > 0 ? 75 : 0
    const relatedGaps = input.gapAnalysis.gaps.filter((gap) => categoryMatches(gap.category ?? toolTypeById.get(gap.toolTypeId ?? '')?.category ?? '', category))
    const highestImpactGap = relatedGaps[0]

    return {
      category,
      score: clamp(Math.round(ownedCoverage - relatedGaps.filter((gap) => gap.severity === 'high').length * 6)),
      ownedCoverage: clamp(Math.round(ownedCoverage)),
      ownedCount: ownedInCategory.length,
      requiredCount,
      missingCapabilities: relatedGaps.filter((gap) => gap.kind === 'capability').map((gap) => gap.name).slice(0, 5),
      missingTools: relatedGaps.filter((gap) => gap.kind === 'tool').map((gap) => gap.name).slice(0, 5),
      affectedProjects: [...affectedProjects].slice(0, 5),
      affectedTemplates: [...affectedTemplates].slice(0, 5),
      highestImpactGap,
    }
  })
}

function calculateReadinessScore(gapAnalysis: GapAnalysisResult, totalItems: number) {
  if (totalItems === 0) return 55
  const blockedPenalty = Math.min(75, gapAnalysis.blockedProjectCount * 6)
  const quickWinCredit = Math.min(15, gapAnalysis.quickWinCount * 2)
  return clamp(100 - blockedPenalty + quickWinCredit)
}

function calculateMaterialScore(materials: Material[], gaps: GapItem[]) {
  const activeMaterials = materials.filter((material) => !material.archivedAt && !material.deletedAt)
  if (activeMaterials.length === 0) return gaps.some((gap) => gap.kind === 'material') ? 35 : 60
  const healthy = activeMaterials.filter((material) => getMaterialStockStatus(material) === 'In Stock').length
  const stockScore = (healthy / activeMaterials.length) * 100
  return clamp(stockScore - gaps.filter((gap) => gap.kind === 'material').length * 8)
}

function calculateConditionScore(tools: UserTool[], repairGaps: GapItem[]) {
  const activeTools = tools.filter((tool) => !tool.archivedAt && !tool.deletedAt)
  if (activeTools.length === 0) return 50
  const good = activeTools.filter((tool) => tool.condition === 'Good' || tool.condition === 'New' || tool.condition === 'Used').length
  return clamp((good / activeTools.length) * 100 - repairGaps.filter((gap) => gap.severity === 'high').length * 12)
}

function gapPenaltyScore(gaps: GapItem[], base: number, penalty: number) {
  return clamp(base - gaps.reduce((sum, gap) => sum + (gap.severity === 'high' ? penalty : gap.severity === 'medium' ? penalty * 0.65 : penalty * 0.35), 0))
}

function requirementMatchesCategory(
  requirement: ProjectRequirement | ProjectTemplateRequirement,
  category: string,
  toolTypeById: Map<string, ToolType>,
  capabilityById: Map<string, Capability>,
) {
  if (requirement.category && categoryMatches(requirement.category, category)) return true
  if (requirement.toolTypeId && categoryMatches(toolTypeById.get(requirement.toolTypeId)?.category ?? '', category)) return true
  if (requirement.capabilityId) {
    const capability = capabilityById.get(requirement.capabilityId)
    if (capability?.projectTypes.some((projectType) => categoryMatches(projectType, category))) return true
  }
  return false
}

function categoryMatches(value: string, category: string) {
  if (!value) return false
  if (value === category) return true
  if (category === 'Masonry / Tile / Drywall') return ['Masonry', 'Tile', 'Drywall', 'Masonry / Tile / Drywall'].includes(value)
  return value.includes(category) || category.includes(value)
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value))
}
