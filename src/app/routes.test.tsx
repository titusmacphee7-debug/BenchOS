import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './routes'
import { db } from '../data/db'

describe('mandatory auth routing', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('redirects protected app routes to login when signed out', async () => {
    await putSignedOutSession()

    render(
      <MemoryRouter initialEntries={['/tool-library']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Your workshop command center starts here.' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue with Auth0' })).toBeInTheDocument()
  })

  it('keeps signup public and redirects reset password to Auth0 sign in', async () => {
    await putSignedOutSession()

    const signup = render(
      <MemoryRouter initialEntries={['/signup']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Your workshop command center starts here.' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create account with Auth0' })).toBeInTheDocument()
    signup.unmount()

    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('button', { name: 'Continue with Auth0' })).toBeInTheDocument()
  })

  it('disables the old Local Mode route in production routing', async () => {
    await putSignedOutSession()

    render(
      <MemoryRouter initialEntries={['/local-mode']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Your workshop command center starts here.' })).toBeInTheDocument()
    expect(screen.queryByText('Local Mode')).not.toBeInTheDocument()
  })

  it('shows only Auth0 production auth controls', async () => {
    await putSignedOutSession()

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('button', { name: 'Continue with Auth0' })).toBeInTheDocument()
    expect(screen.getByText('Secure Workshop Access')).toBeInTheDocument()
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/magic link/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Supabase/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Titus/i)).not.toBeInTheDocument()
  })

  it('gates signed-in accounts until account onboarding is complete', async () => {
    await putSignedInSession()

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Workshop Setup Mission' })).toBeInTheDocument()
  })

  it('renders the main app when signed-in account onboarding is complete', async () => {
    await putSignedInSession({ onboarded: true })

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Welcome back/i)).toBeInTheDocument()
    expect(await screen.findByText('Top Workshop Gaps')).toBeInTheDocument()
    expect(screen.getByText('View score')).toBeInTheDocument()
  })

  it('renders core-loop routes with lazy-loaded pages for signed-in users', async () => {
    await putSignedInSession({ onboarded: true })

    const routes = [
      ['/tool-library', 'Tool Library'],
      ['/my-tools', 'My Tools'],
      ['/projects', 'Projects'],
      ['/wishlist', 'Wishlist'],
      ['/mastery', 'Tool Mastery'],
    ] as const

    for (const [route, heading] of routes) {
      const rendered = render(
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>,
      )

      expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
      rendered.unmount()
    }
  })

  it('renders diagnostic and account settings routes for signed-in users', async () => {
    await putSignedInSession({ onboarded: true })

    const routes = [
      ['/gap-analyzer', 'Gap Analyzer'],
      ['/workshop-score', 'Workshop Score'],
      ['/project-templates', 'Project Template Library'],
      ['/settings/buying-preferences', 'Buying Preferences'],
    ] as const

    for (const [route, heading] of routes) {
      const rendered = render(
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>,
      )
      expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
      rendered.unmount()
    }
  })
})

async function putSignedOutSession() {
  await db.authSessionStates.put({
    id: 'local-session',
    status: 'signed_out',
    provider: 'auth0',
    cloudBackupEnabled: false,
    cloudSyncEnabled: false,
    syncStatus: 'local',
    updatedAt: '',
  })
}

async function putSignedInSession(options: { onboarded?: boolean } = {}) {
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

  if (options.onboarded) {
    await db.userProfiles.put({
      id: 'local-user',
      authUserId: 'user-1',
      ownerUserId: 'user-1',
      email: 'owner@example.com',
      displayName: 'Owner',
      accountOnboardingCompletedAt: '2026-05-05T00:00:00.000Z',
      accountOnboardingVersion: 1,
      localOnly: false,
      syncStatus: 'local',
      createdAt: '',
      updatedAt: '',
    })
  }
}
