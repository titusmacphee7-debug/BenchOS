import { describe, expect, it } from 'vitest'
import { buildStarterToolLibrary } from '../../data/seed/starterToolLibrary'
import type { ToolCatalogLibraryItem } from '../../data/schema'
import {
  buildCatalogGuideRouteIndex,
  catalogGuidePath,
  guideStatusForRoute,
  resolveGuideRoute,
} from './allToolsGuideSystem'
import { getToolMasteryGuideContent } from './toolMasteryContent'

function buildCatalogLibraryItems() {
  const seed = buildStarterToolLibrary()
  const toolTypesById = new Map(seed.toolTypes.map((toolType) => [toolType.id, toolType]))
  const specsByCatalogItem = groupBy(seed.toolCatalogSpecs, (spec) => spec.catalogItemId)
  const sourceNotesByCatalogItem = groupBy(seed.toolCatalogSourceNotes.filter((note) => note.catalogItemId), (note) => note.catalogItemId ?? '')

  return seed.toolCatalogItems.map((catalogItem) => ({
    ...catalogItem,
    toolType: toolTypesById.get(catalogItem.internalToolTypeId)!,
    aliases: [],
    capabilities: [],
    specs: specsByCatalogItem.get(catalogItem.id) ?? [],
    sourceNotes: sourceNotesByCatalogItem.get(catalogItem.id) ?? [],
  })) satisfies ToolCatalogLibraryItem[]
}

describe('all tools guide system', () => {
  it('maps every seeded catalog item to one unique guide route', () => {
    const items = buildCatalogLibraryItems()
    const index = buildCatalogGuideRouteIndex(items)
    const slugs = [...index.bySlug.keys()]

    expect(index.byCatalogItemId.size).toBe(1641)
    expect(slugs).toHaveLength(items.length)
    expect(new Set(slugs).size).toBe(items.length)
  })

  it('reserves old tool-type guide routes for compatibility', () => {
    const items = buildCatalogLibraryItems()
    const index = buildCatalogGuideRouteIndex(items)

    expect(index.bySlug.has('cordless-drill')).toBe(false)
    expect(resolveGuideRoute({ guideSlug: 'cordless-drill' }, index)).toMatchObject({
      kind: 'tool-type',
      toolTypeId: 'cordless-drill',
      path: '/tool-guides/types/cordless-drill',
    })
  })

  it('resolves catalog-specific routes with honest status metadata', () => {
    const items = buildCatalogLibraryItems()
    const index = buildCatalogGuideRouteIndex(items)
    const route = resolveGuideRoute({ guideSlug: catalogGuidePath(items[0], index).replace('/tool-guides/', '') }, index)

    expect(route?.kind).toBe('catalog-item')
    expect(route?.toolTypeId).toBe(items[0].internalToolTypeId)
    expect(guideStatusForRoute(route!, getToolMasteryGuideContent(route!.toolTypeId))).toContain('Model Overlay Missing')
  })
})

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  const grouped = new Map<string, T[]>()
  for (const item of items) grouped.set(getKey(item), [...(grouped.get(getKey(item)) ?? []), item])
  return grouped
}
