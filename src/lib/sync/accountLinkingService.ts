import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { BenchOsDatabase } from '../../data/db'
import { db } from '../../data/db'
import { ensureCloudWorkshop, linkLocalWorkshop, syncNow } from './cloudSyncService'

export async function linkCurrentAccountAndSync(user: User, client: SupabaseClient, database: BenchOsDatabase = db) {
  const workshop = await ensureCloudWorkshop(user, client, database)
  await linkLocalWorkshop(user, workshop, database)
  return syncNow({ client, database })
}
