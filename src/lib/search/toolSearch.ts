import MiniSearch from 'minisearch'
import type { ToolBuyingPreferences, ToolCatalogLibraryItem, ToolLibraryItem } from '../../data/schema'

export type ToolSearchFilters = {
  category?: string
  skillLevel?: string
}

export type ToolCatalogSearchFilters = ToolSearchFilters & {
  brand?: string
  batteryPlatform?: string
  powerType?: string
  costTier?: string
  preferences?: ToolBuyingPreferences
}

export type ParsedToolCatalogQuery = {
  raw: string
  normalized: string
  tokens: string[]
  tokenSet: Set<string>
  accessoryIntent: boolean
  toolIntentTokens: string[]
  knownBrandInQuery: boolean
  knownBrandTokens: string[]
  modelLikeTokens: string[]
}

export type ToolCatalogRank = {
  score: number
  matchedFields: string[]
  reasons: string[]
}

export type ToolCatalogSearchResult = ToolCatalogRank & {
  item: ToolCatalogLibraryItem
  miniSearchScore: number
  preferenceScore: number
}

type ToolSearchDocument = {
  id: string
  name: string
  category: string
  description: string
  aliases: string
  capabilities: string
  materials: string
  commonProjects: string
  skillLevel: string
  powerType: string
  variants: string
}

type ToolCatalogSearchDocument = {
  id: string
  displayName: string
  brand: string
  model: string
  toolType: string
  category: string
  aliases: string
  capabilities: string
  materials: string
  commonProjects: string
  skillLevel: string
  powerType: string
  batteryPlatform: string
  costTier: string
  specs: string
  priorityLabels: string
  searchTags: string
  searchTerms: string
}

type ToolCatalogSearchBundle = {
  fingerprint: string
  index: MiniSearch<ToolCatalogSearchDocument>
  documents: ToolCatalogSearchDocument[]
  documentById: Map<string, ToolCatalogSearchDocument>
}

const catalogSearchIndexCache = new Map<string, ToolCatalogSearchBundle>()
const catalogSearchIndexCacheLimit = 8

export function buildToolSearchIndex(items: ToolLibraryItem[]) {
  const documents = items.map(toSearchDocument)
  const index = new MiniSearch<ToolSearchDocument>({
    fields: [
      'name',
      'aliases',
      'category',
      'capabilities',
      'materials',
      'commonProjects',
      'skillLevel',
      'powerType',
      'variants',
      'description',
    ],
    storeFields: ['id'],
    searchOptions: {
      boost: {
        name: 5,
        aliases: 4,
        capabilities: 3,
        variants: 2,
        commonProjects: 2,
        category: 1.5,
      },
      fuzzy: 0.18,
      prefix: true,
    },
  })

  index.addAll(documents)
  return index
}

export function searchToolLibrary(items: ToolLibraryItem[], query: string, filters: ToolSearchFilters = {}) {
  const filteredItems = items.filter((item) => {
    if (filters.category && filters.category !== 'All' && item.category !== filters.category) return false
    if (filters.skillLevel && filters.skillLevel !== 'All' && item.skillLevel !== filters.skillLevel) return false
    return true
  })

  const trimmedQuery = query.trim()
  if (!trimmedQuery) return filteredItems

  const index = buildToolSearchIndex(filteredItems)
  const itemById = new Map(filteredItems.map((item) => [item.id, item]))

  return index
    .search(trimmedQuery)
    .map((result) => itemById.get(result.id))
    .filter((item): item is ToolLibraryItem => Boolean(item))
}

export function buildToolCatalogSearchIndex(items: ToolCatalogLibraryItem[]) {
  return getToolCatalogSearchBundle(items).index
}

export function clearToolCatalogSearchCache() {
  catalogSearchIndexCache.clear()
}

export function getToolCatalogSearchCacheSize() {
  return catalogSearchIndexCache.size
}

function getToolCatalogSearchBundle(items: ToolCatalogLibraryItem[]): ToolCatalogSearchBundle {
  const fingerprint = catalogSearchFingerprint(items)
  const cached = catalogSearchIndexCache.get(fingerprint)
  if (cached) {
    catalogSearchIndexCache.delete(fingerprint)
    catalogSearchIndexCache.set(fingerprint, cached)
    return cached
  }

  const documents = items.map(toCatalogSearchDocument)
  const index = new MiniSearch<ToolCatalogSearchDocument>({
    fields: [
      'displayName',
      'brand',
      'model',
      'toolType',
      'aliases',
      'category',
      'capabilities',
      'materials',
      'commonProjects',
      'skillLevel',
      'powerType',
      'batteryPlatform',
      'costTier',
      'specs',
      'priorityLabels',
      'searchTags',
      'searchTerms',
    ],
    storeFields: ['id'],
    searchOptions: {
      boost: {
        displayName: 6,
        searchTerms: 6,
        brand: 4,
        model: 4,
        toolType: 4,
        searchTags: 3.5,
        aliases: 3,
        capabilities: 3,
        specs: 2,
        commonProjects: 2,
        category: 1.5,
      },
      fuzzy: 0.18,
      prefix: true,
    },
  })

  index.addAll(documents)
  const bundle = {
    fingerprint,
    index,
    documents,
    documentById: new Map(documents.map((document) => [document.id, document])),
  }

  catalogSearchIndexCache.set(fingerprint, bundle)
  while (catalogSearchIndexCache.size > catalogSearchIndexCacheLimit) {
    const oldest = catalogSearchIndexCache.keys().next().value
    if (!oldest) break
    catalogSearchIndexCache.delete(oldest)
  }

  return bundle
}

export function searchToolCatalog(items: ToolCatalogLibraryItem[], query: string, filters: ToolCatalogSearchFilters = {}) {
  return searchToolCatalogWithScores(items, query, filters).map((result) => result.item)
}

export function searchToolCatalogWithScores(items: ToolCatalogLibraryItem[], query: string, filters: ToolCatalogSearchFilters = {}): ToolCatalogSearchResult[] {
  const filteredItems = filterToolCatalogItems(items, filters)
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    const emptyResults = filteredItems.map((item) => ({
      item,
      score: 0,
      miniSearchScore: 0,
      preferenceScore: scorePreferenceTieBreak(item, filters.preferences),
      matchedFields: [],
      reasons: ['empty query'],
    }))
    return sortToolCatalogSearchResults(emptyResults, true)
  }

  const parsedQuery = parseToolCatalogQuery(trimmedQuery)
  const bundle = getToolCatalogSearchBundle(filteredItems)
  const itemById = new Map(filteredItems.map((item) => [item.id, item]))
  const miniSearchScoreById = new Map<string, number>()
  const candidateIds = new Set<string>()

  for (const result of bundle.index.search(parsedQuery.normalized || trimmedQuery)) {
    const id = String(result.id)
    candidateIds.add(id)
    miniSearchScoreById.set(id, Math.max(miniSearchScoreById.get(id) ?? 0, result.score ?? 0))
  }

  const rankById = new Map<string, ToolCatalogRank>()
  for (const item of filteredItems) {
    const rank = rankToolCatalogItem(item, parsedQuery)
    rankById.set(item.id, rank)
    if (rank.score > 0) candidateIds.add(item.id)
  }

  return [...candidateIds]
    .map((id) => {
      const item = itemById.get(id)
      if (!item) return undefined
      const rank = rankById.get(id) ?? rankToolCatalogItem(item, parsedQuery)
      return {
        item,
        ...rank,
        miniSearchScore: miniSearchScoreById.get(id) ?? 0,
        preferenceScore: scorePreferenceTieBreak(item, filters.preferences),
      }
    })
    .filter((result): result is ToolCatalogSearchResult => Boolean(result))
    .filter((result) => result.score > 0 || result.miniSearchScore > 0)
    .sort((a, b) => sortToolCatalogSearchResult(a, b))
}

function filterToolCatalogItems(items: ToolCatalogLibraryItem[], filters: ToolCatalogSearchFilters) {
  return items.filter((item) => {
    if (filters.category && filters.category !== 'All' && item.toolType.category !== filters.category) return false
    if (filters.skillLevel && filters.skillLevel !== 'All' && item.toolType.skillLevel !== filters.skillLevel) return false
    if (filters.brand && filters.brand !== 'All' && item.brand !== filters.brand) return false
    if (filters.batteryPlatform && filters.batteryPlatform !== 'All' && item.batteryPlatform !== filters.batteryPlatform) return false
    if (filters.powerType && filters.powerType !== 'All' && item.powerType !== filters.powerType) return false
    if (filters.costTier && filters.costTier !== 'All' && item.costTier !== filters.costTier) return false
    return true
  })
}

export function parseToolCatalogQuery(query: string): ParsedToolCatalogQuery {
  const normalized = normalizeSearchText(query)
  const tokens = tokenSet(normalized)
  const knownBrandTokens = knownBrandVariants.filter((brand) => includesPhrase(normalized, brand))
  const toolIntentTokens = tokens.filter((token) => primaryToolIntentTokens.includes(token))
  return {
    raw: query,
    normalized,
    tokens,
    tokenSet: new Set(tokens),
    accessoryIntent: tokens.some((token) => accessoryIntentTokens.includes(token)),
    toolIntentTokens,
    knownBrandInQuery: knownBrandTokens.length > 0,
    knownBrandTokens,
    modelLikeTokens: tokens.filter((token) => /\d/.test(token) || platformIntentTokens.includes(token)),
  }
}

function toSearchDocument(item: ToolLibraryItem): ToolSearchDocument {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    description: item.description,
    aliases: item.aliases.join(' '),
    capabilities: item.capabilities.map((capability) => capability.name).join(' '),
    materials: item.materials.join(' '),
    commonProjects: item.commonProjects.join(' '),
    skillLevel: item.skillLevel,
    powerType: item.powerType,
    variants: item.variants.map((variant) => `${variant.brand} ${variant.model} ${variant.name}`).join(' '),
  }
}

function toCatalogSearchDocument(item: ToolCatalogLibraryItem): ToolCatalogSearchDocument {
  return {
    id: item.id,
    displayName: item.displayName,
    brand: item.brand,
    model: item.model ?? '',
    toolType: item.toolType.name,
    category: item.toolType.category,
    aliases: item.aliases.join(' '),
    capabilities: item.capabilities.map((capability) => capability.name).join(' '),
    materials: item.toolType.materials.join(' '),
    commonProjects: item.toolType.commonProjects.join(' '),
    skillLevel: item.toolType.skillLevel,
    powerType: item.powerType,
    batteryPlatform: item.batteryPlatform ?? '',
    costTier: item.costTier ?? '',
    specs: item.specs.map((spec) => `${spec.label} ${spec.value} ${spec.unit ?? ''}`).join(' '),
    priorityLabels: item.priorityLabels.join(' '),
    searchTags: item.searchTags.join(' '),
    searchTerms: buildCatalogSearchTerms(item).join(' '),
  }
}

function buildCatalogSearchTerms(item: ToolCatalogLibraryItem) {
  const terms = new Set<string>()
  const add = (value?: string) => {
    const normalized = normalizeSearchText(value)
    if (normalized) terms.add(normalized)
  }
  add(item.displayName)
  add(`${item.brand} ${item.toolType.name}`)
  add(`${item.brand} ${item.model ?? ''}`)
  add(`${item.brand} ${item.batteryPlatform ?? ''}`)
  add(`${item.brand} ${item.toolType.category}`)
  for (const alias of item.aliases) add(`${item.brand} ${alias}`)
  for (const tag of item.searchTags) add(tag)
  return [...terms]
}

export function rankToolCatalogItem(item: ToolCatalogLibraryItem, parsedQuery: ParsedToolCatalogQuery): ToolCatalogRank {
  const normalizedQuery = parsedQuery.normalized
  const queryTokens = parsedQuery.tokens
  const brandVariants = brandSearchVariants(item.brand)
  const queryBrand = brandVariants.some((brand) => includesPhrase(normalizedQuery, brand))
  const toolTerms = [item.toolType.name, ...item.aliases].map(normalizeSearchText).filter(Boolean)
  const toolPhraseMatch = toolTerms.some((term) => includesPhrase(normalizedQuery, term))
  const toolTokenMatch = toolTerms.some((term) => tokenSet(term).some((token) => queryTokens.includes(token)))
  const toolIntentScore = rankToolIntent(item, parsedQuery)
  const displayName = normalizeSearchText(item.displayName)
  const model = normalizeSearchText(item.model)
  const brand = normalizeSearchText(item.brand)
  const batteryPlatform = normalizeSearchText(item.batteryPlatform)
  const capabilityText = normalizeSearchText(item.capabilities.map((capability) => capability.name).join(' '))
  const materialsText = normalizeSearchText(item.toolType.materials.join(' '))
  const projectText = normalizeSearchText(item.toolType.commonProjects.join(' '))
  const specsText = normalizeSearchText(item.specs.map((spec) => `${spec.label} ${spec.value} ${spec.unit ?? ''}`).join(' '))
  const priorityText = normalizeSearchText(item.priorityLabels.join(' '))
  const searchTags = item.searchTags.map(normalizeSearchText)
  const tagText = searchTags.join(' ')
  const aliasesText = normalizeSearchText(item.aliases.join(' '))
  const category = normalizeSearchText(item.toolType.category)
  const powerType = normalizeSearchText(item.powerType)
  const searchableText = normalizeSearchText([
    displayName,
    brand,
    model,
    batteryPlatform,
    item.toolType.name,
    aliasesText,
    capabilityText,
    materialsText,
    projectText,
    specsText,
    priorityText,
    tagText,
    category,
    powerType,
  ].join(' '))
  const matchedFields = new Set<string>()
  const reasons: string[] = []
  const add = (points: number, field: string, reason: string) => {
    if (points === 0) return
    score += points
    matchedFields.add(field)
    reasons.push(`${reason} (+${points})`)
  }

  let score = 0

  if (displayName === normalizedQuery) add(2200, 'displayName', 'exact display name')
  if (displayName.includes(normalizedQuery)) add(760, 'displayName', 'display name phrase')
  if (normalizedQuery.includes(displayName) && displayName.length > 4) add(560, 'displayName', 'query contains full display name')
  if (model && includesPhrase(normalizedQuery, model)) add(queryBrand ? 1600 : 900, 'model', queryBrand ? 'brand plus model' : 'model phrase')
  if (batteryPlatform && includesPhrase(normalizedQuery, batteryPlatform)) add(queryBrand ? 640 : 240, 'batteryPlatform', 'battery platform phrase')
  if (queryBrand && toolPhraseMatch) add(1180, 'brand+tool', 'brand plus tool phrase')
  if (queryBrand && toolTokenMatch) add(900, 'brand+tool', 'brand plus tool token')
  if (queryBrand) add(380, 'brand', 'brand match')
  if (toolPhraseMatch) add(380, 'toolType', 'tool type or alias phrase')
  if (toolTokenMatch) add(220, 'toolType', 'tool type or alias token')
  if (toolIntentScore > 0 && queryBrand) add(280, 'brand+intent', 'brand plus tool intent')
  if (toolIntentScore > 0) add(toolIntentScore, 'toolIntent', 'tool intent')
  if (brand && includesPhrase(normalizedQuery, brand)) add(120, 'brand', 'canonical brand phrase')

  score += scoreTextField({
    query: parsedQuery,
    text: capabilityText,
    field: 'capabilities',
    phraseScore: 420,
    tokenScore: 70,
    matchedFields,
    reasons,
  })
  score += scoreTextField({
    query: parsedQuery,
    text: materialsText,
    field: 'materials',
    phraseScore: 220,
    tokenScore: 40,
    matchedFields,
    reasons,
  })
  score += scoreTextField({
    query: parsedQuery,
    text: projectText,
    field: 'commonProjects',
    phraseScore: 360,
    tokenScore: 60,
    matchedFields,
    reasons,
  })
  score += scoreTextField({
    query: parsedQuery,
    text: specsText,
    field: 'specs',
    phraseScore: 260,
    tokenScore: 44,
    matchedFields,
    reasons,
  })
  score += scoreTextField({
    query: parsedQuery,
    text: tagText,
    field: 'searchTags',
    phraseScore: 360,
    tokenScore: 55,
    matchedFields,
    reasons,
  })
  score += scoreTextField({
    query: parsedQuery,
    text: priorityText,
    field: 'priorityLabels',
    phraseScore: 100,
    tokenScore: 20,
    matchedFields,
    reasons,
  })

  const allQueryTokensCovered = queryTokens.length > 0 && queryTokens.every((token) => searchableText.includes(token))
  if (allQueryTokensCovered) add(300, 'tokenCoverage', 'all query tokens covered')
  const coverage = tokenCoverage(queryTokens, tokenSet(searchableText))
  if (coverage > 0 && coverage < 1) add(Math.round(coverage * 190), 'tokenCoverage', 'partial token coverage')
  if (normalizedQuery && includesPhrase(searchableText, normalizedQuery)) add(160, 'phrase', 'full phrase in searchable text')
  if (tokensAppearInOrder(queryTokens, searchableText)) add(90, 'tokenOrder', 'query tokens in order')

  const accessoryPenalty = scoreAccessoryAlignment(item, parsedQuery)
  if (accessoryPenalty !== 0) {
    score += accessoryPenalty
    matchedFields.add('accessoryIntent')
    reasons.push(accessoryPenalty > 0 ? `accessory intent aligned (+${accessoryPenalty})` : `accessory intent mismatch (${accessoryPenalty})`)
  }

  if (parsedQuery.knownBrandInQuery && !queryBrand) {
    score -= 900
    reasons.push('known brand mismatch (-900)')
  }

  return {
    score,
    matchedFields: [...matchedFields],
    reasons,
  }
}

function rankToolIntent(item: ToolCatalogLibraryItem, query: ParsedToolCatalogQuery) {
  const toolName = normalizeSearchText(item.toolType.name)
  const displayName = normalizeSearchText(item.displayName)
  const aliasTokens = tokenSet(item.aliases.map(normalizeSearchText).join(' '))
  const toolTokens = tokenSet(`${toolName} ${displayName}`)
  const itemLooksAccessory = toolTokens.some((token) => accessoryIntentTokens.includes(token))

  let score = 0
  for (const token of query.tokens) {
    if (!primaryToolIntentTokens.includes(token)) continue
    if (!toolTokens.includes(token) && !aliasTokens.includes(token)) continue

    score += 240
    if (toolName === token || toolName.endsWith(` ${token}`)) score += 220
    if (displayName.endsWith(` ${token}`)) score += 120
    if (token === 'drill' && (toolName === 'cordless drill' || toolName === 'corded drill')) score += 180
    if (token === 'drill' && toolName === 'cordless drill') score += 90
    if (token === 'saw' && toolName === 'circular saw') score += 140
  }

  if (query.tokens.includes('drill') && !query.tokens.some((token) => drillSpecialtyTokens.includes(token)) && drillSpecialtyTokens.some((token) => toolTokens.includes(token))) {
    score -= 120
  }
  if (query.tokens.includes('saw') && !query.tokens.some((token) => sawSpecialtyTokens.includes(token)) && sawSpecialtyTokens.some((token) => toolTokens.includes(token))) {
    score -= 80
  }
  if (score > 0 && itemLooksAccessory && !query.accessoryIntent) score -= 420
  return score
}

function scoreTextField({
  query,
  text,
  field,
  phraseScore,
  tokenScore,
  matchedFields,
  reasons,
}: {
  query: ParsedToolCatalogQuery
  text: string
  field: string
  phraseScore: number
  tokenScore: number
  matchedFields: Set<string>
  reasons: string[]
}) {
  if (!text) return 0
  let score = 0
  if (query.normalized && includesPhrase(text, query.normalized)) {
    score += phraseScore
    matchedFields.add(field)
    reasons.push(`${field} phrase (+${phraseScore})`)
  }
  const textTokens = tokenSet(text)
  const matchedTokens = query.tokens.filter((token) => textTokens.includes(token))
  if (matchedTokens.length > 0) {
    const tokenPoints = matchedTokens.length * tokenScore
    score += tokenPoints
    matchedFields.add(field)
    reasons.push(`${field} token match (+${tokenPoints})`)
  }
  return score
}

function scoreAccessoryAlignment(item: ToolCatalogLibraryItem, query: ParsedToolCatalogQuery) {
  const text = normalizeSearchText([
    item.displayName,
    item.toolType.name,
    item.aliases.join(' '),
    item.searchTags.join(' '),
    item.priorityLabels.join(' '),
  ].join(' '))
  const itemLooksAccessory = accessoryIntentTokens.some((token) => tokenSet(text).includes(token))
  if (itemLooksAccessory && query.accessoryIntent) return 420
  if (itemLooksAccessory && !query.accessoryIntent && query.toolIntentTokens.length > 0) return -560
  if (!itemLooksAccessory && query.accessoryIntent && query.toolIntentTokens.length === 0) return -80
  return 0
}

function sortToolCatalogSearchResults(results: ToolCatalogSearchResult[], emptyQuery = false) {
  return [...results].sort((a, b) => emptyQuery ? sortEmptyCatalogSearchResult(a, b) : sortToolCatalogSearchResult(a, b))
}

function sortToolCatalogSearchResult(a: ToolCatalogSearchResult, b: ToolCatalogSearchResult) {
  const scoreDelta = b.score - a.score
  if (Math.abs(scoreDelta) > 35) return scoreDelta
  const preferenceDelta = b.preferenceScore - a.preferenceScore
  if (preferenceDelta !== 0) return preferenceDelta
  const miniDelta = b.miniSearchScore - a.miniSearchScore
  if (miniDelta !== 0) return miniDelta
  return a.item.displayName.localeCompare(b.item.displayName)
}

function sortEmptyCatalogSearchResult(a: ToolCatalogSearchResult, b: ToolCatalogSearchResult) {
  const preferenceDelta = b.preferenceScore - a.preferenceScore
  if (preferenceDelta !== 0) return preferenceDelta
  return a.item.displayName.localeCompare(b.item.displayName)
}

function scorePreferenceTieBreak(item: ToolCatalogLibraryItem, preferences?: ToolBuyingPreferences) {
  if (!preferences) return 0
  const brand = normalizeSearchText(item.brand)
  const platform = normalizeSearchText(item.batteryPlatform)
  let score = 0
  if (preferences.preferredBrands.some((preferred) => brand.includes(normalizeSearchText(preferred)))) score += 14
  if (preferences.avoidedBrands.some((avoided) => brand.includes(normalizeSearchText(avoided)))) score -= 30
  if (platform && preferences.preferredBatteryPlatforms.some((preferred) => platform.includes(normalizeSearchText(preferred)))) score += 18
  if (preferences.preferCordless && item.powerType === 'Battery') score += 3
  if (!preferences.preferCordless && item.powerType === 'Corded') score += 3
  if (preferences.budgetTier === item.costTier) score += 4
  return score
}

function normalizeSearchText(value?: string) {
  if (!value) return ''
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/\b(\d+)\s*-\s*(\d+)\/(\d+)\b/g, '$1 $2/$3')
    .replace(/["']/g, ' inch ')
    .replace(/\bin\./g, ' inch ')
    .replace(/\bft\./g, ' foot ')
    .replace(/[^a-z0-9/.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenSet(value: string) {
  return [...new Set(value.split(' ').filter(Boolean))]
}

function includesPhrase(haystack: string, needle: string) {
  return Boolean(needle && ` ${haystack} `.includes(` ${needle} `))
}

function tokenCoverage(queryTokens: string[], textTokens: string[]) {
  if (queryTokens.length === 0) return 0
  const matches = queryTokens.filter((token) => textTokens.includes(token)).length
  return matches / queryTokens.length
}

function tokensAppearInOrder(queryTokens: string[], text: string) {
  if (queryTokens.length < 2) return false
  let cursor = -1
  for (const token of queryTokens) {
    const next = text.indexOf(token, cursor + 1)
    if (next === -1) return false
    cursor = next
  }
  return true
}

function catalogSearchFingerprint(items: ToolCatalogLibraryItem[]) {
  return items
    .map((item) => `${item.id}:${item.updatedAt}:${item.searchTags.length}:${item.sourceNoteIds.length}`)
    .join('|')
}

function brandSearchVariants(brand: string) {
  const normalized = normalizeSearchText(brand)
  const variants = new Set([normalized])
  if (normalized === 'dewalt') {
    variants.add('de walt')
    variants.add('de-walt')
    variants.add('dewal')
    variants.add('dewlt')
  }
  if (normalized === 'ridgid') variants.add('rigid')
  if (normalized === 'black decker' || normalized === 'black.decker') variants.add('black and decker')
  if (normalized === 'metabo hpt') variants.add('hitachi')
  if (normalized === 'ryobi') variants.add('one plus')
  if (normalized === 'milwaukee') variants.add('m18')
  if (normalized === 'makita') variants.add('lxt')
  return [...variants]
}

const knownBrandVariants = [
  'dewalt',
  'de walt',
  'dewal',
  'dewlt',
  'milwaukee',
  'm18',
  'makita',
  'lxt',
  'ridgid',
  'rigid',
  'ryobi',
  'bosch',
  'klein',
  'craftsman',
  'skil',
  'metabo',
  'festool',
  'stanley',
  'irwin',
  'diablo',
  'freud',
  'stabila',
  'fluke',
  'ego',
]

const primaryToolIntentTokens = [
  'auger',
  'compressor',
  'clamp',
  'cutter',
  'driver',
  'drill',
  'finder',
  'hammer',
  'jigsaw',
  'ladder',
  'level',
  'nailer',
  'plier',
  'pliers',
  'router',
  'sander',
  'scanner',
  'scraper',
  'saw',
  'snake',
  'stapler',
  'tester',
  'trimmer',
  'vac',
  'vacuum',
  'wrench',
]

const accessoryIntentTokens = [
  'accessory',
  'adapter',
  'adapters',
  'bag',
  'bags',
  'bit',
  'bits',
  'blade',
  'blades',
  'coupler',
  'disc',
  'discs',
  'filter',
  'filters',
  'fitting',
  'fittings',
  'hose',
  'kit',
  'nails',
  'nozzle',
  'paper',
  'sandpaper',
  'screws',
  'set',
  'staples',
  'tip',
  'wheel',
  'wheels',
]

const drillSpecialtyTokens = [
  'angle',
  'hammer',
  'masonry',
  'rotary',
  'sds',
]

const sawSpecialtyTokens = [
  'band',
  'jig',
  'jigsaw',
  'miter',
  'reciprocating',
  'scroll',
  'table',
  'tile',
  'track',
]

const platformIntentTokens = [
  '12v',
  '18v',
  '20v',
  '24v',
  '40v',
  '60v',
  'm12',
  'm18',
  'lxt',
  'max',
  'one',
  'plus',
]
