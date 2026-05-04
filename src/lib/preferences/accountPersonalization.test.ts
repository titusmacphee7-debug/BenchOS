import { describe, expect, it } from 'vitest'
import type { ProjectTemplate, ToolCatalogLibraryItem, ToolType } from '../../data/schema'
import { scoreCatalogItemForPreferences, sortTemplatesForWorkshop } from './accountPersonalization'

describe('account personalization', () => {
  it('prioritizes templates that match onboarding interests and skill', () => {
    const templates: ProjectTemplate[] = [
      template('auto', 'Oil Change', 'Automotive', 'Intermediate'),
      template('shelf', 'Simple Wall Shelf', 'Home Improvement', 'Beginner'),
    ]

    const sorted = sortTemplatesForWorkshop(templates, {
      id: 'local-workshop',
      name: 'Home Bench',
      type: 'home-repair',
      skillLevel: 'Beginner',
      spaceType: 'apartment',
      projectInterests: ['Home Improvement'],
      safetyPriorities: [],
      cloudBackupEnabled: false,
      createdAt: '',
      updatedAt: '',
    })

    expect(sorted[0].id).toBe('shelf')
  })

  it('scores preferred brands and battery platforms higher than avoided brands', () => {
    const preferred = catalogItem('dewalt-drill', 'DeWalt', 'DeWalt 20V MAX')
    const avoided = catalogItem('brandx-drill', 'Brand X', 'Brand X 18V')
    const preferences = {
      id: 'default',
      preferredBrands: ['DeWalt'],
      avoidedBrands: ['Brand X'],
      preferredBatteryPlatforms: ['DeWalt 20V MAX'],
      budgetTier: 'balanced' as const,
      workshopType: 'mixed' as const,
      storageSensitivity: 'medium' as const,
      noiseSensitivity: 'medium' as const,
      dustSensitivity: 'medium' as const,
      preferCordless: true,
      createdAt: '',
      updatedAt: '',
    }

    expect(scoreCatalogItemForPreferences(preferred, preferences)).toBeGreaterThan(scoreCatalogItemForPreferences(avoided, preferences))
  })
})

function template(id: string, name: string, category: string, suggestedSkillLevel: ProjectTemplate['suggestedSkillLevel']): ProjectTemplate {
  return {
    id,
    name,
    description: `${name} project`,
    category,
    difficulty: 'Easy',
    estimatedTime: '1 hour',
    suggestedSkillLevel,
    tags: [category],
    steps: ['Do the work'],
    createdAt: '',
    updatedAt: '',
  }
}

function catalogItem(id: string, brand: string, batteryPlatform: string): ToolCatalogLibraryItem {
  const toolType: ToolType = {
    id: 'cordless-drill',
    name: 'Cordless Drill',
    category: 'Drilling',
    description: '',
    materials: [],
    commonProjects: [],
    powerType: 'Battery',
    skillLevel: 'Beginner',
    safety: [],
    createdAt: '',
    updatedAt: '',
  }

  return {
    id,
    internalToolTypeId: toolType.id,
    brand,
    displayName: `${brand} Drill`,
    powerType: 'Battery',
    batteryPlatform,
    costTier: 'balanced',
    compatibilityTags: [],
    priorityLabels: [],
    searchTags: [],
    sourceNoteIds: [],
    createdAt: '',
    updatedAt: '',
    toolType,
    aliases: [],
    capabilities: [],
    specs: [],
    sourceNotes: [],
  }
}
