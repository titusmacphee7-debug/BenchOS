import type {
  Material,
  MissingMaterialItem,
  MissingToolItem,
  Project,
  ProjectRequirement,
  ReadinessResult,
  ToolTypeCapability,
  UserTool,
} from '../../data/schema'

type ReadinessInput = {
  project: Project
  requirements: ProjectRequirement[]
  userTools: UserTool[]
  materials: Material[]
  toolTypeCapabilities: ToolTypeCapability[]
}

export function calculateProjectReadiness({
  project,
  requirements,
  userTools,
  materials,
  toolTypeCapabilities,
}: ReadinessInput): ReadinessResult {
  const activeRequirements = requirements.filter((requirement) => !requirement.archivedAt)
  const usableTools = userTools.filter((tool) => !tool.archivedAt && tool.condition !== 'Needs Repair' && tool.condition !== 'Broken')
  const activeMaterials = materials.filter((material) => !material.archivedAt)
  const cautions = userTools
    .filter((tool) => !tool.archivedAt && tool.condition === 'Fair')
    .map((tool) => `${tool.name} is fair condition; inspect before using.`)

  const missingTools: MissingToolItem[] = []
  const optionalMissingTools: MissingToolItem[] = []
  const missingMaterials: MissingMaterialItem[] = []
  const optionalMissingMaterials: MissingMaterialItem[] = []

  for (const requirement of activeRequirements) {
    if (requirement.requirementKind === 'Material') {
      const missing = checkMaterialRequirement(project.id, requirement, activeMaterials)
      if (missing) {
        if (requirement.required) missingMaterials.push(missing)
        else optionalMissingMaterials.push(missing)
      }
      continue
    }

    const isSatisfied = checkToolRequirement(requirement, usableTools, toolTypeCapabilities)
    if (!isSatisfied) {
      const missing: MissingToolItem = {
        requirementId: requirement.id,
        projectId: project.id,
        requirementKind: requirement.requirementKind,
        name: requirement.displayName,
        required: requirement.required,
        toolTypeId: requirement.toolTypeId,
        capabilityId: requirement.capabilityId,
        category: requirement.category,
        notes: requirement.notes,
      }
      if (requirement.required) missingTools.push(missing)
      else optionalMissingTools.push(missing)
    }
  }

  const status = getReadinessStatus(missingTools, missingMaterials, optionalMissingTools, optionalMissingMaterials)
  return { projectId: project.id, status, missingTools, missingMaterials, optionalMissingTools, optionalMissingMaterials, cautions }
}

export function getReadinessStatus(
  missingTools: MissingToolItem[],
  missingMaterials: MissingMaterialItem[],
  optionalMissingTools: MissingToolItem[],
  optionalMissingMaterials: MissingMaterialItem[],
) {
  if (missingTools.length > 0 && missingMaterials.length > 0) return 'Blocked'
  if (missingTools.length > 0) return 'Missing Tools'
  if (missingMaterials.length > 0) return 'Missing Materials'
  if (optionalMissingTools.length > 0 || optionalMissingMaterials.length > 0) return 'Almost Buildable'
  return 'Buildable Now'
}

function checkToolRequirement(
  requirement: ProjectRequirement,
  usableTools: UserTool[],
  toolTypeCapabilities: ToolTypeCapability[],
) {
  if (requirement.requirementKind === 'ToolType') {
    return Boolean(requirement.toolTypeId && usableTools.some((tool) => tool.toolTypeId === requirement.toolTypeId))
  }

  if (requirement.requirementKind === 'Capability') {
    if (!requirement.capabilityId) return false
    const satisfyingToolTypeIds = new Set(
      toolTypeCapabilities
        .filter((mapping) => mapping.capabilityId === requirement.capabilityId)
        .map((mapping) => mapping.toolTypeId),
    )
    return usableTools.some((tool) => tool.toolTypeId && satisfyingToolTypeIds.has(tool.toolTypeId))
  }

  if (requirement.requirementKind === 'ToolCategory') {
    return Boolean(requirement.category && usableTools.some((tool) => tool.category === requirement.category))
  }

  return false
}

function checkMaterialRequirement(
  projectId: string,
  requirement: ProjectRequirement,
  materials: Material[],
): MissingMaterialItem | undefined {
  const material = findRequirementMaterial(requirement, materials)
  const needed = requirement.quantity ?? 1
  const onHand = material?.quantity ?? 0
  const shortage = Math.max(0, needed - onHand)

  if (material && shortage === 0) return undefined

  return {
    requirementId: requirement.id,
    projectId,
    name: requirement.displayName,
    required: requirement.required,
    materialId: material?.id ?? requirement.materialId,
    quantity: requirement.quantity,
    unit: requirement.unit,
    onHand,
    shortage,
    notes: requirement.notes,
  }
}

function findRequirementMaterial(requirement: ProjectRequirement, materials: Material[]) {
  if (requirement.materialId) {
    const exactMaterial = materials.find((material) => material.id === requirement.materialId)
    if (exactMaterial) return exactMaterial
  }

  const requirementName = normalize(requirement.displayName)
  const requirementCategory = normalize(requirement.category)
  return materials.find((material) => {
    const materialName = normalize(material.name)
    const materialCategory = normalize(material.category)
    if (materialName === requirementName) return true
    if (requirementCategory && materialCategory === requirementCategory) return true
    return false
  })
}

export function normalize(value: unknown) {
  return String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}
