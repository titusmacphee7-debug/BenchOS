import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import type { AuthSessionState } from '../../data/schema'

export function useAuthGateState() {
  return useLiveQuery(
    async () => ({
      ready: true,
      session: (await db.authSessionStates.get('local-session')) ?? null,
    }),
    [],
    { ready: false, session: null as AuthSessionState | null },
  )
}

export function useAccountOnboardingStatus() {
  const state = useLiveQuery(async () => ({
    session: await db.authSessionStates.get('local-session'),
    userProfile: await db.userProfiles.get('local-user'),
  }), [], undefined)

  if (!state) return { ready: false, complete: false, signedIn: false }
  const signedIn = state.session?.status === 'signed_in'
  const complete = signedIn && Boolean(state.userProfile?.accountOnboardingCompletedAt)
  return { ready: true, complete, signedIn }
}

export function useAuthSessionState() {
  return useLiveQuery(() => db.authSessionStates.get('local-session'), [], undefined)
}

export function useUserProfile() {
  return useLiveQuery(() => db.userProfiles.get('local-user'), [], undefined)
}

export function useActiveNotifications() {
  return useLiveQuery(() => db.notifications.where('status').equals('Active').reverse().sortBy('updatedAt'), [], [])
}
