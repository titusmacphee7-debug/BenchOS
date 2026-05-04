import type { BenchOsDatabase } from '../../data/db'
import { db } from '../../data/db'
import { getSupabaseClient, isSupabaseConfigured } from '../auth/supabaseClient'

export async function enterLocalMode(database: BenchOsDatabase = db) {
  const now = new Date().toISOString()
  await clearPersistedSupabaseSession()
  await database.authSessionStates.put({
    id: 'local-session',
    status: 'local',
    provider: 'supabase',
    cloudBackupEnabled: false,
    cloudSyncEnabled: false,
    syncStatus: 'local',
    pendingSyncCount: 0,
    conflictCount: 0,
    updatedAt: now,
  })
}

export async function getPendingSyncCount(database: BenchOsDatabase = db) {
  const tables = [
    database.userTools,
    database.materials,
    database.projects,
    database.projectRequirements,
    database.projectSteps,
    database.projectActivity,
    database.wishlistItems,
    database.purchaseHistory,
    database.toolUsageLogs,
    database.materialUsageLogs,
    database.maintenanceLogs,
    database.masteryProgress,
    database.xpEvents,
    database.notifications,
    database.toolBuyingPreferences,
  ]

  const counts = await Promise.all(tables.map((table) => table.filter((record) => record.syncStatus === 'pending').count()))
  return counts.reduce((sum, count) => sum + count, 0)
}

async function clearPersistedSupabaseSession() {
  if (!isSupabaseConfigured()) return
  const { error } = await getSupabaseClient().auth.signOut({ scope: 'local' })
  if (error) throw error
}
