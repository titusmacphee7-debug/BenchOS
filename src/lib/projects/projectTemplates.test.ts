import { describe, expect, it } from 'vitest'
import { createProjectFromTemplate } from '../../data/actions'
import { BenchOsDatabase, db } from '../../data/db'
import { starterProjectTemplateRequirements, starterProjectTemplates } from '../../data/seed/projectTemplates'
import type { Material, UserTool } from '../../data/schema'
import { calculateProjectTemplateReadiness } from './projectTemplateReadiness'

describe('project templates', () => {
  it('seeds at least 30 templates with requirements and steps', () => {
    expect(starterProjectTemplates.length).toBeGreaterThanOrEqual(30)
    for (const template of starterProjectTemplates) {
      expect(template.steps.length).toBeGreaterThan(0)
      expect(starterProjectTemplateRequirements.some((requirement) => requirement.templateId === template.id)).toBe(true)
    }
  })

  it('calculates blocked and buildable template readiness', () => {
    const template = starterProjectTemplates.find((item) => item.id === 'simple-wall-shelf')
    if (!template) throw new Error('Missing simple wall shelf template')
    const requirements = starterProjectTemplateRequirements.filter((requirement) => requirement.templateId === template.id)
    const empty = calculateProjectTemplateReadiness({
      template,
      requirements,
      userTools: [],
      materials: [],
      toolTypeCapabilities: [],
    })
    expect(empty.status).toBe('Blocked')

    const buildable = calculateProjectTemplateReadiness({
      template,
      requirements,
      userTools: [
        tool('cordless-drill', 'Cordless Drill', 'Drilling'),
        tool('tape-measure', 'Tape Measure', 'Measuring'),
        tool('level', 'Level', 'Measuring'),
        tool('safety-glasses', 'Safety Glasses', 'Safety'),
      ],
      materials: [
        material('Shelf board', 1, 'board'),
        material('Wall anchors or screws', 1, 'set'),
      ],
      toolTypeCapabilities: [],
    })
    expect(buildable.status).toBe('Buildable Now')
  })

  it('converts a template into a real project with requirements and steps', async () => {
    await db.delete()
    await db.open()
    const template = starterProjectTemplates[0]
    const requirements = starterProjectTemplateRequirements.filter((requirement) => requirement.templateId === template.id)

    const project = await createProjectFromTemplate(template, requirements)

    expect(project.name).toBe(template.name)
    expect(await db.projectRequirements.where('projectId').equals(project.id).count()).toBe(requirements.length)
    expect(await db.projectSteps.where('projectId').equals(project.id).count()).toBe(template.steps.length)
  })

  it('opens v5 project template tables in isolated databases', async () => {
    const database = new BenchOsDatabase(`benchos-template-${crypto.randomUUID()}`)
    try {
      await database.open()
      await database.projectTemplates.bulkAdd(starterProjectTemplates.slice(0, 2))
      expect(await database.projectTemplates.count()).toBe(2)
    } finally {
      database.close()
      await database.delete()
    }
  })
})

function tool(toolTypeId: string, name: string, category: string): UserTool {
  return {
    id: `tool-${toolTypeId}`,
    toolTypeId,
    name,
    type: name,
    category,
    condition: 'Good',
    storageLocation: 'Shop',
    usageLevel: 'Low',
    powerType: 'Manual',
    createdAt: '',
    updatedAt: '',
  }
}

function material(name: string, quantity: number, unit: string): Material {
  return {
    id: `material-${name}`,
    name,
    category: 'Materials',
    quantity,
    unit,
    minimumDesired: 0,
    storageLocation: 'Shop',
    createdAt: '',
    updatedAt: '',
  }
}
