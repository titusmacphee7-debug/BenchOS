import type {
  Capability,
  GapAnalysisResult,
  GapItem,
  GapKind,
  GapSeverity,
  MaintenanceLog,
  Material,
  MissingMaterialItem,
  MissingToolItem,
  Project,
  ProjectBlockerSummary,
  ProjectRequirement,
  ProjectTemplate,
  ProjectTemplateRequirement,
  ToolCompatibilityRule,
  ToolConsumable,
  ToolBuyingPreferences,
  ToolAccessory,
  ToolType,
  ToolTypeCapability,
  UserTool,
  WishlistItem,
  WishlistItemType,
  WorkshopProfile,
} from '../../data/schema'
import { isSmallSpaceWorkshop, safetyPriorityMatches } from '../preferences/accountPersonalization'
import { calculateProjectTemplateReadiness } from '../projects/projectTemplateReadiness'
import { calculateProjectReadiness, normalize } from '../readiness/readinessEngine'
import { detectCompatibilityGaps } from './compatibilityEngine'
import { findRequirementSubstitutions } from './substitutionEngine'

export type GapAnalyzerInput = {
  userTools: UserTool[]
  materials: Material[]
  projects: Project[]
  projectRequirements: ProjectRequirement[]
  projectTemplates: ProjectTemplate[]
  projectTemplateRequirements: ProjectTemplateRequirement[]
  toolTypes: ToolType[]
  capabilities: Capability[]
  toolTypeCapabilities: ToolTypeCapability[]
  toolAccessories: ToolAccessory[]
  toolConsumables: ToolConsumable[]
  compatibilityRules: ToolCompatibilityRule[]
  wishlistItems: WishlistItem[]
  maintenanceLogs: MaintenanceLog[]
  workshopProfile?: WorkshopProfile
  buyingPreferences?: ToolBuyingPreferences
}

type MutableGapItem = GapItem & {
  projectNames: string[]
  templateNames: string[]
}

const severityRank: Record<GapSeverity, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

export function analyzeWorkshopGaps(input: GapAnalyzerInput): GapAnalysisResult {
  const generatedAt = new Date().toISOString()
  const activeTools = input.userTools.filter((tool) => !tool.archivedAt && !tool.deletedAt)
  const activeMaterials = input.materials.filter((material) => !material.archivedAt && !material.deletedAt)
  const activeProjects = input.projects.filter((project) => !project.archivedAt && !project.deletedAt && project.status !== 'Completed')
  const activeWishlist = input.wishlistItems.filter((item) => !item.archivedAt && !item.deletedAt && item.status !== 'Converted' && item.status !== 'Archived')
  const toolTypeById = new Map(input.toolTypes.map((toolType) => [toolType.id, toolType]))
  const capabilityById = new Map(input.capabilities.map((capability) => [capability.id, capability]))
  const projectRequirementsByProject = groupBy(input.projectRequirements.filter((requirement) => !requirement.archivedAt && !requirement.deletedAt), (requirement) => requirement.projectId)
  const templateRequirementsByTemplate = groupBy(input.projectTemplateRequirements, (requirement) => requirement.templateId)
  const gaps = new Map<string, MutableGapItem>()
  const projectBlockers: ProjectBlockerSummary[] = []

  for (const project of activeProjects) {
    const requirements = projectRequirementsByProject.get(project.id) ?? []
    const readiness = calculateProjectReadiness({
      project,
      requirements,
      userTools: activeTools,
      materials: activeMaterials,
      toolTypeCapabilities: input.toolTypeCapabilities,
    })
    const substitutions = requirements.flatMap((requirement) => findRequirementSubstitutions(requirement, activeTools)).filter((suggestion) => suggestion.status === 'available')
    const allMissingTools = [...readiness.missingTools, ...readiness.optionalMissingTools]
    const allMissingMaterials = [...readiness.missingMaterials, ...readiness.optionalMissingMaterials]

    for (const missing of allMissingTools) {
      addGap(gaps, missingToolToGap({
        missing,
        projectName: project.name,
        kind: classifyProjectToolGap(missing),
        descriptionSuffix: substitutions.some((suggestion) => suggestion.requirementId === missing.requirementId)
          ? ' A substitution may work with tools you already own.'
          : undefined,
      }))
    }

    for (const missing of allMissingMaterials) {
      addGap(gaps, missingMaterialToGap({ missing, projectName: project.name, kind: 'material' }))
    }

    if (allMissingTools.length > 0 || allMissingMaterials.length > 0 || readiness.cautions.length > 0) {
      projectBlockers.push({
        id: project.id,
        name: project.name,
        source: 'project',
        status: readiness.status,
        missingCount: allMissingTools.length + allMissingMaterials.length,
        missingTools: allMissingTools.map((item) => item.name),
        missingMaterials: allMissingMaterials.map((item) => item.name),
        safetyGaps: allMissingTools.filter((item) => classifyProjectToolGap(item) === 'safety').map((item) => item.name),
        quickWin: allMissingTools.length + allMissingMaterials.length <= 2 ? [...allMissingTools, ...allMissingMaterials][0]?.name : undefined,
      })
    }
  }

  for (const template of input.projectTemplates) {
    const requirements = templateRequirementsByTemplate.get(template.id) ?? []
    const readiness = calculateProjectTemplateReadiness({
      template,
      requirements,
      userTools: activeTools,
      materials: activeMaterials,
      toolTypeCapabilities: input.toolTypeCapabilities,
    })
    const requirementById = new Map(requirements.map((requirement) => [requirement.id, requirement]))
    const allMissingTools = [...readiness.missingTools, ...readiness.optionalMissingTools]
    const allMissingMaterials = [...readiness.missingMaterials, ...readiness.optionalMissingMaterials]

    for (const missing of allMissingTools) {
      const requirement = requirementById.get(missing.requirementId)
      addGap(gaps, missingToolToGap({
        missing,
        templateName: template.name,
        kind: classifyTemplateGap(requirement, missing.requirementKind === 'Capability' ? 'capability' : 'tool'),
      }))
    }

    for (const missing of allMissingMaterials) {
      const requirement = requirementById.get(missing.requirementId)
      addGap(gaps, missingMaterialToGap({
        missing,
        templateName: template.name,
        kind: classifyTemplateGap(requirement, 'material'),
      }))
    }

    if (allMissingTools.length > 0 || allMissingMaterials.length > 0) {
      projectBlockers.push({
        id: template.id,
        name: template.name,
        source: 'template',
        status: readiness.status === 'Buildable Now' ? 'Buildable Now' : readiness.status === 'Almost Buildable' ? 'Almost Buildable' : 'Blocked',
        missingCount: allMissingTools.length + allMissingMaterials.length,
        missingTools: allMissingTools.map((item) => item.name),
        missingMaterials: allMissingMaterials.map((item) => item.name),
        safetyGaps: allMissingTools
          .filter((item) => classifyTemplateGap(requirementById.get(item.requirementId), 'tool') === 'safety')
          .map((item) => item.name),
        quickWin: readiness.onePurchaseUnlock?.name,
      })
    }
  }

  addToolHealthGaps(gaps, activeTools, activeProjects, input.projectTemplates, input.projectRequirements, input.projectTemplateRequirements, input.maintenanceLogs)
  addBaselineSafetyGaps(gaps, activeTools, activeMaterials)
  addCatalogSupportGaps(gaps, activeTools, input.toolAccessories, input.toolConsumables, activeMaterials)
  addPreferenceDrivenGaps(gaps, activeTools, activeMaterials, input.workshopProfile, input.buyingPreferences)
  for (const gap of detectCompatibilityGaps({
    userTools: activeTools,
    compatibilityRules: input.compatibilityRules,
    preferredBatteryPlatforms: input.buyingPreferences?.preferredBatteryPlatforms,
  })) addGap(gaps, gap)

  const gapItems = [...gaps.values()].map((gap) => personalizeGap(gap, input.workshopProfile, input.buyingPreferences)).map((gap) => ({
    ...gap,
    impactCount: Math.max(gap.projectNames.length + gap.templateNames.length, gap.impactCount),
    alreadyWishlisted: isAlreadyWishlisted(gap, activeWishlist),
    wishlistItemType: gap.wishlistItemType ?? wishlistItemTypeForGap(gap),
  })).sort(compareGaps)

  const quickWins = gapItems.filter((gap) => isQuickWin(gap)).slice(0, 8)
  const safetyGaps = gapItems.filter((gap) => gap.kind === 'safety')
  const repairGaps = gapItems.filter((gap) => gap.kind === 'repair')
  const compatibilityGaps = gapItems.filter((gap) => gap.kind === 'compatibility')

  return {
    generatedAt,
    totalGaps: gapItems.length,
    blockedProjectCount: projectBlockers.filter((blocker) => blocker.status !== 'Buildable Now').length,
    quickWinCount: quickWins.length,
    safetyGapCount: safetyGaps.length,
    gaps: gapItems,
    topGaps: gapItems.slice(0, 8),
    quickWins,
    safetyGaps,
    repairGaps,
    compatibilityGaps,
    projectBlockers: projectBlockers.sort((a, b) => b.missingCount - a.missingCount).slice(0, 24),
    topMissingCapabilityCategories: summarizeMissingCategories(gapItems, toolTypeById, capabilityById),
  }
}

function addPreferenceDrivenGaps(
  gaps: Map<string, MutableGapItem>,
  activeTools: UserTool[],
  activeMaterials: Material[],
  workshopProfile?: WorkshopProfile,
  preferences?: ToolBuyingPreferences,
) {
  const inventoryText = normalize([...activeTools.map((tool) => `${tool.name} ${tool.type} ${tool.category} ${tool.batteryPlatform ?? ''}`), ...activeMaterials.map((material) => `${material.name} ${material.category}`)].join(' '))
  const hasTrackedItems = activeTools.length > 0 || activeMaterials.length > 0

  if (isSmallSpaceWorkshop(workshopProfile) && activeTools.some((tool) => tool.powerType === 'Stationary')) {
    addGap(gaps, preferenceGap({
      id: 'small-space-stationary-tool-plan',
      kind: 'compatibility',
      name: 'Small-space stationary tool plan',
      description: 'Your onboarding says space is tight, but your inventory includes stationary tools. Plan storage, dust, and safe clearance before projects.',
      severity: 'medium',
      category: 'Storage',
    }))
  } else if ((isSmallSpaceWorkshop(workshopProfile) || preferences?.storageSensitivity === 'high') && hasTrackedItems) {
    addGap(gaps, preferenceGap({
      id: 'compact-storage-plan',
      kind: 'compatibility',
      name: 'Compact storage plan',
      description: 'Your storage preference is high sensitivity, so BenchOS will treat storage-heavy tools and projects as extra planning items.',
      severity: 'low',
      category: 'Storage',
    }))
  }

  if (preferences?.dustSensitivity === 'high' && !inventoryText.includes('dust collection') && !inventoryText.includes('shop vac') && !inventoryText.includes('respirator')) {
    addGap(gaps, preferenceGap({
      id: 'dust-sensitive-workshop-protection',
      kind: 'safety',
      name: 'Dust collection or respirator',
      description: 'You marked dust sensitivity high, so dust collection or respiratory protection is a priority gap.',
      severity: 'high',
      category: 'Safety',
    }))
  }

  if (preferences?.noiseSensitivity === 'high' && !inventoryText.includes('hearing protection') && !inventoryText.includes('ear protection')) {
    addGap(gaps, preferenceGap({
      id: 'noise-sensitive-hearing-protection',
      kind: 'safety',
      name: 'Hearing protection',
      description: 'You marked noise sensitivity high, so hearing protection is prioritized for tool use.',
      severity: 'high',
      category: 'Safety',
    }))
  }

  for (const priority of workshopProfile?.safetyPriorities ?? []) {
    const normalized = normalize(priority)
    if (normalized.includes('fire') && !inventoryText.includes('fire extinguisher')) {
      addGap(gaps, preferenceGap({
        id: 'priority-fire-extinguisher',
        kind: 'safety',
        name: 'Fire extinguisher',
        description: 'You selected fire safety as a priority, but no fire extinguisher is tracked.',
        severity: 'high',
        category: 'Safety',
      }))
    }
    if (normalized.includes('first') && !inventoryText.includes('first aid')) {
      addGap(gaps, preferenceGap({
        id: 'priority-first-aid-kit',
        kind: 'safety',
        name: 'First aid kit',
        description: 'You selected first aid as a priority, but no first aid kit is tracked.',
        severity: 'high',
        category: 'Safety',
      }))
    }
  }
}

function preferenceGap(gap: Omit<GapItem, 'impactCount' | 'projectNames' | 'templateNames' | 'wishlistItemType'>): GapItem {
  return {
    ...gap,
    impactCount: 1,
    projectNames: [],
    templateNames: [],
    wishlistItemType: gap.kind === 'safety' || gap.kind === 'compatibility' ? 'Accessory' : 'Tool',
  }
}

function personalizeGap(gap: MutableGapItem, workshopProfile?: WorkshopProfile, preferences?: ToolBuyingPreferences): MutableGapItem {
  let description = gap.description
  let severity = gap.severity
  let impactCount = gap.impactCount

  if (gap.kind === 'safety' && safetyPriorityMatches(`${gap.name} ${gap.description}`, workshopProfile?.safetyPriorities)) {
    severity = 'high'
    if (!description.includes('safety priority')) description += ' This matches your onboarding safety priority.'
  }

  if ((gap.kind === 'tool' || gap.kind === 'accessory') && preferences?.budgetTier && !description.includes('buying tier')) {
    description += ` Your default buying tier is ${preferences.budgetTier}.`
  }

  if (isSmallSpaceWorkshop(workshopProfile) && (gap.kind === 'tool' || gap.kind === 'compatibility') && !description.includes('small-space')) {
    description += ' Small-space setup is enabled, so compact storage and clearance matter.'
  }

  const interestText = normalize(`${gap.category ?? ''} ${gap.projectNames.join(' ')} ${gap.templateNames.join(' ')}`)
  if (workshopProfile?.projectInterests?.some((interest) => interestText.includes(normalize(interest)))) {
    impactCount += 2
    if (!description.includes('project interests')) description += ' This connects to your onboarding project interests.'
  }

  return { ...gap, severity, description, impactCount }
}

export function wishlistItemTypeForGap(gap: Pick<GapItem, 'kind'>): WishlistItemType {
  if (gap.kind === 'material' || gap.kind === 'consumable') return 'Material'
  if (gap.kind === 'accessory' || gap.kind === 'safety' || gap.kind === 'compatibility') return 'Accessory'
  return 'Tool'
}

function missingToolToGap({
  missing,
  projectName,
  templateName,
  kind,
  descriptionSuffix,
}: {
  missing: MissingToolItem
  projectName?: string
  templateName?: string
  kind: GapKind
  descriptionSuffix?: string
}): GapItem {
  const affected = projectName ?? templateName ?? 'workshop readiness'
  return {
    id: gapKey(kind, missing.name, missing.toolTypeId, missing.capabilityId),
    kind,
    name: missing.name,
    description: `${missing.name} is blocking ${affected}.${descriptionSuffix ? ` ${descriptionSuffix}` : ''}`,
    severity: missing.required ? 'high' : 'medium',
    category: missing.category,
    toolTypeId: missing.toolTypeId,
    capabilityId: missing.capabilityId,
    impactCount: 1,
    projectNames: projectName ? [projectName] : [],
    templateNames: templateName ? [templateName] : [],
    wishlistItemType: kind === 'safety' || kind === 'accessory' ? 'Accessory' : 'Tool',
  }
}

function missingMaterialToGap({
  missing,
  projectName,
  templateName,
  kind,
}: {
  missing: MissingMaterialItem
  projectName?: string
  templateName?: string
  kind: GapKind
}): GapItem {
  const affected = projectName ?? templateName ?? 'workshop readiness'
  return {
    id: gapKey(kind, missing.name, missing.materialId),
    kind,
    name: missing.name,
    description: `${missing.name} is short for ${affected}.`,
    severity: missing.required ? 'high' : 'medium',
    materialId: missing.materialId,
    quantity: missing.shortage > 0 ? missing.shortage : missing.quantity,
    unit: missing.unit,
    impactCount: 1,
    projectNames: projectName ? [projectName] : [],
    templateNames: templateName ? [templateName] : [],
    wishlistItemType: kind === 'material' || kind === 'consumable' ? 'Material' : 'Accessory',
  }
}

function classifyProjectToolGap(missing: MissingToolItem): GapKind {
  const text = normalize(`${missing.name} ${missing.category ?? ''} ${missing.notes ?? ''}`)
  if (text.includes('safety') || text.includes('respirator') || text.includes('glasses') || text.includes('hearing') || text.includes('mask')) return 'safety'
  if (text.includes('blade') || text.includes('bit') || text.includes('hose') || text.includes('adapter') || text.includes('clamp')) return 'accessory'
  if (missing.requirementKind === 'Capability') return 'capability'
  return 'tool'
}

function classifyTemplateGap(requirement: ProjectTemplateRequirement | undefined, fallback: GapKind): GapKind {
  if (!requirement) return fallback
  if (requirement.group === 'Safety') return 'safety'
  if (requirement.group === 'Accessory') return 'accessory'
  if (requirement.group === 'Consumable') return 'consumable'
  if (requirement.group === 'Material') return 'material'
  if (requirement.requirementKind === 'Capability') return 'capability'
  return fallback
}

function addToolHealthGaps(
  gaps: Map<string, MutableGapItem>,
  activeTools: UserTool[],
  activeProjects: Project[],
  templates: ProjectTemplate[],
  projectRequirements: ProjectRequirement[],
  templateRequirements: ProjectTemplateRequirement[],
  maintenanceLogs: MaintenanceLog[],
) {
  const projectNamesByToolType = affectedNamesByToolType(activeProjects, projectRequirements)
  const templateNamesByToolType = affectedNamesByToolType(templates, templateRequirements)
  const lastMaintenanceByTool = new Map<string, string>()
  for (const log of maintenanceLogs) {
    if (log.deletedAt) continue
    const current = lastMaintenanceByTool.get(log.userToolId)
    if (!current || log.performedAt > current) lastMaintenanceByTool.set(log.userToolId, log.performedAt)
  }
  const staleCutoff = Date.now() - 120 * 24 * 60 * 60 * 1000

  for (const tool of activeTools) {
    const affectedProjects = tool.toolTypeId ? projectNamesByToolType.get(tool.toolTypeId) ?? [] : []
    const affectedTemplates = tool.toolTypeId ? templateNamesByToolType.get(tool.toolTypeId) ?? [] : []
    if (tool.condition === 'Broken' || tool.condition === 'Needs Repair' || tool.condition === 'Fair') {
      addGap(gaps, {
        id: gapKey('repair', tool.name, tool.id),
        kind: 'repair',
        name: tool.name,
        description: tool.condition === 'Fair'
          ? `${tool.name} is marked Fair. Inspect it before relying on it for projects.`
          : `${tool.name} is marked ${tool.condition} and should be repaired or replaced.`,
        severity: tool.condition === 'Fair' ? 'medium' : 'high',
        category: tool.category,
        toolTypeId: tool.toolTypeId,
        catalogItemId: tool.catalogItemId,
        impactCount: Math.max(1, affectedProjects.length + affectedTemplates.length),
        projectNames: affectedProjects,
        templateNames: affectedTemplates,
        wishlistItemType: 'Tool',
      })
    }

    const lastMaintained = lastMaintenanceByTool.get(tool.id)
    if (!lastMaintained && tool.condition !== 'New') {
      addGap(gaps, maintenanceGap(tool, 'No maintenance has been logged for this tool.', affectedProjects, affectedTemplates))
    } else if (lastMaintained && new Date(lastMaintained).getTime() < staleCutoff) {
      addGap(gaps, maintenanceGap(tool, 'Maintenance looks stale based on the last logged service date.', affectedProjects, affectedTemplates))
    }
  }
}

function maintenanceGap(tool: UserTool, reason: string, projectNames: string[], templateNames: string[]): GapItem {
  return {
    id: gapKey('repair', `${tool.name} maintenance`, tool.id),
    kind: 'repair',
    name: `${tool.name} maintenance`,
    description: reason,
    severity: 'low',
    category: tool.category,
    toolTypeId: tool.toolTypeId,
    catalogItemId: tool.catalogItemId,
    impactCount: Math.max(1, projectNames.length + templateNames.length),
    projectNames,
    templateNames,
    wishlistItemType: 'Tool',
  }
}

function addBaselineSafetyGaps(gaps: Map<string, MutableGapItem>, activeTools: UserTool[], activeMaterials: Material[]) {
  if (activeTools.length === 0) return
  const inventoryText = normalize([...activeTools.map((tool) => `${tool.name} ${tool.type} ${tool.category}`), ...activeMaterials.map((material) => `${material.name} ${material.category}`)].join(' '))
  const safetyBasics = [
    ['Safety glasses', ['safety glasses', 'eye protection']],
    ['Hearing protection', ['hearing protection', 'ear protection', 'earmuff']],
    ['Dust mask or respirator', ['dust mask', 'respirator', 'n95']],
  ] as const

  for (const [name, terms] of safetyBasics) {
    if (terms.some((term) => inventoryText.includes(normalize(term)))) continue
    addGap(gaps, {
      id: gapKey('safety', name),
      kind: 'safety',
      name,
      description: `${name} is a baseline shop safety item and is not tracked in your inventory.`,
      severity: 'high',
      category: 'Safety',
      impactCount: 1,
      projectNames: [],
      templateNames: [],
      wishlistItemType: 'Accessory',
    })
  }
}

function addCatalogSupportGaps(
  gaps: Map<string, MutableGapItem>,
  activeTools: UserTool[],
  accessories: ToolAccessory[],
  consumables: ToolConsumable[],
  activeMaterials: Material[],
) {
  const ownedToolTypeIds = new Set(activeTools.map((tool) => tool.toolTypeId).filter(Boolean))
  const ownedNames = normalize([...activeTools.map((tool) => tool.name), ...activeMaterials.map((material) => material.name)].join(' '))

  for (const accessory of accessories) {
    if (!accessory.toolTypeId || !ownedToolTypeIds.has(accessory.toolTypeId)) continue
    if (!accessory.priorityLabels.includes('Safety Critical') && !accessory.priorityLabels.includes('Project Unlocker')) continue
    if (ownedNames.includes(normalize(accessory.name))) continue
    addGap(gaps, {
      id: gapKey('accessory', accessory.name, accessory.toolTypeId),
      kind: accessory.priorityLabels.includes('Safety Critical') ? 'safety' : 'accessory',
      name: accessory.name,
      description: accessory.description ?? `${accessory.name} supports tools you already own.`,
      severity: accessory.priorityLabels.includes('Safety Critical') ? 'high' : 'medium',
      category: accessory.category,
      toolTypeId: accessory.toolTypeId,
      catalogItemId: accessory.catalogItemId,
      impactCount: 1,
      projectNames: [],
      templateNames: [],
      wishlistItemType: 'Accessory',
    })
  }

  for (const consumable of consumables) {
    if (!consumable.toolTypeId || !ownedToolTypeIds.has(consumable.toolTypeId)) continue
    if (ownedNames.includes(normalize(consumable.name))) continue
    addGap(gaps, {
      id: gapKey('consumable', consumable.name, consumable.toolTypeId),
      kind: 'consumable',
      name: consumable.name,
      description: consumable.description ?? `${consumable.name} is a consumable for tools you already own.`,
      severity: 'low',
      category: consumable.category,
      toolTypeId: consumable.toolTypeId,
      catalogItemId: consumable.catalogItemId,
      unit: consumable.unit,
      impactCount: 1,
      projectNames: [],
      templateNames: [],
      wishlistItemType: 'Material',
    })
  }
}

function addGap(gaps: Map<string, MutableGapItem>, gap: GapItem) {
  const key = gap.id
  const existing = gaps.get(key)
  if (!existing) {
    gaps.set(key, { ...gap, projectNames: unique(gap.projectNames), templateNames: unique(gap.templateNames) })
    return
  }

  existing.projectNames = unique([...existing.projectNames, ...gap.projectNames])
  existing.templateNames = unique([...existing.templateNames, ...gap.templateNames])
  existing.impactCount = Math.max(existing.impactCount, gap.impactCount, existing.projectNames.length + existing.templateNames.length)
  if (severityRank[gap.severity] > severityRank[existing.severity]) existing.severity = gap.severity
  if (!existing.description.includes(gap.description)) existing.description = existing.description || gap.description
}

function affectedNamesByToolType<T extends { name: string; id: string }>(
  items: T[],
  requirements: Array<{ projectId?: string; templateId?: string; toolTypeId?: string; requirementKind: string }>,
) {
  const nameById = new Map(items.map((item) => [item.id, item.name]))
  const affected = new Map<string, string[]>()
  for (const requirement of requirements) {
    if (requirement.requirementKind !== 'ToolType' || !requirement.toolTypeId) continue
    const itemId = requirement.projectId ?? requirement.templateId
    const name = itemId ? nameById.get(itemId) : undefined
    if (!name) continue
    affected.set(requirement.toolTypeId, unique([...(affected.get(requirement.toolTypeId) ?? []), name]))
  }
  return affected
}

function summarizeMissingCategories(gaps: GapItem[], toolTypeById: Map<string, ToolType>, capabilityById: Map<string, Capability>) {
  const counts = new Map<string, { count: number; gapNames: string[] }>()
  for (const gap of gaps) {
    const category = gap.category
      ?? (gap.toolTypeId ? toolTypeById.get(gap.toolTypeId)?.category : undefined)
      ?? (gap.capabilityId ? capabilityById.get(gap.capabilityId)?.projectTypes[0] : undefined)
    if (!category) continue
    const current = counts.get(category) ?? { count: 0, gapNames: [] }
    current.count += 1
    current.gapNames = unique([...current.gapNames, gap.name]).slice(0, 5)
    counts.set(category, current)
  }
  return [...counts.entries()]
    .map(([category, value]) => ({ category, ...value }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

function isAlreadyWishlisted(gap: GapItem, wishlistItems: WishlistItem[]) {
  const targetType = wishlistItemTypeForGap(gap)
  const targetName = normalize(gap.name)
  return wishlistItems.some((item) => {
    if (item.itemType !== targetType) return false
    if (gap.catalogItemId && item.catalogItemId === gap.catalogItemId) return true
    if (gap.toolTypeId && item.toolTypeId === gap.toolTypeId) return true
    if (gap.materialId && item.materialId === gap.materialId) return true
    return normalize(item.name) === targetName
  })
}

function compareGaps(a: GapItem, b: GapItem) {
  if (severityRank[b.severity] !== severityRank[a.severity]) return severityRank[b.severity] - severityRank[a.severity]
  if (b.impactCount !== a.impactCount) return b.impactCount - a.impactCount
  return a.name.localeCompare(b.name)
}

function isQuickWin(gap: GapItem) {
  if (gap.alreadyWishlisted) return false
  if (gap.kind === 'repair' && gap.severity === 'high') return true
  if (gap.kind === 'material' || gap.kind === 'consumable' || gap.kind === 'accessory' || gap.kind === 'safety') return true
  return gap.impactCount >= 2 && gap.severity !== 'low'
}

function gapKey(kind: GapKind, name: string, idA?: string, idB?: string) {
  return `${kind}-${idA ?? ''}-${idB ?? ''}-${normalize(name).replace(/\s+/g, '-')}`
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  const grouped = new Map<string, T[]>()
  for (const item of items) grouped.set(getKey(item), [...(grouped.get(getKey(item)) ?? []), item])
  return grouped
}

function unique<T>(items: T[]) {
  return [...new Set(items)]
}
