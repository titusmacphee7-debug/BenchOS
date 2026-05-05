import { benchApi, jsonBody } from '../api/benchApi'
import type { SkillDimension } from '../guides/toolMasteryContent'

type BenchApiTokenProvider = () => Promise<string>

export type BenchXpProgressStatus = 'not_started' | 'in_progress' | 'completed'
export type ReadinessMode = 'relaxed' | 'balanced' | 'strict'

export type BenchXpSkillScores = Record<SkillDimension, number>

export type BenchXpProgress = {
  id: string
  guideId: string
  toolTypeId: string
  userToolId?: string
  status: BenchXpProgressStatus
  completedStepIds: string[]
  skillScores: BenchXpSkillScores
  familiarityScore: number
  xp: number
  lastPracticedAt?: string
  createdAt: string
  updatedAt: string
}

export type BenchXpEvent = {
  id: string
  progressId?: string
  eventKey: string
  sourceType: string
  guideId?: string
  toolTypeId?: string
  userToolId?: string
  xpAmount: number
  dimensions: SkillDimension[]
  description: string
  evidence: Record<string, unknown>
  createdAt: string
}

export type BenchXpEvidence = {
  id: string
  progressId?: string
  eventId?: string
  guideId?: string
  toolTypeId?: string
  dimension: SkillDimension
  evidenceType: string
  positive: boolean
  summary: string
  createdAt: string
}

export type BenchXpPracticeLog = {
  id: string
  progressId?: string
  eventId?: string
  guideId: string
  toolTypeId: string
  taskId: string
  title: string
  result?: string
  confidence?: number
  dimensions: SkillDimension[]
  createdAt: string
}

export type BenchXpConfidenceCheckIn = {
  id: string
  progressId?: string
  eventId?: string
  guideId: string
  toolTypeId: string
  confidence: number
  note?: string
  createdAt: string
}

export type BenchXpMistakeLog = {
  id: string
  progressId?: string
  eventId?: string
  guideId: string
  toolTypeId: string
  mistakeKey: string
  note?: string
  recommendation?: string
  createdAt: string
}

export type BenchXpMaintenanceLog = {
  id: string
  progressId?: string
  eventId?: string
  guideId: string
  toolTypeId: string
  maintenanceKey: string
  note?: string
  createdAt: string
}

export type BenchXpRecommendation = {
  id: string
  guideId?: string
  toolTypeId?: string
  title: string
  detail: string
  priority: 'high' | 'medium' | 'low'
}

export type BenchXpSummary = {
  totalXp: number
  level: number
  xpIntoLevel: number
  xpToNextLevel: number
  progressPercent: number
  completedGuides: number
  inProgressGuides: number
  averageFamiliarity: number
}

export type BenchXpState = {
  progress: BenchXpProgress[]
  events: BenchXpEvent[]
  evidence: BenchXpEvidence[]
  practiceLogs: BenchXpPracticeLog[]
  confidenceCheckins: BenchXpConfidenceCheckIn[]
  mistakeLogs: BenchXpMistakeLog[]
  maintenanceLogs: BenchXpMaintenanceLog[]
  dismissedTooltips: string[]
  favoriteGuideIds: string[]
  readinessPreferences: {
    mode: ReadinessMode
    preferences: Record<string, unknown>
    updatedAt?: string
  }
  recommendations: BenchXpRecommendation[]
  summary: BenchXpSummary
}

export type GuideActionBase = {
  guideId: string
  toolTypeId: string
  userToolId?: string
}

export type BenchXpAction =
  | (GuideActionBase & { action: 'start-guide' })
  | (GuideActionBase & {
    action: 'complete-step'
    stepId: string
    stepTitle: string
    stepCategory: string
    totalStepCount: number
  })
  | (GuideActionBase & {
    action: 'log-practice'
    taskId: string
    title: string
    dimensions: SkillDimension[]
    xp: number
    result?: string
    confidence?: number
    totalStepCount?: number
  })
  | (GuideActionBase & {
    action: 'confidence-checkin'
    confidence: number
    note?: string
  })
  | (GuideActionBase & {
    action: 'mistake-log'
    mistakeKey: string
    note?: string
  })
  | (GuideActionBase & {
    action: 'maintenance-log'
    maintenanceKey: string
    note?: string
  })
  | (GuideActionBase & {
    action: 'favorite-guide'
    favorite: boolean
  })
  | { action: 'dismiss-tooltip'; tooltipKey: string }
  | { action: 'readiness-preferences'; mode: ReadinessMode; preferences?: Record<string, unknown> }

export const emptyBenchXpState: BenchXpState = {
  progress: [],
  events: [],
  evidence: [],
  practiceLogs: [],
  confidenceCheckins: [],
  mistakeLogs: [],
  maintenanceLogs: [],
  dismissedTooltips: [],
  favoriteGuideIds: [],
  readinessPreferences: { mode: 'balanced', preferences: {} },
  recommendations: [],
  summary: {
    totalXp: 0,
    level: 1,
    xpIntoLevel: 0,
    xpToNextLevel: 500,
    progressPercent: 0,
    completedGuides: 0,
    inProgressGuides: 0,
    averageFamiliarity: 0,
  },
}

export function fetchBenchXpState(getAccessToken: BenchApiTokenProvider) {
  return benchApi<BenchXpState>(getAccessToken, 'benchxp')
}

export function sendBenchXpAction(getAccessToken: BenchApiTokenProvider, action: BenchXpAction) {
  return benchApi<BenchXpState>(getAccessToken, 'benchxp', {
    method: 'POST',
    body: jsonBody(action),
  })
}
