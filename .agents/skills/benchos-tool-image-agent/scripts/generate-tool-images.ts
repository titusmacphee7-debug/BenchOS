import 'dotenv/config'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import OpenAI from 'openai'
import pLimit from 'p-limit'
import { compositeCategoryBackground } from './composite-category-background.ts'
import {
  DEFAULT_IMAGE_ROOT,
  DEFAULT_MANIFEST_PATH,
  DEFAULT_MODEL,
  buildToolImagePromptRecords,
  normalizePath,
  parsePositiveInteger,
  type ToolImageManifestRecord,
} from './generate-tool-image-prompts.ts'

type GenerateOptions = {
  dryRun: boolean
  tool?: string
  category?: string
  limit?: number
  manifestPath: string
  imageRoot: string
  lineArtRoot: string
  model: string
  concurrency: number
  skipExisting: boolean
  composite: boolean
  size: '1024x1024' | '1536x1024' | '1024x1536' | 'auto'
  quality: 'low' | 'medium' | 'high' | 'auto'
}

function parseArgs(argv: string[]): GenerateOptions {
  const args: Record<string, string | boolean> = {}
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg.startsWith('--')) continue
    const key = arg.slice(2)
    const next = argv[index + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
    } else {
      args[key] = next
      index += 1
    }
  }

  return {
    dryRun: Boolean(args['dry-run']),
    tool: typeof args.tool === 'string' ? args.tool : undefined,
    category: typeof args.category === 'string' ? args.category : undefined,
    limit: parsePositiveInteger(typeof args.limit === 'string' ? args.limit : undefined),
    manifestPath: String(args.manifest || DEFAULT_MANIFEST_PATH),
    imageRoot: normalizePath(String(args['image-root'] || DEFAULT_IMAGE_ROOT)),
    lineArtRoot: normalizePath(String(args['line-art-root'] || `${DEFAULT_IMAGE_ROOT}/_line-art`)),
    model: String(args.model || process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL),
    concurrency: parsePositiveInteger(String(args.concurrency || process.env.IMAGE_GENERATION_CONCURRENCY || '2')) ?? 2,
    skipExisting: !args['no-skip-existing'],
    composite: !args['no-composite'],
    size: parseImageSize(String(args.size || '1024x1024')),
    quality: parseQuality(String(args.quality || 'low')),
  }
}

function parseImageSize(value: string): GenerateOptions['size'] {
  if (['1024x1024', '1536x1024', '1024x1536', 'auto'].includes(value)) return value as GenerateOptions['size']
  throw new Error(`Unsupported image size "${value}".`)
}

function parseQuality(value: string): GenerateOptions['quality'] {
  if (['low', 'medium', 'high', 'auto'].includes(value)) return value as GenerateOptions['quality']
  throw new Error(`Unsupported image quality "${value}".`)
}

function printHelp() {
  console.log(`
Generate BenchOS tool images. This calls the OpenAI Images API only when --dry-run is not set.

Usage:
  npm run images:plan
  npm run images:generate -- --tool circular-saw --limit 1 --skip-existing

Options:
  --dry-run                  Print the plan without calling the API.
  --tool <id|name>           Generate one internal tool type.
  --category <name>          Limit generation to a category.
  --limit <number>           Limit generated records.
  --skip-existing            Default behavior; skip PNGs that already exist.
  --no-skip-existing         Regenerate even when PNG exists.
  --manifest <path>          Manifest JSON path.
  --image-root <path>        Final PNG output root.
  --line-art-root <path>     Temporary transparent/white line-art output root.
  --model <model>            Image model. Defaults to OPENAI_IMAGE_MODEL.
  --concurrency <number>     Defaults to IMAGE_GENERATION_CONCURRENCY or 2.
  --no-composite             Save line art only and do not create final category PNGs.
  --size <size>              1024x1024, 1536x1024, 1024x1536, or auto.
  --quality <quality>        low, medium, high, or auto.
`)
}

async function main() {
  if (process.argv.includes('--help')) {
    printHelp()
    return
  }

  const options = parseArgs(process.argv.slice(2))
  const plan = buildToolImagePromptRecords({
    tool: options.tool,
    category: options.category,
    limit: options.limit,
    model: options.model,
    imageRoot: options.imageRoot,
  })

  const existingManifest = await readManifestRecords(options.manifestPath)
  const existingById = new Map(existingManifest.map((record) => [record.id, record]))
  const plannedRecords = plan.records.map((record) => existingById.get(record.id) ?? record)
  const recordsToGenerate = options.skipExisting
    ? plannedRecords.filter((record) => !existsSync(path.resolve(record.pngPath)))
    : plannedRecords

  if (options.dryRun) {
    console.log(JSON.stringify({
      dryRun: true,
      model: options.model,
      concurrency: options.concurrency,
      planned: plannedRecords.length,
      toGenerate: recordsToGenerate.length,
      skipExisting: options.skipExisting,
      warnings: plan.warnings,
      records: recordsToGenerate,
    }, null, 2))
    return
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for image generation. Use --dry-run to plan without generating.')
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const limit = pLimit(options.concurrency)
  const generatedRecords = new Map<string, ToolImageManifestRecord>()

  await Promise.all(recordsToGenerate.map((record) => limit(async () => {
    const generated = await generateOneToolImage(client, record, options)
    generatedRecords.set(generated.id, generated)
  })))

  const mergedRecords = plannedRecords.map((record) => {
    const generated = generatedRecords.get(record.id)
    if (generated) return generated
    if (options.skipExisting && existsSync(path.resolve(record.pngPath))) {
      return { ...record, status: 'skipped_existing' as const }
    }
    return record
  })

  await writeManifestRecords(options.manifestPath, mergedRecords, plan.warnings)
  console.log(`Updated ${options.manifestPath} with ${mergedRecords.length} records.`)
}

async function generateOneToolImage(client: OpenAI, record: ToolImageManifestRecord, options: GenerateOptions): Promise<ToolImageManifestRecord> {
  const lineArtPath = `${options.lineArtRoot}/${record.categoryId}/${record.internalToolTypeId}.png`
  try {
    await mkdir(path.dirname(lineArtPath), { recursive: true })
    const response = await client.images.generate({
      model: options.model,
      prompt: record.prompt,
      n: 1,
      size: options.size,
      quality: options.quality,
      background: 'transparent',
      output_format: 'png',
    })
    const imageData = response.data?.[0]?.b64_json
    if (!imageData) throw new Error('OpenAI image response did not include b64_json.')

    await writeFile(lineArtPath, Buffer.from(imageData, 'base64'))

    if (options.composite) {
      await compositeCategoryBackground({
        inputPath: lineArtPath,
        outputPath: record.pngPath,
        categoryName: record.categoryName,
        backgroundColor: record.backgroundColor,
      })
    }

    return {
      ...record,
      model: options.model,
      pngPath: options.composite ? record.pngPath : lineArtPath,
      status: 'generated',
      generatedAt: new Date().toISOString(),
      error: undefined,
    }
  } catch (error) {
    return {
      ...record,
      model: options.model,
      status: 'error',
      generatedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function readManifestRecords(manifestPath: string): Promise<ToolImageManifestRecord[]> {
  try {
    const raw = await readFile(manifestPath, 'utf8')
    const parsed = JSON.parse(raw) as { records?: ToolImageManifestRecord[] } | ToolImageManifestRecord[]
    return Array.isArray(parsed) ? parsed : parsed.records ?? []
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

async function writeManifestRecords(manifestPath: string, records: ToolImageManifestRecord[], warnings: string[]) {
  await mkdir(path.dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, `${JSON.stringify({
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    records,
    warnings,
  }, null, 2)}\n`, 'utf8')
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
