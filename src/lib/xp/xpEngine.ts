import type { MasteryGuide, MasteryProgress, MasteryGuideStepCategory, ToolUsageLog, UsageLevel } from '../../data/schema'

export const XP_RULES = {
  toolUse: 10,
  projectToolUse: 25,
  materialUsage: 10,
  maintenance: 25,
  masteryStep: 50,
  masteryComplete: 250,
  projectStep: 25,
  projectComplete: 250,
}

export function getToolUseXp(projectId?: string) {
  return projectId ? XP_RULES.projectToolUse : XP_RULES.toolUse
}

export function getBenchXpLevel(totalXp: number) {
  const xpPerLevel = 500
  const level = Math.floor(totalXp / xpPerLevel) + 1
  const xpIntoLevel = totalXp % xpPerLevel
  return {
    level,
    xpIntoLevel,
    xpToNextLevel: xpPerLevel,
    progressPercent: Math.min(100, Math.round((xpIntoLevel / xpPerLevel) * 100)),
  }
}

export function calculateUsageLevel(logs: Pick<ToolUsageLog, 'durationMinutes'>[]): UsageLevel {
  const totalMinutes = logs.reduce((sum, log) => sum + (log.durationMinutes ?? 0), 0)
  if (logs.length >= 5 || totalMinutes >= 240) return 'High'
  if (logs.length >= 2 || totalMinutes >= 60) return 'Medium'
  return 'Low'
}

export function calculateMasteryProgress(guide: MasteryGuide, completedStepIds: string[]): Pick<MasteryProgress, 'level' | 'status' | 'safetyProgress' | 'setupProgress' | 'operationProgress' | 'accuracyProgress' | 'maintenanceProgress'> {
  const completed = new Set(completedStepIds)
  const completedCount = guide.steps.filter((step) => completed.has(step.id)).length
  const totalCount = Math.max(1, guide.steps.length)
  const percent = Math.round((completedCount / totalCount) * 100)
  const status = percent === 100 ? 'Mastered' : completedCount > 0 ? 'In Progress' : 'Not Started'
  const level = status === 'Mastered' ? 5 : Math.max(1, Math.ceil(percent / 20))

  return {
    level,
    status,
    safetyProgress: categoryProgress(guide, completed, ['Safety']),
    setupProgress: categoryProgress(guide, completed, ['Setup']),
    operationProgress: categoryProgress(guide, completed, ['Overview', 'Basic Use']),
    accuracyProgress: categoryProgress(guide, completed, ['Common Mistakes', 'Practice Task']),
    maintenanceProgress: categoryProgress(guide, completed, ['Maintenance']),
  }
}

function categoryProgress(guide: MasteryGuide, completed: Set<string>, categories: MasteryGuideStepCategory[]) {
  const steps = guide.steps.filter((step) => categories.includes(step.category))
  if (steps.length === 0) return 0
  const completedCount = steps.filter((step) => completed.has(step.id)).length
  return Math.round((completedCount / steps.length) * 100)
}
