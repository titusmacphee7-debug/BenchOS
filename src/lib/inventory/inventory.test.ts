import { describe, expect, it } from 'vitest'
import type { Material, UserTool } from '../../data/schema'
import { filterMaterials, filterUserTools, getMaterialStockStatus } from './inventory'

const baseMaterial: Material = {
  id: 'material-1',
  name: 'Plywood',
  category: 'Sheet Goods',
  quantity: 5,
  unit: 'Sheets',
  minimumDesired: 2,
  storageLocation: 'Rack',
  createdAt: '',
  updatedAt: '',
}

const tools: UserTool[] = [
  {
    id: 'tool-1',
    name: 'Cordless Drill',
    type: 'Drill / Driver',
    brand: 'DeWalt',
    model: 'DCD777C2',
    category: 'Drilling',
    condition: 'Good',
    storageLocation: 'Wall Pegboard',
    usageLevel: 'High',
    powerType: 'Battery',
    batteryPlatform: '20V MAX',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'tool-2',
    name: 'Circular Saw',
    type: 'Circular Saw',
    brand: 'Makita',
    model: 'XSH03Z',
    category: 'Cutting',
    condition: 'Fair',
    storageLocation: 'Top Shelf',
    usageLevel: 'Medium',
    powerType: 'Battery',
    batteryPlatform: '18V LXT',
    createdAt: '',
    updatedAt: '',
  },
]

describe('inventory helpers', () => {
  it('computes material stock statuses', () => {
    expect(getMaterialStockStatus({ ...baseMaterial, quantity: 3, minimumDesired: 2 })).toBe('In Stock')
    expect(getMaterialStockStatus({ ...baseMaterial, quantity: 2, minimumDesired: 2 })).toBe('Low')
    expect(getMaterialStockStatus({ ...baseMaterial, quantity: 1, minimumDesired: 2 })).toBe('Low')
    expect(getMaterialStockStatus({ ...baseMaterial, quantity: 0, minimumDesired: 2 })).toBe('Out')
    expect(getMaterialStockStatus({ ...baseMaterial, quantity: 1, minimumDesired: 0 })).toBe('In Stock')
  })

  it('filters user tools by inventory fields', () => {
    expect(filterUserTools(tools, { search: 'drill' })).toHaveLength(1)
    expect(filterUserTools(tools, { category: 'Cutting' })).toHaveLength(1)
    expect(filterUserTools(tools, { brand: 'DeWalt' })).toHaveLength(1)
    expect(filterUserTools(tools, { condition: 'Fair' })).toHaveLength(1)
    expect(filterUserTools(tools, { location: 'Wall Pegboard' })).toHaveLength(1)
  })

  it('filters materials by stock status and location', () => {
    const materials: Material[] = [
      baseMaterial,
      { ...baseMaterial, id: 'material-2', name: 'Wood Glue', category: 'Adhesives', quantity: 1, minimumDesired: 2, storageLocation: 'Cabinet' },
      { ...baseMaterial, id: 'material-3', name: 'Sandpaper', category: 'Abrasives', quantity: 0, minimumDesired: 10, storageLocation: 'Drawer' },
    ]

    expect(filterMaterials(materials, { category: 'Adhesives' })).toHaveLength(1)
    expect(filterMaterials(materials, { stockStatus: 'Low' })).toHaveLength(1)
    expect(filterMaterials(materials, { stockStatus: 'Out' })).toHaveLength(1)
    expect(filterMaterials(materials, { location: 'Rack' })).toHaveLength(1)
  })
})
