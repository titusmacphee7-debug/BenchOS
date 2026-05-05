import type { BenchOsDatabase } from '../../data/db'
import { db } from '../../data/db'

type Auth0SessionInput = {
  userId: string
  email?: string
  displayName?: string
  avatarUrl?: string
}

export async function persistAuth0Session(session: Auth0SessionInput | null, database: BenchOsDatabase = db) {
  const now = new Date().toISOString()
  await database.authSessionStates.put({
    id: 'local-session',
    status: session ? 'signed_in' : 'signed_out',
    provider: 'auth0',
    userId: session?.userId,
    email: session?.email,
    cloudBackupEnabled: false,
    cloudSyncEnabled: false,
    syncStatus: 'local',
    pendingSyncCount: 0,
    conflictCount: 0,
    updatedAt: now,
  })

  if (session) {
    const existingProfile = await database.userProfiles.get('local-user')
    await database.userProfiles.put({
      ...(existingProfile ?? {
        id: 'local-user',
        createdAt: now,
      }),
      id: 'local-user',
      authUserId: session.userId,
      ownerUserId: session.userId,
      email: session.email,
      avatarUrl: session.avatarUrl ?? existingProfile?.avatarUrl,
      displayName: existingProfile?.displayName ?? session.displayName ?? session.email?.split('@')[0] ?? 'BenchOS User',
      accountOnboardingCompletedAt: existingProfile?.accountOnboardingCompletedAt,
      accountOnboardingVersion: existingProfile?.accountOnboardingVersion,
      localOnly: false,
      syncStatus: 'local',
      createdAt: existingProfile?.createdAt ?? now,
      updatedAt: now,
    })
  }
}

export async function clearAuthSession(database: BenchOsDatabase = db) {
  await persistAuth0Session(null, database)
}
