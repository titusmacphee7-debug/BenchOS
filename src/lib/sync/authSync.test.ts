import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Session, SupabaseClient, User } from '@supabase/supabase-js'
import { db } from '../../data/db'
import { completeAccountOnboarding } from '../../data/actions'
import { resendSignupVerification, signInWithMagicLink, signInWithPassword, signOut } from '../auth/authService'
import { syncableWorkshopTables } from './syncTables'
import { linkLocalWorkshop, syncNow } from './cloudSyncService'

const user: User = { id: 'user-1', email: 'alex@example.com' } as User
const session: Session = { user } as Session
const workshop = { id: 'workshop-1', owner_user_id: user.id, name: 'Local Workshop', type: 'mixed', cloud_sync_enabled: true, updated_at: '' }

describe('Phase 4 auth and sync', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('wraps Supabase password, magic-link, and sign-out calls', async () => {
    const fakeClient = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ data: { user, session }, error: null }),
        signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
        resend: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
    } as unknown as SupabaseClient

    await signInWithPassword('alex@example.com', 'password', fakeClient)
    await signInWithMagicLink('alex@example.com', fakeClient)
    await resendSignupVerification('alex@example.com', fakeClient)
    await signOut(fakeClient)

    expect(fakeClient.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'alex@example.com', password: 'password' })
    expect(fakeClient.auth.signInWithOtp).toHaveBeenCalled()
    expect(fakeClient.auth.resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'alex@example.com',
      options: { emailRedirectTo: window.location.origin + '/account-onboarding' },
    })
    expect(fakeClient.auth.signOut).toHaveBeenCalled()
  })

  it('links the local workshop to a signed-in account without deleting local data', async () => {
    await db.userTools.add({
      id: 'tool-1',
      name: 'Circular Saw',
      type: 'Circular Saw',
      category: 'Cutting',
      condition: 'Good',
      storageLocation: 'Shelf',
      usageLevel: 'Low',
      powerType: 'Manual',
      createdAt: '',
      updatedAt: '',
    })

    await linkLocalWorkshop(user, workshop, db)

    expect(await db.userTools.count()).toBe(1)
    expect((await db.workshopProfiles.get('local-workshop'))?.ownerUserId).toBe(user.id)
    expect((await db.workshopProfiles.get('local-workshop'))?.workshopId).toBe(workshop.id)
  })

  it('syncs pending local records and excludes seeded catalog/image tables', async () => {
    const upserted: unknown[][] = []
    const fakeClient = makeSyncClient(upserted)
    await db.userTools.add({
      id: 'tool-1',
      name: 'Circular Saw',
      type: 'Circular Saw',
      category: 'Cutting',
      condition: 'Good',
      storageLocation: 'Shelf',
      usageLevel: 'Low',
      powerType: 'Manual',
      syncStatus: 'pending',
      createdAt: '',
      updatedAt: '2026-05-04T00:00:00.000Z',
    })

    const result = await syncNow({ client: fakeClient, database: db })
    const flatRows = upserted.flat() as Array<{ table_name: string; record_id: string }>

    expect(result.pushed).toBeGreaterThan(0)
    expect(flatRows.some((row) => row.table_name === 'userTools' && row.record_id === 'tool-1')).toBe(true)
    expect(flatRows.some((row) => row.table_name === 'toolCatalogItems')).toBe(false)
    expect(syncableWorkshopTables).not.toContain('toolImageAssignments')
  })

  it('pushes completed account onboarding records through workshop records', async () => {
    const upserted: unknown[][] = []
    const fakeClient = makeSyncClient(upserted)
    await db.authSessionStates.put({
      id: 'local-session',
      status: 'signed_in',
      provider: 'supabase',
      userId: user.id,
      email: user.email,
      cloudBackupEnabled: true,
      cloudSyncEnabled: true,
      updatedAt: '',
    })
    await completeAccountOnboarding({
      displayName: 'Titus',
      workshopName: 'Cloud Bench',
      workshopType: 'woodworking',
      skillLevel: 'Beginner',
      spaceType: 'small-shop',
      projectInterests: ['Woodworking'],
      safetyPriorities: ['Dust protection'],
      preferredBrands: ['DeWalt'],
      avoidedBrands: [],
      preferredBatteryPlatforms: ['DeWalt 20V MAX'],
      budgetTier: 'balanced',
      storageSensitivity: 'high',
      noiseSensitivity: 'medium',
      dustSensitivity: 'high',
      preferCordless: true,
    }, { sync: false })

    await syncNow({ client: fakeClient, database: db })
    const flatRows = upserted.flat() as Array<{ table_name: string; payload: Record<string, unknown> }>

    expect(flatRows.some((row) => row.table_name === 'userProfiles' && row.payload.accountOnboardingCompletedAt)).toBe(true)
    expect(flatRows.some((row) => row.table_name === 'workshopProfiles' && Array.isArray(row.payload.projectInterests))).toBe(true)
    expect(flatRows.some((row) => row.table_name === 'toolBuyingPreferences' && row.payload.dustSensitivity === 'high')).toBe(true)
  })
})

function makeSyncClient(upserted: unknown[][]) {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    },
    from(tableName: string) {
      if (tableName === 'workshops') return workshopsBuilder()
      if (tableName === 'workshop_records') return recordsBuilder(upserted)
      return recordsBuilder(upserted)
    },
  } as unknown as SupabaseClient
}

function workshopsBuilder() {
  return {
    select: () => workshopsBuilder(),
    eq: () => workshopsBuilder(),
    order: () => workshopsBuilder(),
    limit: () => Promise.resolve({ data: [workshop], error: null }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: workshop, error: null }),
      }),
    }),
  }
}

function recordsBuilder(upserted: unknown[][]) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    gt: () => builder,
    upsert: (rows: unknown[]) => {
      upserted.push(rows)
      return Promise.resolve({ error: null })
    },
    then: (resolve: (value: { data: unknown[]; error: null }) => void) => resolve({ data: [], error: null }),
  }
  return builder
}
