import { describe, expect, it } from 'vitest'
import { createUserTool, userToolDefaultsFromLibrary } from './actions'
import { BenchOsDatabase, db } from './db'
import { buildStarterToolLibrary } from './seed/starterToolLibrary'
import type { Capability, ToolCatalogLibraryItem, UserTool } from './schema'

describe('database schema v5', () => {
  it('opens v5 catalog and project template tables cleanly', async () => {
    const database = new BenchOsDatabase(`benchos-v5-${crypto.randomUUID()}`)

    try {
      await database.open()
      await database.toolCatalogItems.add({
        id: 'catalog-test-drill',
        internalToolTypeId: 'cordless-drill',
        brand: 'Test Brand',
        displayName: 'Test Brand Cordless Drill',
        powerType: 'Battery',
        compatibilityTags: ['cordless-drill'],
        priorityLabels: ['Project Unlocker'],
        searchTags: ['test brand drill', 'cordless drill', 'battery drill', 'drill holes', 'drive screws', 'pilot holes', 'test brand', 'workshop drill'],
        sourceNoteIds: [],
        createdAt: '',
        updatedAt: '',
      })

      expect(await database.toolCatalogItems.count()).toBe(1)
      await database.projectTemplates.add({
        id: 'template-test',
        name: 'Test Template',
        description: 'Test project template',
        category: 'Test',
        difficulty: 'Easy',
        estimatedTime: '1 hour',
        suggestedSkillLevel: 'Beginner',
        tags: ['test'],
        steps: ['Do the test step'],
        createdAt: '',
        updatedAt: '',
      })
      expect(await database.projectTemplates.count()).toBe(1)
    } finally {
      database.close()
      await database.delete()
    }
  })

  it('accepts v0.01-style owned tools without sync metadata', async () => {
    const database = new BenchOsDatabase(`benchos-v001-tool-${crypto.randomUUID()}`)
    const legacyTool: UserTool = {
      id: 'tool-legacy',
      toolTypeId: 'cordless-drill',
      name: 'Cordless Drill',
      type: 'Cordless Drill',
      category: 'Drilling',
      condition: 'Good',
      storageLocation: 'Wall',
      usageLevel: 'Low',
      powerType: 'Battery',
      createdAt: '',
      updatedAt: '',
    }

    try {
      await database.open()
      await database.userTools.add(legacyTool)

      expect((await database.userTools.get('tool-legacy'))?.name).toBe('Cordless Drill')
    } finally {
      database.close()
      await database.delete()
    }
  })

  it('creates owned tools from catalog defaults with catalog and internal ids', async () => {
    await db.delete()
    await db.open()
    const starter = buildStarterToolLibrary()
    const toolType = starter.toolTypes.find((item) => item.id === 'circular-saw')
    const catalogItem = starter.toolCatalogItems.find((item) => item.internalToolTypeId === 'circular-saw')
    if (!toolType || !catalogItem) throw new Error('Missing circular saw catalog fixture')

    const catalogLibraryItem: ToolCatalogLibraryItem = {
      ...catalogItem,
      toolType,
      aliases: starter.toolAliases.filter((alias) => alias.toolTypeId === toolType.id).map((alias) => alias.alias),
      specs: starter.toolCatalogSpecs.filter((spec) => spec.catalogItemId === catalogItem.id),
      sourceNotes: starter.toolCatalogSourceNotes.filter((note) => note.catalogItemId === catalogItem.id),
      capabilities: starter.toolTypeCapabilities
        .filter((link) => link.toolTypeId === toolType.id)
        .map((link) => starter.capabilities.find((capability) => capability.id === link.capabilityId))
        .filter((capability): capability is Capability => Boolean(capability)),
    }

    const created = await createUserTool({
      ...userToolDefaultsFromLibrary(catalogLibraryItem),
      storageLocation: 'Wall',
    })

    expect(created.catalogItemId).toBe(catalogItem.id)
    expect(created.toolTypeId).toBe('circular-saw')
    expect(created.name).toBe(catalogItem.displayName)
  })
})
