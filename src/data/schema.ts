export const SEED_VERSION = 'phase4-buy-sync-v1'

export type ToolCondition = 'New' | 'Good' | 'Used' | 'Fair' | 'Needs Repair' | 'Broken'
export type UsageLevel = 'Low' | 'Medium' | 'High'
export type PowerType = 'Manual' | 'Battery' | 'Corded' | 'Pneumatic' | 'Stationary' | 'Battery or Corded'
export type CatalogPowerType = PowerType
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced'
export type MaterialStockStatus = 'In Stock' | 'Low' | 'Out' | 'Reorder Soon'
export type ToolCapabilityStrength = 'primary' | 'secondary' | 'limited'
export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Blocked'
export type RequirementKind = 'ToolType' | 'Capability' | 'ToolCategory' | 'Material'
export type ReadinessStatus = 'Buildable Now' | 'Almost Buildable' | 'Missing Tools' | 'Missing Materials' | 'Blocked'
export type WishlistItemType = 'Tool' | 'Material' | 'Accessory'
export type WishlistPriority = 'High' | 'Medium' | 'Low'
export type WishlistStatus = 'Not Purchased' | 'Purchased' | 'Converted' | 'Archived'
export type ToolUsageType = 'Project' | 'Practice' | 'Maintenance' | 'General'
export type MaintenanceType = 'Cleaned' | 'Sharpened' | 'Calibrated' | 'Repaired' | 'Inspected' | 'Other'
export type MasteryStatus = 'Not Started' | 'In Progress' | 'Mastered'
export type MasteryGuideStepCategory = 'Overview' | 'Safety' | 'Setup' | 'Basic Use' | 'Common Mistakes' | 'Practice Task' | 'Maintenance'
export type XPSourceType = 'Guide' | 'ToolUse' | 'Project' | 'Maintenance' | 'MaterialUsage'
export type NotificationType = 'LowStock' | 'OutOfStock' | 'Maintenance' | 'Project'
export type NotificationStatus = 'Active' | 'Dismissed'
export type ToolPriorityLabel =
  | 'First Shop Essential'
  | 'Project Unlocker'
  | 'Safety Critical'
  | 'Consumable'
  | 'Accessory'
  | 'Upgrade Tool'
  | 'Specialty Tool'
  | 'Borrow/Rent Candidate'
  | 'Nice to Have'
  | 'Avoid Early'
export type ToolCostTier = 'budget' | 'balanced' | 'premium' | 'pro'
export type SyncStatus = 'local' | 'pending' | 'synced' | 'error' | 'conflict'
export type AuthSessionStatus = 'signed_in' | 'signed_out'
export type AuthProvider = 'auth0'
export type ToolImageSource = 'openverse' | 'wikimedia' | 'manual_url' | 'user_upload' | 'generated_placeholder' | 'category_placeholder'
export type ToolImageStatus =
  | 'auto_assigned'
  | 'fallback_placeholder'
  | 'user_uploaded'
  | 'manually_replaced'
  | 'flagged_bad_match'
  | 'removed'
export type ImageAuditIssueStatus = 'open' | 'resolved' | 'dismissed'
export type ProjectTemplateRequirementGroup = 'Tool' | 'Material' | 'Accessory' | 'Consumable' | 'Safety'
export type ProjectTemplateDifficulty = 'Easy' | 'Moderate' | 'Hard'
export type WorkshopType = 'woodworking' | 'home-repair' | 'automotive' | 'mixed'
export type WorkshopSpaceType = 'garage' | 'basement' | 'apartment' | 'shed' | 'mobile' | 'small-shop'
export type BuyingPreferenceBudget = ToolCostTier
export type ProductLinkSourceType = 'placeholder'
export type BackupTableName =
  | 'toolFamilies'
  | 'toolTypes'
  | 'toolVariants'
  | 'toolAliases'
  | 'brands'
  | 'batteryPlatforms'
  | 'toolCatalogItems'
  | 'toolCatalogSpecs'
  | 'toolCatalogSourceNotes'
  | 'toolImageCandidates'
  | 'toolImageAssignments'
  | 'imageAuditIssues'
  | 'capabilities'
  | 'toolTypeCapabilities'
  | 'toolAccessories'
  | 'toolConsumables'
  | 'toolCompatibilityRules'
  | 'toolGuideSections'
  | 'projectTemplates'
  | 'projectTemplateRequirements'
  | 'userProfiles'
  | 'workshopProfiles'
  | 'toolBuyingPreferences'
  | 'productLinks'
  | 'userTools'
  | 'materials'
  | 'projects'
  | 'projectRequirements'
  | 'projectSteps'
  | 'projectActivity'
  | 'wishlistItems'
  | 'purchaseHistory'
  | 'toolUsageLogs'
  | 'materialUsageLogs'
  | 'maintenanceLogs'
  | 'masteryGuides'
  | 'masteryProgress'
  | 'xpEvents'
  | 'notifications'
  | 'settings'

export type LocalRecordSyncMeta = {
  ownerUserId?: string
  workshopId?: string
  localOnly?: boolean
  syncStatus?: SyncStatus
  lastSyncedAt?: string
  deletedAt?: string
  syncError?: string
}

export type ToolFamily = {
  id: string
  name: string
  category: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type ToolType = {
  id: string
  name: string
  category: string
  familyId?: string
  description: string
  materials: string[]
  commonProjects: string[]
  powerType: PowerType
  skillLevel: SkillLevel
  safety: string[]
  createdAt: string
  updatedAt: string
}

export type ToolVariant = {
  id: string
  toolTypeId: string
  brand: string
  model: string
  name: string
  powerType?: PowerType
  batteryPlatform?: string
  createdAt: string
  updatedAt: string
}

export type Brand = {
  id: string
  name: string
  aliases: string[]
  websiteUrl?: string
  createdAt: string
  updatedAt: string
}

export type BatteryPlatform = {
  id: string
  brand: string
  name: string
  voltage?: string
  aliases: string[]
  createdAt: string
  updatedAt: string
}

export type ToolCatalogItem = {
  id: string
  internalToolTypeId: string
  familyId?: string
  brand: string
  model?: string
  displayName: string
  powerType: CatalogPowerType
  batteryPlatform?: string
  voltage?: string
  cordedOrCordless?: 'corded' | 'cordless' | 'manual' | 'stationary' | 'pneumatic'
  costTier?: ToolCostTier
  compatibilityTags: string[]
  priorityLabels: ToolPriorityLabel[]
  searchTags: string[]
  imageId?: string
  sourceNoteIds: string[]
  createdAt: string
  updatedAt: string
}

export type ToolCatalogSpecValue = string | number | boolean

export type ToolCatalogSpec = {
  id: string
  catalogItemId: string
  key: string
  label: string
  value: ToolCatalogSpecValue
  unit?: string
  createdAt: string
  updatedAt: string
}

export type ToolCatalogSourceNote = {
  id: string
  catalogItemId?: string
  sourceName: string
  sourceUrl?: string
  observedLabel: string
  observedCategory?: string
  normalizedToolTypeId?: string
  normalizedCatalogItemId?: string
  confidence: number
  notes?: string
  observedAt: string
  createdAt: string
}

export type ToolImageCandidate = {
  id: string
  catalogItemId: string
  source: Extract<ToolImageSource, 'openverse' | 'wikimedia' | 'manual_url' | 'user_upload'>
  imageUrl: string
  thumbnailUrl?: string
  originalUrl: string
  sourceImageId?: string
  title?: string
  authorName?: string
  authorUrl?: string
  licenseName?: string
  licenseUrl?: string
  attributionText?: string
  width?: number
  height?: number
  searchQuery: string
  confidenceScore: number
  metadata?: Record<string, string | number | boolean | undefined>
  createdAt: string
}

export type ToolImageAssignment = {
  id: string
  catalogItemId: string
  candidateId?: string
  source: ToolImageSource
  imageUrl?: string
  thumbnailUrl?: string
  originalUrl?: string
  sourceImageId?: string
  authorName?: string
  authorUrl?: string
  licenseName?: string
  licenseUrl?: string
  attributionText?: string
  searchQuery?: string
  confidenceScore: number
  status: ToolImageStatus
  assignedAt: string
  createdAt: string
  updatedAt: string
}

export type ImageAuditIssue = {
  id: string
  catalogItemId: string
  assignmentId?: string
  issueType: 'bad_match' | 'low_quality' | 'license_concern' | 'missing_image' | 'manual_review'
  status: ImageAuditIssueStatus
  notes?: string
  createdAt: string
  resolvedAt?: string
}

export type SourceInventoryObservation = {
  id: string
  sourceName: string
  sourceUrl: string
  observedLabel: string
  observedCategory?: string
  normalizedName?: string
  normalizedToolTypeId?: string
  includeCandidate: boolean
  exclusionReason?: string
  confidence: number
  observedAt: string
}

export type ToolAlias = {
  id: string
  toolTypeId: string
  alias: string
}

export type Capability = {
  id: string
  name: string
  description: string
  materials: string[]
  projectTypes: string[]
}

export type ToolTypeCapability = {
  id: string
  toolTypeId: string
  capabilityId: string
  strength: ToolCapabilityStrength
}

export type ToolAccessory = {
  id: string
  toolTypeId?: string
  catalogItemId?: string
  name: string
  category: string
  description?: string
  compatibilityTags: string[]
  requiredForProjectTypes: string[]
  priorityLabels: ToolPriorityLabel[]
  createdAt: string
  updatedAt: string
}

export type ToolConsumable = {
  id: string
  toolTypeId?: string
  catalogItemId?: string
  name: string
  category: string
  unit: string
  description?: string
  compatibilityTags: string[]
  createdAt: string
  updatedAt: string
}

export type ToolCompatibilityRule = {
  id: string
  sourceToolTypeId?: string
  sourceCatalogItemId?: string
  targetToolTypeId?: string
  targetCatalogItemId?: string
  tag: string
  ruleType: 'requires' | 'accepts' | 'prefers' | 'warns'
  description: string
  createdAt: string
  updatedAt: string
}

export type ToolGuideSection = {
  id: string
  toolTypeId: string
  title: string
  body: string
  sortOrder: number
  sectionType:
    | 'Overview'
    | 'Best Uses'
    | 'Safety First'
    | 'Setup'
    | 'How to Use'
    | 'Common Mistakes'
    | 'Compare Similar Tools'
    | 'Accessories + Consumables'
    | 'Maintenance'
    | 'Practice Task'
    | 'Projects'
    | 'Buy Notes'
  createdAt: string
  updatedAt: string
}

export type ProjectTemplate = {
  id: string
  name: string
  description: string
  category: string
  difficulty: ProjectTemplateDifficulty
  estimatedTime: string
  suggestedSkillLevel: SkillLevel
  tags: string[]
  steps: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export type ProjectTemplateRequirement = {
  id: string
  templateId: string
  requirementKind: RequirementKind
  group: ProjectTemplateRequirementGroup
  displayName: string
  required: boolean
  toolTypeId?: string
  capabilityId?: string
  category?: string
  quantity?: number
  unit?: string
  notes?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type AuthSessionState = {
  id: string
  status: AuthSessionStatus
  provider: AuthProvider
  userId?: string
  email?: string
  cloudBackupEnabled: boolean
  lastBackupAt?: string
  cloudSyncEnabled?: boolean
  lastSyncAt?: string
  syncStatus?: SyncStatus
  syncError?: string
  pendingSyncCount?: number
  conflictCount?: number
  updatedAt: string
}

export type UserProfile = LocalRecordSyncMeta & {
  id: string
  authUserId?: string
  displayName?: string
  email?: string
  avatarUrl?: string
  accountOnboardingCompletedAt?: string
  accountOnboardingVersion?: number
  createdAt: string
  updatedAt: string
}

export type WorkshopProfile = LocalRecordSyncMeta & {
  id: string
  ownerUserId?: string
  name: string
  type?: WorkshopType
  skillLevel?: SkillLevel
  spaceType?: WorkshopSpaceType
  projectInterests: string[]
  safetyPriorities: string[]
  cloudBackupEnabled: boolean
  lastBackupAt?: string
  cloudSyncEnabled?: boolean
  lastSyncAt?: string
  createdAt: string
  updatedAt: string
}

export type ToolBuyingPreferences = LocalRecordSyncMeta & {
  id: string
  preferredBrands: string[]
  avoidedBrands: string[]
  preferredBatteryPlatforms: string[]
  budgetTier: BuyingPreferenceBudget
  workshopType: WorkshopType | 'apartment' | 'budget'
  storageSensitivity: 'low' | 'medium' | 'high'
  noiseSensitivity: 'low' | 'medium' | 'high'
  dustSensitivity: 'low' | 'medium' | 'high'
  preferCordless: boolean
  createdAt: string
  updatedAt: string
}

export type AccountOnboardingFormValues = {
  displayName: string
  workshopName: string
  workshopType: WorkshopType
  skillLevel: SkillLevel
  spaceType: WorkshopSpaceType
  projectInterests: string[]
  safetyPriorities: string[]
  preferredBrands: string[]
  avoidedBrands: string[]
  preferredBatteryPlatforms: string[]
  budgetTier: BuyingPreferenceBudget
  storageSensitivity: 'low' | 'medium' | 'high'
  noiseSensitivity: 'low' | 'medium' | 'high'
  dustSensitivity: 'low' | 'medium' | 'high'
  preferCordless: boolean
}

export type ProductLink = {
  id: string
  catalogItemId?: string
  toolTypeId?: string
  label: string
  sourceType: ProductLinkSourceType
  url?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type CustomToolMapping = {
  id: string
  userToolId: string
  toolTypeId?: string
  category?: string
  familyId?: string
  capabilityIds: string[]
  compatibleAccessoryIds: string[]
  compatibleConsumableIds: string[]
  confidence: number
  createdAt: string
  updatedAt: string
}

export type CustomCapabilityMapping = {
  id: string
  userToolId: string
  capabilityId: string
  confidence: number
  createdAt: string
  updatedAt: string
}

export type UserTool = LocalRecordSyncMeta & {
  id: string
  toolTypeId?: string
  variantId?: string
  catalogItemId?: string
  customName?: string
  name: string
  type: string
  brand?: string
  model?: string
  category: string
  condition: ToolCondition
  storageLocation: string
  lastUsedAt?: string
  usageLevel: UsageLevel
  powerType: PowerType
  batteryPlatform?: string
  purchaseYear?: number
  purchasePrice?: number
  serialNumber?: string
  notes?: string
  repairNotes?: string
  archivedAt?: string
  createdAt: string
  updatedAt: string
}

export type Material = LocalRecordSyncMeta & {
  id: string
  name: string
  description?: string
  category: string
  quantity: number
  unit: string
  minimumDesired: number
  reorderPoint?: number
  storageLocation: string
  lastRestockedAt?: string
  estimatedUsageRate?: string
  notes?: string
  archivedAt?: string
  createdAt: string
  updatedAt: string
}

export type Setting = {
  key: string
  value: string
  updatedAt: string
}

export type Project = LocalRecordSyncMeta & {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  progress: number
  category?: string
  tags: string[]
  imageUrl?: string
  archivedAt?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type ProjectRequirement = LocalRecordSyncMeta & {
  id: string
  projectId: string
  requirementKind: RequirementKind
  displayName: string
  required: boolean
  toolTypeId?: string
  capabilityId?: string
  category?: string
  materialId?: string
  quantity?: number
  unit?: string
  notes?: string
  archivedAt?: string
  createdAt: string
  updatedAt: string
}

export type ProjectStep = LocalRecordSyncMeta & {
  id: string
  projectId: string
  title: string
  completed: boolean
  sortOrder: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export type ProjectActivity = LocalRecordSyncMeta & {
  id: string
  projectId: string
  title: string
  description: string
  createdAt: string
}

export type WishlistItem = LocalRecordSyncMeta & {
  id: string
  itemType: WishlistItemType
  name: string
  status: WishlistStatus
  priority: WishlistPriority
  linkedProjectId?: string
  toolTypeId?: string
  catalogItemId?: string
  materialId?: string
  quantity?: number
  unit?: string
  addedFor?: string
  notes?: string
  archivedAt?: string
  createdAt: string
  updatedAt: string
  purchasedAt?: string
  convertedAt?: string
}

export type PurchaseHistoryItem = LocalRecordSyncMeta & {
  id: string
  wishlistItemId: string
  itemType: WishlistItemType
  name: string
  quantity?: number
  unit?: string
  purchasedAt: string
  convertedAt?: string
  createdInventoryId?: string
}

export type ToolUsageLog = LocalRecordSyncMeta & {
  id: string
  userToolId: string
  projectId?: string
  usedAt: string
  durationMinutes?: number
  usageType: ToolUsageType
  notes?: string
  xpAwarded?: number
  createdAt: string
}

export type MaterialUsageLog = LocalRecordSyncMeta & {
  id: string
  materialId: string
  projectId?: string
  quantityUsed: number
  unit: string
  usedAt: string
  notes?: string
  xpAwarded?: number
  createdAt: string
}

export type MaintenanceLog = LocalRecordSyncMeta & {
  id: string
  userToolId: string
  maintenanceType: MaintenanceType
  performedAt: string
  notes?: string
  conditionAfter?: ToolCondition
  xpAwarded?: number
  createdAt: string
}

export type MasteryGuideStep = {
  id: string
  title: string
  category: MasteryGuideStepCategory
  description: string
  xp: number
  sortOrder: number
}

export type MasteryGuide = {
  id: string
  toolTypeId: string
  toolName: string
  category: string
  summary: string
  steps: MasteryGuideStep[]
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type MasteryProgress = LocalRecordSyncMeta & {
  id: string
  guideId: string
  toolTypeId: string
  userToolId?: string
  level: number
  xp: number
  xpToNextLevel: number
  status: MasteryStatus
  completedStepIds: string[]
  safetyProgress: number
  setupProgress: number
  operationProgress: number
  accuracyProgress: number
  maintenanceProgress: number
  lastPracticedAt?: string
  createdAt: string
  updatedAt: string
}

export type XPEvent = LocalRecordSyncMeta & {
  id: string
  sourceType: XPSourceType
  sourceId?: string
  xpAmount: number
  awardedAt: string
  description: string
  projectId?: string
  toolTypeId?: string
  userToolId?: string
  materialId?: string
}

export type Notification = LocalRecordSyncMeta & {
  id: string
  type: NotificationType
  status: NotificationStatus
  title: string
  description: string
  materialId?: string
  userToolId?: string
  projectId?: string
  createdAt: string
  updatedAt: string
}

export type MissingToolItem = {
  requirementId: string
  projectId: string
  requirementKind: Exclude<RequirementKind, 'Material'>
  name: string
  required: boolean
  toolTypeId?: string
  capabilityId?: string
  category?: string
  notes?: string
}

export type MissingMaterialItem = {
  requirementId: string
  projectId: string
  name: string
  required: boolean
  materialId?: string
  quantity?: number
  unit?: string
  onHand: number
  shortage: number
  notes?: string
}

export type ReadinessResult = {
  projectId: string
  status: ReadinessStatus
  missingTools: MissingToolItem[]
  missingMaterials: MissingMaterialItem[]
  optionalMissingTools: MissingToolItem[]
  optionalMissingMaterials: MissingMaterialItem[]
  cautions: string[]
}

export type GapKind = 'tool' | 'capability' | 'material' | 'accessory' | 'consumable' | 'safety' | 'repair' | 'compatibility'
export type GapSeverity = 'high' | 'medium' | 'low'

export type GapItem = {
  id: string
  kind: GapKind
  name: string
  description: string
  severity: GapSeverity
  category?: string
  toolTypeId?: string
  catalogItemId?: string
  capabilityId?: string
  materialId?: string
  quantity?: number
  unit?: string
  impactCount: number
  projectNames: string[]
  templateNames: string[]
  alreadyWishlisted?: boolean
  wishlistItemType?: WishlistItemType
}

export type ProjectBlockerSummary = {
  id: string
  name: string
  source: 'project' | 'template'
  status: ReadinessStatus | 'Almost Buildable' | 'Blocked'
  missingCount: number
  missingTools: string[]
  missingMaterials: string[]
  safetyGaps: string[]
  quickWin?: string
}

export type GapAnalysisResult = {
  generatedAt: string
  totalGaps: number
  blockedProjectCount: number
  quickWinCount: number
  safetyGapCount: number
  gaps: GapItem[]
  topGaps: GapItem[]
  quickWins: GapItem[]
  safetyGaps: GapItem[]
  repairGaps: GapItem[]
  compatibilityGaps: GapItem[]
  projectBlockers: ProjectBlockerSummary[]
  topMissingCapabilityCategories: Array<{ category: string; count: number; gapNames: string[] }>
}

export type WorkshopCapabilityScore = {
  category: string
  score: number
  ownedCoverage: number
  ownedCount: number
  requiredCount: number
  missingCapabilities: string[]
  missingTools: string[]
  affectedProjects: string[]
  affectedTemplates: string[]
  highestImpactGap?: GapItem
}

export type WorkshopScore = {
  score: number
  generatedAt: string
  breakdown: Array<{
    key: 'coverage' | 'readiness' | 'materials' | 'safety' | 'accessories' | 'condition'
    label: string
    score: number
    weight: number
    detail: string
  }>
  capabilityScores: WorkshopCapabilityScore[]
  repairWarnings: GapItem[]
  quickImprovements: GapItem[]
}

export type ToolLibraryItem = ToolType & {
  aliases: string[]
  capabilities: Capability[]
  variants: ToolVariant[]
}

export type ToolCatalogLibraryItem = ToolCatalogItem & {
  toolType: ToolType
  aliases: string[]
  capabilities: Capability[]
  specs: ToolCatalogSpec[]
  sourceNotes: ToolCatalogSourceNote[]
  imageAssignment?: ToolImageAssignment
}

export type UserToolFormValues = {
  toolTypeId?: string
  variantId?: string
  catalogItemId?: string
  customName?: string
  name: string
  type: string
  brand?: string
  model?: string
  category: string
  condition: ToolCondition
  storageLocation: string
  powerType: PowerType
  batteryPlatform?: string
  purchaseYear?: number
  notes?: string
  repairNotes?: string
}

export type MaterialFormValues = {
  name: string
  description?: string
  category: string
  quantity: number
  unit: string
  minimumDesired: number
  storageLocation: string
  lastRestockedAt?: string
  estimatedUsageRate?: string
  notes?: string
}

export type ProjectFormValues = {
  name: string
  description?: string
  status: ProjectStatus
  progress: number
  category?: string
  tagsText?: string
}

export type ProjectRequirementFormValues = {
  requirementKind: RequirementKind
  displayName: string
  required: boolean
  toolTypeId?: string
  capabilityId?: string
  category?: string
  materialId?: string
  quantity?: number
  unit?: string
  notes?: string
}

export type WishlistItemFormValues = {
  itemType: WishlistItemType
  name: string
  status: WishlistStatus
  priority: WishlistPriority
  linkedProjectId?: string
  toolTypeId?: string
  catalogItemId?: string
  materialId?: string
  quantity?: number
  unit?: string
  addedFor?: string
  notes?: string
}

export type WishlistToolConversionValues = UserToolFormValues

export type WishlistMaterialConversionValues = MaterialFormValues & {
  existingMaterialId?: string
}

export type ToolUsageFormValues = {
  userToolId: string
  projectId?: string
  usedAt: string
  durationMinutes?: number
  usageType: ToolUsageType
  notes?: string
}

export type MaterialUsageFormValues = {
  materialId: string
  projectId?: string
  quantityUsed: number
  unit: string
  usedAt: string
  notes?: string
}

export type MaintenanceFormValues = {
  userToolId: string
  maintenanceType: MaintenanceType
  performedAt: string
  notes?: string
  conditionAfter?: ToolCondition
}

export type RecentActivityItem = {
  id: string
  title: string
  description: string
  timestamp: string
  tone: 'orange' | 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'muted'
}

export type BenchOsBackup = {
  appName: 'BenchOS'
  schemaVersion: 3 | 4 | 5 | 6
  exportedAt: string
  backupVersion: 1
  tables: Record<BackupTableName, unknown[]>
}

export type ImportResult = {
  importedAt: string
  tableCounts: Record<BackupTableName, number>
}

export const toolConditions: ToolCondition[] = ['New', 'Good', 'Used', 'Fair', 'Needs Repair', 'Broken']
export const usageLevels: UsageLevel[] = ['Low', 'Medium', 'High']
export const powerTypes: PowerType[] = ['Manual', 'Battery', 'Corded', 'Pneumatic', 'Stationary', 'Battery or Corded']
export const skillLevels: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced']
export const projectStatuses: ProjectStatus[] = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Blocked']
export const requirementKinds: RequirementKind[] = ['ToolType', 'Capability', 'ToolCategory', 'Material']
export const wishlistItemTypes: WishlistItemType[] = ['Tool', 'Material', 'Accessory']
export const wishlistPriorities: WishlistPriority[] = ['High', 'Medium', 'Low']
export const wishlistStatuses: WishlistStatus[] = ['Not Purchased', 'Purchased', 'Converted', 'Archived']
export const buyingPreferenceBudgets: BuyingPreferenceBudget[] = ['budget', 'balanced', 'premium', 'pro']
export const workshopSpaceTypes: WorkshopSpaceType[] = ['garage', 'basement', 'apartment', 'shed', 'mobile', 'small-shop']
export const accountOnboardingVersion = 1
export const toolUsageTypes: ToolUsageType[] = ['Project', 'Practice', 'Maintenance', 'General']
export const maintenanceTypes: MaintenanceType[] = ['Cleaned', 'Sharpened', 'Calibrated', 'Repaired', 'Inspected', 'Other']
export const masteryStatuses: MasteryStatus[] = ['Not Started', 'In Progress', 'Mastered']
export const notificationStatuses: NotificationStatus[] = ['Active', 'Dismissed']

export const toolCategories = [
  'Cutting',
  'Drilling',
  'Fastening',
  'Sanding',
  'Measuring',
  'Layout',
  'Clamping',
  'Routing',
  'Planing',
  'Chiseling',
  'Joinery',
  'Finishing',
  'Safety',
  'Dust Collection',
  'Workbench / Holding',
  'Sharpening',
  'Shop Equipment',
  'Electrical',
  'Plumbing',
  'Outdoor / Yard',
  'Automotive',
]
