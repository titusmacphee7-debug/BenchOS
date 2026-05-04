import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ToolCatalogItem, ToolType } from '../../../../src/data/schema.ts'
import { buildStarterToolLibrary } from '../../../../src/data/seed/starterToolLibrary.ts'
import {
  resolveCategoryBackgroundColor,
  slugifyCategoryId,
} from './composite-category-background.ts'

export const DEFAULT_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1-mini'
export const DEFAULT_PROMPT_PLAN_PATH = '.agents/skills/benchos-tool-image-agent/assets/tool-image-prompt-plan.json'
export const DEFAULT_MANIFEST_PATH = 'public/generated/tool-images/manifest.json'
export const DEFAULT_IMAGE_ROOT = 'public/generated/tool-images'

export const TOOL_IMAGE_PROMPT_TEMPLATE =
  'Create an original black-and-white monoline technical illustration of a [TOOL NAME] for a workshop inventory app. Clean hand-drawn tool icon style, bold simple outline, minimal interior contour lines, centered object, 1:1 square composition, transparent or white background for compositing. No text, no labels, no watermark, no signature, no brand logos, no brand marks, no color on the tool, no photorealism, no people, no background scene.'

export type ToolImageManifestRecord = {
  id: string
  catalogItemId?: string
  internalToolTypeId: string
  categoryId: string
  categoryName: string
  categoryColor: string
  backgroundColor: string
  displayName: string
  normalizedToolName: string
  prompt: string
  model: string
  pngPath: string
  svgPath?: string
  status: 'planned' | 'generated' | 'error' | 'skipped_existing'
  generatedAt: string | null
  error?: string
}

export type PromptBuildOptions = {
  tool?: string
  category?: string
  limit?: number
  model?: string
  imageRoot?: string
  includeCatalogItemId?: boolean
}

export type PromptBuildResult = {
  records: ToolImageManifestRecord[]
  warnings: string[]
}

export function buildToolImagePromptRecords(options: PromptBuildOptions = {}): PromptBuildResult {
  const library = buildStarterToolLibrary()
  const catalogItemsByTypeId = groupCatalogItemsByToolType(library.toolCatalogItems)
  const warnings: string[] = []
  const toolFilter = options.tool ? normalizeFilter(options.tool) : undefined
  const categoryFilter = options.category ? normalizeFilter(options.category) : undefined

  let toolTypes = library.toolTypes.filter((toolType) => {
    const matchesTool =
      !toolFilter ||
      normalizeFilter(toolType.id) === toolFilter ||
      normalizeFilter(toolType.name) === toolFilter
    const matchesCategory =
      !categoryFilter ||
      normalizeFilter(toolType.category) === categoryFilter ||
      slugifyCategoryId(toolType.category) === categoryFilter
    return matchesTool && matchesCategory
  })

  toolTypes = dedupeBy(toolTypes, (toolType) => toolType.id).sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category)
    return categoryCompare === 0 ? a.name.localeCompare(b.name) : categoryCompare
  })

  if (typeof options.limit === 'number') {
    toolTypes = toolTypes.slice(0, options.limit)
  }

  const imageRoot = normalizePath(options.imageRoot || DEFAULT_IMAGE_ROOT)
  const records = toolTypes.map((toolType) => {
    const representativeCatalogItem = catalogItemsByTypeId.get(toolType.id)?.[0]
    const colorResolution = resolveCategoryBackgroundColor(toolType.category)
    if (!colorResolution.found) {
      warnings.push(`Missing category color for "${toolType.category}" (${toolType.id}); using neutral fallback.`)
    }

    const normalizedToolName = normalizeToolImageName(toolType, representativeCatalogItem)
    const categoryId = colorResolution.categoryId
    const pngPath = `${imageRoot}/${categoryId}/${toolType.id}.png`

    const record: ToolImageManifestRecord = {
      id: `generated-tool-image-${toolType.id}`,
      internalToolTypeId: toolType.id,
      categoryId,
      categoryName: toolType.category || 'Uncategorized',
      categoryColor: colorResolution.color,
      backgroundColor: colorResolution.color,
      displayName: toolType.name,
      normalizedToolName,
      prompt: buildToolImagePrompt(normalizedToolName),
      model: options.model || DEFAULT_MODEL,
      pngPath,
      status: 'planned',
      generatedAt: null,
    }

    if (options.includeCatalogItemId && representativeCatalogItem) {
      record.catalogItemId = representativeCatalogItem.id
    }

    return record
  })

  return { records, warnings }
}

export function buildToolImagePrompt(toolName: string) {
  return TOOL_IMAGE_PROMPT_TEMPLATE.replace('[TOOL NAME]', toolName)
}

export function normalizeToolImageName(toolType: Pick<ToolType, 'name' | 'powerType'>, catalogItem?: Pick<ToolCatalogItem, 'displayName' | 'brand' | 'model'>) {
  const sourceName = toolType.name || catalogItem?.displayName || ''
  const withoutBrand = stripBrandAndModel(sourceName, catalogItem)
  return withoutBrand.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function normalizePath(value: string) {
  return value.replace(/\\/g, '/').replace(/\/+$/g, '')
}

export function parsePositiveInteger(value: string | undefined) {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`Expected a positive integer, received "${value}".`)
  }
  return parsed
}

function stripBrandAndModel(name: string, catalogItem?: Pick<ToolCatalogItem, 'brand' | 'model'>) {
  let normalized = name
  const removals = [
    catalogItem?.brand,
    catalogItem?.model,
    '20v max',
    'm18',
    'm12',
    '18v',
    '12v',
    '40v',
    '56v',
    'one+',
    'lxt',
    'v20',
    'xr',
    'fuel',
    'brushless',
  ].filter(Boolean) as string[]

  for (const removal of removals) {
    normalized = normalized.replace(new RegExp(escapeRegExp(removal), 'ig'), ' ')
  }

  return normalized
    .replace(/\b(dewalt|milwaukee|makita|bosch|ridgid|ryobi|craftsman|festool|klein|stanley|generic)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function groupCatalogItemsByToolType(catalogItems: ToolCatalogItem[]) {
  const grouped = new Map<string, ToolCatalogItem[]>()
  for (const item of catalogItems) {
    const existing = grouped.get(item.internalToolTypeId) ?? []
    existing.push(item)
    grouped.set(item.internalToolTypeId, existing)
  }
  return grouped
}

function normalizeFilter(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function dedupeBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = getKey(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function parseArgs(argv: string[]) {
  const options: Record<string, string | boolean> = {}
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg.startsWith('--')) continue
    const key = arg.slice(2)
    const next = argv[index + 1]
    if (!next || next.startsWith('--')) {
      options[key] = true
    } else {
      options[key] = next
      index += 1
    }
  }
  return options
}

function printHelp() {
  console.log(`
Generate BenchOS tool-image prompt records without calling the image API.

Usage:
  npm run images:prompts -- --dry-run --limit 10
  npm run images:prompts -- --tool circular-saw --output .agents/skills/benchos-tool-image-agent/assets/tool-image-prompt-plan.json

Options:
  --dry-run             Print the prompt plan instead of writing a file.
  --tool <id|name>      Limit to one internal tool type.
  --category <name>     Limit to one category.
  --limit <number>      Limit the number of prompt records.
  --output <path>       Output prompt-plan JSON path.
  --manifest <path>     Alias for --output when writing a manifest-shaped plan.
  --model <model>       Override OPENAI_IMAGE_MODEL for prompt records.
  --image-root <path>   Root folder for future generated PNG paths.
`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  const outputPath = String(args.output || args.manifest || DEFAULT_PROMPT_PLAN_PATH)
  const result = buildToolImagePromptRecords({
    tool: typeof args.tool === 'string' ? args.tool : undefined,
    category: typeof args.category === 'string' ? args.category : undefined,
    limit: parsePositiveInteger(typeof args.limit === 'string' ? args.limit : undefined),
    model: typeof args.model === 'string' ? args.model : undefined,
    imageRoot: typeof args['image-root'] === 'string' ? args['image-root'] : undefined,
  })

  const payload = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    records: result.records,
    warnings: result.warnings,
  }

  if (args['dry-run']) {
    console.log(JSON.stringify(payload, null, 2))
    return
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${result.records.length} prompt records to ${outputPath}`)
  for (const warning of result.warnings) console.warn(warning)
}

function isMainModule() {
  return process.argv[1] ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false
}

if (isMainModule()) {
  main().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
