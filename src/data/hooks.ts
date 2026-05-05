import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useState } from 'react'
import { db } from './db'
import { ensureDatabaseSeeded } from './seed/seedDatabase'
import type {
  MaintenanceLog,
  MaterialUsageLog,
  ProjectActivity,
  ProjectRequirement,
  ProjectStep,
  ProjectTemplate,
  ProjectTemplateRequirement,
  RecentActivityItem,
  AuthSessionState,
  ToolAccessory,
  ToolBuyingPreferences,
  ToolCatalogLibraryItem,
  ToolCompatibilityRule,
  ToolConsumable,
  ToolLibraryItem,
  ToolUsageLog,
} from './schema'
import { analyzeWorkshopGaps } from '../lib/diagnostics/gapAnalyzer'
import { calculateWorkshopScore } from '../lib/diagnostics/workshopScoreEngine'
import { getBenchXpLevel } from '../lib/xp/xpEngine'

export function useSeedDatabase() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<unknown>()

  useEffect(() => {
    let active = true
    db.settings.get('seedVersion')
      .then(() => ensureDatabaseSeeded(db, { includeSampleData: false }))
      .then(() => {
        if (active) setReady(true)
      })
      .catch((seedError: unknown) => {
        if (active) setError(seedError)
      })

    return () => {
      active = false
    }
  }, [])

  return { ready, error }
}

export function useSettings() {
  return useLiveQuery(() => db.settings.toArray(), [], [])
}

export function useToolLibraryData() {
  const toolTypes = useLiveQuery(() => db.toolTypes.orderBy('name').toArray(), [], [])
  const aliases = useLiveQuery(() => db.toolAliases.toArray(), [], [])
  const variants = useLiveQuery(() => db.toolVariants.toArray(), [], [])
  const capabilities = useLiveQuery(() => db.capabilities.toArray(), [], [])
  const typeCapabilities = useLiveQuery(() => db.toolTypeCapabilities.toArray(), [], [])

  const items = useMemo<ToolLibraryItem[]>(() => {
    const capabilityById = new Map(capabilities.map((capability) => [capability.id, capability]))
    const aliasesByTool = groupBy(aliases, (alias) => alias.toolTypeId)
    const variantsByTool = groupBy(variants, (variant) => variant.toolTypeId)
    const typeCapabilitiesByTool = groupBy(typeCapabilities, (item) => item.toolTypeId)

    return toolTypes.map((toolType) => ({
      ...toolType,
      aliases: (aliasesByTool.get(toolType.id) ?? []).map((alias) => alias.alias),
      variants: variantsByTool.get(toolType.id) ?? [],
      capabilities: (typeCapabilitiesByTool.get(toolType.id) ?? [])
        .map((item) => capabilityById.get(item.capabilityId))
        .filter((capability): capability is NonNullable<typeof capability> => Boolean(capability)),
    }))
  }, [aliases, capabilities, toolTypes, typeCapabilities, variants])

  return { items, aliases, variants, capabilities, typeCapabilities }
}

export function useToolCatalogData() {
  const toolTypes = useLiveQuery(() => db.toolTypes.orderBy('name').toArray(), [], [])
  const catalogItems = useLiveQuery(() => db.toolCatalogItems.orderBy('displayName').toArray(), [], [])
  const aliases = useLiveQuery(() => db.toolAliases.toArray(), [], [])
  const capabilities = useLiveQuery(() => db.capabilities.toArray(), [], [])
  const typeCapabilities = useLiveQuery(() => db.toolTypeCapabilities.toArray(), [], [])
  const specs = useLiveQuery(() => db.toolCatalogSpecs.toArray(), [], [])
  const sourceNotes = useLiveQuery(() => db.toolCatalogSourceNotes.toArray(), [], [])
  const brands = useLiveQuery(() => db.brands.orderBy('name').toArray(), [], [])
  const batteryPlatforms = useLiveQuery(() => db.batteryPlatforms.orderBy('name').toArray(), [], [])

  const items = useMemo<ToolCatalogLibraryItem[]>(() => {
    const toolTypeById = new Map(toolTypes.map((toolType) => [toolType.id, toolType]))
    const capabilityById = new Map(capabilities.map((capability) => [capability.id, capability]))
    const aliasesByTool = groupBy(aliases, (alias) => alias.toolTypeId)
    const typeCapabilitiesByTool = groupBy(typeCapabilities, (item) => item.toolTypeId)
    const specsByCatalogItem = groupBy(specs, (spec) => spec.catalogItemId)
    const sourceNotesByCatalogItem = groupBy(sourceNotes.filter((note) => note.catalogItemId), (note) => note.catalogItemId ?? '')

    return catalogItems
      .map((catalogItem) => {
        const toolType = toolTypeById.get(catalogItem.internalToolTypeId)
        if (!toolType) return undefined
        const item: ToolCatalogLibraryItem = {
          ...catalogItem,
          toolType,
          aliases: (aliasesByTool.get(toolType.id) ?? []).map((alias) => alias.alias),
          specs: specsByCatalogItem.get(catalogItem.id) ?? [],
          sourceNotes: sourceNotesByCatalogItem.get(catalogItem.id) ?? [],
          capabilities: (typeCapabilitiesByTool.get(toolType.id) ?? [])
            .map((item) => capabilityById.get(item.capabilityId))
            .filter((capability): capability is NonNullable<typeof capability> => Boolean(capability)),
        }
        return item
      })
      .filter((item): item is ToolCatalogLibraryItem => Boolean(item))
  }, [aliases, capabilities, catalogItems, sourceNotes, specs, toolTypes, typeCapabilities])

  return { items, catalogItems, brands, batteryPlatforms, capabilities, typeCapabilities, specs, sourceNotes }
}

export function useProjectTemplateData() {
  const templates = useLiveQuery(() => db.projectTemplates.orderBy('name').toArray(), [], []) as ProjectTemplate[]
  const requirements = useLiveQuery(() => db.projectTemplateRequirements.orderBy('sortOrder').toArray(), [], []) as ProjectTemplateRequirement[]
  return { templates, requirements }
}

export function useToolGuideSections() {
  return useLiveQuery(() => db.toolGuideSections.orderBy('sortOrder').toArray(), [], [])
}

export function useToolAccessories() {
  return useLiveQuery(() => db.toolAccessories.toArray(), [], []) as ToolAccessory[]
}

export function useToolConsumables() {
  return useLiveQuery(() => db.toolConsumables.toArray(), [], []) as ToolConsumable[]
}

export function useToolCompatibilityRules() {
  return useLiveQuery(() => db.toolCompatibilityRules.toArray(), [], []) as ToolCompatibilityRule[]
}

export function useWorkshopProfile() {
  return useLiveQuery(() => db.workshopProfiles.get('local-workshop'), [], undefined)
}

export function useUserProfile() {
  return useLiveQuery(() => db.userProfiles.get('local-user'), [], undefined)
}

export function useAuthSessionState() {
  return useLiveQuery(() => db.authSessionStates.get('local-session'), [], undefined)
}

export function useAuthGateState() {
  return useLiveQuery(
    async () => ({
      ready: true,
      session: (await db.authSessionStates.get('local-session')) ?? null,
    }),
    [],
    { ready: false, session: null as AuthSessionState | null },
  )
}

export function useAccountOnboardingStatus() {
  const state = useLiveQuery(async () => ({
    session: await db.authSessionStates.get('local-session'),
    userProfile: await db.userProfiles.get('local-user'),
  }), [], undefined)

  if (!state) return { ready: false, complete: false, signedIn: false }
  const signedIn = state.session?.status === 'signed_in'
  const complete = signedIn && Boolean(state.userProfile?.accountOnboardingCompletedAt)
  return { ready: true, complete, signedIn }
}

export function useToolBuyingPreferences() {
  return useLiveQuery(() => db.toolBuyingPreferences.get('default'), [], undefined) as ToolBuyingPreferences | undefined
}

export function useActiveUserTools() {
  return useLiveQuery(() => db.userTools.filter((tool) => !tool.archivedAt).toArray(), [], [])
}

export function useActiveMaterials() {
  return useLiveQuery(() => db.materials.filter((material) => !material.archivedAt).toArray(), [], [])
}

export function useActiveProjects() {
  return useLiveQuery(() => db.projects.filter((project) => !project.archivedAt).toArray(), [], [])
}

export function useProjectRequirements(projectId?: string) {
  return (useLiveQuery(
    () => projectId
      ? db.projectRequirements.where('projectId').equals(projectId).filter((requirement) => !requirement.archivedAt).toArray()
      : Promise.resolve([] as ProjectRequirement[]),
    [projectId],
  ) ?? []) as ProjectRequirement[]
}

export function useAllProjectRequirements() {
  return useLiveQuery(() => db.projectRequirements.filter((requirement) => !requirement.archivedAt).toArray(), [], [])
}

export function useAllToolTypeCapabilities() {
  return useLiveQuery(() => db.toolTypeCapabilities.toArray(), [], [])
}

export function useProjectSteps(projectId?: string) {
  return (useLiveQuery(
    () => projectId
      ? db.projectSteps.where('projectId').equals(projectId).sortBy('sortOrder')
      : Promise.resolve([] as ProjectStep[]),
    [projectId],
  ) ?? []) as ProjectStep[]
}

export function useProjectActivity(projectId?: string) {
  return (useLiveQuery(
    () => projectId
      ? db.projectActivity.where('projectId').equals(projectId).toArray((items) => items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      : Promise.resolve([] as ProjectActivity[]),
    [projectId],
  ) ?? []) as ProjectActivity[]
}

export function useActiveWishlistItems() {
  return useLiveQuery(() => db.wishlistItems.filter((item) => !item.archivedAt).toArray(), [], [])
}

export function usePurchaseHistory() {
  return useLiveQuery(() => db.purchaseHistory.reverse().sortBy('purchasedAt'), [], [])
}

export function useToolUsageLogs(userToolId?: string) {
  return (useLiveQuery(
    () => userToolId
      ? db.toolUsageLogs.where('userToolId').equals(userToolId).reverse().sortBy('usedAt')
      : db.toolUsageLogs.reverse().sortBy('usedAt'),
    [userToolId],
  ) ?? []) as ToolUsageLog[]
}

export function useMaterialUsageLogs(materialId?: string) {
  return (useLiveQuery(
    () => materialId
      ? db.materialUsageLogs.where('materialId').equals(materialId).reverse().sortBy('usedAt')
      : db.materialUsageLogs.reverse().sortBy('usedAt'),
    [materialId],
  ) ?? []) as MaterialUsageLog[]
}

export function useMaintenanceLogs(userToolId?: string) {
  return (useLiveQuery(
    () => userToolId
      ? db.maintenanceLogs.where('userToolId').equals(userToolId).reverse().sortBy('performedAt')
      : db.maintenanceLogs.reverse().sortBy('performedAt'),
    [userToolId],
  ) ?? []) as MaintenanceLog[]
}

export function useMasteryGuides() {
  return useLiveQuery(() => db.masteryGuides.orderBy('sortOrder').toArray(), [], [])
}

export function useMasteryProgress() {
  return useLiveQuery(() => db.masteryProgress.toArray(), [], [])
}

export function useXpEvents() {
  return useLiveQuery(() => db.xpEvents.reverse().sortBy('awardedAt'), [], [])
}

export function useXpSummary() {
  const events = useXpEvents()
  const totalXp = events.reduce((sum, event) => sum + event.xpAmount, 0)
  return { totalXp, events, ...getBenchXpLevel(totalXp) }
}

export function useActiveNotifications() {
  return useLiveQuery(() => db.notifications.where('status').equals('Active').reverse().sortBy('updatedAt'), [], [])
}

export function useToolsNeedingMaintenance() {
  const tools = useActiveUserTools()
  const maintenanceLogs = useMaintenanceLogs()
  const [maintenanceCutoff] = useState(() => Date.now() - 90 * 24 * 60 * 60 * 1000)
  return useMemo(() => {
    const lastMaintenanceByTool = new Map<string, string>()
    for (const log of maintenanceLogs) {
      const current = lastMaintenanceByTool.get(log.userToolId)
      if (!current || log.performedAt > current) lastMaintenanceByTool.set(log.userToolId, log.performedAt)
    }
    return tools.filter((tool) => {
      if (tool.condition === 'Needs Repair' || tool.condition === 'Broken') return true
      const lastMaintained = lastMaintenanceByTool.get(tool.id)
      if (!lastMaintained) return true
      return new Date(lastMaintained).getTime() < maintenanceCutoff
    })
  }, [maintenanceCutoff, maintenanceLogs, tools])
}

export function useWorkshopDiagnostics() {
  const tools = useActiveUserTools()
  const materials = useActiveMaterials()
  const projects = useActiveProjects()
  const projectRequirements = useAllProjectRequirements()
  const { templates, requirements: projectTemplateRequirements } = useProjectTemplateData()
  const toolLibrary = useToolLibraryData()
  const accessories = useToolAccessories()
  const consumables = useToolConsumables()
  const compatibilityRules = useToolCompatibilityRules()
  const wishlistItems = useActiveWishlistItems()
  const maintenanceLogs = useMaintenanceLogs()
  const workshopProfile = useWorkshopProfile()
  const buyingPreferences = useToolBuyingPreferences()

  return useMemo(() => {
    const toolTypes = toolLibrary.items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      familyId: item.familyId,
      description: item.description,
      materials: item.materials,
      commonProjects: item.commonProjects,
      powerType: item.powerType,
      skillLevel: item.skillLevel,
      safety: item.safety,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
    const gapAnalysis = analyzeWorkshopGaps({
      userTools: tools,
      materials,
      projects,
      projectRequirements,
      projectTemplates: templates,
      projectTemplateRequirements,
      toolTypes,
      capabilities: toolLibrary.capabilities,
      toolTypeCapabilities: toolLibrary.typeCapabilities,
      toolAccessories: accessories,
      toolConsumables: consumables,
      compatibilityRules,
      wishlistItems,
      maintenanceLogs,
      workshopProfile,
      buyingPreferences,
    })
    const workshopScore = calculateWorkshopScore({
      userTools: tools,
      materials,
      projects,
      projectRequirements,
      projectTemplates: templates,
      projectTemplateRequirements,
      toolTypes,
      capabilities: toolLibrary.capabilities,
      toolTypeCapabilities: toolLibrary.typeCapabilities,
      gapAnalysis,
      workshopProfile,
      buyingPreferences,
    })

    return { gapAnalysis, workshopScore }
  }, [
    accessories,
    compatibilityRules,
    consumables,
    maintenanceLogs,
    materials,
    buyingPreferences,
    projectRequirements,
    projectTemplateRequirements,
    projects,
    templates,
    toolLibrary.capabilities,
    toolLibrary.items,
    toolLibrary.typeCapabilities,
    tools,
    workshopProfile,
    wishlistItems,
  ])
}

export function useRecentActivityFeed(limit = 8) {
  const tools = useActiveUserTools()
  const materials = useActiveMaterials()
  const projects = useActiveProjects()
  const toolUsageLogs = useToolUsageLogs()
  const materialUsageLogs = useMaterialUsageLogs()
  const maintenanceLogs = useMaintenanceLogs()
  const xpEvents = useXpEvents()
  const projectActivity = useLiveQuery(() => db.projectActivity.reverse().sortBy('createdAt'), [], [])

  return useMemo<RecentActivityItem[]>(() => {
    const toolById = new Map(tools.map((tool) => [tool.id, tool]))
    const materialById = new Map(materials.map((material) => [material.id, material]))
    const projectById = new Map(projects.map((project) => [project.id, project]))
    const items: RecentActivityItem[] = [
      ...toolUsageLogs.map((log) => ({
        id: `tool-${log.id}`,
        title: toolById.get(log.userToolId)?.name ?? 'Tool use',
        description: `${log.usageType} use${log.projectId ? ` for ${projectById.get(log.projectId)?.name ?? 'project'}` : ''}`,
        timestamp: log.usedAt,
        tone: 'orange' as const,
      })),
      ...materialUsageLogs.map((log) => ({
        id: `material-${log.id}`,
        title: materialById.get(log.materialId)?.name ?? 'Material usage',
        description: `Used ${log.quantityUsed} ${log.unit}${log.projectId ? ` for ${projectById.get(log.projectId)?.name ?? 'project'}` : ''}`,
        timestamp: log.usedAt,
        tone: 'yellow' as const,
      })),
      ...maintenanceLogs.map((log) => ({
        id: `maintenance-${log.id}`,
        title: toolById.get(log.userToolId)?.name ?? 'Maintenance',
        description: `${log.maintenanceType} maintenance logged`,
        timestamp: log.performedAt,
        tone: 'green' as const,
      })),
      ...xpEvents.map((event) => ({
        id: `xp-${event.id}`,
        title: `${event.xpAmount} XP earned`,
        description: event.description,
        timestamp: event.awardedAt,
        tone: 'purple' as const,
      })),
      ...(projectActivity ?? []).map((activity) => ({
        id: `project-${activity.id}`,
        title: activity.title,
        description: activity.description,
        timestamp: activity.createdAt,
        tone: 'blue' as const,
      })),
    ]
    return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit)
  }, [limit, maintenanceLogs, materialUsageLogs, materials, projectActivity, projects, toolUsageLogs, tools, xpEvents])
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  const grouped = new Map<string, T[]>()
  for (const item of items) {
    const key = getKey(item)
    grouped.set(key, [...(grouped.get(key) ?? []), item])
  }
  return grouped
}
