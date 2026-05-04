import type { Material, MaterialStockStatus, UserTool } from '../../data/schema'

export type UserToolFilters = {
  search?: string
  category?: string
  brand?: string
  condition?: string
  powerType?: string
  batteryPlatform?: string
  location?: string
}

export type MaterialFilters = {
  search?: string
  category?: string
  stockStatus?: string
  unit?: string
  location?: string
}

export function getMaterialStockStatus(material: Pick<Material, 'quantity' | 'minimumDesired'>): MaterialStockStatus {
  if (material.quantity <= 0) return 'Out'
  if (material.quantity <= (material.minimumDesired || 0)) return 'Low'
  return 'In Stock'
}

export function filterUserTools(tools: UserTool[], filters: UserToolFilters) {
  const query = normalize(filters.search)
  return tools.filter((tool) => {
    if (query && !normalize([tool.name, tool.type, tool.brand, tool.model, tool.category, tool.storageLocation].join(' ')).includes(query)) return false
    if (!matches(filters.category, tool.category)) return false
    if (!matches(filters.brand, tool.brand)) return false
    if (!matches(filters.condition, tool.condition)) return false
    if (!matches(filters.powerType, tool.powerType)) return false
    if (!matches(filters.batteryPlatform, tool.batteryPlatform)) return false
    if (!matches(filters.location, tool.storageLocation)) return false
    return true
  })
}

export function filterMaterials(materials: Material[], filters: MaterialFilters) {
  const query = normalize(filters.search)
  return materials.filter((material) => {
    const stockStatus = getMaterialStockStatus(material)
    if (query && !normalize([material.name, material.description, material.category, material.storageLocation, material.unit].join(' ')).includes(query)) return false
    if (!matches(filters.category, material.category)) return false
    if (!matches(filters.stockStatus, stockStatus)) return false
    if (!matches(filters.unit, material.unit)) return false
    if (!matches(filters.location, material.storageLocation)) return false
    return true
  })
}

export function sortUserTools(tools: UserTool[]) {
  return [...tools].sort((a, b) => a.name.localeCompare(b.name))
}

export function sortMaterials(materials: Material[]) {
  return [...materials].sort((a, b) => a.name.localeCompare(b.name))
}

export function uniqueDefined(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))].sort((a, b) => a.localeCompare(b))
}

function matches(filterValue: string | undefined, itemValue: string | undefined) {
  if (!filterValue || filterValue === 'All') return true
  return itemValue === filterValue
}

function normalize(value: unknown) {
  return String(value ?? '').trim().toLowerCase()
}
