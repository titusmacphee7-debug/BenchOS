import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../data/db'
import { BenchAuth0Context, type BenchAuth0ContextValue } from '../../lib/auth/benchAuth0Context'
import { SettingsPage } from './SettingsPage'

const auth0Value: BenchAuth0ContextValue = {
  available: true,
  isLoading: false,
  isAuthenticated: true,
  login: () => Promise.resolve(),
  signup: () => Promise.resolve(),
  getAccessToken: () => Promise.resolve('test-token'),
  logout: () => undefined,
}

describe('Settings account danger zone', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('requires exact DELETE before enabling account deletion', async () => {
    render(
      <MemoryRouter>
        <BenchAuth0Context.Provider value={auth0Value}>
          <SettingsPage />
        </BenchAuth0Context.Provider>
      </MemoryRouter>,
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Delete account' }))

    const finalDelete = screen.getByRole('button', { name: 'Permanently delete account' })
    expect(finalDelete).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Type DELETE to confirm.'), { target: { value: 'delete' } })
    expect(finalDelete).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Type DELETE to confirm.'), { target: { value: 'DELETE' } })
    expect(finalDelete).toBeEnabled()
  })
})
