import { beforeEach, describe, expect, it } from 'vitest'
import { completeAccountOnboarding } from './actions'
import { db } from './db'
import type { AccountOnboardingFormValues } from './schema'

const onboardingValues: AccountOnboardingFormValues = {
  displayName: 'Owner',
  workshopName: 'Owner Workshop',
  workshopType: 'woodworking',
  skillLevel: 'Beginner',
  spaceType: 'apartment',
  projectInterests: ['Woodworking', 'Storage'],
  safetyPriorities: ['Dust protection', 'Fire safety'],
  preferredBrands: ['DeWalt'],
  avoidedBrands: ['Brand X'],
  preferredBatteryPlatforms: ['DeWalt 20V MAX'],
  budgetTier: 'balanced',
  storageSensitivity: 'high',
  noiseSensitivity: 'high',
  dustSensitivity: 'high',
  preferCordless: true,
}

describe('account onboarding', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('writes meaningful profile, workshop, and preference data', async () => {
    await db.authSessionStates.put({
      id: 'local-session',
      status: 'signed_in',
      provider: 'auth0',
      userId: 'user-1',
      email: 'owner@example.com',
      cloudBackupEnabled: false,
      cloudSyncEnabled: false,
      syncStatus: 'local',
      updatedAt: '',
    })

    await completeAccountOnboarding(onboardingValues, { sync: false })

    const userProfile = await db.userProfiles.get('local-user')
    const workshop = await db.workshopProfiles.get('local-workshop')
    const preferences = await db.toolBuyingPreferences.get('default')

    expect(userProfile?.displayName).toBe('Owner')
    expect(userProfile?.accountOnboardingCompletedAt).toBeTruthy()
    expect(userProfile?.syncStatus).toBe('local')
    expect(workshop?.name).toBe('Owner Workshop')
    expect(workshop?.cloudBackupEnabled).toBe(false)
    expect(workshop?.cloudSyncEnabled).toBe(false)
    expect(workshop?.type).toBe('woodworking')
    expect(workshop?.spaceType).toBe('apartment')
    expect(workshop?.projectInterests).toContain('Storage')
    expect(workshop?.safetyPriorities).toContain('Dust protection')
    expect(preferences?.preferredBrands).toContain('DeWalt')
    expect(preferences?.preferredBatteryPlatforms).toContain('DeWalt 20V MAX')
    expect(preferences?.storageSensitivity).toBe('high')
  })
})
