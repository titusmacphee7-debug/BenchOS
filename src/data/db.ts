import Dexie, { type Table } from 'dexie'
import type {
  AuthSessionState,
  BatteryPlatform,
  Brand,
  Capability,
  ImageAuditIssue,
  Material,
  MaterialUsageLog,
  MaintenanceLog,
  MasteryGuide,
  MasteryProgress,
  Notification,
  Project,
  ProjectActivity,
  ProjectRequirement,
  ProjectStep,
  ProjectTemplate,
  ProjectTemplateRequirement,
  ProductLink,
  PurchaseHistoryItem,
  Setting,
  ToolBuyingPreferences,
  ToolAlias,
  ToolAccessory,
  ToolCatalogItem,
  ToolImageAssignment,
  ToolImageCandidate,
  ToolCatalogSourceNote,
  ToolCatalogSpec,
  ToolCompatibilityRule,
  ToolConsumable,
  ToolFamily,
  ToolGuideSection,
  ToolType,
  ToolTypeCapability,
  ToolVariant,
  ToolUsageLog,
  UserTool,
  UserProfile,
  WorkshopProfile,
  WishlistItem,
  XPEvent,
} from './schema'

export class BenchOsDatabase extends Dexie {
  toolFamilies!: Table<ToolFamily, string>
  toolTypes!: Table<ToolType, string>
  toolVariants!: Table<ToolVariant, string>
  toolAliases!: Table<ToolAlias, string>
  brands!: Table<Brand, string>
  batteryPlatforms!: Table<BatteryPlatform, string>
  toolCatalogItems!: Table<ToolCatalogItem, string>
  toolCatalogSpecs!: Table<ToolCatalogSpec, string>
  toolCatalogSourceNotes!: Table<ToolCatalogSourceNote, string>
  toolImageCandidates!: Table<ToolImageCandidate, string>
  toolImageAssignments!: Table<ToolImageAssignment, string>
  imageAuditIssues!: Table<ImageAuditIssue, string>
  capabilities!: Table<Capability, string>
  toolTypeCapabilities!: Table<ToolTypeCapability, string>
  toolAccessories!: Table<ToolAccessory, string>
  toolConsumables!: Table<ToolConsumable, string>
  toolCompatibilityRules!: Table<ToolCompatibilityRule, string>
  toolGuideSections!: Table<ToolGuideSection, string>
  projectTemplates!: Table<ProjectTemplate, string>
  projectTemplateRequirements!: Table<ProjectTemplateRequirement, string>
  userProfiles!: Table<UserProfile, string>
  workshopProfiles!: Table<WorkshopProfile, string>
  toolBuyingPreferences!: Table<ToolBuyingPreferences, string>
  productLinks!: Table<ProductLink, string>
  userTools!: Table<UserTool, string>
  materials!: Table<Material, string>
  projects!: Table<Project, string>
  projectRequirements!: Table<ProjectRequirement, string>
  projectSteps!: Table<ProjectStep, string>
  projectActivity!: Table<ProjectActivity, string>
  wishlistItems!: Table<WishlistItem, string>
  purchaseHistory!: Table<PurchaseHistoryItem, string>
  toolUsageLogs!: Table<ToolUsageLog, string>
  materialUsageLogs!: Table<MaterialUsageLog, string>
  maintenanceLogs!: Table<MaintenanceLog, string>
  masteryGuides!: Table<MasteryGuide, string>
  masteryProgress!: Table<MasteryProgress, string>
  xpEvents!: Table<XPEvent, string>
  notifications!: Table<Notification, string>
  authSessionStates!: Table<AuthSessionState, string>
  settings!: Table<Setting, string>

  constructor(name = 'benchos') {
    super(name)

    this.version(1).stores({
      toolTypes: 'id, name, category, skillLevel, powerType',
      toolVariants: 'id, toolTypeId, brand, model, name',
      toolAliases: 'id, toolTypeId, alias',
      capabilities: 'id, name',
      toolTypeCapabilities: 'id, toolTypeId, capabilityId',
      userTools: 'id, toolTypeId, variantId, name, category, brand, condition, powerType, batteryPlatform, storageLocation, archivedAt',
      materials: 'id, name, category, unit, storageLocation, archivedAt',
      settings: 'key',
    })

    this.version(2).stores({
      toolTypes: 'id, name, category, skillLevel, powerType',
      toolVariants: 'id, toolTypeId, brand, model, name',
      toolAliases: 'id, toolTypeId, alias',
      capabilities: 'id, name',
      toolTypeCapabilities: 'id, toolTypeId, capabilityId',
      userTools: 'id, toolTypeId, variantId, name, category, brand, condition, powerType, batteryPlatform, storageLocation, archivedAt',
      materials: 'id, name, category, unit, storageLocation, archivedAt',
      projects: 'id, name, status, category, archivedAt, updatedAt',
      projectRequirements: 'id, projectId, requirementKind, toolTypeId, capabilityId, materialId, archivedAt',
      projectSteps: 'id, projectId, sortOrder',
      projectActivity: 'id, projectId, createdAt',
      wishlistItems: 'id, itemType, status, priority, linkedProjectId, toolTypeId, materialId, archivedAt',
      purchaseHistory: 'id, wishlistItemId, itemType, purchasedAt',
      settings: 'key',
    })

    this.version(3).stores({
      toolTypes: 'id, name, category, skillLevel, powerType',
      toolVariants: 'id, toolTypeId, brand, model, name',
      toolAliases: 'id, toolTypeId, alias',
      capabilities: 'id, name',
      toolTypeCapabilities: 'id, toolTypeId, capabilityId',
      userTools: 'id, toolTypeId, variantId, name, category, brand, condition, powerType, batteryPlatform, storageLocation, archivedAt',
      materials: 'id, name, category, unit, storageLocation, archivedAt',
      projects: 'id, name, status, category, archivedAt, updatedAt',
      projectRequirements: 'id, projectId, requirementKind, toolTypeId, capabilityId, materialId, archivedAt',
      projectSteps: 'id, projectId, sortOrder',
      projectActivity: 'id, projectId, createdAt',
      wishlistItems: 'id, itemType, status, priority, linkedProjectId, toolTypeId, materialId, archivedAt',
      purchaseHistory: 'id, wishlistItemId, itemType, purchasedAt',
      toolUsageLogs: 'id, userToolId, projectId, usedAt, usageType',
      materialUsageLogs: 'id, materialId, projectId, usedAt',
      maintenanceLogs: 'id, userToolId, maintenanceType, performedAt',
      masteryGuides: 'id, toolTypeId, toolName, category, sortOrder',
      masteryProgress: 'id, guideId, toolTypeId, userToolId, status, lastPracticedAt',
      xpEvents: 'id, sourceType, sourceId, awardedAt, projectId, userToolId, materialId, toolTypeId',
      notifications: 'id, type, status, materialId, userToolId, projectId, updatedAt',
      settings: 'key',
    })

    this.version(4).stores({
      toolFamilies: 'id, name, category',
      toolTypes: 'id, name, category, familyId, skillLevel, powerType',
      toolVariants: 'id, toolTypeId, brand, model, name',
      toolAliases: 'id, toolTypeId, alias',
      brands: 'id, name',
      batteryPlatforms: 'id, brand, name, voltage',
      toolCatalogItems: 'id, internalToolTypeId, familyId, brand, model, displayName, powerType, batteryPlatform, voltage, costTier',
      toolCatalogSpecs: 'id, catalogItemId, key',
      toolCatalogSourceNotes: 'id, catalogItemId, sourceName, normalizedToolTypeId, normalizedCatalogItemId',
      capabilities: 'id, name',
      toolTypeCapabilities: 'id, toolTypeId, capabilityId',
      toolAccessories: 'id, toolTypeId, catalogItemId, name, category',
      toolConsumables: 'id, toolTypeId, catalogItemId, name, category',
      toolCompatibilityRules: 'id, sourceToolTypeId, sourceCatalogItemId, targetToolTypeId, targetCatalogItemId, tag, ruleType',
      toolGuideSections: 'id, toolTypeId, sortOrder, sectionType',
      userTools: 'id, toolTypeId, variantId, catalogItemId, name, category, brand, condition, powerType, batteryPlatform, storageLocation, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt',
      materials: 'id, name, category, unit, storageLocation, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt',
      projects: 'id, name, status, category, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt, updatedAt',
      projectRequirements: 'id, projectId, requirementKind, toolTypeId, capabilityId, materialId, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt',
      projectSteps: 'id, projectId, sortOrder, ownerUserId, workshopId, syncStatus, deletedAt',
      projectActivity: 'id, projectId, createdAt, ownerUserId, workshopId, syncStatus, deletedAt',
      wishlistItems: 'id, itemType, status, priority, linkedProjectId, toolTypeId, catalogItemId, materialId, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt',
      purchaseHistory: 'id, wishlistItemId, itemType, purchasedAt, ownerUserId, workshopId, syncStatus, deletedAt',
      toolUsageLogs: 'id, userToolId, projectId, usedAt, usageType, ownerUserId, workshopId, syncStatus, deletedAt',
      materialUsageLogs: 'id, materialId, projectId, usedAt, ownerUserId, workshopId, syncStatus, deletedAt',
      maintenanceLogs: 'id, userToolId, maintenanceType, performedAt, ownerUserId, workshopId, syncStatus, deletedAt',
      masteryGuides: 'id, toolTypeId, toolName, category, sortOrder',
      masteryProgress: 'id, guideId, toolTypeId, userToolId, status, ownerUserId, workshopId, syncStatus, deletedAt, lastPracticedAt',
      xpEvents: 'id, sourceType, sourceId, awardedAt, projectId, userToolId, materialId, toolTypeId, ownerUserId, workshopId, syncStatus, deletedAt',
      notifications: 'id, type, status, materialId, userToolId, projectId, ownerUserId, workshopId, syncStatus, deletedAt, updatedAt',
      authSessionStates: 'id, status, provider, userId, email, updatedAt',
      settings: 'key',
    })

    this.version(5).stores({
      toolFamilies: 'id, name, category',
      toolTypes: 'id, name, category, familyId, skillLevel, powerType',
      toolVariants: 'id, toolTypeId, brand, model, name',
      toolAliases: 'id, toolTypeId, alias',
      brands: 'id, name',
      batteryPlatforms: 'id, brand, name, voltage',
      toolCatalogItems: 'id, internalToolTypeId, familyId, brand, model, displayName, powerType, batteryPlatform, voltage, costTier, imageId',
      toolCatalogSpecs: 'id, catalogItemId, key',
      toolCatalogSourceNotes: 'id, catalogItemId, sourceName, normalizedToolTypeId, normalizedCatalogItemId',
      toolImageCandidates: 'id, catalogItemId, source, sourceImageId, confidenceScore, createdAt',
      toolImageAssignments: 'id, catalogItemId, candidateId, source, status, confidenceScore, assignedAt, updatedAt',
      imageAuditIssues: 'id, catalogItemId, assignmentId, issueType, status, createdAt',
      capabilities: 'id, name',
      toolTypeCapabilities: 'id, toolTypeId, capabilityId',
      toolAccessories: 'id, toolTypeId, catalogItemId, name, category',
      toolConsumables: 'id, toolTypeId, catalogItemId, name, category',
      toolCompatibilityRules: 'id, sourceToolTypeId, sourceCatalogItemId, targetToolTypeId, targetCatalogItemId, tag, ruleType',
      toolGuideSections: 'id, toolTypeId, sortOrder, sectionType',
      projectTemplates: 'id, name, category, difficulty, suggestedSkillLevel',
      projectTemplateRequirements: 'id, templateId, requirementKind, group, toolTypeId, capabilityId, category, sortOrder',
      userProfiles: 'id, authUserId, email, ownerUserId, workshopId, syncStatus, deletedAt',
      workshopProfiles: 'id, ownerUserId, name, type, cloudBackupEnabled, syncStatus, deletedAt',
      userTools: 'id, toolTypeId, variantId, catalogItemId, name, category, brand, condition, powerType, batteryPlatform, storageLocation, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt',
      materials: 'id, name, category, unit, storageLocation, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt',
      projects: 'id, name, status, category, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt, updatedAt',
      projectRequirements: 'id, projectId, requirementKind, toolTypeId, capabilityId, materialId, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt',
      projectSteps: 'id, projectId, sortOrder, ownerUserId, workshopId, syncStatus, deletedAt',
      projectActivity: 'id, projectId, createdAt, ownerUserId, workshopId, syncStatus, deletedAt',
      wishlistItems: 'id, itemType, status, priority, linkedProjectId, toolTypeId, catalogItemId, materialId, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt',
      purchaseHistory: 'id, wishlistItemId, itemType, purchasedAt, ownerUserId, workshopId, syncStatus, deletedAt',
      toolUsageLogs: 'id, userToolId, projectId, usedAt, usageType, ownerUserId, workshopId, syncStatus, deletedAt',
      materialUsageLogs: 'id, materialId, projectId, usedAt, ownerUserId, workshopId, syncStatus, deletedAt',
      maintenanceLogs: 'id, userToolId, maintenanceType, performedAt, ownerUserId, workshopId, syncStatus, deletedAt',
      masteryGuides: 'id, toolTypeId, toolName, category, sortOrder',
      masteryProgress: 'id, guideId, toolTypeId, userToolId, status, ownerUserId, workshopId, syncStatus, deletedAt, lastPracticedAt',
      xpEvents: 'id, sourceType, sourceId, awardedAt, projectId, userToolId, materialId, toolTypeId, ownerUserId, workshopId, syncStatus, deletedAt',
      notifications: 'id, type, status, materialId, userToolId, projectId, ownerUserId, workshopId, syncStatus, deletedAt, updatedAt',
      authSessionStates: 'id, status, provider, userId, email, updatedAt',
      settings: 'key',
    })

    this.version(6).stores({
      toolFamilies: 'id, name, category',
      toolTypes: 'id, name, category, familyId, skillLevel, powerType',
      toolVariants: 'id, toolTypeId, brand, model, name',
      toolAliases: 'id, toolTypeId, alias',
      brands: 'id, name',
      batteryPlatforms: 'id, brand, name, voltage',
      toolCatalogItems: 'id, internalToolTypeId, familyId, brand, model, displayName, powerType, batteryPlatform, voltage, costTier, imageId',
      toolCatalogSpecs: 'id, catalogItemId, key',
      toolCatalogSourceNotes: 'id, catalogItemId, sourceName, normalizedToolTypeId, normalizedCatalogItemId',
      toolImageCandidates: 'id, catalogItemId, source, sourceImageId, confidenceScore, createdAt',
      toolImageAssignments: 'id, catalogItemId, candidateId, source, status, confidenceScore, assignedAt, updatedAt',
      imageAuditIssues: 'id, catalogItemId, assignmentId, issueType, status, createdAt',
      capabilities: 'id, name',
      toolTypeCapabilities: 'id, toolTypeId, capabilityId',
      toolAccessories: 'id, toolTypeId, catalogItemId, name, category',
      toolConsumables: 'id, toolTypeId, catalogItemId, name, category',
      toolCompatibilityRules: 'id, sourceToolTypeId, sourceCatalogItemId, targetToolTypeId, targetCatalogItemId, tag, ruleType',
      toolGuideSections: 'id, toolTypeId, sortOrder, sectionType',
      projectTemplates: 'id, name, category, difficulty, suggestedSkillLevel',
      projectTemplateRequirements: 'id, templateId, requirementKind, group, toolTypeId, capabilityId, category, sortOrder',
      userProfiles: 'id, authUserId, email, ownerUserId, workshopId, syncStatus, deletedAt',
      workshopProfiles: 'id, ownerUserId, name, type, cloudBackupEnabled, cloudSyncEnabled, syncStatus, deletedAt',
      toolBuyingPreferences: 'id, ownerUserId, workshopId, syncStatus, deletedAt, updatedAt',
      productLinks: 'id, catalogItemId, toolTypeId, sourceType',
      userTools: 'id, toolTypeId, variantId, catalogItemId, name, category, brand, condition, powerType, batteryPlatform, storageLocation, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt',
      materials: 'id, name, category, unit, storageLocation, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt',
      projects: 'id, name, status, category, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt, updatedAt',
      projectRequirements: 'id, projectId, requirementKind, toolTypeId, capabilityId, materialId, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt',
      projectSteps: 'id, projectId, sortOrder, ownerUserId, workshopId, syncStatus, deletedAt',
      projectActivity: 'id, projectId, createdAt, ownerUserId, workshopId, syncStatus, deletedAt',
      wishlistItems: 'id, itemType, status, priority, linkedProjectId, toolTypeId, catalogItemId, materialId, ownerUserId, workshopId, syncStatus, archivedAt, deletedAt',
      purchaseHistory: 'id, wishlistItemId, itemType, purchasedAt, ownerUserId, workshopId, syncStatus, deletedAt',
      toolUsageLogs: 'id, userToolId, projectId, usedAt, usageType, ownerUserId, workshopId, syncStatus, deletedAt',
      materialUsageLogs: 'id, materialId, projectId, usedAt, ownerUserId, workshopId, syncStatus, deletedAt',
      maintenanceLogs: 'id, userToolId, maintenanceType, performedAt, ownerUserId, workshopId, syncStatus, deletedAt',
      masteryGuides: 'id, toolTypeId, toolName, category, sortOrder',
      masteryProgress: 'id, guideId, toolTypeId, userToolId, status, ownerUserId, workshopId, syncStatus, deletedAt, lastPracticedAt',
      xpEvents: 'id, sourceType, sourceId, awardedAt, projectId, userToolId, materialId, toolTypeId, ownerUserId, workshopId, syncStatus, deletedAt',
      notifications: 'id, type, status, materialId, userToolId, projectId, ownerUserId, workshopId, syncStatus, deletedAt, updatedAt',
      authSessionStates: 'id, status, provider, userId, email, syncStatus, updatedAt',
      settings: 'key',
    })
  }
}

export const db = new BenchOsDatabase()
