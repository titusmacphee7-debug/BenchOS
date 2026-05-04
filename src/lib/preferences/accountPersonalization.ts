import type { ProjectTemplate, ToolCatalogLibraryItem, ToolBuyingPreferences, WorkshopProfile } from '../../data/schema'
import { normalize } from '../readiness/readinessEngine'

const skillRank = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
} as const

export function sortTemplatesForWorkshop(templates: ProjectTemplate[], workshop?: WorkshopProfile) {
  return [...templates].sort((a, b) => {
    const scoreDelta = scoreTemplateForWorkshop(b, workshop) - scoreTemplateForWorkshop(a, workshop)
    if (scoreDelta !== 0) return scoreDelta
    return a.name.localeCompare(b.name)
  })
}

export function scoreTemplateForWorkshop(template: ProjectTemplate, workshop?: WorkshopProfile) {
  let score = 0
  const text = normalize(`${template.name} ${template.description} ${template.category} ${template.tags.join(' ')}`)
  for (const interest of workshop?.projectInterests ?? []) {
    if (text.includes(normalize(interest))) score += 24
  }

  const userSkill = workshop?.skillLevel ? skillRank[workshop.skillLevel] : skillRank.Beginner
  const templateSkill = skillRank[template.suggestedSkillLevel]
  if (templateSkill <= userSkill) score += 12
  if (templateSkill > userSkill) score -= (templateSkill - userSkill) * 10
  if (workshop?.spaceType === 'apartment' || workshop?.spaceType === 'small-shop') {
    if (text.includes('outdoor') || text.includes('garage') || text.includes('workbench')) score -= 6
    if (text.includes('small') || text.includes('shelf') || text.includes('repair')) score += 6
  }
  return score
}

export function sortCatalogForPreferences(items: ToolCatalogLibraryItem[], preferences?: ToolBuyingPreferences) {
  return [...items].sort((a, b) => {
    const scoreDelta = scoreCatalogItemForPreferences(b, preferences) - scoreCatalogItemForPreferences(a, preferences)
    if (scoreDelta !== 0) return scoreDelta
    return a.displayName.localeCompare(b.displayName)
  })
}

export function scoreCatalogItemForPreferences(item: ToolCatalogLibraryItem, preferences?: ToolBuyingPreferences) {
  if (!preferences) return 0
  const brand = normalize(item.brand)
  const platform = normalize(item.batteryPlatform ?? '')
  let score = 0

  if (preferences.preferredBrands.some((preferred) => brand.includes(normalize(preferred)))) score += 14
  if (preferences.avoidedBrands.some((avoided) => brand.includes(normalize(avoided)))) score -= 30
  if (platform && preferences.preferredBatteryPlatforms.some((preferred) => platform.includes(normalize(preferred)))) score += 18
  if (preferences.preferCordless && item.powerType === 'Battery') score += 3
  if (!preferences.preferCordless && item.powerType === 'Corded') score += 3
  if (preferences.budgetTier === item.costTier) score += 4

  return score
}

export function isSmallSpaceWorkshop(workshop?: WorkshopProfile) {
  return workshop?.spaceType === 'apartment' || workshop?.spaceType === 'small-shop' || workshop?.spaceType === 'mobile'
}

export function safetyPriorityMatches(text: string, priorities: string[] = []) {
  const normalized = normalize(text)
  return priorities.some((priority) => {
    const target = normalize(priority)
    if (normalized.includes(target)) return true
    if (target.includes('eye') && normalized.includes('glasses')) return true
    if (target.includes('hearing') && normalized.includes('hearing')) return true
    if (target.includes('dust') && (normalized.includes('dust') || normalized.includes('respirator') || normalized.includes('mask'))) return true
    if (target.includes('fire') && normalized.includes('fire')) return true
    if (target.includes('first') && normalized.includes('first aid')) return true
    return false
  })
}
