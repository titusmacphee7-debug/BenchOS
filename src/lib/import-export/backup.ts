import type { Table } from 'dexie'
import { db, type BenchOsDatabase } from '../../data/db'
import type { BackupTableName, BenchOsBackup, ImportResult, Setting } from '../../data/schema'
import { ensureDatabaseSeeded } from '../../data/seed/seedDatabase'

export const backupTableNames: BackupTableName[] = [
  'toolFamilies',
  'toolTypes',
  'toolVariants',
  'toolAliases',
  'brands',
  'batteryPlatforms',
  'toolCatalogItems',
  'toolCatalogSpecs',
  'toolCatalogSourceNotes',
  'toolImageCandidates',
  'toolImageAssignments',
  'imageAuditIssues',
  'capabilities',
  'toolTypeCapabilities',
  'toolAccessories',
  'toolConsumables',
  'toolCompatibilityRules',
  'toolGuideSections',
  'projectTemplates',
  'projectTemplateRequirements',
  'userProfiles',
  'workshopProfiles',
  'toolBuyingPreferences',
  'productLinks',
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
  'masteryGuides',
  'masteryProgress',
  'xpEvents',
  'notifications',
  'settings',
]

const v5BackupTableNames = [
  'toolFamilies',
  'toolTypes',
  'toolVariants',
  'toolAliases',
  'brands',
  'batteryPlatforms',
  'toolCatalogItems',
  'toolCatalogSpecs',
  'toolCatalogSourceNotes',
  'toolImageCandidates',
  'toolImageAssignments',
  'imageAuditIssues',
  'capabilities',
  'toolTypeCapabilities',
  'toolAccessories',
  'toolConsumables',
  'toolCompatibilityRules',
  'toolGuideSections',
  'projectTemplates',
  'projectTemplateRequirements',
  'userProfiles',
  'workshopProfiles',
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
  'masteryGuides',
  'masteryProgress',
  'xpEvents',
  'notifications',
  'settings',
] as const

const v4BackupTableNames = [
  'toolFamilies',
  'toolTypes',
  'toolVariants',
  'toolAliases',
  'brands',
  'batteryPlatforms',
  'toolCatalogItems',
  'toolCatalogSpecs',
  'toolCatalogSourceNotes',
  'capabilities',
  'toolTypeCapabilities',
  'toolAccessories',
  'toolConsumables',
  'toolCompatibilityRules',
  'toolGuideSections',
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
  'masteryGuides',
  'masteryProgress',
  'xpEvents',
  'notifications',
  'settings',
] as const

const v3BackupTableNames = [
  'toolTypes',
  'toolVariants',
  'toolAliases',
  'capabilities',
  'toolTypeCapabilities',
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
  'masteryGuides',
  'masteryProgress',
  'xpEvents',
  'notifications',
  'settings',
] as const

export const workshopTableNames: BackupTableName[] = [
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
  'toolBuyingPreferences',
]

export async function exportBenchOsBackup(database: BenchOsDatabase = db): Promise<BenchOsBackup> {
  const tables = Object.fromEntries(
    await Promise.all(backupTableNames.map(async (name) => [name, await table(database, name).toArray()])),
  ) as BenchOsBackup['tables']

  const now = new Date().toISOString()
  await database.settings.put({ key: 'lastBackupAt', value: now, updatedAt: now })
  await database.settings.put({ key: 'backupVersion', value: '1', updatedAt: now })

  return {
    appName: 'BenchOS',
    schemaVersion: 6,
    backupVersion: 1,
    exportedAt: now,
    tables: {
      ...tables,
      settings: await database.settings.toArray(),
    },
  }
}

export function validateBenchOsBackup(value: unknown): value is BenchOsBackup {
  if (!value || typeof value !== 'object') return false
  const backup = value as Partial<BenchOsBackup>
  if (backup.appName !== 'BenchOS' || backup.backupVersion !== 1) return false
  if (!backup.tables || typeof backup.tables !== 'object') return false
  if (backup.schemaVersion === 6) return backupTableNames.every((name) => Array.isArray(backup.tables?.[name]))
  if (backup.schemaVersion === 5) return v5BackupTableNames.every((name) => Array.isArray(backup.tables?.[name]))
  if (backup.schemaVersion === 4) return v4BackupTableNames.every((name) => Array.isArray(backup.tables?.[name]))
  if (backup.schemaVersion === 3) return v3BackupTableNames.every((name) => Array.isArray(backup.tables?.[name]))
  return false
}

export async function importBenchOsBackup(backup: unknown, database: BenchOsDatabase = db): Promise<ImportResult> {
  if (!validateBenchOsBackup(backup)) {
    throw new Error('This file is not a valid BenchOS backup.')
  }

  const tableCounts = Object.fromEntries(backupTableNames.map((name) => [name, (backup.tables[name] ?? []).length])) as ImportResult['tableCounts']
  const importedAt = new Date().toISOString()

  await database.transaction('rw', backupTableNames.map((name) => table(database, name)), async () => {
    for (const name of backupTableNames) {
      const currentTable = table(database, name)
      await currentTable.clear()
      const rows = backup.tables[name] ?? []
      if (rows.length > 0) await currentTable.bulkPut(rows)
    }
    await database.settings.put({ key: 'onboardingComplete', value: 'true', updatedAt: importedAt })
    await database.settings.put({ key: 'lastImportedAt', value: importedAt, updatedAt: importedAt })
  })

  return { importedAt, tableCounts }
}

export async function clearWorkshopData(database: BenchOsDatabase = db) {
  const now = new Date().toISOString()
  await database.transaction('rw', [...workshopTableNames.map((name) => table(database, name)), database.settings], async () => {
    for (const name of workshopTableNames) await table(database, name).clear()
    await markOnboardingComplete(database, now)
  })
}

export async function clearAllLocalData(database: BenchOsDatabase = db) {
  const now = new Date().toISOString()
  await database.transaction('rw', backupTableNames.map((name) => table(database, name)), async () => {
    for (const name of backupTableNames) await table(database, name).clear()
  })
  await ensureDatabaseSeeded(database, { includeSampleData: false, force: true })
  await markOnboardingComplete(database, now)
}

export async function resetSampleData(database: BenchOsDatabase = db) {
  const now = new Date().toISOString()
  await clearWorkshopData(database)
  await database.settings.delete('seedVersion')
  await ensureDatabaseSeeded(database, { includeSampleData: true, force: true })
  await markOnboardingComplete(database, now)
}

export async function markOnboardingComplete(database: BenchOsDatabase = db, timestamp = new Date().toISOString()) {
  const settings: Setting[] = [
    { key: 'onboardingComplete', value: 'true', updatedAt: timestamp },
    { key: 'needsOnboarding', value: 'false', updatedAt: timestamp },
  ]
  await database.settings.bulkPut(settings)
}

export async function getTableCounts(database: BenchOsDatabase = db) {
  return Object.fromEntries(await Promise.all(backupTableNames.map(async (name) => [name, await table(database, name).count()]))) as Record<BackupTableName, number>
}

function table(database: BenchOsDatabase, name: BackupTableName): Table<unknown, string> {
  return database.table(name) as Table<unknown, string>
}
