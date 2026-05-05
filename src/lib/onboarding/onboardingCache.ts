import { db } from '../../data/db'

export async function cacheServerOnboardingComplete() {
  const now = new Date().toISOString()
  const existingProfile = await db.userProfiles.get('local-user')
  await db.userProfiles.put({
    ...(existingProfile ?? {
      id: 'local-user',
      createdAt: now,
    }),
    id: 'local-user',
    accountOnboardingCompletedAt: existingProfile?.accountOnboardingCompletedAt ?? now,
    accountOnboardingVersion: existingProfile?.accountOnboardingVersion ?? 1,
    localOnly: false,
    syncStatus: 'local',
    updatedAt: now,
  })
  await db.settings.put({ key: 'serverOnboardingComplete', value: 'true', updatedAt: now })
}
