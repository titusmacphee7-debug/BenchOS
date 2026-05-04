import { describe, expect, it } from 'vitest'
import type { Capability, ToolBuyingPreferences, ToolCatalogLibraryItem, ToolLibraryItem } from '../../data/schema'
import { PUBLIC_INVENTORY_SOURCES } from '../../data/seed/publicInventoryExpansion'
import { buildStarterToolLibrary } from '../../data/seed/starterToolLibrary'
import {
  clearToolCatalogSearchCache,
  getToolCatalogSearchCacheSize,
  parseToolCatalogQuery,
  rankToolCatalogItem,
  searchToolCatalog,
  searchToolCatalogWithScores,
  searchToolLibrary,
} from './toolSearch'

const starter = buildStarterToolLibrary()
const capabilityById = new Map(starter.capabilities.map((capability) => [capability.id, capability]))
const items: ToolLibraryItem[] = starter.toolTypes.map((toolType) => ({
  ...toolType,
  aliases: starter.toolAliases.filter((alias) => alias.toolTypeId === toolType.id).map((alias) => alias.alias),
  variants: starter.toolVariants.filter((variant) => variant.toolTypeId === toolType.id),
  capabilities: starter.toolTypeCapabilities
    .filter((link) => link.toolTypeId === toolType.id)
    .map((link) => capabilityById.get(link.capabilityId))
    .filter((capability): capability is Capability => Boolean(capability)),
}))
const toolTypeById = new Map(starter.toolTypes.map((toolType) => [toolType.id, toolType]))
const aliasesByToolTypeId = new Map(starter.toolTypes.map((toolType) => [
  toolType.id,
  starter.toolAliases.filter((alias) => alias.toolTypeId === toolType.id).map((alias) => alias.alias),
]))
const specsByCatalogItemId = new Map(starter.toolCatalogItems.map((item) => [
  item.id,
  starter.toolCatalogSpecs.filter((spec) => spec.catalogItemId === item.id),
]))
const sourceNotesByCatalogItemId = new Map(starter.toolCatalogItems.map((item) => [
  item.id,
  starter.toolCatalogSourceNotes.filter((note) => note.catalogItemId === item.id),
]))
const catalogItems: ToolCatalogLibraryItem[] = starter.toolCatalogItems.map((item) => {
  const toolType = toolTypeById.get(item.internalToolTypeId)
  if (!toolType) throw new Error(`Missing tool type for ${item.id}`)
  return {
    ...item,
    toolType,
    aliases: aliasesByToolTypeId.get(toolType.id) ?? [],
    specs: specsByCatalogItemId.get(item.id) ?? [],
    sourceNotes: sourceNotesByCatalogItemId.get(item.id) ?? [],
    capabilities: starter.toolTypeCapabilities
      .filter((link) => link.toolTypeId === toolType.id)
      .map((link) => capabilityById.get(link.capabilityId))
      .filter((capability): capability is Capability => Boolean(capability)),
  }
})

describe('tool search', () => {
  it('keeps the legacy tool foundation and expands internal types for public inventory', () => {
    expect(starter.toolTypes.length).toBeGreaterThanOrEqual(170)
  })

  it('finds tools by name and alias', () => {
    expect(searchToolLibrary(items, 'circular saw')[0]?.id).toBe('circular-saw')
    expect(searchToolLibrary(items, 'skilsaw')[0]?.id).toBe('circular-saw')
  })

  it('finds tools by capability and project use case', () => {
    expect(searchToolLibrary(items, 'cut plywood').some((tool) => tool.id === 'circular-saw')).toBe(true)
    expect(searchToolLibrary(items, 'drive screws').some((tool) => tool.id === 'cordless-drill')).toBe(true)
    expect(searchToolLibrary(items, 'deck tools').some((tool) => tool.commonProjects.includes('deck'))).toBe(true)
  })

  it('finds tools by starter brand/model variants', () => {
    expect(searchToolLibrary(items, 'DeWalt DCS391').some((tool) => tool.id === 'circular-saw')).toBe(true)
  })

  it('builds concrete catalog records from starter variants', () => {
    const legacyCatalogItems = starter.toolCatalogItems.filter((tool) => tool.id.startsWith('catalog-'))
    expect(legacyCatalogItems).toHaveLength(starter.toolVariants.length)
    expect(starter.toolCatalogItems.some((tool) => tool.displayName === 'DeWalt DCS391')).toBe(true)
    expect(starter.toolCatalogSourceNotes.some((note) => note.sourceName === 'BenchOS v0.01 seed')).toBe(true)
  })

  it('adds a large public-inventory catalog expansion with searchable tags', () => {
    const publicItems = starter.toolCatalogItems.filter((tool) => tool.id.startsWith('public-catalog-'))
    expect(publicItems.length).toBeGreaterThanOrEqual(1400)
    expect(publicItems.length).toBeLessThanOrEqual(1600)
    expect(publicItems.length).toBe(starter.publicInventoryExpansionCatalogItemIds.length)
    expect(starter.toolCatalogItems.every((tool) => tool.searchTags.length >= 8)).toBe(true)
  })

  it('keeps public source notes for every requested inventory source', () => {
    const sourceNames = new Set(starter.toolCatalogSourceNotes.map((note) => note.sourceName))
    for (const source of PUBLIC_INVENTORY_SOURCES) {
      expect(sourceNames.has(source.name)).toBe(true)
    }
  })

  it('merges duplicate canonical source observations onto existing catalog cards', () => {
    const publicItemsWithMultipleSources = starter.toolCatalogItems.filter((tool) => tool.id.startsWith('public-catalog-') && tool.sourceNoteIds.length > 1)
    const uniqueCatalogIds = new Set(starter.toolCatalogItems.map((tool) => tool.id))
    expect(uniqueCatalogIds.size).toBe(starter.toolCatalogItems.length)
    expect(publicItemsWithMultipleSources.length).toBeGreaterThan(0)
  })

  it('searches concrete catalog tools by internal type and capability', () => {
    expect(searchToolCatalog(catalogItems, 'DeWalt DCS391')[0]?.displayName).toBe('DeWalt DCS391')
    expect(searchToolCatalog(catalogItems, 'DCS391')[0]?.displayName).toBe('DeWalt DCS391')
    expect(searchToolCatalog(catalogItems, 'cordless drill').some((tool) => tool.internalToolTypeId === 'cordless-drill')).toBe(true)
    expect(searchToolCatalog(catalogItems, 'cut plywood').some((tool) => tool.internalToolTypeId === 'circular-saw')).toBe(true)
  })

  it('ranks exact brand and tool intent searches above loose fuzzy matches', () => {
    expect(searchToolCatalog(catalogItems, 'dewalt drill')[0]).toMatchObject({ brand: 'DeWalt', internalToolTypeId: 'cordless-drill' })
    expect(searchToolCatalog(catalogItems, 'milwaukee impact')[0]?.brand).toBe('Milwaukee')
    expect(searchToolCatalog(catalogItems, 'milwaukee impact')[0]?.toolType.name.toLowerCase()).toContain('impact')
    expect(searchToolCatalog(catalogItems, 'makita circular saw')[0]).toMatchObject({ brand: 'Makita', internalToolTypeId: 'circular-saw' })
    expect(searchToolCatalog(catalogItems, 'ridgid shop vac')[0]).toMatchObject({ brand: 'RIDGID', internalToolTypeId: 'shop-vac' })
    expect(searchToolCatalog(catalogItems, 'rigid shop vac')[0]).toMatchObject({ brand: 'RIDGID', internalToolTypeId: 'shop-vac' })
    expect(searchToolCatalog(catalogItems, 'bosch jigsaw')[0]).toMatchObject({ brand: 'Bosch', internalToolTypeId: 'jigsaw' })
  })

  it('finds project, accessory, and repair intent queries through tags', () => {
    expect(searchToolCatalog(catalogItems, 'drill concrete').some((tool) => ['rotary-hammer', 'hammer-drill', 'masonry-bit-set'].includes(tool.internalToolTypeId))).toBe(true)
    expect(searchToolCatalog(catalogItems, 'sink repair').some((tool) => ['basin-wrench', 'pipe-wrench', 'drain-snake'].includes(tool.internalToolTypeId))).toBe(true)
    expect(searchToolCatalog(catalogItems, 'oil change').some((tool) => ['floor-jack', 'jack-stands', 'oil-filter-wrench'].includes(tool.internalToolTypeId))).toBe(true)
    expect(searchToolCatalog(catalogItems, 'drywall patch').some((tool) => ['drywall-saw', 'taping-knife', 'drywall-sander'].includes(tool.internalToolTypeId))).toBe(true)
    expect(searchToolCatalog(catalogItems, 'tile saw').some((tool) => ['tile-saw', 'tile-cutter'].includes(tool.internalToolTypeId))).toBe(true)
    expect(searchToolCatalog(catalogItems, 'air compressor hose').some((tool) => tool.displayName.toLowerCase().includes('air compressor hose'))).toBe(true)
    expect(searchToolCatalog(catalogItems, 'f style clamp').some((tool) => tool.internalToolTypeId === 'f-style-clamp')).toBe(true)
  })

  it('keeps parent tools above accessories unless accessory intent is present', () => {
    expect(searchToolCatalog(catalogItems, 'dewalt circular saw')[0]).toMatchObject({ brand: 'DeWalt', internalToolTypeId: 'circular-saw' })
    expect(searchToolCatalog(catalogItems, 'dewalt saw blade')[0]).toMatchObject({ brand: 'DeWalt', internalToolTypeId: 'saw-blade-set' })
  })

  it('exposes deterministic score reasons for debug views', () => {
    const result = searchToolCatalogWithScores(catalogItems, 'dewalt drill')[0]
    expect(result.item).toMatchObject({ brand: 'DeWalt', internalToolTypeId: 'cordless-drill' })
    expect(result.score).toBeGreaterThan(0)
    expect(result.matchedFields).toContain('brand+tool')
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('keeps preferences as tie-breakers instead of overriding relevance', () => {
    const preferences = buyingPreferences({
      preferredBrands: ['Milwaukee'],
      preferredBatteryPlatforms: ['M18'],
      avoidedBrands: ['DeWalt'],
    })
    const results = searchToolCatalogWithScores(catalogItems, 'dewalt drill', { preferences })

    expect(results[0].item).toMatchObject({ brand: 'DeWalt', internalToolTypeId: 'cordless-drill' })
    expect(results[0].preferenceScore).toBeLessThan(0)
  })

  it('searches seeded tags and tolerates common typos without beating exact matches', () => {
    const exact = searchToolCatalog(catalogItems, 'dewalt drill')[0]
    const typo = searchToolCatalog(catalogItems, 'dewlt drill')[0]

    expect(searchToolCatalog(catalogItems, 'cabinet cuts').some((tool) => ['track-saw', 'table-saw'].includes(tool.internalToolTypeId))).toBe(true)
    expect(typo?.internalToolTypeId).toBe('cordless-drill')
    expect(exact?.brand).toBe('DeWalt')
  })

  it('ranks exact model matches above broad same-brand tool queries', () => {
    const dcs391 = catalogItems.find((tool) => tool.displayName === 'DeWalt DCS391')
    if (!dcs391) throw new Error('Expected DeWalt DCS391 seed item')
    const rank = rankToolCatalogItem(dcs391, parseToolCatalogQuery('DeWalt DCS391'))

    expect(searchToolCatalog(catalogItems, 'DeWalt DCS391')[0]?.displayName).toBe('DeWalt DCS391')
    expect(rank.matchedFields).toContain('model')
    expect(rank.score).toBeGreaterThan(1000)
  })

  it('reuses cached catalog indexes for identical item sets', () => {
    clearToolCatalogSearchCache()
    const first = searchToolCatalog(catalogItems, 'sink repair').map((tool) => tool.id)
    const cacheSizeAfterFirstSearch = getToolCatalogSearchCacheSize()
    const second = searchToolCatalog(catalogItems, 'sink repair').map((tool) => tool.id)

    expect(cacheSizeAfterFirstSearch).toBe(1)
    expect(getToolCatalogSearchCacheSize()).toBe(1)
    expect(second).toEqual(first)
  })

  it('returns all filtered catalog items for empty search', () => {
    const results = searchToolCatalog(catalogItems, '', { category: 'Drilling' })
    expect(results.length).toBe(catalogItems.filter((tool) => tool.toolType.category === 'Drilling').length)
    expect(results.every((tool) => tool.toolType.category === 'Drilling')).toBe(true)
  })

  it('keeps seed source notes free of live inventory-only fields', () => {
    const serializedNotes = JSON.stringify(starter.toolCatalogSourceNotes)
    expect(serializedNotes).not.toMatch(/\b(shelf|available|due|overdue|reservation|reserved)\b|@\s*shelf/i)
  })
})

function buyingPreferences(overrides: Partial<ToolBuyingPreferences> = {}): ToolBuyingPreferences {
  return {
    id: 'default',
    preferredBrands: [],
    avoidedBrands: [],
    preferredBatteryPlatforms: [],
    budgetTier: 'balanced',
    workshopType: 'mixed',
    storageSensitivity: 'medium',
    noiseSensitivity: 'medium',
    dustSensitivity: 'medium',
    preferCordless: true,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}
