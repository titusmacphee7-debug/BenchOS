import type { ToolCatalogLibraryItem } from '../../data/schema'
import type { GuideDepthMode, ToolMasteryGuideContent } from './toolMasteryContent'

export type GuideContentStatus =
  | 'Complete'
  | 'Reviewed'
  | 'Needs Review'
  | 'Template-Based'
  | 'Model Overlay Missing'
  | 'Safety Review Required'
  | 'Specs Missing'
  | 'Image Missing'
  | 'Accessories Missing'
  | 'Project Links Missing'

export type GuideRouteKind = 'catalog-item' | 'tool-type'

export type CatalogGuideRoute = {
  kind: 'catalog-item'
  catalogItemId: string
  slug: string
  path: string
  toolTypeId: string
  title: string
  displayName: string
  brand: string
  model?: string
  catalogItem: ToolCatalogLibraryItem
}

export type ToolTypeGuideRoute = {
  kind: 'tool-type'
  slug: string
  path: string
  toolTypeId: string
  title: string
  catalogItem?: undefined
}

export type ResolvedGuideRoute = CatalogGuideRoute | ToolTypeGuideRoute

export type CatalogGuideRouteIndex = {
  byCatalogItemId: Map<string, CatalogGuideRoute>
  bySlug: Map<string, CatalogGuideRoute>
  byToolTypeId: Map<string, CatalogGuideRoute[]>
}

export type GuideRouteRequest = {
  guideSlug?: string
  toolTypeId?: string
  catalogItemId?: string
}

export type CategoryGuideFoundation = {
  template: string
  safetyIntro: string
  setupFocus: string
  practiceFocus: string
  reviewLevel: 'standard' | 'strict'
}

const strictSafetyCategories = new Set(['Cutting', 'Routing', 'Automotive', 'Electrical', 'Plumbing', 'Finishing', 'Outdoor / Yard'])

const categoryFoundations: Record<string, CategoryGuideFoundation> = {
  Cutting: {
    template: 'Power cutting tool foundation',
    safetyIntro: 'Cutting tools need stable support, a clear cut path, appropriate PPE, and a stop plan before the tool starts.',
    setupFocus: 'Confirm the blade, work support, offcut behavior, and line of cut before the first pass.',
    practiceFocus: 'Practice with scrap until the cut path, support, and body position feel predictable.',
    reviewLevel: 'strict',
  },
  Drilling: {
    template: 'Drilling and boring foundation',
    safetyIntro: 'Drilling work is usually controlled, but bit choice, hidden hazards, and workholding still matter.',
    setupFocus: 'Match the bit to the material, secure the work, and choose speed or clutch settings deliberately.',
    practiceFocus: 'Practice pilot holes, clean exits, and square alignment before drilling project stock.',
    reviewLevel: 'standard',
  },
  Fastening: {
    template: 'Fastening foundation',
    safetyIntro: 'Fastening tools reward bit fit, controlled force, and attention to the material being joined.',
    setupFocus: 'Match the driver, socket, or fastener to the task and start with controlled pressure.',
    practiceFocus: 'Practice consistent depth and alignment before project assembly.',
    reviewLevel: 'standard',
  },
  Sanding: {
    template: 'Surface prep foundation',
    safetyIntro: 'Dust control and respiratory protection are part of sanding readiness, not optional cleanup.',
    setupFocus: 'Choose the grit sequence, attach dust collection, and test on scrap or a hidden area.',
    practiceFocus: 'Practice light pressure and grit progression until scratch patterns become predictable.',
    reviewLevel: 'standard',
  },
  Measuring: {
    template: 'Measuring foundation',
    safetyIntro: 'Measuring tools are low risk, but bad measuring habits can break project readiness.',
    setupFocus: 'Use a consistent reference edge, repeat critical measurements, and mark clearly.',
    practiceFocus: 'Practice repeatable marks and checks before committing project material.',
    reviewLevel: 'standard',
  },
  Layout: {
    template: 'Layout foundation',
    safetyIntro: 'Layout tools become safety tools when they keep cutting and drilling paths predictable.',
    setupFocus: 'Seat the reference surface cleanly and verify the mark before cutting or fastening.',
    practiceFocus: 'Practice square, repeatable layout marks and compare the result after the operation.',
    reviewLevel: 'standard',
  },
  Clamping: {
    template: 'Workholding foundation',
    safetyIntro: 'Workholding reduces tool movement, hand risk, and project drift.',
    setupFocus: 'Choose clamp placement that supports the operation without crossing the tool path.',
    practiceFocus: 'Practice dry fits and pressure checks before glue, cutting, or drilling.',
    reviewLevel: 'standard',
  },
  Automotive: {
    template: 'Automotive tool foundation',
    safetyIntro: 'Automotive work needs support, torque awareness, and caution around stored energy, weight, and critical fasteners.',
    setupFocus: 'Confirm support equipment, exact tool fit, and torque requirements before loosening or tightening.',
    practiceFocus: 'Practice on non-critical hardware before working near safety-critical vehicle systems.',
    reviewLevel: 'strict',
  },
  Electrical: {
    template: 'Electrical tool foundation',
    safetyIntro: 'Electrical work can be hazardous. Verify power state, use proper meters, and follow local code or a qualified professional when needed.',
    setupFocus: 'Confirm the circuit, rating, tool category, and personal limits before touching conductors.',
    practiceFocus: 'Practice measurement and identification habits on safe, known examples first.',
    reviewLevel: 'strict',
  },
  Plumbing: {
    template: 'Plumbing tool foundation',
    safetyIntro: 'Plumbing work needs water shutoff planning, correct materials, and awareness of code-sensitive connections.',
    setupFocus: 'Confirm pipe material, shutoff access, pressure state, and compatible fittings before work begins.',
    practiceFocus: 'Practice assembly and leak-check habits before closing walls or finishing surfaces.',
    reviewLevel: 'strict',
  },
  'Dust Collection': {
    template: 'Dust collection foundation',
    safetyIntro: 'Dust collection supports health, visibility, cleanup, and tool reliability.',
    setupFocus: 'Match filters, bags, hoses, and adapters to the material and tool.',
    practiceFocus: 'Practice dust-path setup and check what escapes before longer sessions.',
    reviewLevel: 'standard',
  },
}

const defaultFoundation: CategoryGuideFoundation = {
  template: 'General workshop guide foundation',
  safetyIntro: 'Confirm the tool is appropriate for the material, the work is stable, and the manual does not call for a special setup.',
  setupFocus: 'Start with the correct accessory, stable workholding, and a small test before committing project material.',
  practiceFocus: 'Practice slowly on scrap or low-risk material until the result feels repeatable.',
  reviewLevel: 'standard',
}

export function buildCatalogGuideRouteIndex(items: ToolCatalogLibraryItem[]): CatalogGuideRouteIndex {
  const baseSlugs = items.map((item) => normalizeGuideSlug(item.displayName || `${item.brand} ${item.toolType.name}`))
  const counts = countValues(baseSlugs)
  const reservedToolTypeSlugs = new Set(items.map((item) => normalizeGuideSlug(item.internalToolTypeId)))
  const usedSlugs = new Set<string>()
  const routes = items.map((item, index) => {
    const baseSlug = baseSlugs[index] || normalizeGuideSlug(item.id)
    const needsSuffix = (counts.get(baseSlug) ?? 0) > 1 || reservedToolTypeSlugs.has(baseSlug)
    let slug = needsSuffix ? `${baseSlug}-${shortCatalogId(item.id)}` : baseSlug
    while (usedSlugs.has(slug)) slug = `${baseSlug}-${shortCatalogId(item.id)}-${usedSlugs.size + 1}`
    usedSlugs.add(slug)

    return {
      kind: 'catalog-item' as const,
      catalogItemId: item.id,
      slug,
      path: `/tool-guides/${slug}`,
      toolTypeId: item.internalToolTypeId,
      title: `${item.displayName} Guide`,
      displayName: item.displayName,
      brand: item.brand,
      model: item.model,
      catalogItem: item,
    }
  })

  return {
    byCatalogItemId: new Map(routes.map((route) => [route.catalogItemId, route])),
    bySlug: new Map(routes.map((route) => [route.slug, route])),
    byToolTypeId: groupRoutes(routes),
  }
}

export function resolveGuideRoute(request: GuideRouteRequest, index: CatalogGuideRouteIndex): ResolvedGuideRoute | undefined {
  if (request.catalogItemId) {
    const catalogRoute = index.byCatalogItemId.get(request.catalogItemId)
    if (catalogRoute) return catalogRoute
  }

  if (request.toolTypeId) return toolTypeGuideRoute(request.toolTypeId)

  const slug = request.guideSlug ? normalizeGuideSlug(request.guideSlug) : undefined
  if (!slug) return undefined

  const catalogRoute = index.bySlug.get(slug)
  if (catalogRoute) return catalogRoute

  const oldToolTypeFallback = index.byToolTypeId.get(slug)
  if (oldToolTypeFallback || isLikelyToolTypeId(slug)) return toolTypeGuideRoute(slug)

  return undefined
}

export function catalogGuidePath(item: ToolCatalogLibraryItem, index: CatalogGuideRouteIndex) {
  return index.byCatalogItemId.get(item.id)?.path ?? `/tool-guides/${normalizeGuideSlug(item.displayName || item.id)}`
}

export function toolTypeGuidePath(toolTypeId: string) {
  return `/tool-guides/types/${toolTypeId}`
}

export function guideIdForResolvedRoute(route: ResolvedGuideRoute) {
  return route.kind === 'catalog-item' ? `guide-catalog-${route.catalogItemId}` : `guide-${route.toolTypeId}`
}

export function getCategoryGuideFoundation(category?: string) {
  return (category && categoryFoundations[category]) || defaultFoundation
}

export function guideStatusForRoute(route: ResolvedGuideRoute, structuredGuide?: ToolMasteryGuideContent) {
  const statuses: GuideContentStatus[] = []
  if (structuredGuide) statuses.push('Complete', 'Reviewed')
  else statuses.push('Template-Based', 'Needs Review')

  if (route.kind === 'catalog-item') {
    const item = route.catalogItem
    statuses.push('Model Overlay Missing')
    if (item.specs.length === 0) statuses.push('Specs Missing')
    if (!item.imageAssignment && !item.imageId) statuses.push('Image Missing')
    if (item.compatibilityTags.length === 0) statuses.push('Accessories Missing')
    if (item.toolType.commonProjects.length === 0) statuses.push('Project Links Missing')
  }

  const category = route.kind === 'catalog-item' ? route.catalogItem.toolType.category : undefined
  if (!structuredGuide && category && strictSafetyCategories.has(category)) statuses.push('Safety Review Required')
  return unique(statuses)
}

export function statusTone(status: GuideContentStatus) {
  if (status === 'Complete' || status === 'Reviewed') return 'green'
  if (status === 'Safety Review Required') return 'red'
  if (status === 'Template-Based') return 'orange'
  if (status.includes('Missing')) return 'yellow'
  return 'muted'
}

export function statusDescription(status: GuideContentStatus) {
  const descriptions: Record<GuideContentStatus, string> = {
    Complete: 'A structured BenchOS tool-type foundation is available.',
    Reviewed: 'The current foundation has passed the internal safety/copy checks for this release.',
    'Needs Review': 'This guide is useful, but the content should be reviewed before calling it complete.',
    'Template-Based': 'The page inherits category and tool-type context instead of a full custom guide.',
    'Model Overlay Missing': 'Brand/model-specific claims are not verified yet, so BenchOS keeps the copy generic.',
    'Safety Review Required': 'This category needs stricter safety review before the guide should be treated as complete.',
    'Specs Missing': 'Catalog specs are not available for this item.',
    'Image Missing': 'A verified image is not available yet.',
    'Accessories Missing': 'Accessory and compatibility metadata is thin or missing.',
    'Project Links Missing': 'Project examples or links need more catalog mapping.',
  }
  return descriptions[status]
}

export function modelOverlayFacts(route: ResolvedGuideRoute) {
  if (route.kind !== 'catalog-item') return []
  const item = route.catalogItem
  return [
    ['Brand', item.brand],
    ['Model / platform', item.model],
    ['Power source', item.powerType],
    ['Battery platform', item.batteryPlatform],
    ['Voltage', item.voltage],
    ['Catalog ID', item.id],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]))
}

export function templateGuideSectionsForRoute(route: ResolvedGuideRoute, mode: GuideDepthMode) {
  const item = route.kind === 'catalog-item' ? route.catalogItem : undefined
  const typeName = item?.toolType.name ?? titleFromToolTypeId(route.toolTypeId)
  const category = item?.toolType.category
  const foundation = getCategoryGuideFoundation(category)
  const displayName = item?.displayName ?? typeName
  const materials = item?.toolType.materials.slice(0, 4).join(', ') || 'the material in front of you'
  const projects = item?.toolType.commonProjects.slice(0, 4).join(', ') || 'general workshop projects'
  const safety = item?.toolType.safety.length ? item.toolType.safety : [foundation.safetyIntro, 'Review the manufacturer manual before project work.']

  const quick = [
    { title: 'Safety First', items: [...safety, `${displayName} uses the ${foundation.template}. Model-specific safety notes are not fully reviewed yet.`] },
    { title: 'Setup', items: [foundation.setupFocus, `Confirm ${materials} compatibility before using ${displayName}.`, 'Use a stable work surface and stop if the setup feels unstable.'] },
    { title: 'Basic Use', items: [`Use ${displayName} for ${projects} when the task matches the tool type.`, 'Start slowly, inspect early results, and adjust before working on final project material.'] },
    { title: 'Common Mistakes', items: ['Treating a template guide as model-specific manual advice.', 'Skipping a test pass or dry fit before project work.', 'Using worn, mismatched, or missing accessories.'] },
  ]

  if (mode === 'quick') return quick
  if (mode === 'shop-card') {
    return [
      { title: 'Shop Card Checklist', items: ['Manual checked if the task is unfamiliar.', 'Workpiece stable and clear of the tool path.', 'Correct accessory or consumable selected.', 'PPE and dust/noise controls ready.', 'Practice or test pass completed when risk is unclear.'] },
      { title: 'Readiness Warnings', items: [`${displayName} currently uses inherited guide content.`, 'Model-specific specs, accessories, and warnings may be incomplete.', 'BenchXP familiarity is guidance, not certification.'] },
      { title: 'Practice Task', items: [`Template practice: perform one controlled, low-risk test with ${typeName} and inspect the result before project work.`] },
    ]
  }

  return [
    { title: 'Overview', items: [`${displayName} is mapped to the ${typeName} guide foundation.`, `This guide inherits ${category ?? 'general workshop'} safety and setup context until a dedicated model overlay is reviewed.`] },
    { title: 'Best Uses', items: item?.toolType.commonProjects.length ? item.toolType.commonProjects : ['General workshop tasks that match this tool type.'] },
    { title: 'When Not To Use It', items: ['Do not use it when the workpiece is unstable, the accessory does not match the material, or the model manual calls for a different setup.'] },
    ...quick,
    { title: 'Accessories', items: item?.compatibilityTags.length ? item.compatibilityTags : ['Accessory metadata is incomplete; check the tool manual and project requirement before buying or using add-ons.'] },
    { title: 'Consumables', items: ['Match consumables to the material, tool rating, and project finish quality before starting.'] },
    { title: 'Maintenance', items: ['Inspect moving parts, power connections, accessories, and storage condition before returning the tool to the shelf.'] },
    { title: 'Comparisons', items: [`Compare ${typeName} against nearby tool types before forcing it into a task it is not meant to do.`] },
    { title: 'Substitutions', items: ['Use substitutes only when they keep the setup stable, the result honest, and the safety conditions acceptable.'] },
    { title: 'Project Examples', items: item?.toolType.commonProjects.length ? item.toolType.commonProjects : ['Add project links later as catalog mapping improves.'] },
    { title: 'Buying Notes', items: ['Do not buy on brand/model name alone; close a real capability, safety, compatibility, or project-readiness gap.'] },
    { title: 'Troubleshooting', items: ['If the tool feels hard to control, stop and inspect setup, accessory fit, workholding, and material compatibility.'] },
    { title: 'Storage + Care', items: 'Store it clean, dry, and easy to inspect before the next project.'.split('\n') },
  ]
}

function toolTypeGuideRoute(toolTypeId: string): ToolTypeGuideRoute {
  return {
    kind: 'tool-type',
    slug: normalizeGuideSlug(toolTypeId),
    path: toolTypeGuidePath(toolTypeId),
    toolTypeId,
    title: `${titleFromToolTypeId(toolTypeId)} Guide`,
  }
}

export function normalizeGuideSlug(value: string) {
  return value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function shortCatalogId(id: string) {
  const normalized = normalizeGuideSlug(id).replace(/^catalog-/, '')
  return normalized.split('-').slice(-2).join('-') || normalized.slice(-8)
}

function countValues(values: string[]) {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return counts
}

function groupRoutes(routes: CatalogGuideRoute[]) {
  const grouped = new Map<string, CatalogGuideRoute[]>()
  for (const route of routes) grouped.set(route.toolTypeId, [...(grouped.get(route.toolTypeId) ?? []), route])
  return grouped
}

function isLikelyToolTypeId(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

function titleFromToolTypeId(toolTypeId: string) {
  return toolTypeId.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

function unique<T>(items: T[]) {
  return [...new Set(items)]
}
