import type { StatusTone } from '../../lib/types/status'

export type ToolType = {
  id: string
  name: string
  category: string
  description: string
  aliases: string[]
  capabilities: string[]
  materials: string[]
  commonProjects: string[]
  powerType: string
  skillLevel: string
  safety: string[]
  variants: string[]
}

export type UserTool = {
  id: string
  toolTypeId: string
  name: string
  type: string
  brand: string
  model: string
  category: string
  condition: 'New' | 'Good' | 'Used' | 'Fair' | 'Needs Repair' | 'Broken'
  storageLocation: string
  lastUsedAt: string
  usageLevel: 'Low' | 'Medium' | 'High'
  powerType: 'Manual' | 'Battery' | 'Corded' | 'Pneumatic' | 'Stationary'
  batteryPlatform?: string
  purchaseYear?: number
  notes: string
  repairNotes?: string
}

export type Material = {
  id: string
  name: string
  description: string
  category: string
  quantity: number
  unit: string
  minimumDesired: number
  storageLocation: string
  stockStatus: 'In Stock' | 'Low' | 'Reorder Soon' | 'Out'
  lastRestockedAt: string
  estimatedUsageRate: string
  notes: string
}

export type Project = {
  id: string
  name: string
  description: string
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Blocked'
  readiness: 'Buildable Now' | 'Almost Buildable' | 'Missing Tools' | 'Missing Materials' | 'Blocked'
  progress: number
  category: string
  tags: string[]
  updatedAt: string
  nextStep: string
}

export type ProjectRequirement = {
  id: string
  projectId: string
  requirementKind: 'ToolType' | 'Capability' | 'ToolCategory' | 'Material'
  displayName: string
  required: boolean
  quantity?: number
  unit?: string
  satisfied: boolean
  notes?: string
}

export type WishlistItem = {
  id: string
  itemType: 'Tool' | 'Material' | 'Accessory'
  name: string
  description: string
  linkedProjectId?: string
  addedFor: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Not Purchased' | 'Purchased' | 'Converted' | 'Archived'
  quantity?: number
  unit?: string
  notes?: string
}

export type MasteryGuide = {
  id: string
  toolTypeId: string
  toolName: string
  category: string
  level: number
  xp: number
  xpToNextLevel: number
  status: 'Not Started' | 'In Progress' | 'Mastered' | 'Locked'
  summary: string
  progress: {
    safety: number
    setup: number
    operation: number
    accuracy: number
    maintenance: number
  }
}

export type ActivityItem = {
  id: string
  title: string
  description: string
  timestamp: string
  tone: StatusTone
}
