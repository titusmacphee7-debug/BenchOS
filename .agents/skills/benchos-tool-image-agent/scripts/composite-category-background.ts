import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

export const NEUTRAL_CATEGORY_COLOR = '#94a3b8'

export const TOOL_CATEGORY_COLORS: Record<string, string> = {
  automotive: '#f43f5e',
  chiseling: '#fb7185',
  clamping: '#34d399',
  consumables: '#94a3b8',
  cutting: '#ff6a00',
  drilling: '#38bdf8',
  dust_collection: '#67e8f9',
  electrical: '#fde047',
  fastening: '#f59e0b',
  finishing: '#f472b6',
  joinery: '#818cf8',
  layout: '#22d3ee',
  masonry: '#fb7185',
  masonry_tile_drywall: '#fb7185',
  measuring: '#60a5fa',
  outdoor_yard: '#84cc16',
  planing: '#2dd4bf',
  plumbing: '#06b6d4',
  routing: '#c084fc',
  safety: '#22c55e',
  sanding: '#a78bfa',
  sharpening: '#ef4444',
  shop_equipment: '#fb923c',
  workbench_holding: '#fbbf24',
}

export type CategoryColorResolution = {
  categoryId: string
  color: string
  found: boolean
}

export type CompositeOptions = {
  inputPath: string
  outputPath: string
  categoryName?: string
  categoryId?: string
  backgroundColor?: string
  inkColor?: string
  forceWhiteToAlpha?: boolean
}

export function slugifyCategoryId(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function resolveCategoryBackgroundColor(categoryNameOrId?: string): CategoryColorResolution {
  const categoryId = slugifyCategoryId(categoryNameOrId || '')
  const color = TOOL_CATEGORY_COLORS[categoryId]
  return {
    categoryId: categoryId || 'uncategorized',
    color: color ?? NEUTRAL_CATEGORY_COLOR,
    found: Boolean(color),
  }
}

export async function compositeCategoryBackground(options: CompositeOptions) {
  const backgroundColor =
    options.backgroundColor ??
    resolveCategoryBackgroundColor(options.categoryId || options.categoryName).color
  const inkColor = options.inkColor ?? '#111111'
  const input = sharp(options.inputPath)
  const metadata = await input.metadata()
  const width = metadata.width ?? 1024
  const height = metadata.height ?? 1024
  const shouldConvertWhiteToAlpha = options.forceWhiteToAlpha || !metadata.hasAlpha
  const lineArt = shouldConvertWhiteToAlpha
    ? await makeWhiteBackgroundLineArtOverlay(options.inputPath, width, height, inkColor)
    : await sharp(options.inputPath).png().toBuffer()

  await mkdir(path.dirname(options.outputPath), { recursive: true })

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: backgroundColor,
    },
  })
    .composite([{ input: lineArt, blend: 'over' }])
    .png()
    .toFile(options.outputPath)

  return {
    outputPath: options.outputPath,
    backgroundColor,
    width,
    height,
  }
}

async function makeWhiteBackgroundLineArtOverlay(inputPath: string, width: number, height: number, inkColor: string) {
  const alphaMask = await sharp(inputPath)
    .resize(width, height, { fit: 'fill' })
    .removeAlpha()
    .greyscale()
    .negate()
    .linear(1.25, -8)
    .png()
    .toBuffer()

  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: inkColor,
    },
  })
    .joinChannel(alphaMask)
    .png()
    .toBuffer()
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
Composite BenchOS tool line art onto a category-colored background.

Usage:
  tsx .agents/skills/benchos-tool-image-agent/scripts/composite-category-background.ts --input line-art.png --output final.png --category Cutting

Options:
  --input <path>       Source transparent or white-background line-art image.
  --output <path>      Final PNG path.
  --category <name>    BenchOS category name or id.
  --background <hex>   Override background color.
  --ink <hex>          Override line color. Defaults to #111111.
  --white-to-alpha     Force white-background cleanup even when alpha exists.
`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  const inputPath = String(args.input ?? '')
  const outputPath = String(args.output ?? '')
  if (!inputPath || !outputPath) {
    printHelp()
    process.exitCode = 1
    return
  }

  const result = await compositeCategoryBackground({
    inputPath,
    outputPath,
    categoryName: typeof args.category === 'string' ? args.category : undefined,
    backgroundColor: typeof args.background === 'string' ? args.background : undefined,
    inkColor: typeof args.ink === 'string' ? args.ink : undefined,
    forceWhiteToAlpha: Boolean(args['white-to-alpha']),
  })

  console.log(`Composited ${result.outputPath} on ${result.backgroundColor}`)
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
