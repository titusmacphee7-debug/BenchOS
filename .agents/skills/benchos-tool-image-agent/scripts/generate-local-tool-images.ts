import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import {
  DEFAULT_IMAGE_ROOT,
  DEFAULT_MANIFEST_PATH,
  buildToolImagePromptRecords,
  normalizePath,
  parsePositiveInteger,
  type ToolImageManifestRecord,
} from './generate-tool-image-prompts.ts'

const LOCAL_IMAGE_MODEL = 'local-svg-monoline-v2'

type LocalGenerateOptions = {
  dryRun: boolean
  tool?: string
  category?: string
  limit?: number
  manifestPath: string
  imageRoot: string
  skipExisting: boolean
}

function parseArgs(argv: string[]): LocalGenerateOptions {
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
    skipExisting: !args['no-skip-existing'],
  }
}

function printHelp() {
  console.log(`
Generate BenchOS tool images locally with deterministic SVG monoline glyphs.
This does not call OpenAI and does not require OPENAI_API_KEY.

Usage:
  npm run images:local -- --tool circular-saw
  npm run images:local -- --limit 10
  npm run images:local -- --no-skip-existing

Options:
  --dry-run             Print planned local images without writing files.
  --tool <id|name>      Generate one internal tool type.
  --category <name>     Limit to one category.
  --limit <number>      Limit generated records.
  --skip-existing       Default behavior; skip PNGs that already exist.
  --no-skip-existing    Regenerate even when PNG exists.
  --manifest <path>     Manifest JSON path.
  --image-root <path>   Final SVG/PNG output root.
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
    model: LOCAL_IMAGE_MODEL,
    imageRoot: options.imageRoot,
  })
  const existingManifest = await readManifestRecords(options.manifestPath)
  const existingById = new Map(existingManifest.map((record) => [record.id, record]))
  const plannedRecords: ToolImageManifestRecord[] = plan.records.map((record) => ({
    ...(existingById.get(record.id) ?? record),
    ...record,
    model: LOCAL_IMAGE_MODEL,
    svgPath: `${options.imageRoot}/${record.categoryId}/${record.internalToolTypeId}.svg`,
    pngPath: `${options.imageRoot}/${record.categoryId}/${record.internalToolTypeId}.png`,
    status: 'planned' as const,
    generatedAt: null,
    error: undefined,
  }))
  const recordsToGenerate = options.skipExisting
    ? plannedRecords.filter((record) => !existsSync(path.resolve(record.pngPath)))
    : plannedRecords

  if (options.dryRun) {
    console.log(JSON.stringify({
      dryRun: true,
      model: LOCAL_IMAGE_MODEL,
      planned: plannedRecords.length,
      toGenerate: recordsToGenerate.length,
      skipExisting: options.skipExisting,
      warnings: plan.warnings,
      records: recordsToGenerate,
    }, null, 2))
    return
  }

  const generatedRecords: ToolImageManifestRecord[] = []
  for (const record of recordsToGenerate) {
    generatedRecords.push(await generateLocalToolImage(record))
  }

  const generatedById = new Map(generatedRecords.map((record) => [record.id, record]))
  const mergedRecords: ToolImageManifestRecord[] = plannedRecords.map((record) => generatedById.get(record.id) ?? {
    ...record,
    status: existsSync(path.resolve(record.pngPath)) ? 'skipped_existing' as const : record.status,
  })

  await writeManifestRecords(options.manifestPath, mergedRecords, plan.warnings)
  console.log(`Generated ${generatedRecords.length} local tool images. Updated ${options.manifestPath}.`)
}

async function generateLocalToolImage(record: ToolImageManifestRecord): Promise<ToolImageManifestRecord> {
  const svgPath = record.svgPath ?? record.pngPath.replace(/\.png$/i, '.svg')
  const svg = buildLocalToolSvg(record)
  await mkdir(path.dirname(svgPath), { recursive: true })
  await writeFile(svgPath, `${svg}\n`, 'utf8')
  await sharp(Buffer.from(svg)).png().toFile(record.pngPath)

  return {
    ...record,
    model: LOCAL_IMAGE_MODEL,
    svgPath,
    status: 'generated',
    generatedAt: new Date().toISOString(),
    error: undefined,
  }
}

function buildLocalToolSvg(record: ToolImageManifestRecord) {
  const kind = resolveToolKind(record)
  const glyph = glyphForKind(kind)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" role="img" aria-label="${escapeSvg(record.normalizedToolName)}">
  <rect width="1024" height="1024" fill="${record.backgroundColor}"/>
  <g fill="none" stroke="#111111" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision">
    ${glyph}
  </g>
</svg>`
}

type ToolKind =
  | 'automotive'
  | 'blade'
  | 'brush'
  | 'clamp'
  | 'drill'
  | 'electrical'
  | 'generic'
  | 'ladder'
  | 'measure'
  | 'outdoor'
  | 'plane'
  | 'plumbing'
  | 'router'
  | 'safety'
  | 'sander'
  | 'saw'
  | 'vacuum'
  | 'wrench'

function resolveToolKind(record: ToolImageManifestRecord): ToolKind {
  const text = `${record.internalToolTypeId} ${record.displayName} ${record.normalizedToolName} ${record.categoryName}`.toLowerCase()
  if (hasAny(text, ['blade', 'bit set', 'hole saw'])) return 'blade'
  if (hasAny(text, ['saw', 'jigsaw', 'cutter'])) return 'saw'
  if (hasAny(text, ['drill', 'driver', 'boring', 'auger'])) return 'drill'
  if (hasAny(text, ['sander', 'sanding', 'sandpaper'])) return 'sander'
  if (hasAny(text, ['clamp', 'vise', 'holdfast'])) return 'clamp'
  if (hasAny(text, ['measure', 'level', 'square', 'caliper', 'gauge', 'chalk line', 'stud finder', 'layout'])) return 'measure'
  if (hasAny(text, ['router', 'joiner', 'jig', 'dowel'])) return 'router'
  if (hasAny(text, ['plane', 'planer', 'scraper', 'spokeshave'])) return 'plane'
  if (hasAny(text, ['brush', 'roller', 'sprayer', 'paint', 'caulk', 'finish', 'applicator'])) return 'brush'
  if (hasAny(text, ['glasses', 'respirator', 'mask', 'hearing', 'helmet', 'first aid', 'safety', 'gloves', 'shield'])) return 'safety'
  if (hasAny(text, ['vac', 'dust', 'filter', 'hose', 'collector'])) return 'vacuum'
  if (hasAny(text, ['ladder', 'dolly', 'cart', 'handling'])) return 'ladder'
  if (hasAny(text, ['pipe', 'plumbing', 'plunger', 'drain', 'basin', 'tubing'])) return 'plumbing'
  if (hasAny(text, ['wire', 'voltage', 'multimeter', 'electrical', 'outlet', 'crimp'])) return 'electrical'
  if (hasAny(text, ['jack', 'automotive', 'oil', 'tire', 'obd', 'battery charger'])) return 'automotive'
  if (hasAny(text, ['wrench', 'socket', 'ratchet', 'torque'])) return 'wrench'
  if (hasAny(text, ['shovel', 'rake', 'garden', 'yard', 'trimmer', 'blower', 'pruning'])) return 'outdoor'
  return 'generic'
}

function glyphForKind(kind: ToolKind) {
  if (kind === 'automotive') return automotiveGlyph()
  if (kind === 'blade') return bladeGlyph()
  if (kind === 'brush') return brushGlyph()
  if (kind === 'clamp') return clampGlyph()
  if (kind === 'drill') return drillGlyph()
  if (kind === 'electrical') return electricalGlyph()
  if (kind === 'ladder') return ladderGlyph()
  if (kind === 'measure') return measureGlyph()
  if (kind === 'outdoor') return outdoorGlyph()
  if (kind === 'plane') return planeGlyph()
  if (kind === 'plumbing') return plumbingGlyph()
  if (kind === 'router') return routerGlyph()
  if (kind === 'safety') return safetyGlyph()
  if (kind === 'sander') return sanderGlyph()
  if (kind === 'saw') return sawGlyph()
  if (kind === 'vacuum') return vacuumGlyph()
  if (kind === 'wrench') return wrenchGlyph()
  return genericGlyph()
}

function sawGlyph() {
  return `
    <path d="M176 654h552l92 94H250z"/>
    <path d="M216 620h552" stroke-width="22"/>
    <circle cx="430" cy="526" r="166"/>
    <circle cx="430" cy="526" r="74" stroke-width="22"/>
    <circle cx="430" cy="526" r="24" stroke-width="18"/>
    <path d="M430 360l32 74 80-30-30 80 82 26-78 38 58 66-86-12 4 90-62-62-62 64 6-92-88 18 54-74-82-34 86-28-34-82 80 34z" stroke-width="14"/>
    <path d="M306 410c66-94 190-128 292-78 70 34 116 98 130 174" stroke-width="26"/>
    <path d="M618 346h116c54 0 102 30 126 78l34 66H720" stroke-width="28"/>
    <path d="M686 420c36 10 66 38 80 76" stroke-width="18"/>
    <path d="M622 320c14-72 70-122 140-122h44c42 0 76 34 76 76v26H746c-34 0-62 22-72 54" stroke-width="28"/>
    <path d="M304 358c72-82 212-108 338-48" stroke-width="18"/>
    <path d="M248 654l-38 70M686 654l54 70" stroke-width="18"/>
    <path d="M768 490h118" stroke-width="22"/>
    <path d="M840 490l54 42" stroke-width="18"/>
  `
}

function drillGlyph() {
  return `
    <path d="M208 348h336c80 0 144 54 164 130l12 46H248c-90 0-156-58-156-124 0-52 42-82 116-52z"/>
    <path d="M708 420h100l68 42-68 42H708z"/>
    <path d="M876 462h72"/>
    <path d="M346 524l88 232H302l-72-232z"/>
    <path d="M282 756h210c28 0 50 22 50 50v18H238v-20c0-26 20-48 44-48z"/>
    <circle cx="286" cy="436" r="42" stroke-width="24"/>
    <path d="M332 346c84-34 174-32 270 6" stroke-width="20"/>
    <path d="M438 412h116M406 478h168" stroke-width="22"/>
  `
}

function sanderGlyph() {
  return `
    <path d="M180 438h462c88 0 164 58 186 142l36 138H144l42-188c10-48 48-80-6-92z"/>
    <path d="M288 438v-54c0-72 58-130 130-130h90c70 0 128 58 128 130v54"/>
    <path d="M158 718h724"/>
    <path d="M260 792h484" stroke-width="24"/>
    <path d="M292 534c124-46 290-44 446 8" stroke-width="20"/>
    <path d="M304 616c144-30 306-28 486 10" stroke-width="18"/>
  `
}

function clampGlyph() {
  return `
    <path d="M674 206H318c-96 0-174 78-174 174v184c0 96 78 174 174 174h350"/>
    <path d="M672 206h118v532H672z"/>
    <path d="M790 326h126M790 622h126"/>
    <path d="M914 286v122M914 582v122"/>
    <path d="M820 408l118-118M820 582l118 118" stroke-width="24"/>
    <path d="M286 382h300M286 560h300" stroke-width="20"/>
  `
}

function measureGlyph() {
  return `
    <path d="M146 526h720l52 132H200z"/>
    <path d="M216 526v70M292 526v42M368 526v70M444 526v42M520 526v70M596 526v42M672 526v70M748 526v42M824 526v70" stroke-width="18"/>
    <circle cx="512" cy="592" r="46" stroke-width="24"/>
    <path d="M236 352c132-74 320-84 488 8" stroke-width="26"/>
    <path d="M306 430c126-44 284-44 414 4" stroke-width="20"/>
  `
}

function routerGlyph() {
  return `
    <path d="M262 342h500l72 330H190z"/>
    <path d="M354 342v-78h316v78"/>
    <path d="M408 264c46-60 164-60 208 0" stroke-width="26"/>
    <path d="M512 672v146M448 818h128"/>
    <path d="M190 436h-86M834 436h86"/>
    <circle cx="512" cy="502" r="76" stroke-width="24"/>
    <path d="M350 592h324M376 426h272" stroke-width="20"/>
  `
}

function planeGlyph() {
  return `
    <path d="M158 560h708l-86 140H238z"/>
    <path d="M382 560l80-214h168l72 214"/>
    <path d="M430 382c78-60 190-38 242 42" stroke-width="26"/>
    <path d="M254 518c66-84 166-124 300-116" stroke-width="24"/>
    <path d="M250 700c160 52 340 52 520 0" stroke-width="22"/>
  `
}

function brushGlyph() {
  return `
    <path d="M512 156l218 218-130 130-218-218z"/>
    <path d="M382 286L228 440c-52 52-52 136 0 188l18 18c52 52 138 50 188-2l154-154"/>
    <path d="M242 650c-86 90-122 172-84 210 42 42 132-2 214-84"/>
    <path d="M552 224L438 338M622 294L508 408M690 362L576 476" stroke-width="20"/>
  `
}

function safetyGlyph() {
  return `
    <path d="M160 406c70-68 190-88 292-44 36 16 64 42 80 76 16-34 46-60 84-76 106-42 222-18 286 54l-46 168c-24 88-116 138-204 112l-118-34c-36-10-64-36-78-70-14 34-42 60-78 70l-120 32c-86 22-174-28-196-114z"/>
    <path d="M244 458c76-20 156 2 202 56M620 514c48-54 136-74 212-40" stroke-width="22"/>
    <path d="M392 660c80 54 204 58 290 8" stroke-width="24"/>
    <path d="M214 348c88-82 218-124 360-116 118 6 226 54 300 138" stroke-width="24"/>
  `
}

function vacuumGlyph() {
  return `
    <path d="M218 386h438c88 0 160 72 160 160v132H156V466c0-44 36-80 62-80z"/>
    <path d="M338 386v-72c0-66 52-118 118-118h130c64 0 116 52 116 116v74"/>
    <path d="M816 486c126-4 188 54 170 146-12 66-78 96-164 66" stroke-width="24"/>
    <circle cx="308" cy="718" r="52" stroke-width="24"/>
    <circle cx="652" cy="718" r="52" stroke-width="24"/>
    <path d="M288 502h300M288 586h404" stroke-width="20"/>
  `
}

function ladderGlyph() {
  return `
    <path d="M392 150L230 844M632 150l162 694"/>
    <path d="M370 266h286M344 382h340M318 498h394M292 614h448M266 730h502" stroke-width="24"/>
    <path d="M392 150c72 56 168 56 240 0" stroke-width="26"/>
    <path d="M220 844h584"/>
  `
}

function plumbingGlyph() {
  return `
    <path d="M294 348c0-92 74-166 166-166h92v188h-92c-22 0-40 18-40 40v166c0 92-74 166-166 166h-88V554h88c22 0 40-18 40-40z"/>
    <path d="M576 278h330M576 370h238"/>
    <path d="M98 554h176M98 742h176"/>
    <path d="M790 370l104 70-104 70z" stroke-width="24"/>
    <path d="M654 270v108M724 270v108" stroke-width="18"/>
  `
}

function electricalGlyph() {
  return `
    <rect x="340" y="160" width="344" height="520" rx="58"/>
    <path d="M414 250h196v136H414z" stroke-width="24"/>
    <circle cx="456" cy="518" r="42" stroke-width="24"/>
    <circle cx="584" cy="518" r="42" stroke-width="24"/>
    <path d="M456 518L232 812M584 518l236 288" stroke-width="24"/>
    <path d="M394 444h236M394 604h236" stroke-width="20"/>
  `
}

function automotiveGlyph() {
  return `
    <path d="M332 188c78-76 198-78 280-10L468 322l112 112 144-144c62 86 52 210-26 288-86 86-218 94-316 30L214 776l-92-92 170-168c-64-98-48-238 40-328z"/>
    <path d="M664 604h168c58 0 104 46 104 104v18H664z" stroke-width="24"/>
    <circle cx="724" cy="758" r="52" stroke-width="24"/>
    <circle cx="866" cy="758" r="52" stroke-width="24"/>
    <path d="M704 666h156" stroke-width="20"/>
  `
}

function wrenchGlyph() {
  return `
    <path d="M224 246c82-82 212-92 306-28L390 358l104 104 142-142c64 96 52 224-30 306-88 88-226 98-326 28L124 810 58 744l156-156c-72-100-62-244 10-342z"/>
    <path d="M622 604l246 246"/>
    <path d="M800 784l74-74M736 720l74-74" stroke-width="22"/>
  `
}

function bladeGlyph() {
  return `
    <circle cx="512" cy="512" r="278"/>
    <circle cx="512" cy="512" r="112" stroke-width="24"/>
    <circle cx="512" cy="512" r="34" stroke-width="24"/>
    <path d="M512 234l44 98 102-44-34 106 112 26-102 60 78 86-114-8 8 116-88-76-76 92 6-118-112 28 68-102-108-46 114-30-42-110z" stroke-width="18"/>
    <path d="M512 276v472M276 512h472M346 346l332 332M678 346L346 678" stroke-width="16"/>
  `
}

function outdoorGlyph() {
  return `
    <path d="M512 156v632"/>
    <path d="M512 278c138 14 250 106 292 234-140 22-260-66-292-234z"/>
    <path d="M512 278c-138 14-250 106-292 234 140 22 260-66 292-234z"/>
    <path d="M512 788l-118 92M512 788l118 92M512 788v114" stroke-width="24"/>
    <path d="M370 428c84-2 138-54 142-150M654 428c-84-2-138-54-142-150" stroke-width="18"/>
  `
}

function genericGlyph() {
  return `
    <path d="M220 566h512l126 150H346z"/>
    <path d="M316 356h406c70 0 128 58 128 128v42H316z"/>
    <path d="M660 526l76 190H608l-50-190z" stroke-width="24"/>
    <circle cx="438" cy="452" r="62" stroke-width="24"/>
    <path d="M386 370c110-58 238-56 360 6" stroke-width="22"/>
    <path d="M326 642h420" stroke-width="20"/>
  `
}

function hasAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle))
}

function escapeSvg(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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
