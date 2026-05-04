import { describe, expect, it } from 'vitest'
import { BenchOsDatabase } from '../../data/db'
import { ensureDatabaseSeeded } from '../../data/seed/seedDatabase'
import { clearWorkshopData, exportBenchOsBackup, importBenchOsBackup, validateBenchOsBackup } from './backup'
import { escapeCsvValue, rowsToCsv } from './csv'

describe('BenchOS import/export', () => {
  it('exports every table with backup metadata', async () => {
    const database = new BenchOsDatabase(`benchos-export-${crypto.randomUUID()}`)
    try {
      await ensureDatabaseSeeded(database)
      const backup = await exportBenchOsBackup(database)

      expect(backup.appName).toBe('BenchOS')
      expect(backup.schemaVersion).toBe(6)
      expect(backup.backupVersion).toBe(1)
      expect(backup.tables.toolTypes.length).toBeGreaterThanOrEqual(170)
      expect(backup.tables.toolCatalogItems.length).toBeGreaterThan(0)
      expect(backup.tables.toolAccessories.length).toBeGreaterThan(0)
      expect(backup.tables.toolConsumables.length).toBeGreaterThan(0)
      expect(backup.tables.projectTemplates.length).toBeGreaterThanOrEqual(30)
      expect(backup.tables.projectTemplateRequirements.length).toBeGreaterThan(0)
      expect(backup.tables.toolGuideSections.length).toBeGreaterThanOrEqual(200)
      expect(backup.tables.workshopProfiles.length).toBe(1)
      expect(backup.tables.toolBuyingPreferences.length).toBe(1)
      expect(backup.tables.settings.length).toBeGreaterThan(0)
      expect(validateBenchOsBackup(backup)).toBe(true)
    } finally {
      database.close()
      await database.delete()
    }
  })

  it('does not clear existing data when import validation fails', async () => {
    const database = new BenchOsDatabase(`benchos-invalid-import-${crypto.randomUUID()}`)
    try {
      await ensureDatabaseSeeded(database)
      const before = await database.userTools.count()

      await expect(importBenchOsBackup({ nope: true }, database)).rejects.toThrow('valid BenchOS backup')

      expect(await database.userTools.count()).toBe(before)
    } finally {
      database.close()
      await database.delete()
    }
  })

  it('round-trips seeded data through a JSON backup', async () => {
    const source = new BenchOsDatabase(`benchos-source-${crypto.randomUUID()}`)
    const target = new BenchOsDatabase(`benchos-target-${crypto.randomUUID()}`)
    try {
      await ensureDatabaseSeeded(source)
      const backup = await exportBenchOsBackup(source)
      const result = await importBenchOsBackup(backup, target)

      expect(result.tableCounts.toolTypes).toBeGreaterThanOrEqual(170)
      expect(result.tableCounts.toolCatalogItems).toBeGreaterThan(0)
      expect(result.tableCounts.projectTemplates).toBeGreaterThanOrEqual(30)
      expect(await target.toolTypes.count()).toBe(await source.toolTypes.count())
      expect(await target.toolCatalogItems.count()).toBe(await source.toolCatalogItems.count())
      expect(await target.projectTemplates.count()).toBe(await source.projectTemplates.count())
      expect(await target.projects.count()).toBe(await source.projects.count())
      expect((await target.settings.get('onboardingComplete'))?.value).toBe('true')
    } finally {
      source.close()
      target.close()
      await source.delete()
      await target.delete()
    }
  })

  it('exports CSV with safe quoting', () => {
    expect(escapeCsvValue('A "quoted", multiline\nvalue')).toBe('"A ""quoted"", multiline\nvalue"')
    expect(escapeCsvValue('=cmd|/C calc!A0')).toBe("'=cmd|/C calc!A0")
    expect(escapeCsvValue('+SUM(A1:A2)')).toBe("'+SUM(A1:A2)")
    expect(escapeCsvValue('@HYPERLINK("https://example.com")')).toBe('"\'@HYPERLINK(""https://example.com"")"')
    expect(rowsToCsv([{ Name: 'Plywood, Birch', Notes: '4 "x" 8' }])).toBe('Name,Notes\n"Plywood, Birch","4 ""x"" 8"')
    expect(rowsToCsv([{ Name: '-1+2', Notes: '\t=1+1' }])).toBe("Name,Notes\n'-1+2,'\t=1+1")
  })

  it('start empty preserves library tables and clears workshop tables', async () => {
    const database = new BenchOsDatabase(`benchos-empty-${crypto.randomUUID()}`)
    try {
      await ensureDatabaseSeeded(database)
      await clearWorkshopData(database)

      expect(await database.toolTypes.count()).toBeGreaterThanOrEqual(170)
      expect(await database.toolCatalogItems.count()).toBeGreaterThan(0)
      expect(await database.projectTemplates.count()).toBeGreaterThanOrEqual(30)
      expect(await database.masteryGuides.count()).toBe(10)
      expect(await database.userTools.count()).toBe(0)
      expect(await database.projects.count()).toBe(0)
      expect((await database.settings.get('onboardingComplete'))?.value).toBe('true')
    } finally {
      database.close()
      await database.delete()
    }
  })
})
