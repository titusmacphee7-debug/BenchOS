import type { GapItem, ToolCompatibilityRule, UserTool } from '../../data/schema'
import { normalize } from '../readiness/readinessEngine'

export function detectCompatibilityGaps(input: {
  userTools: UserTool[]
  compatibilityRules: ToolCompatibilityRule[]
  preferredBatteryPlatforms?: string[]
}): GapItem[] {
  const activeTools = input.userTools.filter((tool) => !tool.archivedAt && !tool.deletedAt)
  const ownedToolTypeIds = new Set(activeTools.map((tool) => tool.toolTypeId).filter(Boolean))
  const ownedCatalogItemIds = new Set(activeTools.map((tool) => tool.catalogItemId).filter(Boolean))
  const gaps: GapItem[] = []

  for (const rule of input.compatibilityRules) {
    if (rule.ruleType !== 'requires' && rule.ruleType !== 'warns') continue
    const sourceMatches = Boolean(
      (rule.sourceToolTypeId && ownedToolTypeIds.has(rule.sourceToolTypeId))
      || (rule.sourceCatalogItemId && ownedCatalogItemIds.has(rule.sourceCatalogItemId)),
    )
    if (!sourceMatches) continue

    const targetOwned = Boolean(
      (rule.targetToolTypeId && ownedToolTypeIds.has(rule.targetToolTypeId))
      || (rule.targetCatalogItemId && ownedCatalogItemIds.has(rule.targetCatalogItemId)),
    )
    if (targetOwned) continue

    gaps.push({
      id: `compatibility-${rule.id}`,
      kind: 'compatibility',
      name: rule.tag,
      description: rule.description,
      severity: rule.ruleType === 'requires' ? 'high' : 'medium',
      toolTypeId: rule.targetToolTypeId,
      catalogItemId: rule.targetCatalogItemId,
      impactCount: 1,
      projectNames: [],
      templateNames: [],
      wishlistItemType: 'Accessory',
    })
  }

  const batteryTools = activeTools.filter((tool) => tool.powerType === 'Battery' && tool.batteryPlatform)
  const platforms = new Map<string, UserTool[]>()
  for (const tool of batteryTools) {
    const platform = tool.batteryPlatform?.trim()
    if (!platform) continue
    platforms.set(platform, [...(platforms.get(platform) ?? []), tool])
  }

  for (const [platform, tools] of platforms) {
    const hasCharger = activeTools.some((tool) => {
      const text = normalize(`${tool.name} ${tool.type} ${tool.category} ${tool.batteryPlatform ?? ''}`)
      return text.includes('charger') && text.includes(normalize(platform))
    })
    if (!hasCharger) {
      gaps.push({
        id: `compatibility-${normalize(platform).replace(/\s+/g, '-')}-charger`,
        kind: 'compatibility',
        name: `${platform} charger`,
        description: `${tools.length} battery tool${tools.length === 1 ? '' : 's'} use ${platform}, but no matching charger is tracked.`,
        severity: 'medium',
        category: 'Battery Platform',
        impactCount: tools.length,
        projectNames: [],
        templateNames: [],
        wishlistItemType: 'Accessory',
      })
    }
  }

  if (platforms.size > 1) {
    gaps.push({
      id: 'compatibility-multiple-battery-platforms',
      kind: 'compatibility',
      name: 'Multiple battery platforms',
      description: `You currently track ${platforms.size} battery platforms. Future buying recommendations should prefer a platform you already own.`,
      severity: 'low',
      category: 'Battery Platform',
      impactCount: platforms.size,
      projectNames: [],
      templateNames: [],
      wishlistItemType: 'Accessory',
    })
  }

  const preferredPlatforms = input.preferredBatteryPlatforms?.map((platform) => normalize(platform)).filter(Boolean) ?? []
  if (preferredPlatforms.length > 0) {
    for (const [platform, tools] of platforms) {
      const normalizedPlatform = normalize(platform)
      if (preferredPlatforms.some((preferred) => normalizedPlatform.includes(preferred) || preferred.includes(normalizedPlatform))) continue
      gaps.push({
        id: `compatibility-${normalizedPlatform.replace(/\s+/g, '-')}-outside-preferred-platform`,
        kind: 'compatibility',
        name: `${platform} outside preferred platform`,
        description: `${tools.length} battery tool${tools.length === 1 ? '' : 's'} use ${platform}, which is outside your onboarding battery platform preference.`,
        severity: 'low',
        category: 'Battery Platform',
        impactCount: tools.length,
        projectNames: [],
        templateNames: [],
        wishlistItemType: 'Accessory',
      })
    }
  }

  return gaps
}
