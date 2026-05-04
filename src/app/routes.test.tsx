import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './routes'
import { db } from '../data/db'

describe('onboarding gate', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('redirects to onboarding when setup is incomplete', async () => {
    await db.settings.put({ key: 'needsOnboarding', value: 'true', updatedAt: '' })

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Welcome to BenchOS')).toBeInTheDocument()
  })

  it('renders the main app when onboarding is complete', async () => {
    await db.settings.put({ key: 'onboardingComplete', value: 'true', updatedAt: '' })

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Welcome back/i)).toBeInTheDocument()
    expect(await screen.findByText('Top Workshop Gaps')).toBeInTheDocument()
    expect(screen.getByText('View score')).toBeInTheDocument()
  })

  it('renders Phase 2 routes without requiring account login', async () => {
    await db.settings.put({ key: 'onboardingComplete', value: 'true', updatedAt: '' })

    render(
      <MemoryRouter initialEntries={['/local-mode']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Local Mode' })).toBeInTheDocument()
    expect(screen.getByText(/fully usable without an account/i)).toBeInTheDocument()
  })

  it('renders the project templates route', async () => {
    await db.settings.put({ key: 'onboardingComplete', value: 'true', updatedAt: '' })

    render(
      <MemoryRouter initialEntries={['/project-templates']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Project Template Library' })).toBeInTheDocument()
  })

  it('renders Phase 3 diagnostic routes in Local Mode', async () => {
    await db.settings.put({ key: 'onboardingComplete', value: 'true', updatedAt: '' })

    const rendered = render(
      <MemoryRouter initialEntries={['/gap-analyzer']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Gap Analyzer' })).toBeInTheDocument()
    rendered.unmount()

    render(
      <MemoryRouter initialEntries={['/workshop-score']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Workshop Score' })).toBeInTheDocument()
  })

  it('gates signed-in accounts until account onboarding is complete', async () => {
    await db.settings.put({ key: 'onboardingComplete', value: 'true', updatedAt: '' })
    await db.authSessionStates.put({
      id: 'local-session',
      status: 'signed_in',
      provider: 'supabase',
      userId: 'user-1',
      email: 'titus@example.com',
      cloudBackupEnabled: true,
      cloudSyncEnabled: true,
      updatedAt: '',
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Set up your workshop intelligence' })).toBeInTheDocument()
  })

  it('does not gate Local Mode users behind account onboarding', async () => {
    await db.settings.put({ key: 'onboardingComplete', value: 'true', updatedAt: '' })
    await db.authSessionStates.put({
      id: 'local-session',
      status: 'local',
      provider: 'supabase',
      cloudBackupEnabled: false,
      cloudSyncEnabled: false,
      updatedAt: '',
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Welcome back/i)).toBeInTheDocument()
  })

  it('renders account settings routes without requiring account login', async () => {
    await db.settings.put({ key: 'onboardingComplete', value: 'true', updatedAt: '' })

    const routes = [
      ['/account-onboarding', 'Set up your workshop intelligence'],
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
