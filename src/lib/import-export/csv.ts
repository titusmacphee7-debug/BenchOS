import type { Material, Project, ToolUsageLog, UserTool, WishlistItem } from '../../data/schema'

type CsvValue = string | number | boolean | null | undefined
type CsvRow = Record<string, CsvValue>

export function rowsToCsv(rows: CsvRow[]) {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  return [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
  ].join('\n')
}

export function toolsToCsv(tools: UserTool[]) {
  return rowsToCsv(tools.map((tool) => ({
    Name: tool.name,
    Type: tool.type,
    Brand: tool.brand,
    Model: tool.model,
    Category: tool.category,
    Condition: tool.condition,
    Location: tool.storageLocation,
    'Power Type': tool.powerType,
    'Battery Platform': tool.batteryPlatform,
    'Last Used': tool.lastUsedAt,
  })))
}

export function materialsToCsv(materials: Material[]) {
  return rowsToCsv(materials.map((material) => ({
    Name: material.name,
    Description: material.description,
    Category: material.category,
    Quantity: material.quantity,
    Unit: material.unit,
    'Minimum Desired': material.minimumDesired,
    Location: material.storageLocation,
    Notes: material.notes,
  })))
}

export function wishlistToCsv(items: WishlistItem[]) {
  return rowsToCsv(items.map((item) => ({
    Name: item.name,
    Type: item.itemType,
    Status: item.status,
    Priority: item.priority,
    'Added For': item.addedFor,
    Quantity: item.quantity,
    Unit: item.unit,
    Notes: item.notes,
  })))
}

export function projectsToCsv(projects: Project[]) {
  return rowsToCsv(projects.map((project) => ({
    Name: project.name,
    Status: project.status,
    Progress: project.progress,
    Category: project.category,
    Tags: project.tags.join('; '),
    Description: project.description,
    Updated: project.updatedAt,
  })))
}

export function toolUsageToCsv(logs: ToolUsageLog[]) {
  return rowsToCsv(logs.map((log) => ({
    'Tool ID': log.userToolId,
    'Project ID': log.projectId,
    'Used At': log.usedAt,
    'Duration Minutes': log.durationMinutes,
    'Usage Type': log.usageType,
    Notes: log.notes,
    XP: log.xpAwarded,
  })))
}

export function escapeCsvValue(value: CsvValue) {
  const text = neutralizeCsvFormula(value == null ? '' : String(value))
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

function neutralizeCsvFormula(text: string) {
  return /^[=+\-@\t\r\n]/.test(text) ? `'${text}` : text
}
