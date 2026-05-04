import type {
  Material,
  MissingMaterialItem,
  MissingToolItem,
  Project,
  ProjectRequirement,
  ProjectTemplate,
  ProjectTemplateRequirement,
  ToolTypeCapability,
  UserTool,
} from '../../data/schema'
import { calculateProjectReadiness } from '../readiness/readinessEngine'

export type TemplateReadinessStatus = 'Buildable Now' | 'Almost Buildable' | 'Blocked'

export type ProjectTemplateReadinessResult = {
  templateId: string
  status: TemplateReadinessStatus
  missingTools: MissingToolItem[]
  missingMaterials: MissingMaterialItem[]
  optionalMissingTools: MissingToolItem[]
  optionalMissingMaterials: MissingMaterialItem[]
  onePurchaseUnlock?: MissingToolItem | MissingMaterialItem
}

export function calculateProjectTemplateReadiness(input: {
  template: ProjectTemplate
  requirements: ProjectTemplateRequirement[]
  userTools: UserTool[]
  materials: Material[]
  toolTypeCapabilities: ToolTypeCapability[]
}): ProjectTemplateReadinessResult {
  const project = templateToReadinessProject(input.template)
  const readiness = calculateProjectReadiness({
    project,
    requirements: input.requirements.map((requirement) => templateRequirementToProjectRequirement(project.id, requirement)),
    userTools: input.userTools,
    materials: input.materials,
    toolTypeCapabilities: input.toolTypeCapabilities,
  })
  const requiredMissing = [...readiness.missingTools, ...readiness.missingMaterials]
  const optionalMissing = [...readiness.optionalMissingTools, ...readiness.optionalMissingMaterials]
  const status: TemplateReadinessStatus = requiredMissing.length === 0
    ? optionalMissing.length > 0 ? 'Almost Buildable' : 'Buildable Now'
    : requiredMissing.length <= 2 ? 'Almost Buildable' : 'Blocked'

  return {
    templateId: input.template.id,
    status,
    missingTools: readiness.missingTools,
    missingMaterials: readiness.missingMaterials,
    optionalMissingTools: readiness.optionalMissingTools,
    optionalMissingMaterials: readiness.optionalMissingMaterials,
    onePurchaseUnlock: requiredMissing.length === 1 ? requiredMissing[0] : undefined,
  }
}

export function templateRequirementToProjectRequirement(
  projectId: string,
  requirement: ProjectTemplateRequirement,
): ProjectRequirement {
  const now = new Date().toISOString()
  return {
    id: requirement.id,
    projectId,
    requirementKind: requirement.requirementKind,
    displayName: requirement.displayName,
    required: requirement.required,
    toolTypeId: requirement.toolTypeId,
    capabilityId: requirement.capabilityId,
    category: requirement.category,
    quantity: requirement.quantity,
    unit: requirement.unit,
    notes: requirement.notes,
    createdAt: now,
    updatedAt: now,
  }
}

function templateToReadinessProject(template: ProjectTemplate): Project {
  return {
    id: `template-${template.id}`,
    name: template.name,
    description: template.description,
    status: 'Planning',
    progress: 0,
    category: template.category,
    tags: template.tags,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  }
}
