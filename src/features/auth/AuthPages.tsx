import { KeyRound, LogOut, Mail, RefreshCw, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { StatusPill } from '../../components/ui/StatusPill'
import { useAuthSessionState, useUserProfile, useWorkshopProfile } from '../../data/hooks'
import { getCurrentSession, resendSignupVerification, resetPassword, signInWithMagicLink, signInWithPassword, signOut, signUpWithPassword } from '../../lib/auth/authService'
import { isSupabaseConfigured } from '../../lib/auth/supabaseClient'
import { syncNow } from '../../lib/sync/cloudSyncService'

type AuthMode = 'login' | 'signup' | 'reset'

export function LoginPage() {
  return (
    <AuthPanel
      title="Sign in to BenchOS"
      description="BenchOS production requires an account before the workshop dashboard, tools, projects, and wishlist can open."
      mode="login"
    />
  )
}

export function SignupPage() {
  return (
    <AuthPanel
      title="Create your BenchOS account"
      description="Create a Supabase Auth account so BenchOS can attach workshop data to your signed-in identity."
      mode="signup"
    />
  )
}

export function ResetPasswordPage() {
  return (
    <AuthPanel
      title="Reset password"
      description="BenchOS uses Supabase Auth for password reset and never stores raw passwords."
      mode="reset"
    />
  )
}

export function AccountPage() {
  const navigate = useNavigate()
  const session = useAuthSessionState()
  const userProfile = useUserProfile()
  const workshop = useWorkshopProfile()
  const configured = isSupabaseConfigured()
  const profileName = userProfile?.displayName?.trim()
  const displayName = profileName && profileName !== 'Local Mode' ? profileName : session?.email?.split('@')[0] ?? 'Not set'
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()
  const [working, setWorking] = useState(false)

  useEffect(() => {
    void getCurrentSession().catch(() => undefined)
  }, [])

  async function run(label: string, action: () => Promise<void>) {
    setWorking(true)
    setMessage(undefined)
    setError(undefined)
    try {
      await action()
      setMessage(label)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="grid gap-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-bench-text">Account</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-bench-muted">
            Supabase Auth is required for production access. Signing out returns this device to the login screen.
          </p>
        </div>
        <StatusPill label={session?.status === 'signed_in' ? 'Signed In' : 'Signed Out'} tone={session?.status === 'signed_in' ? 'green' : 'orange'} />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <Card>
          <CardTitle title="Workshop Profile" action={<CloudStatus configured={configured} signedIn={session?.status === 'signed_in'} />} />
          <div className="grid gap-3">
            <InfoRow label="Signed-in email" value={session?.email ?? 'Not signed in'} />
            <InfoRow label="Display name" value={displayName} />
            <InfoRow label="Workshop" value={workshop?.name ?? 'Not set'} />
            <InfoRow label="Workshop type" value={workshop?.type ?? 'Not set'} />
            <InfoRow label="Skill level" value={workshop?.skillLevel ?? 'Not set'} />
            <InfoRow label="Cloud sync" value={session?.cloudSyncEnabled ? 'Enabled' : configured ? 'Available after sign-in' : 'Not configured'} />
            <InfoRow label="Onboarding" value={userProfile?.accountOnboardingCompletedAt ? 'Complete' : 'Needs setup'} />
            <InfoRow label="Last sync" value={formatDate(session?.lastSyncAt)} />
            <InfoRow label="Pending records" value={String(session?.pendingSyncCount ?? 0)} />
            <InfoRow label="Conflicts" value={String(session?.conflictCount ?? 0)} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              icon={<RefreshCw size={16} />}
              disabled={!configured || session?.status !== 'signed_in' || working}
              onClick={() => void run('Sync completed.', async () => { await syncNow() })}
            >
              Sync now
            </Button>
            <Button
              variant="outline"
              icon={<LogOut size={16} />}
              disabled={!configured || session?.status !== 'signed_in' || working}
              onClick={() => void run('Signed out.', async () => {
                await signOut()
                navigate('/login')
              })}
            >
              Sign out
            </Button>
          </div>
          {message && <p className="mt-4 rounded-lg border border-bench-green/30 bg-bench-green/10 p-3 text-sm text-bench-green">{message}</p>}
          {error && <p className="mt-4 rounded-lg border border-bench-red/30 bg-bench-red/10 p-3 text-sm text-bench-red">{error}</p>}
        </Card>

        <Card>
          <CardTitle title="Account Access" />
          <p className="text-sm leading-6 text-bench-muted">
            Supabase Auth is the current identity layer. Netlify Database will become the production app data store in a later approved slice.
          </p>
          <div className="mt-4 grid gap-3">
            <Link to="/login"><Button className="w-full" icon={<KeyRound size={16} />}>Sign in</Button></Link>
            <Link to="/signup"><Button className="w-full" variant="outline" icon={<UserRound size={16} />}>Create account</Button></Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

function AuthPanel({ title, description, mode }: { title: string; description: string; mode: AuthMode }) {
  const navigate = useNavigate()
  const configured = isSupabaseConfigured()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()
  const [verificationEmail, setVerificationEmail] = useState<string>()
  const [working, setWorking] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setWorking(true)
    setMessage(undefined)
    setError(undefined)
    try {
      if (!configured) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable production sign-in.')
      const result = mode === 'signup'
        ? await signUpWithPassword(email, password)
        : mode === 'reset'
          ? await resetPassword(email)
          : await signInWithPassword(email, password)
      if (mode !== 'reset' && result.session) {
        setVerificationEmail(undefined)
        await syncNow().catch(() => undefined)
        navigate('/account-onboarding')
        return
      }
      if (mode === 'signup') setVerificationEmail(email)
      setMessage(result.message ?? (mode === 'signup' ? 'Account created.' : mode === 'reset' ? 'Reset email sent.' : 'Signed in and synced.'))
    } catch (caught) {
      const errorMessage = caught instanceof Error ? caught.message : String(caught)
      if (errorMessage.toLowerCase().includes('email not confirmed')) {
        setVerificationEmail(email)
        setError('If this email is waiting on verification, resend it from here, then try signing in again.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setWorking(false)
    }
  }

  async function magicLink() {
    setWorking(true)
    setMessage(undefined)
    setError(undefined)
    try {
      if (!configured) throw new Error('Supabase is not configured. Add env vars to enable magic links.')
      const result = await signInWithMagicLink(email)
      setMessage(result.message)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setWorking(false)
    }
  }

  async function resendVerification() {
    setWorking(true)
    setMessage(undefined)
    setError(undefined)
    try {
      if (!configured) throw new Error('Supabase is not configured. Add env vars to resend verification.')
      const targetEmail = verificationEmail || email
      if (!targetEmail) throw new Error('Enter your email first.')
      const result = await resendSignupVerification(targetEmail)
      setVerificationEmail(targetEmail)
      setMessage(result.message)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_.85fr]">
      <section className="pt-6">
        <h1 className="text-3xl font-bold text-bench-text">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-bench-muted">{description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {mode === 'signup' ? (
            <Link to="/login">
              <Button variant="secondary" icon={<KeyRound size={16} />}>Already have an account?</Button>
            </Link>
          ) : (
            <Link to="/signup">
              <Button variant="secondary" icon={<UserRound size={16} />}>Create account</Button>
            </Link>
          )}
        </div>
        {!configured && (
          <p className="mt-5 max-w-2xl rounded-lg border border-bench-orange/30 bg-bench-orange/10 p-3 text-sm text-bench-orange">
            Supabase env vars are missing, so production sign-in is disabled until they are added in the environment.
          </p>
        )}
      </section>

      <Card className="bg-bench-orange/5">
        <CardTitle title={mode === 'reset' ? 'Password Reset' : 'Supabase Auth'} action={<CloudStatus configured={configured} signedIn={false} />} />
        <form className="grid gap-3" onSubmit={(event) => void submit(event)}>
          <label className="grid gap-2 text-sm font-semibold text-bench-text">
            Email
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bench-muted" size={16} />
              <input className="h-11 w-full rounded-lg border border-bench-border bg-white/[0.035] pl-10 pr-3 text-sm outline-none focus:border-bench-orange/70" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
          </label>
          {mode !== 'reset' && (
            <label className="grid gap-2 text-sm font-semibold text-bench-text">
              Password
              <input className="h-11 w-full rounded-lg border border-bench-border bg-white/[0.035] px-3 text-sm outline-none focus:border-bench-orange/70" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
          )}
          <Button disabled={working || !email || (mode !== 'reset' && !password)}>{mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}</Button>
          {mode === 'login' && (
            <Button type="button" variant="outline" disabled={working || !email} onClick={() => void magicLink()}>Send magic link</Button>
          )}
          {mode !== 'reset' && verificationEmail && (
            <Button type="button" variant="outline" disabled={working} onClick={() => void resendVerification()}>
              Resend verification email
            </Button>
          )}
          <p className="text-xs leading-5 text-bench-muted">
            BenchOS uses Supabase Auth. No raw passwords are stored in the app.
          </p>
          {message && <p className="rounded-lg border border-bench-green/30 bg-bench-green/10 p-3 text-sm text-bench-green">{message}</p>}
          {error && <p className="rounded-lg border border-bench-red/30 bg-bench-red/10 p-3 text-sm text-bench-red">{error}</p>}
        </form>
      </Card>
    </div>
  )
}

function CloudStatus({ configured, signedIn }: { configured: boolean; signedIn: boolean }) {
  if (!configured) return <StatusPill label="Auth config needed" tone="orange" />
  return <StatusPill label={signedIn ? 'Sync ready' : 'Configured'} tone="green" />
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-bench-border bg-white/[0.025] px-3 py-2 text-sm">
      <span className="text-bench-muted">{label}</span>
      <span className="font-semibold text-bench-text">{value}</span>
    </div>
  )
}

function formatDate(value?: string) {
  if (!value) return 'Never'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}
