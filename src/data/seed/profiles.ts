import type { AuthSessionState, ToolBuyingPreferences, UserProfile, WorkshopProfile } from '../schema'

const today = '2026-05-03T00:00:00.000Z'

export const defaultAuthSessionState: AuthSessionState = {
  id: 'local-session',
  status: 'signed_out',
  provider: 'supabase',
  cloudBackupEnabled: false,
  cloudSyncEnabled: false,
  pendingSyncCount: 0,
  conflictCount: 0,
  updatedAt: today,
}

export const defaultUserProfile: UserProfile = {
  id: 'local-user',
  displayName: 'Sample Builder',
  accountOnboardingVersion: 1,
  localOnly: true,
  syncStatus: 'local',
  createdAt: today,
  updatedAt: today,
}

export const defaultWorkshopProfile: WorkshopProfile = {
  id: 'local-workshop',
  name: 'Sample Workshop',
  type: 'mixed',
  skillLevel: 'Beginner',
  spaceType: 'garage',
  projectInterests: [],
  safetyPriorities: [],
  cloudBackupEnabled: false,
  cloudSyncEnabled: false,
  localOnly: true,
  syncStatus: 'local',
  createdAt: today,
  updatedAt: today,
}

export const defaultToolBuyingPreferences: ToolBuyingPreferences = {
  id: 'default',
  preferredBrands: [],
  avoidedBrands: [],
  preferredBatteryPlatforms: [],
  budgetTier: 'balanced',
  workshopType: 'mixed',
  storageSensitivity: 'medium',
  noiseSensitivity: 'medium',
  dustSensitivity: 'medium',
  preferCordless: true,
  localOnly: true,
  syncStatus: 'local',
  createdAt: today,
  updatedAt: today,
}
