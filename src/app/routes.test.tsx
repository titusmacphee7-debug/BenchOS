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

    expect(await screen.findByRole('heading', { name: 'Sign in to BenchOS' })).toBeInTheDocument()
  })

  it('keeps signup and reset password public', async () => {
    await putSignedOutSession()

    const signup = render(
      <MemoryRouter initialEntries={['/signup']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Create your BenchOS account' })).toBeInTheDocument()
    signup.unmount()

    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Reset password' })).toBeInTheDocument()
  })

  it('disables the old Local Mode route in production routing', async () => {
    await putSignedOutSession()

    render(
      <MemoryRouter initialEntries={['/local-mode']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Sign in to BenchOS' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Local Mode' })).not.toBeInTheDocument()
  })

  it('gates signed-in accounts until account onboarding is complete', async () => {
    await putSignedInSession()

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Set up your workshop intelligence' })).toBeInTheDocument()
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
    provider: 'supabase',
    cloudBackupEnabled: false,
    cloudSyncEnabled: false,
    updatedAt: '',
  })
}

async function putSignedInSession(options: { onboarded?: boolean } = {}) {
  await db.authSessionStates.put({
    id: 'local-session',
    status: 'signed_in',
    provider: 'supabase',
    userId: 'user-1',
    email: 'owner@example.com',
    cloudBackupEnabled: true,
    cloudSyncEnabled: true,
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
      syncStatus: 'synced',
      createdAt: '',
      updatedAt: '',
    })
  }
}
