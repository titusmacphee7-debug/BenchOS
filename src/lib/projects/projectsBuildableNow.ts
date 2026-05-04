import type { Material, ProjectTemplate, ProjectTemplateRequirement, ToolTypeCapability, UserTool } from '../../data/schema'
import { calculateProjectTemplateReadiness, type ProjectTemplateReadinessResult } from './projectTemplateReadiness'

export type BuildNowGroup = {
  buildableNow: TemplateWithReadiness[]
  almostBuildable: TemplateWithReadiness[]
  blocked: TemplateWithReadiness[]
  onePurchaseUnlocks: TemplateWithReadiness[]
}

export type TemplateWithReadiness = {
  template: ProjectTemplate
  requirements: ProjectTemplateRequirement[]
  readiness: ProjectTemplateReadinessResult
}

export function getProjectsBuildableNow(input: {
  templates: ProjectTemplate[]
  requirements: ProjectTemplateRequirement[]
  userTools: UserTool[]
  materials: Material[]
  toolTypeCapabilities: ToolTypeCapability[]
}): BuildNowGroup {
  const requirementsByTemplateId = groupBy(input.requirements, (requirement) => requirement.templateId)
  const evaluated = input.templates.map((template) => {
    const requirements = requirementsByTemplateId.get(template.id) ?? []
    return {
      template,
      requirements,
      readiness: calculateProjectTemplateReadiness({
        template,
        requirements,
        userTools: input.userTools,
        materials: input.materials,
        toolTypeCapabilities: input.toolTypeCapabilities,
      }),
    }
  })

  return {
    buildableNow: evaluated.filter((item) => item.readiness.status === 'Buildable Now'),
    almostBuildable: evaluated.filter((item) => item.readiness.status === 'Almost Buildable'),
    blocked: evaluated.filter((item) => item.readiness.status === 'Blocked'),
    onePurchaseUnlocks: evaluated.filter((item) => item.readiness.onePurchaseUnlock),
  }
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  const grouped = new Map<string, T[]>()
  for (const item of items) grouped.set(getKey(item), [...(grouped.get(getKey(item)) ?? []), item])
  return grouped
}
