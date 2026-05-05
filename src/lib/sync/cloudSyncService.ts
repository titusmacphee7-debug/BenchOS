import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Table } from 'dexie'
import type { BenchOsDatabase } from '../../data/db'
import { db } from '../../data/db'
import type { LocalRecordSyncMeta, WorkshopProfile } from '../../data/schema'
import { getSupabaseClient, isSupabaseConfigured } from '../auth/supabaseClient'
import { syncableWorkshopTables, type SyncableWorkshopTableName } from './syncTables'

type SyncableRecord = LocalRecordSyncMeta & {
  id: string
  updatedAt?: string
  createdAt?: string
}

type CloudWorkshop = {
  id: string
  owner_user_id: string
  name: string
  type: string
  cloud_sync_enabled: boolean
  updated_at: string
}

type CloudWorkshopRecord = {
  id?: string
  owner_user_id: string
  workshop_id: string
  table_name: SyncableWorkshopTableName
  record_id: string
  payload: SyncableRecord
  updated_at: string
  deleted_at?: string | null
}

export type CloudSyncSummary = {
  pushed: number
  pulled: number
  conflicts: number
  pending: number
  lastSyncAt?: string
}

function clientOrThrow(client?: SupabaseClient) {
  if (!client && !isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Add the public Supabase env vars before using cloud sync.')
  }
  return client ?? getSupabaseClient()
}

export async function syncNow(options: { client?: SupabaseClient; database?: BenchOsDatabase } = {}): Promise<CloudSyncSummary> {
  const database = options.database ?? db
  const client = clientOrThrow(options.client)
  const { data: sessionData, error: sessionError } = await client.auth.getSession()
  if (sessionError) throw sessionError
  const user = sessionData.session?.user
  if (!user) throw new Error('Sign in before syncing.')

  const workshop = await ensureCloudWorkshop(user, client, database)
  const previousSession = await database.authSessionStates.get('local-session')
  const since = previousSession?.lastSyncAt
  const now = new Date().toISOString()

  await linkLocalWorkshop(user, workshop, database)
  const pulled = await pullRemoteRecords({ client, database, userId: user.id, workshopId: workshop.id, since })
  const pushed = await pushLocalRecords({ client, database, userId: user.id, workshopId: workshop.id })
  const pending = await countPending(database)
  const summary: CloudSyncSummary = {
    pushed,
    pulled: pulled.pulled,
    conflicts: pulled.conflicts,
    pending,
    lastSyncAt: now,
  }

  await database.authSessionStates.put({
    id: 'local-session',
    status: 'signed_in',
    provider: 'supabase',
    userId: user.id,
    email: user.email,
    cloudBackupEnabled: true,
    cloudSyncEnabled: true,
    lastSyncAt: now,
    syncStatus: pending > 0 || summary.conflicts > 0 ? 'pending' : 'synced',
    pendingSyncCount: pending,
    conflictCount: summary.conflicts,
    updatedAt: now,
  })

  return summary
}

export async function ensureCloudWorkshop(user: User, client: SupabaseClient, database: BenchOsDatabase = db) {
  const localWorkshop = await database.workshopProfiles.get('local-workshop')
  const workshopName = localWorkshop?.name ?? 'Local Workshop'
  const workshopType = localWorkshop?.type ?? 'mixed'

  const { data: existingRows, error: selectError } = await client
    .from('workshops')
    .select('*')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)

  if (selectError) throw selectError
  const existing = (existingRows?.[0] as CloudWorkshop | undefined)
  if (existing) return existing

  const { data: inserted, error: insertError } = await client
    .from('workshops')
    .insert({
      owner_user_id: user.id,
      name: workshopName,
      type: workshopType,
      cloud_sync_enabled: true,
    })
    .select('*')
    .single()

  if (insertError) throw insertError
  return inserted as CloudWorkshop
}

export async function linkLocalWorkshop(user: User, workshop: CloudWorkshop, database: BenchOsDatabase = db) {
  const now = new Date().toISOString()
  const localWorkshop = await database.workshopProfiles.get('local-workshop')
  const localUser = await database.userProfiles.get('local-user')
  const nextWorkshop: WorkshopProfile = {
    ...(localWorkshop ?? {
      id: 'local-workshop',
      name: workshop.name,
      type: workshop.type === 'automotive' || workshop.type === 'home-repair' || workshop.type === 'woodworking' ? workshop.type : 'mixed',
      cloudBackupEnabled: true,
      createdAt: now,
      updatedAt: now,
    }),
    type: localWorkshop?.type ?? (workshop.type === 'automotive' || workshop.type === 'home-repair' || workshop.type === 'woodworking' ? workshop.type : 'mixed'),
    skillLevel: localWorkshop?.skillLevel ?? 'Beginner',
    spaceType: localWorkshop?.spaceType ?? 'garage',
    projectInterests: localWorkshop?.projectInterests ?? [],
    safetyPriorities: localWorkshop?.safetyPriorities ?? [],
    ownerUserId: user.id,
    workshopId: workshop.id,
    localOnly: false,
    cloudBackupEnabled: true,
    cloudSyncEnabled: true,
    syncStatus: 'pending',
    updatedAt: now,
  }

  await database.userProfiles.put({
    ...(localUser ?? {
      id: 'local-user',
      createdAt: now,
    }),
    id: 'local-user',
    authUserId: user.id,
    ownerUserId: user.id,
    workshopId: workshop.id,
    email: user.email,
    displayName: localUser?.displayName && localUser.displayName !== 'Local Mode' ? localUser.displayName : user.email?.split('@')[0] ?? 'BenchOS User',
    accountOnboardingCompletedAt: localUser?.accountOnboardingCompletedAt,
    accountOnboardingVersion: localUser?.accountOnboardingVersion,
    localOnly: false,
    syncStatus: 'pending',
    createdAt: localUser?.createdAt ?? now,
    updatedAt: now,
  })
  await database.workshopProfiles.put(nextWorkshop)
}

async function pushLocalRecords({
  client,
  database,
  userId,
  workshopId,
}: {
  client: SupabaseClient
  database: BenchOsDatabase
  userId: string
  workshopId: string
}) {
  const now = new Date().toISOString()
  let pushed = 0

  for (const tableName of syncableWorkshopTables) {
    const localTable = table(database, tableName)
    const records = await localTable.toArray()
    const pending = records
      .filter((record) => record.localOnly !== true)
      .filter((record) => record.syncStatus !== 'synced' || !record.lastSyncedAt)
      .map((record) => {
        const payload: SyncableRecord = {
          ...record,
          ownerUserId: userId,
          workshopId,
          localOnly: false,
          syncStatus: 'synced',
          lastSyncedAt: now,
          updatedAt: record.updatedAt ?? record.createdAt ?? now,
        }
        return {
          owner_user_id: userId,
          workshop_id: workshopId,
          table_name: tableName,
          record_id: record.id,
          payload,
          updated_at: payload.updatedAt ?? now,
          deleted_at: record.deletedAt ?? null,
        }
      })

    if (pending.length === 0) continue
    const { error } = await client.from('workshop_records').upsert(pending, { onConflict: 'workshop_id,table_name,record_id' })
    if (error) throw error
    await Promise.all(pending.map((record) => localTable.update(record.record_id, record.payload)))
    pushed += pending.length
  }

  return pushed
}

async function pullRemoteRecords({
  client,
  database,
  userId,
  workshopId,
  since,
}: {
  client: SupabaseClient
  database: BenchOsDatabase
  userId: string
  workshopId: string
  since?: string
}) {
  let query = client
    .from('workshop_records')
    .select('*')
    .eq('owner_user_id', userId)
    .eq('workshop_id', workshopId)
    .order('updated_at', { ascending: true })

  if (since) query = query.gt('updated_at', since)

  const { data, error } = await query
  if (error) throw error

  let pulled = 0
  let conflicts = 0

  for (const remote of (data ?? []) as CloudWorkshopRecord[]) {
    if (!syncableWorkshopTables.includes(remote.table_name)) continue
    const localTable = table(database, remote.table_name)
    const local = await localTable.get(remote.record_id)
    if (local?.syncStatus === 'pending' && local.updatedAt && since && local.updatedAt > since) {
      conflicts += 1
      await localTable.update(local.id, { syncStatus: 'conflict' })
      continue
    }

    if (remote.deleted_at) {
      await localTable.update(remote.record_id, {
        deletedAt: remote.deleted_at,
        syncStatus: 'synced',
        lastSyncedAt: remote.updated_at,
      })
    } else {
      await localTable.put({
        ...remote.payload,
        ownerUserId: userId,
        workshopId,
        localOnly: false,
        syncStatus: 'synced',
        lastSyncedAt: remote.updated_at,
      })
    }
    pulled += 1
  }

  return { pulled, conflicts }
}

export async function countPending(database: BenchOsDatabase = db) {
  const counts = await Promise.all(syncableWorkshopTables.map((tableName) => table(database, tableName).filter((record) => record.syncStatus === 'pending' || record.syncStatus === 'conflict').count()))
  return counts.reduce((sum, count) => sum + count, 0)
}

function table(database: BenchOsDatabase, tableName: SyncableWorkshopTableName): Table<SyncableRecord, string> {
  return database.table(tableName) as Table<SyncableRecord, string>
}
