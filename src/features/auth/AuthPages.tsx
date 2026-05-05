import { ArrowRight, BarChart3, CheckCircle2, ClipboardList, Gauge, KeyRound, LockKeyhole, LogOut, ShieldCheck, UserRound, Wrench } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { StatusPill } from '../../components/ui/StatusPill'
import { useAuthSessionState, useUserProfile, useWorkshopProfile } from '../../data/hooks'
import { clearAuthSession } from '../../lib/auth/authService'
import { useBenchAuth0 } from '../../lib/auth/benchAuth0Context'

type AuthMode = 'login' | 'signup'

const outcomes = [
  'Know what you own.',
  'See what you can build.',
  'Turn gaps into a focused wishlist.',
  'Track mastery as your shop grows.',
]

const commandRows = [
  { label: 'Tool Library', value: 'Real brands and models', icon: Wrench },
  { label: 'Projects', value: 'Readiness by build', icon: ClipboardList },
  { label: 'Readiness', value: 'Missing tools and materials', icon: Gauge },
  { label: 'Wishlist', value: 'Focused purchase decisions', icon: CheckCircle2 },
  { label: 'BenchXP', value: 'Skill progress', icon: BarChart3 },
]

export function LoginPage() {
  return <AuthPanel mode="login" />
}

export function SignupPage() {
  return <AuthPanel mode="signup" />
}

export function AccountPage() {
  const navigate = useNavigate()
  const auth0 = useBenchAuth0()
  const session = useAuthSessionState()
  const userProfile = useUserProfile()
  const workshop = useWorkshopProfile()
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()
  const [working, setWorking] = useState(false)
  const signedIn = session?.status === 'signed_in' && session.provider === 'auth0'
  const profileName = userProfile?.displayName?.trim()
  const displayName = profileName || session?.email?.split('@')[0] || 'BenchOS account'

  async function handleSignOut() {
    setWorking(true)
    setMessage(undefined)
    setError(undefined)
    try {
      await clearAuthSession()
      setMessage('Signed out.')
      if (auth0.available) {
        auth0.logout()
      } else {
        navigate('/login')
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
      setWorking(false)
    }
  }

  return (
    <div className="grid gap-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-bench-text">Account</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-bench-muted">
            Auth0 manages BenchOS sign-in. Workshop data remains tied to your authenticated account identity while the production database layer is prepared.
          </p>
        </div>
        <StatusPill label={signedIn ? 'Auth0 Signed In' : 'Signed Out'} tone={signedIn ? 'green' : 'orange'} />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_.75fr]">
        <Card>
          <CardTitle title="Workshop Profile" action={<ShieldCheck className="text-bench-orange" size={20} />} />
          <div className="grid gap-3">
            <InfoRow label="Signed-in email" value={session?.email ?? 'Not signed in'} />
            <InfoRow label="Identity provider" value={signedIn ? 'Auth0' : 'Not signed in'} />
            <InfoRow label="Display name" value={displayName} />
            <InfoRow label="Workshop" value={workshop?.name ?? 'Not set'} />
            <InfoRow label="Workshop type" value={workshop?.type ?? 'Not set'} />
            <InfoRow label="Skill level" value={workshop?.skillLevel ?? 'Not set'} />
            <InfoRow label="Data storage" value="Local-first workspace; server-verified database planned" />
            <InfoRow label="Onboarding" value={userProfile?.accountOnboardingCompletedAt ? 'Complete' : 'Needs setup'} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="outline"
              icon={<LogOut size={16} />}
              disabled={!signedIn || working}
              onClick={() => void handleSignOut()}
            >
              Sign out
            </Button>
          </div>
          {message && <p className="mt-4 rounded-lg border border-bench-green/30 bg-bench-green/10 p-3 text-sm text-bench-green">{message}</p>}
          {error && <p className="mt-4 rounded-lg border border-bench-red/30 bg-bench-red/10 p-3 text-sm text-bench-red">{error}</p>}
        </Card>

        <Card>
          <CardTitle title="Account Access" action={<StatusPill label="Auth0" tone="green" />} />
          <p className="text-sm leading-6 text-bench-muted">
            Auth0 handles sign-in, signup, and logout. BenchOS does not handle raw passwords in the app UI.
          </p>
          <div className="mt-4 grid gap-3">
            <Link to="/login">
              <Button className="w-full" icon={<KeyRound size={16} />}>Open sign in</Button>
            </Link>
            <Link to="/signup">
              <Button className="w-full" variant="outline" icon={<UserRound size={16} />}>Create account</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function AccountDeletedPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-bench-border bg-bench-panel/95 p-6 shadow-panel md:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-bench-green/35 bg-bench-green/10 text-bench-green">
          <CheckCircle2 size={22} />
        </span>
        <StatusPill label="Account deleted" tone="green" />
      </div>
      <h1 className="text-3xl font-black leading-tight text-bench-text">Your BenchOS account has been deleted.</h1>
      <p className="mt-4 text-sm leading-6 text-bench-muted">
        You have been signed out and this browser can no longer access the deleted workspace. A future signup with the same email will create a clean new BenchOS account.
      </p>
      <div className="mt-6">
        <Link to="/login">
          <Button icon={<KeyRound size={16} />}>Return to sign in</Button>
        </Link>
      </div>
    </div>
  )
}

function AuthPanel({ mode }: { mode: AuthMode }) {
  const auth0 = useBenchAuth0()
  const [error, setError] = useState<string>()
  const [working, setWorking] = useState(false)
  const isSignup = mode === 'signup'

  async function redirectToAuth0(nextMode: AuthMode) {
    setWorking(true)
    setError(undefined)
    try {
      await (nextMode === 'signup' ? auth0.signup() : auth0.login())
    } catch (caught) {
      setWorking(false)
      setError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  return (
    <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 overflow-hidden rounded-[1.6rem] border border-white/[0.06] bg-black/10 p-5 shadow-[0_32px_120px_rgba(0,0,0,0.36)] lg:grid-cols-[1.08fr_.82fr] lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:44px_44px] opacity-25" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-bench-orange/12 blur-3xl" />
      <section className="relative z-10 grid gap-7">
        <div className="flex flex-wrap gap-2">
          <StatusPill label="Account required" tone="orange" />
          <StatusPill label="User-scoped data" tone="green" />
          <StatusPill label="Build ready" tone="muted" />
        </div>

        <div>
          <h1 className="max-w-2xl text-4xl font-black leading-tight text-bench-text md:text-5xl">
            Your workshop command center starts here.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-bench-muted">
            Sign in to manage tools, projects, readiness, wishlist decisions, and BenchXP from one secure BenchOS account.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {outcomes.map((outcome) => (
            <div key={outcome} className="flex min-h-12 items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 text-sm font-semibold text-bench-text">
              <CheckCircle2 className="shrink-0 text-bench-orange" size={17} />
              {outcome}
            </div>
          ))}
        </div>

        <div className="max-w-xl rounded-2xl border border-bench-border bg-bench-panel/70 p-4 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-bench-text">Command Preview</p>
              <p className="mt-1 text-xs text-bench-muted">Clean accounts start empty and build from real workshop choices.</p>
            </div>
          </div>
          <div className="grid gap-2">
            {commandRows.map(({ label, value, icon: Icon }) => (
              <div key={label} className="grid min-h-12 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-bench-orange/12 text-bench-orange">
                  <Icon size={16} />
                </span>
                <span className="text-sm font-semibold text-bench-text">{label}</span>
                <span className="text-right text-xs text-bench-muted">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full w-3/4 rounded-full bg-bench-orange" />
          </div>
        </div>
      </section>

      <section className="relative z-10">
        <div className="rounded-2xl border border-bench-border bg-bench-panel/95 p-5 shadow-panel md:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-bench-text">Secure Workshop Access</p>
              <p className="mt-2 text-sm leading-6 text-bench-muted">
                Auth0 handles sign-in. BenchOS scopes workshop data to your authenticated account.
              </p>
            </div>
            <StatusPill label="Auth0" tone="green" />
          </div>

          <div className="grid gap-3">
            <Button
              className="w-full"
              size="lg"
              variant="primary"
              icon={<ShieldCheck size={17} />}
              aria-label={isSignup ? 'Create account with Auth0' : 'Continue with Auth0'}
              disabled={working || auth0.isLoading || !auth0.available}
              onClick={() => void redirectToAuth0(mode)}
            >
              {isSignup ? 'Create account with Auth0' : 'Continue with Auth0'}
            </Button>

            {auth0.isLoading && (
              <p className="rounded-lg border border-bench-border bg-white/[0.025] p-3 text-sm text-bench-muted" role="status" aria-live="polite">
                Checking secure session...
              </p>
            )}

            {(error || auth0.error) && (
              <p className="rounded-lg border border-bench-red/30 bg-bench-red/10 p-3 text-sm text-bench-red">
                {error ?? auth0.error?.message}
              </p>
            )}

            {isSignup ? (
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-lg border border-bench-border bg-white/[0.03] px-4 py-3 text-sm font-semibold text-bench-text transition hover:border-bench-orange/45">
                <KeyRound size={16} />
                Already have an account?
              </Link>
            ) : (
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-bench-border bg-white/[0.03] px-4 py-3 text-sm font-semibold text-bench-text transition hover:border-bench-orange/45"
                onClick={() => void redirectToAuth0('signup')}
              >
                <UserRound size={16} />
                Create account with Auth0
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-3 border-t border-bench-border pt-5">
            <TrustNote icon={<LockKeyhole size={16} />} text="BenchOS does not handle raw passwords in the browser." />
            <TrustNote icon={<ArrowRight size={16} />} text="New accounts start clean. Sample starter data can be added later only if you choose it." />
          </div>
        </div>
      </section>
    </div>
  )
}

function TrustNote({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3 text-sm leading-6 text-bench-muted">
      <span className="mt-1 text-bench-orange">{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-bench-border bg-white/[0.025] px-3 py-2 text-sm">
      <span className="text-bench-muted">{label}</span>
      <span className="text-right font-semibold text-bench-text">{value}</span>
    </div>
  )
}
