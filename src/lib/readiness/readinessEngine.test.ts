import { describe, expect, it } from 'vitest'
import type { Material, Project, ProjectRequirement, ToolTypeCapability, UserTool } from '../../data/schema'
import { calculateProjectReadiness } from './readinessEngine'

const project: Project = {
  id: 'project-1',
  name: 'Test Project',
  status: 'Planning',
  progress: 0,
  tags: [],
  createdAt: '',
  updatedAt: '',
}

const tools: UserTool[] = [
  tool('drill', 'Cordless Drill', 'cordless-drill', 'Drilling', 'Good'),
  tool('saw', 'Circular Saw', 'circular-saw', 'Cutting', 'Fair'),
]

const mappings: ToolTypeCapability[] = [
  { id: 'map-1', toolTypeId: 'circular-saw', capabilityId: 'cut-plywood', strength: 'primary' },
  { id: 'map-2', toolTypeId: 'cordless-drill', capabilityId: 'drive-screws', strength: 'primary' },
]

const materials: Material[] = [
  material('plywood', '3/4" Plywood', 'Sheet Goods', 3),
  material('screws', 'Wood Screws', 'Fasteners', 20),
]

describe('readiness engine', () => {
  it('satisfies tool type, capability, category, and material requirements', () => {
    const result = readiness([
      req('r1', 'ToolType', 'Cordless Drill', { toolTypeId: 'cordless-drill' }),
      req('r2', 'Capability', 'Cut plywood', { capabilityId: 'cut-plywood' }),
      req('r3', 'ToolCategory', 'Any cutting tool', { category: 'Cutting' }),
      req('r4', 'Material', '3/4" Plywood', { materialId: 'plywood', quantity: 2, unit: 'Sheets' }),
    ])

    expect(result.status).toBe('Buildable Now')
    expect(result.cautions).toHaveLength(1)
  })

  it('does not satisfy requirements with broken or needs-repair tools', () => {
    const result = readiness(
      [req('r1', 'ToolType', 'Cordless Drill', { toolTypeId: 'cordless-drill' })],
      [tool('broken-drill', 'Cordless Drill', 'cordless-drill', 'Drilling', 'Broken')],
    )

    expect(result.status).toBe('Missing Tools')
    expect(result.missingTools[0].name).toBe('Cordless Drill')
  })

  it('supports typed material name fallback and detects shortages', () => {
    const satisfied = readiness([req('r1', 'Material', 'Wood Screws', { quantity: 10, unit: 'Pieces' })])
    const short = readiness([req('r2', 'Material', 'Wood Screws', { quantity: 40, unit: 'Pieces' })])

    expect(satisfied.status).toBe('Buildable Now')
    expect(short.status).toBe('Missing Materials')
    expect(short.missingMaterials[0].shortage).toBe(20)
  })

  it('marks optional missing items as almost buildable', () => {
    const result = readiness([req('r1', 'ToolType', 'Impact Driver', { toolTypeId: 'impact-driver', required: false })])

    expect(result.status).toBe('Almost Buildable')
    expect(result.optionalMissingTools).toHaveLength(1)
  })

  it('marks combined required tool and material gaps as blocked', () => {
    const result = readiness([
      req('r1', 'ToolType', 'Router', { toolTypeId: 'router' }),
      req('r2', 'Material', 'Drawer Slides', { quantity: 2, unit: 'Pairs' }),
    ])

    expect(result.status).toBe('Blocked')
    expect(result.missingTools).toHaveLength(1)
    expect(result.missingMaterials).toHaveLength(1)
  })
})

function readiness(requirements: ProjectRequirement[], userTools = tools, materialInventory = materials) {
  return calculateProjectReadiness({ project, requirements, userTools, materials: materialInventory, toolTypeCapabilities: mappings })
}

function req(id: string, requirementKind: ProjectRequirement['requirementKind'], displayName: string, extra: Partial<ProjectRequirement>): ProjectRequirement {
  return {
    id,
    projectId: project.id,
    requirementKind,
    displayName,
    required: extra.required ?? true,
    createdAt: '',
    updatedAt: '',
    ...extra,
  }
}

function tool(id: string, name: string, toolTypeId: string, category: string, condition: UserTool['condition']): UserTool {
  return {
    id,
    name,
    type: name,
    toolTypeId,
    category,
    condition,
    storageLocation: 'Wall',
    usageLevel: 'Medium',
    powerType: 'Battery',
    createdAt: '',
    updatedAt: '',
  }
}

function material(id: string, name: string, category: string, quantity: number): Material {
  return {
    id,
    name,
    category,
    quantity,
    unit: 'Pieces',
    minimumDesired: 1,
    storageLocation: 'Rack',
    createdAt: '',
    updatedAt: '',
  }
}
