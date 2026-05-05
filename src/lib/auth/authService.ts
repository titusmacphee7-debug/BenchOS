import type { AuthChangeEvent, Session, SupabaseClient, User } from '@supabase/supabase-js'
import type { BenchOsDatabase } from '../../data/db'
import { db } from '../../data/db'
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient'

type ExternalAuthSessionInput = {
  provider: 'auth0'
  userId: string
  email?: string
  displayName?: string
  avatarUrl?: string
}

export type AuthServiceResult = {
  user?: User
  session?: Session | null
  message?: string
}

function clientOrThrow(client?: SupabaseClient) {
  return client ?? getSupabaseClient()
}

export async function signUpWithPassword(email: string, password: string, client?: SupabaseClient): Promise<AuthServiceResult> {
  const supabase = clientOrThrow(client)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin + '/account-onboarding' },
  })
  if (error) throw error
  await persistAuthSession(data.session, data.user, db)
  return {
    user: data.user ?? undefined,
    session: data.session,
    message: data.session
      ? 'Account created and signed in.'
      : 'Account created. Confirm the email before signing in. Check spam/junk, or resend verification from here.',
  }
}

export async function resendSignupVerification(email: string, client?: SupabaseClient): Promise<AuthServiceResult> {
  const supabase = clientOrThrow(client)
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: window.location.origin + '/account-onboarding' },
  })
  if (error) throw error
  await db.authSessionStates.put({
    id: 'local-session',
    status: 'signed_out',
    provider: 'supabase',
    email,
    cloudBackupEnabled: false,
    cloudSyncEnabled: false,
    syncStatus: 'local',
    pendingSyncCount: 0,
    conflictCount: 0,
    updatedAt: new Date().toISOString(),
  })
  return { message: 'Verification email resent. Check inbox, spam, and junk folders.' }
}

export async function signInWithPassword(email: string, password: string, client?: SupabaseClient): Promise<AuthServiceResult> {
  const supabase = clientOrThrow(client)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  await persistAuthSession(data.session, data.user, db)
  return { user: data.user, session: data.session }
}

export async function signInWithMagicLink(email: string, client?: SupabaseClient): Promise<AuthServiceResult> {
  const supabase = clientOrThrow(client)
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + '/account-onboarding' },
  })
  if (error) throw error
  await db.authSessionStates.put({
    id: 'local-session',
    status: 'signed_out',
    provider: 'supabase',
    email,
    cloudBackupEnabled: false,
    cloudSyncEnabled: false,
    syncStatus: 'local',
    pendingSyncCount: 0,
    conflictCount: 0,
    updatedAt: new Date().toISOString(),
  })
  return { message: 'Magic link sent. Check your email to continue.' }
}

export async function resetPassword(email: string, client?: SupabaseClient): Promise<AuthServiceResult> {
  const supabase = clientOrThrow(client)
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/account',
  })
  if (error) throw error
  return { message: 'Password reset email sent.' }
}

export async function signOut(client?: SupabaseClient) {
  const supabase = clientOrThrow(client)
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  await persistAuthSession(null, undefined, db)
}

export async function getCurrentSession(client?: SupabaseClient) {
  if (!client && !isSupabaseConfigured()) return null
  const supabase = clientOrThrow(client)
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  await persistAuthSession(data.session, data.session?.user, db)
  return data.session
}

export function listenToAuthChanges(onChange?: (event: AuthChangeEvent, session: Session | null) => void, client?: SupabaseClient) {
  if (!client && !isSupabaseConfigured()) return () => undefined
  const supabase = clientOrThrow(client)
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    void persistAuthSession(session, session?.user, db)
    onChange?.(event, session)
  })
  return () => data.subscription.unsubscribe()
}

export async function persistAuthSession(session: Session | null, user?: User | null, database: BenchOsDatabase = db) {
  const now = new Date().toISOString()
  await database.authSessionStates.put({
    id: 'local-session',
    status: session?.user ? 'signed_in' : 'signed_out',
    provider: 'supabase',
    userId: session?.user.id,
    email: session?.user.email ?? user?.email,
    cloudBackupEnabled: Boolean(session?.user),
    cloudSyncEnabled: Boolean(session?.user),
    syncStatus: session?.user ? 'pending' : 'local',
    pendingSyncCount: 0,
    conflictCount: 0,
    updatedAt: now,
  })

  if (session?.user) {
    const existingProfile = await database.userProfiles.get('local-user')
    await database.userProfiles.put({
      ...(existingProfile ?? {
        id: 'local-user',
        createdAt: now,
      }),
      id: 'local-user',
      authUserId: session.user.id,
      ownerUserId: session.user.id,
      email: session.user.email,
      displayName: existingProfile?.displayName && existingProfile.displayName !== 'Local Mode'
        ? existingProfile.displayName
        : session.user.email?.split('@')[0] ?? 'BenchOS User',
      accountOnboardingCompletedAt: existingProfile?.accountOnboardingCompletedAt,
      accountOnboardingVersion: existingProfile?.accountOnboardingVersion,
      localOnly: false,
      syncStatus: 'pending',
      createdAt: existingProfile?.createdAt ?? now,
      updatedAt: now,
    })
  }
}

export async function persistExternalAuthSession(session: ExternalAuthSessionInput | null, database: BenchOsDatabase = db) {
  const now = new Date().toISOString()
  await database.authSessionStates.put({
    id: 'local-session',
    status: session ? 'signed_in' : 'signed_out',
    provider: session?.provider ?? 'auth0',
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
      displayName: existingProfile?.displayName && existingProfile.displayName !== 'Local Mode'
        ? existingProfile.displayName
        : session.displayName ?? session.email?.split('@')[0] ?? 'BenchOS User',
      accountOnboardingCompletedAt: existingProfile?.accountOnboardingCompletedAt,
      accountOnboardingVersion: existingProfile?.accountOnboardingVersion,
      localOnly: false,
      syncStatus: 'local',
      createdAt: existingProfile?.createdAt ?? now,
      updatedAt: now,
    })
  }
}

export async function clearExternalAuthSession(provider: ExternalAuthSessionInput['provider'], database: BenchOsDatabase = db) {
  const existingSession = await database.authSessionStates.get('local-session')
  if (existingSession?.provider !== provider) return
  await persistExternalAuthSession(null, database)
}
