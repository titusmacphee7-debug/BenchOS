import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import {
  DEFAULT_MANIFEST_PATH,
  buildToolImagePromptRecords,
  parsePositiveInteger,
} from './generate-tool-image-prompts.ts'
import { resolveCategoryBackgroundColor } from './composite-category-background.ts'

const manifestRecordSchema = z.object({
  id: z.string().min(1),
  catalogItemId: z.string().optional(),
  internalToolTypeId: z.string().min(1),
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  categoryColor: z.string().min(1),
  backgroundColor: z.string().min(1),
  displayName: z.string().min(1),
  normalizedToolName: z.string().min(1),
  prompt: z.string().min(1),
  model: z.string().min(1),
  pngPath: z.string().min(1),
  svgPath: z.string().optional(),
  status: z.string().min(1),
  generatedAt: z.string().nullable().optional(),
  error: z.string().optional(),
})

type ValidationIssue = {
  level: 'error' | 'warning'
  code: string
  message: string
  recordId?: string
}

function parseArgs(argv: string[]) {
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
    manifestPath: String(args.manifest || DEFAULT_MANIFEST_PATH),
    tool: typeof args.tool === 'string' ? args.tool : undefined,
    category: typeof args.category === 'string' ? args.category : undefined,
    limit: parsePositiveInteger(typeof args.limit === 'string' ? args.limit : undefined),
    manifestOnly: Boolean(args['manifest-only']),
    allowMissingFiles: Boolean(args['allow-missing-files']),
    json: Boolean(args.json),
    help: Boolean(args.help),
  }
}

function printHelp() {
  console.log(`
Validate BenchOS generated tool-image manifest records.

Usage:
  npm run images:validate
  npm run images:validate -- --tool circular-saw

Options:
  --manifest <path>        Manifest JSON path.
  --tool <id|name>         Validate expected record for one internal tool type.
  --category <name>        Validate expected records for one category.
  --limit <number>         Limit expected records.
  --manifest-only          Do not compare against the current BenchOS tool type list.
  --allow-missing-files    Do not fail when generated PNG files are missing.
  --json                   Print machine-readable validation output.
`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  const issues: ValidationIssue[] = []
  const records = await readManifest(args.manifestPath, issues)
  const validRecords: z.infer<typeof manifestRecordSchema>[] = []

  records.forEach((record, index) => {
    const parsed = manifestRecordSchema.safeParse(record)
    if (!parsed.success) {
      issues.push({
        level: 'error',
        code: 'invalid_manifest_record',
        message: `Manifest record at index ${index} is invalid: ${parsed.error.issues.map((issue) => issue.message).join('; ')}`,
      })
      return
    }

    validRecords.push(parsed.data)
    validateRecord(parsed.data, issues, args.allowMissingFiles)
  })

  if (!args.manifestOnly) {
    const expected = buildToolImagePromptRecords({
      tool: args.tool,
      category: args.category,
      limit: args.limit,
    }).records
    const recordIds = new Set(validRecords.map((record) => record.internalToolTypeId))
    for (const expectedRecord of expected) {
      if (!recordIds.has(expectedRecord.internalToolTypeId)) {
        issues.push({
          level: 'error',
          code: 'missing_manifest_record',
          message: `Missing manifest record for internal tool type "${expectedRecord.internalToolTypeId}".`,
          recordId: expectedRecord.id,
        })
      }
    }
  }

  const errorCount = issues.filter((issue) => issue.level === 'error').length
  const warningCount = issues.filter((issue) => issue.level === 'warning').length

  if (args.json) {
    console.log(JSON.stringify({ valid: errorCount === 0, errorCount, warningCount, issues }, null, 2))
  } else if (issues.length === 0) {
    console.log(`Tool image validation passed for ${records.length} manifest records.`)
  } else {
    for (const issue of issues) {
      console.log(`[${issue.level.toUpperCase()}] ${issue.code}: ${issue.message}`)
    }
  }

  if (errorCount > 0) process.exitCode = 1
}

async function readManifest(manifestPath: string, issues: ValidationIssue[]) {
  try {
    const raw = await readFile(manifestPath, 'utf8')
    const parsed = JSON.parse(raw) as { records?: unknown[] } | unknown[]
    return Array.isArray(parsed) ? parsed : parsed.records ?? []
  } catch (error) {
    issues.push({
      level: 'error',
      code: 'missing_manifest',
      message: `Could not read manifest at ${manifestPath}: ${error instanceof Error ? error.message : String(error)}`,
    })
    return []
  }
}

function validateRecord(record: z.infer<typeof manifestRecordSchema>, issues: ValidationIssue[], allowMissingFiles: boolean) {
  const categoryColor = resolveCategoryBackgroundColor(record.categoryName)
  if (!categoryColor.found) {
    issues.push({
      level: 'warning',
      code: 'missing_category_color',
      message: `Category "${record.categoryName}" is not in the category color map; neutral fallback should be used.`,
      recordId: record.id,
    })
  }

  if (categoryColor.found && record.backgroundColor.toLowerCase() !== categoryColor.color.toLowerCase()) {
    issues.push({
      level: 'error',
      code: 'category_color_mismatch',
      message: `Record uses ${record.backgroundColor}, but "${record.categoryName}" expects ${categoryColor.color}.`,
      recordId: record.id,
    })
  }

  const requiredPromptFragments = [
    'black-and-white monoline technical illustration',
    'No text',
    'no watermark',
    'no brand logos',
    'no brand marks',
    'no photorealism',
    'no people',
    'no background scene',
  ]
  for (const fragment of requiredPromptFragments) {
    if (!record.prompt.includes(fragment)) {
      issues.push({
        level: 'error',
        code: 'prompt_missing_safety_fragment',
        message: `Prompt is missing required fragment "${fragment}".`,
        recordId: record.id,
      })
    }
  }

  if (record.status === 'error') {
    issues.push({
      level: 'error',
      code: 'generation_error',
      message: `Generation failed${record.error ? `: ${record.error}` : '.'}`,
      recordId: record.id,
    })
  }

  if (record.status === 'generated' && !allowMissingFiles && !existsSync(path.resolve(record.pngPath))) {
    issues.push({
      level: 'error',
      code: 'missing_generated_png',
      message: `Generated PNG is missing at ${record.pngPath}.`,
      recordId: record.id,
    })
  }

  if (record.svgPath && record.status === 'generated' && !existsSync(path.resolve(record.svgPath))) {
    issues.push({
      level: 'warning',
      code: 'missing_generated_svg',
      message: `Optional SVG path is recorded but missing at ${record.svgPath}.`,
      recordId: record.id,
    })
  }
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
