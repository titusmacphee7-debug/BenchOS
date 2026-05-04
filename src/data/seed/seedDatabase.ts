import type { BenchOsDatabase } from '../db'
import { SEED_VERSION } from '../schema'
import { starterToolGuideSections } from './deepToolGuides'
import { defaultAuthSessionState, defaultToolBuyingPreferences, defaultUserProfile, defaultWorkshopProfile } from './profiles'
import { starterProjectTemplateRequirements, starterProjectTemplates } from './projectTemplates'
import { starterMaterials, starterUserTools } from './starterInventory'
import { starterMasteryGuides, starterMasteryProgress } from './starterMastery'
import { starterProjectActivity, starterProjectRequirements, starterProjects, starterProjectSteps, starterWishlistItems } from './starterProjects'
import { buildStarterToolLibrary } from './starterToolLibrary'

export async function ensureDatabaseSeeded(database: BenchOsDatabase, options: { includeSampleData?: boolean; markNeedsOnboarding?: boolean; force?: boolean } = {}) {
  const includeSampleData = options.includeSampleData ?? true
  const currentSeed = await database.settings.get('seedVersion')
  if (!options.force && currentSeed?.value === SEED_VERSION) return false

  const library = buildStarterToolLibrary()
  const now = new Date().toISOString()

  await database.transaction(
    'rw',
    [
      database.toolTypes,
      database.toolAliases,
      database.toolVariants,
      database.toolFamilies,
      database.brands,
      database.batteryPlatforms,
      database.toolCatalogItems,
      database.toolCatalogSpecs,
      database.toolCatalogSourceNotes,
      database.toolImageCandidates,
      database.toolImageAssignments,
      database.imageAuditIssues,
      database.projectTemplates,
      database.projectTemplateRequirements,
      database.capabilities,
      database.toolTypeCapabilities,
      database.toolAccessories,
      database.toolConsumables,
      database.toolCompatibilityRules,
      database.toolGuideSections,
      database.authSessionStates,
      database.userProfiles,
      database.workshopProfiles,
      database.toolBuyingPreferences,
      database.userTools,
      database.materials,
      database.projects,
      database.projectRequirements,
      database.projectSteps,
      database.projectActivity,
      database.wishlistItems,
      database.masteryGuides,
      database.masteryProgress,
      database.settings,
    ],
    async () => {
      await database.toolTypes.bulkPut(library.toolTypes)
      await database.toolAliases.bulkPut(library.toolAliases)
      await database.toolVariants.bulkPut(library.toolVariants)
      await database.toolFamilies.bulkPut(library.toolFamilies)
      await database.brands.bulkPut(library.brands)
      await database.batteryPlatforms.bulkPut(library.batteryPlatforms)
      await database.toolCatalogItems.bulkPut(library.toolCatalogItems.map((item) => ({ ...item, imageId: undefined })))
      await database.toolCatalogSpecs.bulkPut(library.toolCatalogSpecs)
      await database.toolCatalogSourceNotes.bulkPut(library.toolCatalogSourceNotes)
      await database.toolImageCandidates.clear()
      await database.toolImageAssignments.clear()
      await database.imageAuditIssues.clear()
      await database.projectTemplates.bulkPut(starterProjectTemplates)
      await database.projectTemplateRequirements.bulkPut(starterProjectTemplateRequirements)
      await database.capabilities.bulkPut(library.capabilities)
      await database.toolTypeCapabilities.bulkPut(library.toolTypeCapabilities)
      await database.toolAccessories.bulkPut(library.toolAccessories)
      await database.toolConsumables.bulkPut(library.toolConsumables)
      await database.toolCompatibilityRules.bulkPut(library.toolCompatibilityRules)
      await database.toolGuideSections.bulkPut(starterToolGuideSections)

      if ((await database.authSessionStates.count()) === 0) {
        await database.authSessionStates.put(defaultAuthSessionState)
      }

      if ((await database.userProfiles.count()) === 0) {
        await database.userProfiles.put(defaultUserProfile)
      }

      if ((await database.workshopProfiles.count()) === 0) {
        await database.workshopProfiles.put(defaultWorkshopProfile)
      }

      if ((await database.toolBuyingPreferences.count()) === 0) {
        await database.toolBuyingPreferences.put(defaultToolBuyingPreferences)
      }

      if (includeSampleData && (await database.userTools.count()) === 0) {
        await database.userTools.bulkPut(starterUserTools)
      }

      if (includeSampleData && (await database.materials.count()) === 0) {
        await database.materials.bulkPut(starterMaterials)
      }

      if (includeSampleData && (await database.projects.count()) === 0) {
        await database.projects.bulkPut(starterProjects)
      }

      if (includeSampleData && (await database.projectRequirements.count()) === 0) {
        await database.projectRequirements.bulkPut(starterProjectRequirements)
      }

      if (includeSampleData && (await database.projectSteps.count()) === 0) {
        await database.projectSteps.bulkPut(starterProjectSteps)
      }

      if (includeSampleData && (await database.projectActivity.count()) === 0) {
        await database.projectActivity.bulkPut(starterProjectActivity)
      }

      if (includeSampleData && (await database.wishlistItems.count()) === 0) {
        await database.wishlistItems.bulkPut(starterWishlistItems)
      }

      if ((await database.masteryGuides.count()) === 0) {
        await database.masteryGuides.bulkPut(starterMasteryGuides)
      }

      if ((await database.masteryProgress.count()) === 0) {
        await database.masteryProgress.bulkPut(starterMasteryProgress)
      }

      await database.settings.put({ key: 'seedVersion', value: SEED_VERSION, updatedAt: now })
      await database.settings.put({ key: 'lastSeededAt', value: now, updatedAt: now })
      if (options.markNeedsOnboarding) {
        await database.settings.put({ key: 'needsOnboarding', value: 'true', updatedAt: now })
      }
    },
  )

  return true
}
