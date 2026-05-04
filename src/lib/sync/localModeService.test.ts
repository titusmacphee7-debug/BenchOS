import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../data/db'

const mocks = vi.hoisted(() => ({
  signOut: vi.fn().mockResolvedValue({ error: null }),
  isSupabaseConfigured: vi.fn(() => true),
}))

vi.mock('../auth/supabaseClient', () => ({
  getSupabaseClient: () => ({ auth: { signOut: mocks.signOut } }),
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}))

describe('local mode service', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    mocks.signOut.mockClear()
    mocks.isSupabaseConfigured.mockReturnValue(true)
  })

  it('clears the persisted Supabase session before entering Local Mode', async () => {
    const { enterLocalMode } = await import('./localModeService')

    await enterLocalMode()

    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' })
    expect((await db.authSessionStates.get('local-session'))?.status).toBe('local')
  })
})
