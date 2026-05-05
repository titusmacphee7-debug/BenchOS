import { z } from 'zod'
import { db } from './db'
import type {
  AccountOnboardingFormValues,
  LocalRecordSyncMeta,
  MaintenanceFormValues,
  MaintenanceLog,
  Material,
  MaterialFormValues,
  MaterialUsageFormValues,
  MaterialUsageLog,
  MasteryProgress,
  GapItem,
  MissingMaterialItem,
  MissingToolItem,
  Notification,
  Project,
  ProjectFormValues,
  ProjectRequirement,
  ProjectRequirementFormValues,
  ProjectTemplate,
  ProjectTemplateRequirement,
  ToolCatalogLibraryItem,
  ToolBuyingPreferences,
  ToolLibraryItem,
  ToolUsageFormValues,
  ToolUsageLog,
  UserTool,
  UserToolFormValues,
  UserProfile,
  WishlistItem,
  WishlistItemFormValues,
  WishlistMaterialConversionValues,
  WishlistToolConversionValues,
  WorkshopProfile,
  XPEvent,
} from './schema'
import {
  accountOnboardingVersion,
  maintenanceTypes,
  powerTypes,
  projectStatuses,
  requirementKinds,
  toolConditions,
  toolUsageTypes,
  wishlistItemTypes,
  wishlistPriorities,
  wishlistStatuses,
} from './schema'
import { getMaterialStockStatus } from '../lib/inventory/inventory'
import { wishlistItemTypeForGap } from '../lib/diagnostics/gapAnalyzer'
import { calculateMasteryProgress, calculateUsageLevel, getToolUseXp, XP_RULES } from '../lib/xp/xpEngine'

const optionalText = z.string().optional()
const optionalNumber = z.number().finite().nonnegative().optional()

export const userToolFormSchema = z.object({
  toolTypeId: optionalText,
  variantId: optionalText,
  catalogItemId: optionalText,
  customName: optionalText,
  name: z.string().trim().min(1, 'Tool name is required'),
  type: z.string().trim().min(1, 'Tool type is required'),
  brand: optionalText,
  model: optionalText,
  category: z.string().trim().min(1, 'Category is required'),
  condition: z.enum(toolConditions),
  storageLocation: z.string().trim().min(1, 'Storage location is required'),
  powerType: z.enum(powerTypes),
  batteryPlatform: optionalText,
  purchaseYear: optionalNumber,
  notes: optionalText,
  repairNotes: optionalText,
}) satisfies z.ZodType<UserToolFormValues>

export const materialFormSchema = z.object({
  name: z.string().trim().min(1, 'Material name is required'),
  description: optionalText,
  category: z.string().trim().min(1, 'Category is required'),
  quantity: z.number().finite().nonnegative('Quantity cannot be negative'),
  unit: z.string().trim().min(1, 'Unit is required'),
  minimumDesired: z.number().finite().nonnegative('Minimum desired cannot be negative'),
  storageLocation: z.string().trim().min(1, 'Storage location is required'),
  lastRestockedAt: optionalText,
  estimatedUsageRate: optionalText,
  notes: optionalText,
}) satisfies z.ZodType<MaterialFormValues>

export const projectFormSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  description: optionalText,
  status: z.enum(projectStatuses),
  progress: z.number().finite().min(0).max(100),
  category: optionalText,
  tagsText: optionalText,
}) satisfies z.ZodType<ProjectFormValues>

export const projectRequirementFormSchema = z.object({
  requirementKind: z.enum(requirementKinds),
  displayName: z.string().trim().min(1, 'Requirement name is required'),
  required: z.boolean(),
  toolTypeId: optionalText,
  capabilityId: optionalText,
  category: optionalText,
  materialId: optionalText,
  quantity: optionalNumber,
  unit: optionalText,
  notes: optionalText,
}) satisfies z.ZodType<ProjectRequirementFormValues>

export const wishlistItemFormSchema = z.object({
  itemType: z.enum(wishlistItemTypes),
  name: z.string().trim().min(1, 'Wishlist item name is required'),
  status: z.enum(wishlistStatuses),
  priority: z.enum(wishlistPriorities),
  linkedProjectId: optionalText,
  toolTypeId: optionalText,
  catalogItemId: optionalText,
  materialId: optionalText,
  quantity: optionalNumber,
  unit: optionalText,
  addedFor: optionalText,
  notes: optionalText,
}) satisfies z.ZodType<WishlistItemFormValues>

export const wishlistMaterialConversionSchema = materialFormSchema.extend({
  existingMaterialId: optionalText,
}) satisfies z.ZodType<WishlistMaterialConversionValues>

export const toolUsageFormSchema = z.object({
  userToolId: z.string().trim().min(1, 'Tool is required'),
  projectId: optionalText,
  usedAt: z.string().trim().min(1, 'Usage date is required'),
  durationMinutes: optionalNumber,
  usageType: z.enum(toolUsageTypes),
  notes: optionalText,
}) satisfies z.ZodType<ToolUsageFormValues>

export const materialUsageFormSchema = z.object({
  materialId: z.string().trim().min(1, 'Material is required'),
  projectId: optionalText,
  quantityUsed: z.number().finite().positive('Quantity used must be greater than zero'),
  unit: z.string().trim().min(1, 'Unit is required'),
  usedAt: z.string().trim().min(1, 'Usage date is required'),
  notes: optionalText,
}) satisfies z.ZodType<MaterialUsageFormValues>

export const maintenanceFormSchema = z.object({
  userToolId: z.string().trim().min(1, 'Tool is required'),
  maintenanceType: z.enum(maintenanceTypes),
  performedAt: z.string().trim().min(1, 'Maintenance date is required'),
  notes: optionalText,
  conditionAfter: z.enum(toolConditions).optional(),
}) satisfies z.ZodType<MaintenanceFormValues>

export async function createUserTool(values: UserToolFormValues) {
  const now = new Date().toISOString()
  const syncMeta = await syncMetaForLocalMutation()
  const userTool: UserTool = {
    id: createId('tool'),
    ...values,
    customName: values.customName || undefined,
    catalogItemId: values.catalogItemId || undefined,
    brand: values.brand || undefined,
    model: values.model || undefined,
    batteryPlatform: values.batteryPlatform || undefined,
    purchaseYear: values.purchaseYear || undefined,
    notes: values.notes || undefined,
    repairNotes: values.repairNotes || undefined,
    usageLevel: 'Low',
    ...syncMeta,
    createdAt: now,
    updatedAt: now,
  }
  await db.userTools.add(userTool)
  return userTool
}

export async function updateUserTool(id: string, values: UserToolFormValues) {
  const existing = await db.userTools.get(id)
  await db.userTools.update(id, {
    ...values,
    customName: values.customName || undefined,
    catalogItemId: values.catalogItemId || undefined,
    brand: values.brand || undefined,
    model: values.model || undefined,
    batteryPlatform: values.batteryPlatform || undefined,
    purchaseYear: values.purchaseYear || undefined,
    notes: values.notes || undefined,
    repairNotes: values.repairNotes || undefined,
    ...(await syncMetaForLocalMutation(existing)),
    updatedAt: new Date().toISOString(),
  })
}

export async function archiveUserTool(id: string) {
  const existing = await db.userTools.get(id)
  await db.userTools.update(id, { archivedAt: new Date().toISOString(), ...(await syncMetaForLocalMutation(existing)), updatedAt: new Date().toISOString() })
}

export async function createMaterial(values: MaterialFormValues) {
  const now = new Date().toISOString()
  const syncMeta = await syncMetaForLocalMutation()
  const material: Material = {
    id: createId('material'),
    ...values,
    description: values.description || undefined,
    lastRestockedAt: values.lastRestockedAt || undefined,
    estimatedUsageRate: values.estimatedUsageRate || undefined,
    notes: values.notes || undefined,
    ...syncMeta,
    createdAt: now,
    updatedAt: now,
  }
  await db.materials.add(material)
  return material
}

export async function updateMaterial(id: string, values: MaterialFormValues) {
  const existing = await db.materials.get(id)
  await db.materials.update(id, {
    ...values,
    description: values.description || undefined,
    lastRestockedAt: values.lastRestockedAt || undefined,
    estimatedUsageRate: values.estimatedUsageRate || undefined,
    notes: values.notes || undefined,
    ...(await syncMetaForLocalMutation(existing)),
    updatedAt: new Date().toISOString(),
  })
}

export async function archiveMaterial(id: string) {
  const existing = await db.materials.get(id)
  await db.materials.update(id, { archivedAt: new Date().toISOString(), ...(await syncMetaForLocalMutation(existing)), updatedAt: new Date().toISOString() })
}

export async function adjustMaterialStock(id: string, delta: number) {
  const material = await db.materials.get(id)
  if (!material) return
  const quantity = Math.max(0, material.quantity + delta)
  await db.materials.update(id, {
    quantity,
    lastRestockedAt: delta > 0 ? new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : material.lastRestockedAt,
    ...(await syncMetaForLocalMutation(material)),
    updatedAt: new Date().toISOString(),
  })
  await syncMaterialStockNotification({ ...material, quantity })
}

export async function createProject(values: ProjectFormValues) {
  const now = new Date().toISOString()
  const syncMeta = await syncMetaForLocalMutation()
  const project: Project = {
    id: createId('project'),
    name: values.name,
    description: values.description || undefined,
    status: values.status,
    progress: values.progress,
    category: values.category || undefined,
    tags: parseTags(values.tagsText),
    ...syncMeta,
    createdAt: now,
    updatedAt: now,
    completedAt: values.status === 'Completed' ? now : undefined,
  }
  await db.projects.add(project)
  await db.projectActivity.add({
    id: createId('activity'),
    projectId: project.id,
    title: 'Project created',
    description: `${project.name} was created.`,
    ...syncMeta,
    createdAt: now,
  })
  return project
}

export async function createProjectFromTemplate(template: ProjectTemplate, requirements: ProjectTemplateRequirement[]) {
  const now = new Date().toISOString()
  const syncMeta = await syncMetaForLocalMutation()
  const project: Project = {
    id: createId('project'),
    name: template.name,
    description: template.description,
    status: 'Planning',
    progress: 0,
    category: template.category,
    tags: template.tags,
    ...syncMeta,
    createdAt: now,
    updatedAt: now,
  }
  const projectRequirements: ProjectRequirement[] = requirements.map((requirement) => ({
    id: createId('requirement'),
    projectId: project.id,
    requirementKind: requirement.requirementKind,
    displayName: requirement.displayName,
    required: requirement.required,
    toolTypeId: requirement.toolTypeId,
    capabilityId: requirement.capabilityId,
    category: requirement.category,
    quantity: requirement.quantity,
    unit: requirement.unit,
    notes: requirement.notes,
    ...syncMeta,
    createdAt: now,
    updatedAt: now,
  }))
  const projectSteps = template.steps.map((title, index) => ({
    id: createId('step'),
    projectId: project.id,
    title,
    completed: false,
    sortOrder: index,
    notes: '',
    ...syncMeta,
    createdAt: now,
    updatedAt: now,
  }))

  await db.transaction('rw', [db.projects, db.projectRequirements, db.projectSteps, db.projectActivity], async () => {
    await db.projects.add(project)
    if (projectRequirements.length > 0) await db.projectRequirements.bulkAdd(projectRequirements)
    if (projectSteps.length > 0) await db.projectSteps.bulkAdd(projectSteps)
    await db.projectActivity.add({
      id: createId('activity'),
      projectId: project.id,
      title: 'Project created from template',
      description: `${template.name} was created from the Project Template Library.`,
      ...syncMeta,
      createdAt: now,
    })
  })

  return project
}

export async function updateProject(id: string, values: ProjectFormValues) {
  const now = new Date().toISOString()
  const existing = await db.projects.get(id)
  await db.projects.update(id, {
    name: values.name,
    description: values.description || undefined,
    status: values.status,
    progress: values.progress,
    category: values.category || undefined,
    tags: parseTags(values.tagsText),
    completedAt: values.status === 'Completed' ? now : undefined,
    ...(await syncMetaForLocalMutation(existing)),
    updatedAt: now,
  })
  if (existing?.status !== 'Completed' && values.status === 'Completed') {
    await awardXpEvent({
      sourceType: 'Project',
      sourceId: `project-complete:${id}`,
      xpAmount: XP_RULES.projectComplete,
      description: `Completed project: ${values.name}`,
      projectId: id,
      dedupe: true,
    })
  }
}

export async function archiveProject(id: string) {
  const existing = await db.projects.get(id)
  await db.projects.update(id, { archivedAt: new Date().toISOString(), ...(await syncMetaForLocalMutation(existing)), updatedAt: new Date().toISOString() })
}

export async function createProjectRequirement(projectId: string, values: ProjectRequirementFormValues) {
  const now = new Date().toISOString()
  const syncMeta = await syncMetaForLocalMutation()
  const requirement: ProjectRequirement = {
    id: createId('requirement'),
    projectId,
    ...values,
    toolTypeId: values.toolTypeId || undefined,
    capabilityId: values.capabilityId || undefined,
    category: values.category || undefined,
    materialId: values.materialId || undefined,
    quantity: values.quantity || undefined,
    unit: values.unit || undefined,
    notes: values.notes || undefined,
    ...syncMeta,
    createdAt: now,
    updatedAt: now,
  }
  await db.projectRequirements.add(requirement)
  await touchProject(projectId, `Added requirement: ${requirement.displayName}`)
  return requirement
}

export async function updateProjectRequirement(id: string, values: ProjectRequirementFormValues) {
  const requirement = await db.projectRequirements.get(id)
  if (!requirement) return
  await db.projectRequirements.update(id, {
    ...values,
    toolTypeId: values.toolTypeId || undefined,
    capabilityId: values.capabilityId || undefined,
    category: values.category || undefined,
    materialId: values.materialId || undefined,
    quantity: values.quantity || undefined,
    unit: values.unit || undefined,
    notes: values.notes || undefined,
    ...(await syncMetaForLocalMutation(requirement)),
    updatedAt: new Date().toISOString(),
  })
  await touchProject(requirement.projectId, `Updated requirement: ${values.displayName}`)
}

export async function archiveProjectRequirement(id: string) {
  const requirement = await db.projectRequirements.get(id)
  if (!requirement) return
  await db.projectRequirements.update(id, { archivedAt: new Date().toISOString(), ...(await syncMetaForLocalMutation(requirement)), updatedAt: new Date().toISOString() })
  await touchProject(requirement.projectId, `Archived requirement: ${requirement.displayName}`)
}

export async function setProjectStepCompleted(id: string, completed: boolean) {
  const step = await db.projectSteps.get(id)
  if (!step) return
  await db.projectSteps.update(id, { completed, ...(await syncMetaForLocalMutation(step)), updatedAt: new Date().toISOString() })
  await touchProject(step.projectId, `${completed ? 'Completed' : 'Reopened'} step: ${step.title}`)
  if (completed && !step.completed) {
    await awardXpEvent({
      sourceType: 'Project',
      sourceId: `project-step:${id}`,
      xpAmount: XP_RULES.projectStep,
      description: `Completed project step: ${step.title}`,
      projectId: step.projectId,
      dedupe: true,
    })
  }
}

export async function logToolUsage(values: ToolUsageFormValues) {
  const tool = await db.userTools.get(values.userToolId)
  if (!tool) return undefined
  const now = new Date().toISOString()
  const syncMeta = await syncMetaForLocalMutation()
  const xpAwarded = getToolUseXp(values.projectId)
  const log: ToolUsageLog = {
    id: createId('tool-use'),
    userToolId: values.userToolId,
    projectId: values.projectId || undefined,
    usedAt: values.usedAt,
    durationMinutes: values.durationMinutes || undefined,
    usageType: values.usageType,
    notes: values.notes || undefined,
    xpAwarded,
    ...syncMeta,
    createdAt: now,
  }
  await db.toolUsageLogs.add(log)
  const toolLogs = await db.toolUsageLogs.where('userToolId').equals(values.userToolId).toArray()
  await db.userTools.update(values.userToolId, {
    lastUsedAt: values.usedAt,
    usageLevel: calculateUsageLevel(toolLogs),
    ...(await syncMetaForLocalMutation(tool)),
    updatedAt: now,
  })
  await awardXpEvent({
    sourceType: 'ToolUse',
    sourceId: log.id,
    xpAmount: xpAwarded,
    description: values.projectId ? `Used ${tool.name} for a project` : `Logged use for ${tool.name}`,
    projectId: values.projectId || undefined,
    userToolId: values.userToolId,
    toolTypeId: tool.toolTypeId,
  })
  if (values.projectId) await touchProject(values.projectId, `Logged tool use: ${tool.name}`)
  return log
}

export async function logMaterialUsage(values: MaterialUsageFormValues) {
  const material = await db.materials.get(values.materialId)
  if (!material) return undefined
  const now = new Date().toISOString()
  const syncMeta = await syncMetaForLocalMutation()
  const quantity = Math.max(0, material.quantity - values.quantityUsed)
  const log: MaterialUsageLog = {
    id: createId('material-use'),
    materialId: values.materialId,
    projectId: values.projectId || undefined,
    quantityUsed: values.quantityUsed,
    unit: values.unit,
    usedAt: values.usedAt,
    notes: values.notes || undefined,
    xpAwarded: XP_RULES.materialUsage,
    ...syncMeta,
    createdAt: now,
  }
  await db.materialUsageLogs.add(log)
  await db.materials.update(values.materialId, { quantity, ...(await syncMetaForLocalMutation(material)), updatedAt: now })
  await syncMaterialStockNotification({ ...material, quantity })
  await awardXpEvent({
    sourceType: 'MaterialUsage',
    sourceId: log.id,
    xpAmount: XP_RULES.materialUsage,
    description: `Logged material usage: ${material.name}`,
    projectId: values.projectId || undefined,
    materialId: values.materialId,
  })
  if (values.projectId) await touchProject(values.projectId, `Logged material usage: ${material.name}`)
  return log
}

export async function logMaintenance(values: MaintenanceFormValues) {
  const tool = await db.userTools.get(values.userToolId)
  if (!tool) return undefined
  const now = new Date().toISOString()
  const syncMeta = await syncMetaForLocalMutation()
  const log: MaintenanceLog = {
    id: createId('maintenance'),
    userToolId: values.userToolId,
    maintenanceType: values.maintenanceType,
    performedAt: values.performedAt,
    notes: values.notes || undefined,
    conditionAfter: values.conditionAfter || undefined,
    xpAwarded: XP_RULES.maintenance,
    ...syncMeta,
    createdAt: now,
  }
  await db.maintenanceLogs.add(log)
  await db.userTools.update(values.userToolId, {
    condition: values.conditionAfter || tool.condition,
    repairNotes: values.notes ? values.notes : tool.repairNotes,
    ...(await syncMetaForLocalMutation(tool)),
    updatedAt: now,
  })
  await awardXpEvent({
    sourceType: 'Maintenance',
    sourceId: log.id,
    xpAmount: XP_RULES.maintenance,
    description: `Logged maintenance: ${tool.name}`,
    userToolId: values.userToolId,
    toolTypeId: tool.toolTypeId,
  })
  return log
}

export async function createWishlistItem(values: WishlistItemFormValues) {
  const now = new Date().toISOString()
  const syncMeta = await syncMetaForLocalMutation()
  const item: WishlistItem = {
    id: createId('wishlist'),
    ...values,
    linkedProjectId: values.linkedProjectId || undefined,
    toolTypeId: values.toolTypeId || undefined,
    catalogItemId: values.catalogItemId || undefined,
    materialId: values.materialId || undefined,
    quantity: values.quantity || undefined,
    unit: values.unit || undefined,
    addedFor: values.addedFor || undefined,
    notes: values.notes || undefined,
    ...syncMeta,
    createdAt: now,
    updatedAt: now,
  }
  await db.wishlistItems.add(item)
  return item
}

export async function saveToolBuyingPreferences(values: ToolBuyingPreferences) {
  const now = new Date().toISOString()
  const existing = await db.toolBuyingPreferences.get(values.id)
  const next: ToolBuyingPreferences = {
    ...values,
    ...localSyncMeta(),
    createdAt: existing?.createdAt ?? values.createdAt ?? now,
    updatedAt: now,
  }
  await db.toolBuyingPreferences.put(next)
  return next
}

export async function completeAccountOnboarding(values: AccountOnboardingFormValues, options: { sync?: boolean } = {}) {
  void options
  const now = new Date().toISOString()
  const session = await db.authSessionStates.get('local-session')
  const existingUser = await db.userProfiles.get('local-user')
  const existingWorkshop = await db.workshopProfiles.get('local-workshop')
  const existingPreferences = await db.toolBuyingPreferences.get('default')
  const signedIn = session?.status === 'signed_in'
  if (!signedIn) throw new Error('Sign in before completing account setup.')
  const syncMeta = localSyncMeta()
  const displayName = values.displayName.trim()
  const workshopName = values.workshopName.trim()
  if (!displayName) throw new Error('Display name is required.')
  if (!workshopName) throw new Error('Workshop name is required.')

  const userProfile: UserProfile = {
    ...(existingUser ?? {
      id: 'local-user',
      createdAt: now,
    }),
    authUserId: session?.userId ?? existingUser?.authUserId,
    ownerUserId: session?.userId ?? existingUser?.ownerUserId,
    workshopId: existingWorkshop?.workshopId,
    email: session?.email ?? existingUser?.email,
    displayName,
    accountOnboardingCompletedAt: now,
    accountOnboardingVersion,
    ...syncMeta,
    updatedAt: now,
  }

  const workshopProfile: WorkshopProfile = {
    ...(existingWorkshop ?? {
      id: 'local-workshop',
      createdAt: now,
    }),
    ownerUserId: session?.userId ?? existingWorkshop?.ownerUserId,
    name: workshopName,
    type: values.workshopType,
    skillLevel: values.skillLevel,
    spaceType: values.spaceType,
    projectInterests: values.projectInterests,
    safetyPriorities: values.safetyPriorities,
    cloudBackupEnabled: false,
    cloudSyncEnabled: false,
    ...syncMeta,
    updatedAt: now,
  }

  const preferences: ToolBuyingPreferences = {
    ...(existingPreferences ?? {
      id: 'default',
      createdAt: now,
    }),
    ownerUserId: session?.userId ?? existingPreferences?.ownerUserId,
    workshopId: existingWorkshop?.workshopId ?? existingPreferences?.workshopId,
    preferredBrands: values.preferredBrands,
    avoidedBrands: values.avoidedBrands,
    preferredBatteryPlatforms: values.preferredBatteryPlatforms,
    budgetTier: values.budgetTier,
    workshopType: values.workshopType,
    storageSensitivity: values.storageSensitivity,
    noiseSensitivity: values.noiseSensitivity,
    dustSensitivity: values.dustSensitivity,
    preferCordless: values.preferCordless,
    ...syncMeta,
    updatedAt: now,
  }

  await db.transaction('rw', [db.userProfiles, db.workshopProfiles, db.toolBuyingPreferences], async () => {
    await db.userProfiles.put(userProfile)
    await db.workshopProfiles.put(workshopProfile)
    await db.toolBuyingPreferences.put(preferences)
  })

  return { userProfile, workshopProfile, preferences }
}

export async function addGapItemToWishlist(gap: GapItem) {
  const itemType = wishlistItemTypeForGap(gap)
  const existingItems = await db.wishlistItems
    .filter((item) => !item.archivedAt && item.status !== 'Converted' && item.status !== 'Archived')
    .toArray()
  const key = wishlistDuplicateKey(itemType, gap.name, gap.toolTypeId, gap.materialId, gap.catalogItemId)
  const existing = existingItems.find((item) => wishlistDuplicateKey(item.itemType, item.name, item.toolTypeId, item.materialId, item.catalogItemId) === key)
  if (existing) return { item: existing, created: false }

  const now = new Date().toISOString()
  const syncMeta = await syncMetaForLocalMutation()
  const item: WishlistItem = {
    id: createId('wishlist'),
    itemType,
    name: gap.name,
    status: 'Not Purchased',
    priority: gap.severity === 'high' ? 'High' : gap.severity === 'medium' ? 'Medium' : 'Low',
    toolTypeId: gap.toolTypeId,
    catalogItemId: gap.catalogItemId,
    materialId: gap.materialId,
    quantity: gap.quantity,
    unit: gap.unit,
    addedFor: gap.projectNames[0] ?? gap.templateNames[0] ?? 'Gap Analyzer',
    notes: `${gap.description}${gap.projectNames.length || gap.templateNames.length ? ` Affects: ${[...gap.projectNames, ...gap.templateNames].join(', ')}.` : ''}`,
    ...syncMeta,
    createdAt: now,
    updatedAt: now,
  }
  await db.wishlistItems.add(item)
  return { item, created: true }
}

export async function updateWishlistItem(id: string, values: WishlistItemFormValues) {
  const existing = await db.wishlistItems.get(id)
  await db.wishlistItems.update(id, {
    ...values,
    linkedProjectId: values.linkedProjectId || undefined,
    toolTypeId: values.toolTypeId || undefined,
    catalogItemId: values.catalogItemId || undefined,
    materialId: values.materialId || undefined,
    quantity: values.quantity || undefined,
    unit: values.unit || undefined,
    addedFor: values.addedFor || undefined,
    notes: values.notes || undefined,
    ...(await syncMetaForLocalMutation(existing)),
    updatedAt: new Date().toISOString(),
  })
}

export async function archiveWishlistItem(id: string) {
  const existing = await db.wishlistItems.get(id)
  await db.wishlistItems.update(id, { status: 'Archived', archivedAt: new Date().toISOString(), ...(await syncMetaForLocalMutation(existing)), updatedAt: new Date().toISOString() })
}

export async function markWishlistPurchased(id: string) {
  const existing = await db.wishlistItems.get(id)
  await db.wishlistItems.update(id, { status: 'Purchased', purchasedAt: new Date().toISOString(), ...(await syncMetaForLocalMutation(existing)), updatedAt: new Date().toISOString() })
}

export async function convertWishlistItemToInventory(
  id: string,
  options?: {
    tool?: WishlistToolConversionValues
    material?: WishlistMaterialConversionValues
  },
) {
  const item = await db.wishlistItems.get(id)
  if (!item) return undefined
  const now = new Date().toISOString()
  let createdInventoryId: string | undefined

  if (item.itemType === 'Material') {
    const existingMaterialId = options?.material?.existingMaterialId || item.materialId
    if (existingMaterialId) {
      const material = await db.materials.get(existingMaterialId)
      if (material) {
        await adjustMaterialStock(material.id, options?.material?.quantity ?? item.quantity ?? 1)
        createdInventoryId = material.id
      }
    }

    if (!createdInventoryId) {
      const { existingMaterialId: _existingMaterialId, ...materialValues } = options?.material ?? materialConversionDefaults(item)
      void _existingMaterialId
      const material = await createMaterial(materialValues)
      createdInventoryId = material.id
    }
  } else {
    const tool = await createUserTool(options?.tool ?? await toolConversionDefaults(item))
    createdInventoryId = tool.id
  }

  const syncMeta = await syncMetaForLocalMutation(item)
  await db.wishlistItems.update(id, { status: 'Converted', convertedAt: now, purchasedAt: item.purchasedAt ?? now, ...syncMeta, updatedAt: now })
  await db.purchaseHistory.add({
    id: createId('purchase'),
    wishlistItemId: item.id,
    itemType: item.itemType,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    purchasedAt: item.purchasedAt ?? now,
    convertedAt: now,
    createdInventoryId,
    ...syncMeta,
  })
  return createdInventoryId
}

export async function addMissingItemsToWishlist(
  project: Project,
  missingTools: MissingToolItem[],
  missingMaterials: MissingMaterialItem[],
) {
  const existingItems = await db.wishlistItems
    .where('linkedProjectId')
    .equals(project.id)
    .filter((item) => !item.archivedAt && item.status !== 'Converted')
    .toArray()
  const existingKeys = new Set(existingItems.map((item) => wishlistDuplicateKey(item.itemType, item.name, item.toolTypeId, item.materialId, item.catalogItemId)))
  const now = new Date().toISOString()
  const syncMeta = await syncMetaForLocalMutation()
  const items: WishlistItem[] = []

  for (const missing of missingTools) {
    const itemType = missing.requirementKind === 'ToolType' ? 'Tool' : 'Accessory'
    const key = wishlistDuplicateKey(itemType, missing.name, missing.toolTypeId)
    if (existingKeys.has(key)) continue
    existingKeys.add(key)
    items.push({
      id: createId('wishlist'),
      itemType,
      name: missing.name,
      status: 'Not Purchased',
      priority: missing.required ? 'High' : 'Medium',
      linkedProjectId: project.id,
      toolTypeId: missing.toolTypeId,
      addedFor: project.name,
      notes: missing.notes,
      ...syncMeta,
      createdAt: now,
      updatedAt: now,
    })
  }

  for (const missing of missingMaterials) {
    const key = wishlistDuplicateKey('Material', missing.name, undefined, missing.materialId)
    if (existingKeys.has(key)) continue
    existingKeys.add(key)
    items.push({
      id: createId('wishlist'),
      itemType: 'Material',
      name: missing.name,
      status: 'Not Purchased',
      priority: missing.required ? 'High' : 'Medium',
      linkedProjectId: project.id,
      materialId: missing.materialId,
      quantity: missing.shortage > 0 ? missing.shortage : missing.quantity,
      unit: missing.unit,
      addedFor: project.name,
      notes: missing.notes,
      ...syncMeta,
      createdAt: now,
      updatedAt: now,
    })
  }

  if (items.length > 0) await db.wishlistItems.bulkAdd(items)
  return items
}

export async function addMissingTemplateItemsToWishlist(
  template: ProjectTemplate,
  missingTools: MissingToolItem[],
  missingMaterials: MissingMaterialItem[],
) {
  const existingItems = await db.wishlistItems
    .filter((item) => !item.archivedAt && item.status !== 'Converted' && item.addedFor === template.name)
    .toArray()
  const existingKeys = new Set(existingItems.map((item) => wishlistDuplicateKey(item.itemType, item.name, item.toolTypeId, item.materialId, item.catalogItemId)))
  const now = new Date().toISOString()
  const syncMeta = await syncMetaForLocalMutation()
  const items: WishlistItem[] = []

  for (const missing of missingTools) {
    const itemType = missing.requirementKind === 'ToolType' ? 'Tool' : 'Accessory'
    const key = wishlistDuplicateKey(itemType, missing.name, missing.toolTypeId)
    if (existingKeys.has(key)) continue
    existingKeys.add(key)
    items.push({
      id: createId('wishlist'),
      itemType,
      name: missing.name,
      status: 'Not Purchased',
      priority: missing.required ? 'High' : 'Medium',
      toolTypeId: missing.toolTypeId,
      addedFor: template.name,
      notes: missing.notes ?? `Missing for project template: ${template.name}.`,
      ...syncMeta,
      createdAt: now,
      updatedAt: now,
    })
  }

  for (const missing of missingMaterials) {
    const key = wishlistDuplicateKey('Material', missing.name, undefined, missing.materialId)
    if (existingKeys.has(key)) continue
    existingKeys.add(key)
    items.push({
      id: createId('wishlist'),
      itemType: 'Material',
      name: missing.name,
      status: 'Not Purchased',
      priority: missing.required ? 'High' : 'Medium',
      materialId: missing.materialId,
      quantity: missing.shortage > 0 ? missing.shortage : missing.quantity,
      unit: missing.unit,
      addedFor: template.name,
      notes: missing.notes ?? `Missing for project template: ${template.name}.`,
      ...syncMeta,
      createdAt: now,
      updatedAt: now,
    })
  }

  if (items.length > 0) await db.wishlistItems.bulkAdd(items)
  return items
}

export async function startMasteryGuide(guideId: string, userToolId?: string) {
  const guide = await db.masteryGuides.get(guideId)
  if (!guide) return undefined
  const existing = await findMasteryProgress(guideId, userToolId)
  if (existing) return existing
  const now = new Date().toISOString()
  const syncMeta = await syncMetaForLocalMutation()
  const progress: MasteryProgress = {
    id: createId('mastery'),
    guideId: guide.id,
    toolTypeId: guide.toolTypeId,
    userToolId,
    level: 1,
    xp: 0,
    xpToNextLevel: 500,
    status: 'Not Started',
    completedStepIds: [],
    safetyProgress: 0,
    setupProgress: 0,
    operationProgress: 0,
    accuracyProgress: 0,
    maintenanceProgress: 0,
    ...syncMeta,
    createdAt: now,
    updatedAt: now,
  }
  await db.masteryProgress.add(progress)
  return progress
}

export async function completeMasteryGuideStep(guideId: string, stepId: string, userToolId?: string) {
  const guide = await db.masteryGuides.get(guideId)
  if (!guide) return undefined
  let progress = await findMasteryProgress(guideId, userToolId)
  if (!progress) {
    const started = await startMasteryGuide(guideId, userToolId)
    if (!started) return undefined
    progress = started
  }
  if (progress.completedStepIds.includes(stepId)) return progress

  const now = new Date().toISOString()
  const completedStepIds = [...progress.completedStepIds, stepId]
  const nextProgress = calculateMasteryProgress(guide, completedStepIds)
  const wasMastered = progress.status === 'Mastered'
  const isNowMastered = nextProgress.status === 'Mastered'
  const xp = progress.xp + XP_RULES.masteryStep + (!wasMastered && isNowMastered ? XP_RULES.masteryComplete : 0)

  const updated: MasteryProgress = {
    ...progress,
    ...nextProgress,
    completedStepIds,
    xp,
    lastPracticedAt: now,
    ...(await syncMetaForLocalMutation(progress)),
    updatedAt: now,
  }
  await db.masteryProgress.put(updated)
  await awardXpEvent({
    sourceType: 'Guide',
    sourceId: `guide-step:${updated.id}:${stepId}`,
    xpAmount: XP_RULES.masteryStep,
    description: `Completed ${guide.toolName} guide step`,
    toolTypeId: guide.toolTypeId,
    userToolId: updated.userToolId,
    dedupe: true,
  })
  if (!wasMastered && isNowMastered) {
    await awardXpEvent({
      sourceType: 'Guide',
      sourceId: `guide-mastered:${updated.id}`,
      xpAmount: XP_RULES.masteryComplete,
      description: `Completed ${guide.toolName} guide`,
      toolTypeId: guide.toolTypeId,
      userToolId: updated.userToolId,
      dedupe: true,
    })
  }
  return updated
}

export function userToolDefaultsFromLibrary(tool?: ToolLibraryItem | ToolCatalogLibraryItem): UserToolFormValues {
  if (isCatalogLibraryItem(tool)) {
    return {
      toolTypeId: tool.internalToolTypeId,
      catalogItemId: tool.id,
      name: tool.displayName,
      type: tool.toolType.name,
      brand: tool.brand,
      model: tool.model ?? '',
      category: tool.toolType.category,
      condition: 'Good',
      storageLocation: '',
      powerType: tool.powerType,
      batteryPlatform: tool.batteryPlatform ?? '',
      purchaseYear: undefined,
      notes: '',
      repairNotes: '',
    }
  }

  const variant = tool?.variants[0]
  return {
    toolTypeId: tool?.id,
    variantId: variant?.id,
    catalogItemId: undefined,
    name: tool?.name ?? '',
    type: tool?.name ?? '',
    brand: variant?.brand ?? '',
    model: variant?.model ?? '',
    category: tool?.category ?? '',
    condition: 'Good',
    storageLocation: '',
    powerType: variant?.powerType ?? tool?.powerType ?? 'Manual',
    batteryPlatform: variant?.batteryPlatform ?? '',
    purchaseYear: undefined,
    notes: '',
    repairNotes: '',
  }
}

export function userToolDefaults(tool?: UserTool): UserToolFormValues {
  return {
    toolTypeId: tool?.toolTypeId,
    variantId: tool?.variantId,
    catalogItemId: tool?.catalogItemId,
    customName: tool?.customName ?? '',
    name: tool?.name ?? '',
    type: tool?.type ?? '',
    brand: tool?.brand ?? '',
    model: tool?.model ?? '',
    category: tool?.category ?? '',
    condition: tool?.condition ?? 'Good',
    storageLocation: tool?.storageLocation ?? '',
    powerType: tool?.powerType ?? 'Manual',
    batteryPlatform: tool?.batteryPlatform ?? '',
    purchaseYear: tool?.purchaseYear,
    notes: tool?.notes ?? '',
    repairNotes: tool?.repairNotes ?? '',
  }
}

export function materialDefaults(material?: Material): MaterialFormValues {
  return {
    name: material?.name ?? '',
    description: material?.description ?? '',
    category: material?.category ?? '',
    quantity: material?.quantity ?? 0,
    unit: material?.unit ?? '',
    minimumDesired: material?.minimumDesired ?? 0,
    storageLocation: material?.storageLocation ?? '',
    lastRestockedAt: material?.lastRestockedAt ?? '',
    estimatedUsageRate: material?.estimatedUsageRate ?? '',
    notes: material?.notes ?? '',
  }
}

export function projectDefaults(project?: Project): ProjectFormValues {
  return {
    name: project?.name ?? '',
    description: project?.description ?? '',
    status: project?.status ?? 'Planning',
    progress: project?.progress ?? 0,
    category: project?.category ?? '',
    tagsText: project?.tags.join(', ') ?? '',
  }
}

export function requirementDefaults(requirement?: ProjectRequirement): ProjectRequirementFormValues {
  return {
    requirementKind: requirement?.requirementKind ?? 'ToolType',
    displayName: requirement?.displayName ?? '',
    required: requirement?.required ?? true,
    toolTypeId: requirement?.toolTypeId ?? '',
    capabilityId: requirement?.capabilityId ?? '',
    category: requirement?.category ?? '',
    materialId: requirement?.materialId ?? '',
    quantity: requirement?.quantity,
    unit: requirement?.unit ?? '',
    notes: requirement?.notes ?? '',
  }
}

export function wishlistDefaults(item?: WishlistItem): WishlistItemFormValues {
  return {
    itemType: item?.itemType ?? 'Tool',
    name: item?.name ?? '',
    status: item?.status ?? 'Not Purchased',
    priority: item?.priority ?? 'Medium',
    linkedProjectId: item?.linkedProjectId ?? '',
    toolTypeId: item?.toolTypeId ?? '',
    catalogItemId: item?.catalogItemId ?? '',
    materialId: item?.materialId ?? '',
    quantity: item?.quantity,
    unit: item?.unit ?? '',
    addedFor: item?.addedFor ?? '',
    notes: item?.notes ?? '',
  }
}

export async function toolConversionDefaults(item: WishlistItem): Promise<WishlistToolConversionValues> {
  const catalogItem = item.catalogItemId ? await db.toolCatalogItems.get(item.catalogItemId) : undefined
  const toolType = item.toolTypeId ? await db.toolTypes.get(item.toolTypeId) : undefined
  const variant = item.toolTypeId ? await db.toolVariants.where('toolTypeId').equals(item.toolTypeId).first() : undefined
  return {
    toolTypeId: item.toolTypeId ?? catalogItem?.internalToolTypeId,
    catalogItemId: item.catalogItemId,
    variantId: variant?.id,
    name: catalogItem?.displayName ?? toolType?.name ?? item.name,
    type: toolType?.name ?? item.itemType,
    brand: catalogItem?.brand ?? variant?.brand ?? '',
    model: catalogItem?.model ?? variant?.model ?? '',
    category: toolType?.category ?? (item.itemType === 'Accessory' ? 'Shop Equipment' : 'Custom'),
    condition: 'New',
    storageLocation: 'Unassigned',
    powerType: catalogItem?.powerType ?? variant?.powerType ?? toolType?.powerType ?? 'Manual',
    batteryPlatform: catalogItem?.batteryPlatform ?? variant?.batteryPlatform ?? '',
    purchaseYear: undefined,
    notes: item.addedFor ? `Converted from wishlist for ${item.addedFor}.` : 'Converted from wishlist.',
    repairNotes: '',
  }
}

export function materialConversionDefaults(item: WishlistItem): WishlistMaterialConversionValues {
  return {
    existingMaterialId: item.materialId ?? '',
    name: item.name,
    description: item.notes ?? '',
    category: 'Materials',
    quantity: item.quantity ?? 1,
    unit: item.unit ?? 'Each',
    minimumDesired: 1,
    storageLocation: 'Unassigned',
    lastRestockedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    estimatedUsageRate: '',
    notes: item.addedFor ? `Converted from wishlist for ${item.addedFor}.` : 'Converted from wishlist.',
  }
}

export function toolUsageDefaults(userToolId?: string, projectId?: string): ToolUsageFormValues {
  return {
    userToolId: userToolId ?? '',
    projectId: projectId ?? '',
    usedAt: new Date().toISOString().slice(0, 16),
    durationMinutes: undefined,
    usageType: projectId ? 'Project' : 'General',
    notes: '',
  }
}

export function materialUsageDefaults(material?: Material, projectId?: string): MaterialUsageFormValues {
  return {
    materialId: material?.id ?? '',
    projectId: projectId ?? '',
    quantityUsed: 1,
    unit: material?.unit ?? '',
    usedAt: new Date().toISOString().slice(0, 16),
    notes: '',
  }
}

export function maintenanceDefaults(userToolId?: string): MaintenanceFormValues {
  return {
    userToolId: userToolId ?? '',
    maintenanceType: 'Cleaned',
    performedAt: new Date().toISOString().slice(0, 16),
    notes: '',
    conditionAfter: undefined,
  }
}

function parseTags(tagsText?: string) {
  return (tagsText ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

async function touchProject(projectId: string, description: string) {
  const now = new Date().toISOString()
  const project = await db.projects.get(projectId)
  const syncMeta = await syncMetaForLocalMutation(project)
  await db.projects.update(projectId, { ...syncMeta, updatedAt: now })
  await db.projectActivity.add({ id: createId('activity'), projectId, title: 'Project updated', description, ...syncMeta, createdAt: now })
}

async function awardXpEvent(event: Omit<XPEvent, 'id' | 'awardedAt'> & { dedupe?: boolean }) {
  if (event.dedupe && event.sourceId) {
    const existing = await db.xpEvents.where('sourceId').equals(event.sourceId).first()
    if (existing) return existing
  }
  const awardedAt = new Date().toISOString()
  const xpEvent: XPEvent = {
    id: createId('xp'),
    sourceType: event.sourceType,
    sourceId: event.sourceId,
    xpAmount: event.xpAmount,
    awardedAt,
    description: event.description,
    projectId: event.projectId,
    toolTypeId: event.toolTypeId,
    userToolId: event.userToolId,
    materialId: event.materialId,
    ...(await syncMetaForLocalMutation()),
  }
  await db.xpEvents.add(xpEvent)
  return xpEvent
}

async function syncMaterialStockNotification(material: Material) {
  const status = getMaterialStockStatus(material)
  const notificationId = `notification-material-${material.id}`
  const existing = await db.notifications.get(notificationId)
  const now = new Date().toISOString()

  if (status === 'In Stock') {
    if (existing?.status === 'Active') {
      await db.notifications.update(notificationId, { status: 'Dismissed', ...(await syncMetaForLocalMutation(existing)), updatedAt: now })
    }
    return
  }

  const notification: Notification = {
    id: notificationId,
    type: status === 'Out' ? 'OutOfStock' : 'LowStock',
    status: 'Active',
    title: status === 'Out' ? `${material.name} is out` : `${material.name} is low`,
    description: `${material.quantity} ${material.unit} on hand. Minimum desired is ${material.minimumDesired}.`,
    materialId: material.id,
    ...(await syncMetaForLocalMutation(existing)),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  await db.notifications.put(notification)
}

async function syncMetaForLocalMutation(existing?: LocalRecordSyncMeta) {
  const session = await db.authSessionStates.get('local-session')
  const cloudLinked = Boolean(
    existing?.ownerUserId
      || existing?.workshopId
      || existing?.lastSyncedAt
      || existing?.syncStatus === 'synced'
      || existing?.syncStatus === 'pending'
      || existing?.syncStatus === 'conflict',
  )

  if (session?.status !== 'signed_in' && !cloudLinked) return {}

  const workshop = await db.workshopProfiles.get('local-workshop')
  return {
    ownerUserId: session?.userId ?? existing?.ownerUserId,
    workshopId: workshop?.workshopId ?? existing?.workshopId,
    localOnly: false,
    syncStatus: 'local' as const,
  }
}

async function findMasteryProgress(guideId: string, userToolId?: string) {
  const matches = await db.masteryProgress.where('guideId').equals(guideId).toArray()
  return matches.find((progress) => userToolId ? progress.userToolId === userToolId : !progress.userToolId) ?? matches[0]
}

function wishlistDuplicateKey(itemType: string, name: string, toolTypeId?: string, materialId?: string, catalogItemId?: string) {
  return [itemType, toolTypeId ?? '', materialId ?? '', catalogItemId ?? '', name.trim().toLowerCase()].join('|')
}

function localSyncMeta() {
  return { syncStatus: 'local' as const, localOnly: false }
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function isCatalogLibraryItem(tool?: ToolLibraryItem | ToolCatalogLibraryItem): tool is ToolCatalogLibraryItem {
  return Boolean(tool && 'internalToolTypeId' in tool && 'displayName' in tool && 'toolType' in tool)
}
