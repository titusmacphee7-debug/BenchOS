import type { BackupTableName } from '../../data/schema'

export const syncableWorkshopTables = [
  'userTools',
  'materials',
  'projects',
  'projectRequirements',
  'projectSteps',
  'projectActivity',
  'wishlistItems',
  'purchaseHistory',
  'toolUsageLogs',
  'materialUsageLogs',
  'maintenanceLogs',
  'masteryProgress',
  'xpEvents',
  'notifications',
  'userProfiles',
  'workshopProfiles',
  'toolBuyingPreferences',
] satisfies BackupTableName[]

export type SyncableWorkshopTableName = (typeof syncableWorkshopTables)[number]
