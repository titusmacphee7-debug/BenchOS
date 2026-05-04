import { describe, expect, it } from 'vitest'
import { BenchOsDatabase } from '../db'
import { ensureDatabaseSeeded } from './seedDatabase'

describe('database seeding', () => {
  it('seeds once and then respects the stored seed version', async () => {
    const database = new BenchOsDatabase(`benchos-test-${crypto.randomUUID()}`)

    try {
      const firstSeed = await ensureDatabaseSeeded(database)
      const toolCountAfterFirstSeed = await database.toolTypes.count()
      const userToolCountAfterFirstSeed = await database.userTools.count()
      const secondSeed = await ensureDatabaseSeeded(database)

      expect(firstSeed).toBe(true)
      expect(secondSeed).toBe(false)
      expect(toolCountAfterFirstSeed).toBeGreaterThanOrEqual(170)
      expect(await database.projects.count()).toBeGreaterThan(0)
      expect(await database.projectRequirements.count()).toBeGreaterThan(0)
      expect(await database.wishlistItems.count()).toBeGreaterThan(0)
      expect(await database.toolCatalogItems.count()).toBeGreaterThan(0)
      expect(await database.toolCatalogSourceNotes.count()).toBeGreaterThan(0)
      expect(await database.toolAccessories.count()).toBeGreaterThan(0)
      expect(await database.toolConsumables.count()).toBeGreaterThan(0)
      expect(await database.toolImageAssignments.count()).toBe(0)
      expect(await database.toolImageCandidates.count()).toBe(0)
      expect(await database.imageAuditIssues.count()).toBe(0)
      expect((await database.toolCatalogItems.where('internalToolTypeId').equals('respirator').first())?.imageId).toBeFalsy()
      expect(await database.projectTemplates.count()).toBeGreaterThanOrEqual(30)
      expect(await database.projectTemplateRequirements.count()).toBeGreaterThan(0)
      expect(await database.toolGuideSections.count()).toBeGreaterThanOrEqual(200)
      expect(await database.workshopProfiles.count()).toBe(1)
      expect((await database.workshopProfiles.get('local-workshop'))?.cloudBackupEnabled).toBe(false)
      expect(await database.masteryGuides.count()).toBe(10)
      expect(await database.masteryProgress.count()).toBeGreaterThan(0)
      expect(await database.toolTypes.count()).toBe(toolCountAfterFirstSeed)
      expect(await database.userTools.count()).toBe(userToolCountAfterFirstSeed)
      expect(await database.masteryGuides.count()).toBe(10)
    } finally {
      database.close()
      await database.delete()
    }
  })
})
