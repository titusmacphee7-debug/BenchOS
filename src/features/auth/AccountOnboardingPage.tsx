import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  ClipboardList,
  Database,
  Gauge,
  GraduationCap,
  Hammer,
  Loader2,
  LogOut,
  ShieldCheck,
  ShoppingCart,
  Target,
  Wrench,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { StatusPill } from '../../components/ui/StatusPill'
import { benchApi, jsonBody } from '../../lib/api/benchApi'
import { clearAuthSession } from '../../lib/auth/authService'
import { useBenchAuth0 } from '../../lib/auth/benchAuth0Context'
import { cacheServerOnboardingComplete } from '../../lib/onboarding/onboardingCache'
import type { BootstrapResponse, OnboardingDraft, OnboardingPath, OnboardingPlatformDraft } from '../../lib/onboarding/onboardingTypes'

type StepId = 'boot' | 'welcome' | 'path' | 'profile' | 'goals' | 'platforms' | 'tools' | 'projects' | 'skill' | 'wishlist' | 'demo' | 'summary'

const initialDraft: OnboardingDraft = {
  path: 'guided',
  profile: {
    workshopType: 'Mixed Workshop',
    experienceLevel: 'Some experience',
    spaceType: 'Garage',
    ownershipLevel: 'A few core tools',
    safetyPreference: 'Help me avoid mistakes',
    projectInterests: [],
  },
  goals: [],
  platforms: [],
  projectGoals: [],
  skillProfile: {
    skillLevel: 'Some experience',
    guidanceMode: 'Help me avoid mistakes',
  },
  wishlistStrategy: [],
  sampleChoice: 'empty',
}

const pathSteps: Record<OnboardingPath, StepId[]> = {
  quick: ['profile', 'goals', 'platforms', 'summary'],
  guided: ['profile', 'goals', 'platforms', 'tools', 'projects', 'skill', 'wishlist', 'demo', 'summary'],
  power: ['profile', 'goals', 'platforms', 'tools', 'projects', 'skill', 'wishlist', 'demo', 'summary'],
}

const bootItems = [
  'Creating secure BenchOS workspace',
  'Preparing inventory system',
  'Loading project readiness engine',
  'Setting up BenchXP profile',
  'No starter data added automatically',
]

const valueCards = [
  { title: 'Map what you own', description: 'Start with real tools, not a fake starter inventory.', icon: Wrench },
  { title: 'See what you can build', description: 'Turn projects into practical readiness checks.', icon: Gauge },
  { title: 'Turn gaps into smarter buys', description: 'Keep purchases focused on what unlocks work.', icon: ShoppingCart },
]

const setupPaths: Array<{ id: OnboardingPath; title: string; description: string; detail: string; cta: string }> = [
  { id: 'quick', title: 'Quick Start', description: 'Get into BenchOS fast.', detail: 'Best for testing the app or setting up only the essentials.', cta: 'Start Quick Setup' },
  { id: 'guided', title: 'Guided Setup', description: 'Tune the command center.', detail: 'Best for most users. Builds a useful empty command center around how you actually build.', cta: 'Start Guided Setup' },
  { id: 'power', title: 'Power Setup', description: 'Dial in the whole shop.', detail: 'Best for serious builders who want deeper preferences and wishlist strategy from day one.', cta: 'Start Power Setup' },
]

const workshopTypes = ['Mixed Workshop', 'Home DIY', 'Woodworking', 'Automotive', 'Electrical / Plumbing', 'Outdoor / Yard', 'Beginner Builder', 'Advanced / Pro']
const experienceLevels = ['New beginner', 'Some experience', 'Comfortable', 'Advanced']
const spaceTypes = ['Apartment', 'Shared space', 'Garage', 'Basement', 'Shed', 'Dedicated shop', 'Mobile setup']
const ownershipLevels = ['Starting from zero', 'A few core tools', 'Growing inventory', 'Well-equipped shop', 'Professional setup']
const safetyPreferences = ['Teach me the basics', 'Help me avoid mistakes', 'Show tips only when useful', 'Keep it minimal']
const goalOptions = ['Track what I own', 'Know what I can build', 'Build a better workshop', 'Plan tool purchases', 'Learn tools safely', 'Build furniture', 'Do car repairs', 'Do home repairs', 'Track materials', 'Improve project readiness', 'Avoid buying duplicate tools']
const brandOptions = ['DeWalt', 'Milwaukee', 'Makita', 'Ryobi', 'Bosch', 'Ridgid', 'Craftsman', 'Kobalt', 'Harbor Freight / Bauer / Hercules', 'Other', 'Not sure yet']
const firstToolModes = ['Search real brand/model tools', 'Use a starter checklist', 'Walk through categories', 'Skip tools for now']
const projectGoalOptions = ['Build garage shelves', 'Build a workbench', 'Build a tool wall', 'Make a cutting board', 'Install shelves', 'Repair drywall', 'Change brake pads', 'Detail a car', 'Build an outdoor planter', 'Organize garage storage', 'Set up dust collection', 'Build a miter saw station']
const wishlistOptions = ['Tools I need for projects', 'Compatible batteries/platform tools', 'Safety gear', 'Materials', 'Shop upgrades', 'Automotive tools', 'Replacement/upgrade tools', 'Avoid duplicate purchases']

export function AccountOnboardingPage() {
  const navigate = useNavigate()
  const auth0 = useBenchAuth0()
  const [step, setStep] = useState<StepId>('boot')
  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft)
  const [bootstrap, setBootstrap] = useState<BootstrapResponse>()
  const [error, setError] = useState<string>()
  const [working, setWorking] = useState(false)
  const steps = pathSteps[draft.path ?? 'guided']
  const currentStepIndex = steps.includes(step) ? steps.indexOf(step) : -1
  const progress = currentStepIndex >= 0 ? Math.round(((currentStepIndex + 1) / steps.length) * 100) : 0

  const nextStep = useMemo(() => {
    if (step === 'welcome' || step === 'path') return steps[0]
    const nextIndex = currentStepIndex + 1
    return nextIndex >= 0 && nextIndex < steps.length ? steps[nextIndex] : 'summary'
  }, [currentStepIndex, step, steps])

  const bootstrapWorkspace = useCallback(async () => {
    setWorking(true)
    setError(undefined)
    try {
      const response = await benchApi<BootstrapResponse>(auth0.getAccessToken, 'bootstrap-user', { method: 'POST' })
      setBootstrap(response)
      if (response.onboarding.status === 'completed' || response.onboarding.status === 'skipped') {
        await cacheServerOnboardingComplete()
        navigate('/')
        return
      }
      setStep('welcome')
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setWorking(false)
    }
  }, [auth0.getAccessToken, navigate])

  useEffect(() => {
    const timer = window.setTimeout(() => void bootstrapWorkspace(), 0)
    return () => window.clearTimeout(timer)
  }, [bootstrapWorkspace])

  async function saveAndGo(targetStep: StepId, nextDraft = draft) {
    setWorking(true)
    setError(undefined)
    try {
      await benchApi<BootstrapResponse>(auth0.getAccessToken, 'onboarding', {
        method: 'PUT',
        body: jsonBody({
          path: nextDraft.path,
          currentStep: targetStep,
          data: nextDraft,
          profile: nextDraft.profile,
          goals: nextDraft.goals,
          platforms: nextDraft.platforms,
          projectGoals: nextDraft.projectGoals,
          skillProfile: nextDraft.skillProfile,
          dashboardPreferences: { onboardingPath: nextDraft.path },
        }),
      })
      setDraft(nextDraft)
      setStep(targetStep)
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setWorking(false)
    }
  }

  async function finish(skipped = false) {
    setWorking(true)
    setError(undefined)
    try {
      if (!skipped && (draft.sampleChoice === 'one_project' || draft.sampleChoice === 'full_demo')) {
        await benchApi(auth0.getAccessToken, 'sample-data', {
          method: 'POST',
          body: jsonBody({ sampleKind: draft.sampleChoice }),
        })
      }
      await benchApi(auth0.getAccessToken, 'onboarding-complete', {
        method: 'POST',
        body: jsonBody({ skipped, path: draft.path, data: draft }),
      })
      await cacheServerOnboardingComplete()
      navigate('/')
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setWorking(false)
    }
  }

  async function signOut() {
    await clearAuthSession()
    auth0.logout()
  }

  function choosePath(path: OnboardingPath) {
    const nextDraft = { ...draft, path }
    void saveAndGo(pathSteps[path][0], nextDraft)
  }

  function updateProfile(key: keyof OnboardingDraft['profile'], value: string | string[]) {
    setDraft((current) => ({ ...current, profile: { ...current.profile, [key]: value } }))
  }

  function toggleGoal(goal: string) {
    setDraft((current) => ({ ...current, goals: toggle(current.goals, goal).slice(0, 5) }))
  }

  function toggleProjectGoal(project: string) {
    setDraft((current) => ({ ...current, projectGoals: toggle(current.projectGoals, project) }))
  }

  function toggleWishlist(item: string) {
    setDraft((current) => ({ ...current, wishlistStrategy: toggle(current.wishlistStrategy, item) }))
  }

  function togglePlatform(brand: string) {
    setDraft((current) => {
      const exists = current.platforms.some((platform) => platform.brand === brand)
      const platforms = exists
        ? current.platforms.filter((platform) => platform.brand !== brand)
        : [...current.platforms, { brand, cordlessPreference: 'Not sure yet' }]
      return { ...current, platforms }
    })
  }

  function setFavoriteBrand(brand: string) {
    setDraft((current) => ({
      ...current,
      platforms: current.platforms.map((platform) => ({ ...platform, favorite: platform.brand === brand })),
    }))
  }

  return (
    <div className="min-h-[calc(100vh-7rem)] overflow-hidden rounded-3xl border border-white/[0.07] bg-black/10 p-5 shadow-[0_32px_120px_rgba(0,0,0,0.34)] lg:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:44px_44px] opacity-20" />
      <div className="relative mx-auto grid max-w-6xl gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill label="Auth0 verified" tone="green" />
              <StatusPill label="Server workspace" tone="orange" />
              <StatusPill label="No demo data" tone="muted" />
            </div>
            <h1 className="mt-4 text-3xl font-black leading-tight text-bench-text md:text-4xl">Workshop Setup Mission</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-bench-muted">
              Build your BenchOS command center from a real authenticated workspace. Your workspace starts empty unless you explicitly choose demo data.
            </p>
          </div>
          <Button variant="ghost" icon={<LogOut size={16} />} onClick={() => void signOut()}>
            Sign out
          </Button>
        </header>

        {step !== 'boot' && step !== 'welcome' && step !== 'path' && (
          <div className="rounded-2xl border border-bench-border bg-bench-panel/70 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-bench-text">{draft.path === 'guided' ? 'Guided Setup' : draft.path === 'power' ? 'Power Setup' : 'Quick Start'}</p>
              <p className="text-sm text-bench-muted">{progress}%</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <div className="h-full rounded-full bg-bench-orange transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {error && <SetupError message={error} onRetry={() => void bootstrapWorkspace()} onSignOut={() => void signOut()} />}

        {step === 'boot' && <BootPanel working={working} />}
        {step === 'welcome' && <WelcomePanel onGuided={() => choosePath('guided')} onChoosePath={() => setStep('path')} onSkip={() => void finish(true)} working={working} />}
        {step === 'path' && <PathPanel selected={draft.path ?? 'guided'} onSelect={choosePath} working={working} />}
        {step === 'profile' && (
          <ProfileStep
            draft={draft}
            onProfile={updateProfile}
            onBack={() => setStep('path')}
            onNext={() => void saveAndGo(nextStep)}
            working={working}
          />
        )}
        {step === 'goals' && <GoalsStep goals={draft.goals} onToggle={toggleGoal} onBack={() => setStep(previousStep(step, steps))} onNext={() => void saveAndGo(nextStep)} working={working} />}
        {step === 'platforms' && (
          <PlatformsStep platforms={draft.platforms} onToggle={togglePlatform} onFavorite={setFavoriteBrand} onBack={() => setStep(previousStep(step, steps))} onNext={() => void saveAndGo(nextStep)} working={working} />
        )}
        {step === 'tools' && <FirstToolsStep onBack={() => setStep(previousStep(step, steps))} onNext={() => void saveAndGo(nextStep)} working={working} />}
        {step === 'projects' && <ProjectGoalsStep selected={draft.projectGoals} onToggle={toggleProjectGoal} onBack={() => setStep(previousStep(step, steps))} onNext={() => void saveAndGo(nextStep)} working={working} />}
        {step === 'skill' && (
          <SkillStep
            draft={draft}
            onSkill={(skillLevel) => setDraft((current) => ({ ...current, skillProfile: { ...current.skillProfile, skillLevel } }))}
            onGuidance={(guidanceMode) => setDraft((current) => ({ ...current, skillProfile: { ...current.skillProfile, guidanceMode } }))}
            onBack={() => setStep(previousStep(step, steps))}
            onNext={() => void saveAndGo(nextStep)}
            working={working}
          />
        )}
        {step === 'wishlist' && <WishlistStep selected={draft.wishlistStrategy} onToggle={toggleWishlist} onBack={() => setStep(previousStep(step, steps))} onNext={() => void saveAndGo(nextStep)} working={working} />}
        {step === 'demo' && (
          <DemoStep
            choice={draft.sampleChoice ?? 'empty'}
            onChoice={(sampleChoice) => setDraft((current) => ({ ...current, sampleChoice }))}
            onBack={() => setStep(previousStep(step, steps))}
            onNext={() => void saveAndGo(nextStep)}
            working={working}
          />
        )}
        {step === 'summary' && <SummaryStep bootstrap={bootstrap} draft={draft} onBack={() => setStep(previousStep(step, steps))} onOpen={() => void finish(false)} onSkip={() => void finish(true)} working={working} />}
      </div>
    </div>
  )
}

function BootPanel({ working }: { working: boolean }) {
  return (
    <section className="grid min-h-[28rem] place-items-center">
      <div className="w-full max-w-2xl rounded-3xl border border-bench-border bg-bench-panel/85 p-6 text-center shadow-panel">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-bench-orange/35 bg-bench-orange/15 text-bench-orange">
          {working ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
        </div>
        <h2 className="mt-5 text-2xl font-black text-bench-text">Creating secure BenchOS workspace</h2>
        <p className="mt-2 text-sm leading-6 text-bench-muted">BenchOS is verifying your Auth0 session and preparing an empty server-backed workspace.</p>
        <div className="mt-6 grid gap-3 text-left">
          {bootItems.map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-sm text-bench-text">
              <CheckCircle2 className={index < 2 || !working ? 'text-bench-green' : 'text-bench-muted'} size={17} />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WelcomePanel({ onGuided, onChoosePath, onSkip, working }: { onGuided: () => void; onChoosePath: () => void; onSkip: () => void; working: boolean }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
      <div className="rounded-3xl border border-bench-border bg-bench-panel/80 p-6 shadow-panel">
        <StatusPill label="First run" tone="orange" />
        <h2 className="mt-5 max-w-2xl text-4xl font-black leading-tight text-bench-text">Build your workshop command center.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-bench-muted">
          BenchOS connects your tools, projects, readiness, wishlist, and skills so your shop becomes measurable without fake starter data.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button variant="primary" size="lg" icon={<ArrowRight size={17} />} disabled={working} onClick={onGuided}>
            Start Guided Setup
          </Button>
          <Button variant="secondary" size="lg" icon={<ClipboardList size={17} />} disabled={working} onClick={onChoosePath}>
            Choose setup path
          </Button>
          <Button variant="ghost" size="lg" disabled={working} onClick={onSkip}>
            Skip to Empty Command Center
          </Button>
        </div>
        <p className="mt-5 rounded-xl border border-bench-orange/25 bg-bench-orange/10 p-3 text-sm leading-6 text-bench-orange">
          Your workspace starts empty. Demo data is never added unless you choose it.
        </p>
      </div>
      <div className="grid gap-3">
        {valueCards.map(({ title, description, icon: Icon }) => (
          <div key={title} className="rounded-2xl border border-bench-border bg-white/[0.025] p-4">
            <Icon className="text-bench-orange" size={22} />
            <p className="mt-3 font-bold text-bench-text">{title}</p>
            <p className="mt-1 text-sm leading-6 text-bench-muted">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function PathPanel({ selected, onSelect, working }: { selected: OnboardingPath; onSelect: (path: OnboardingPath) => void; working: boolean }) {
  return (
    <StepShell icon={<Target size={22} />} title="Choose your setup path" description="Guided Setup is recommended, but BenchOS can move as quickly or as deeply as you want.">
      <div className="grid gap-4 lg:grid-cols-3">
        {setupPaths.map((path) => {
          const active = selected === path.id
          return (
            <button
              key={path.id}
              className={`rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-bench-orange/50 ${active ? 'border-bench-orange bg-bench-orange/10' : 'border-bench-border bg-white/[0.025] hover:border-bench-orange/45'}`}
              disabled={working}
              onClick={() => onSelect(path.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-black text-bench-text">{path.title}</p>
                {path.id === 'guided' && <StatusPill label="Recommended" tone="orange" />}
              </div>
              <p className="mt-3 font-semibold text-bench-text">{path.description}</p>
              <p className="mt-2 text-sm leading-6 text-bench-muted">{path.detail}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-bench-orange">
                {path.cta} <ArrowRight size={15} />
              </span>
            </button>
          )
        })}
      </div>
    </StepShell>
  )
}

function ProfileStep({ draft, onProfile, onBack, onNext, working }: { draft: OnboardingDraft; onProfile: (key: keyof OnboardingDraft['profile'], value: string | string[]) => void; onBack: () => void; onNext: () => void; working: boolean }) {
  return (
    <StepShell icon={<Hammer size={22} />} title="Shape the workshop profile" description="This tunes templates, safety depth, readiness language, and setup missions.">
      <div className="grid gap-4 md:grid-cols-2">
        <SelectPill label="Workshop type" value={draft.profile.workshopType} options={workshopTypes} onChange={(value) => onProfile('workshopType', value)} />
        <SelectPill label="Experience level" value={draft.profile.experienceLevel} options={experienceLevels} onChange={(value) => onProfile('experienceLevel', value)} />
        <SelectPill label="Space type" value={draft.profile.spaceType} options={spaceTypes} onChange={(value) => onProfile('spaceType', value)} />
        <SelectPill label="Tool ownership" value={draft.profile.ownershipLevel} options={ownershipLevels} onChange={(value) => onProfile('ownershipLevel', value)} />
        <SelectPill label="Safety guidance" value={draft.profile.safetyPreference} options={safetyPreferences} onChange={(value) => onProfile('safetyPreference', value)} />
      </div>
      <StepActions onBack={onBack} onNext={onNext} working={working} />
    </StepShell>
  )
}

function GoalsStep({ goals, onToggle, onBack, onNext, working }: { goals: string[]; onToggle: (goal: string) => void; onBack: () => void; onNext: () => void; working: boolean }) {
  return (
    <StepShell icon={<Target size={22} />} title="Pick 2-5 goals" description="Goals drive setup missions, dashboard modules, and next recommended actions.">
      <ChipGrid options={goalOptions} selected={goals} onToggle={onToggle} />
      <StepActions onBack={onBack} onNext={onNext} working={working} disabled={goals.length < 2} nextLabel={goals.length < 2 ? 'Choose at least 2 goals' : 'Continue'} />
    </StepShell>
  )
}

function PlatformsStep({ platforms, onToggle, onFavorite, onBack, onNext, working }: { platforms: OnboardingPlatformDraft[]; onToggle: (brand: string) => void; onFavorite: (brand: string) => void; onBack: () => void; onNext: () => void; working: boolean }) {
  const selected = platforms.map((platform) => platform.brand)
  return (
    <StepShell icon={<BatteryCharging size={22} />} title="Which tool ecosystems are in your shop?" description="BenchOS uses this for compatibility filters, wishlist suggestions, and platform-aware guidance.">
      <ChipGrid options={brandOptions} selected={selected} onToggle={onToggle} />
      {platforms.length > 0 && (
        <div className="mt-5 rounded-2xl border border-bench-border bg-white/[0.025] p-4">
          <p className="text-sm font-bold text-bench-text">Favorite brand or platform</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <button key={platform.brand} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${platform.favorite ? 'border-bench-orange bg-bench-orange/10 text-bench-orange' : 'border-bench-border text-bench-muted'}`} onClick={() => onFavorite(platform.brand)}>
                {platform.brand}
              </button>
            ))}
          </div>
        </div>
      )}
      <StepActions onBack={onBack} onNext={onNext} working={working} />
    </StepShell>
  )
}

function FirstToolsStep({ onBack, onNext, working }: { onBack: () => void; onNext: () => void; working: boolean }) {
  return (
    <StepShell icon={<Wrench size={22} />} title="First tools setup" description="Add what you own when you are ready. This step does not auto-add tools.">
      <div className="grid gap-3 md:grid-cols-2">
        {firstToolModes.map((mode) => (
          <div key={mode} className="rounded-2xl border border-bench-border bg-white/[0.025] p-4">
            <p className="font-bold text-bench-text">{mode}</p>
            <p className="mt-2 text-sm leading-6 text-bench-muted">Available as a setup mission after onboarding; no inventory is created automatically.</p>
          </div>
        ))}
      </div>
      <StepActions onBack={onBack} onNext={onNext} working={working} nextLabel="Continue without auto-adding tools" />
    </StepShell>
  )
}

function ProjectGoalsStep({ selected, onToggle, onBack, onNext, working }: { selected: string[]; onToggle: (project: string) => void; onBack: () => void; onNext: () => void; working: boolean }) {
  return (
    <StepShell icon={<ClipboardList size={22} />} title="What do you want to build?" description="BenchOS keeps these as goals first. Real projects can be created later.">
      <ChipGrid options={projectGoalOptions} selected={selected} onToggle={onToggle} />
      <div className="mt-5 rounded-2xl border border-bench-orange/25 bg-bench-orange/10 p-4 text-sm leading-6 text-bench-orange">
        Readiness preview will use only real owned tools plus selected goals. No fake progress is created.
      </div>
      <StepActions onBack={onBack} onNext={onNext} working={working} />
    </StepShell>
  )
}

function SkillStep({ draft, onSkill, onGuidance, onBack, onNext, working }: { draft: OnboardingDraft; onSkill: (value: string) => void; onGuidance: (value: string) => void; onBack: () => void; onNext: () => void; working: boolean }) {
  return (
    <StepShell icon={<GraduationCap size={22} />} title="Set your BenchXP baseline" description="This tunes mastery guide depth, safety reminders, and project recommendations.">
      <div className="grid gap-4 md:grid-cols-2">
        <SelectPill label="Skill level" value={draft.skillProfile.skillLevel} options={experienceLevels} onChange={onSkill} />
        <SelectPill label="Guidance mode" value={draft.skillProfile.guidanceMode} options={safetyPreferences} onChange={onGuidance} />
      </div>
      <StepActions onBack={onBack} onNext={onNext} working={working} />
    </StepShell>
  )
}

function WishlistStep({ selected, onToggle, onBack, onNext, working }: { selected: string[]; onToggle: (item: string) => void; onBack: () => void; onNext: () => void; working: boolean }) {
  return (
    <StepShell icon={<ShoppingCart size={22} />} title="What should BenchOS help you buy smarter?" description="No purchases or wishlist items are created automatically. This only tunes future setup missions.">
      <ChipGrid options={wishlistOptions} selected={selected} onToggle={onToggle} />
      <StepActions onBack={onBack} onNext={onNext} working={working} />
    </StepShell>
  )
}

function DemoStep({ choice, onChoice, onBack, onNext, working }: { choice: NonNullable<OnboardingDraft['sampleChoice']>; onChoice: (choice: NonNullable<OnboardingDraft['sampleChoice']>) => void; onBack: () => void; onNext: () => void; working: boolean }) {
  const options = [
    { id: 'empty', title: 'Keep my workspace empty', detail: 'Recommended. Start from real tools and projects.' },
    { id: 'one_project', title: 'Add one sample project', detail: 'Creates labeled sample tracking only in this pass.' },
    { id: 'full_demo', title: 'Explore full demo workspace', detail: 'Explicit demo tracking; demo records must be labeled and removable.' },
  ] as const
  return (
    <StepShell icon={<Database size={22} />} title="Demo data policy" description="BenchOS never adds demo inventory by surprise. Choose explicitly.">
      <div className="grid gap-3">
        {options.map((option) => (
          <button key={option.id} className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-bench-orange/50 ${choice === option.id ? 'border-bench-orange bg-bench-orange/10' : 'border-bench-border bg-white/[0.025]'}`} onClick={() => onChoice(option.id)}>
            <p className="font-bold text-bench-text">{option.title}</p>
            <p className="mt-1 text-sm leading-6 text-bench-muted">{option.detail}</p>
          </button>
        ))}
      </div>
      <StepActions onBack={onBack} onNext={onNext} working={working} />
    </StepShell>
  )
}

function SummaryStep({ bootstrap, draft, onBack, onOpen, onSkip, working }: { bootstrap?: BootstrapResponse; draft: OnboardingDraft; onBack: () => void; onOpen: () => void; onSkip: () => void; working: boolean }) {
  const rows = [
    ['Workspace', bootstrap?.workspace.name ?? 'Primary Workshop'],
    ['Path', draft.path ?? 'guided'],
    ['Goals selected', String(draft.goals.length)],
    ['Platforms selected', String(draft.platforms.length)],
    ['Project goals', String(draft.projectGoals.length)],
    ['BenchXP mode', draft.skillProfile.guidanceMode ?? 'Not set'],
    ['Demo choice', draft.sampleChoice === 'empty' ? 'Empty workspace' : draft.sampleChoice ?? 'Empty workspace'],
  ]
  return (
    <StepShell icon={<CheckCircle2 size={22} />} title="Your BenchOS workspace is ready." description="Open an empty, server-confirmed command center with setup missions.">
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-bench-border bg-white/[0.025] p-3">
            <p className="text-xs uppercase text-bench-muted">{label}</p>
            <p className="mt-1 font-bold text-bench-text">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button variant="ghost" icon={<ArrowLeft size={16} />} disabled={working} onClick={onBack}>Back</Button>
        <Button variant="secondary" disabled={working} onClick={onSkip}>Skip and open empty dashboard</Button>
        <Button variant="primary" icon={<ArrowRight size={16} />} disabled={working} onClick={onOpen}>Open Command Center</Button>
      </div>
    </StepShell>
  )
}

function StepShell({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-bench-border bg-bench-panel/85 p-5 shadow-panel md:p-6">
      <div className="mb-5 flex items-start gap-4">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-bench-orange/35 bg-bench-orange/15 text-bench-orange">{icon}</span>
        <div>
          <h2 className="text-2xl font-black text-bench-text">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-bench-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function SelectPill({ label, value, options, onChange }: { label: string; value?: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="text-sm font-bold text-bench-text">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button key={option} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-bench-orange/50 ${value === option ? 'border-bench-orange bg-bench-orange/10 text-bench-orange' : 'border-bench-border bg-white/[0.025] text-bench-muted hover:text-bench-text'}`} onClick={() => onChange(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChipGrid({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option)
        return (
          <button key={option} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-bench-orange/50 ${active ? 'border-bench-orange bg-bench-orange/10 text-bench-orange' : 'border-bench-border bg-white/[0.025] text-bench-muted hover:text-bench-text'}`} onClick={() => onToggle(option)}>
            {option}
          </button>
        )
      })}
    </div>
  )
}

function StepActions({ onBack, onNext, working, disabled, nextLabel = 'Continue' }: { onBack: () => void; onNext: () => void; working: boolean; disabled?: boolean; nextLabel?: string }) {
  return (
    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <Button variant="ghost" icon={<ArrowLeft size={16} />} disabled={working} onClick={onBack}>Back</Button>
      <Button variant="primary" icon={<ArrowRight size={16} />} disabled={working || disabled} onClick={onNext}>{nextLabel}</Button>
    </div>
  )
}

function SetupError({ message, onRetry, onSignOut }: { message: string; onRetry: () => void; onSignOut: () => void }) {
  return (
    <div className="rounded-2xl border border-bench-red/30 bg-bench-red/10 p-4">
      <p className="font-bold text-bench-red">Server setup needed</p>
      <p className="mt-2 text-sm leading-6 text-bench-text">{message}</p>
      <p className="mt-2 text-sm leading-6 text-bench-muted">
        If this says Netlify Database is missing, initialize Netlify Database for the site so Netlify can provision the managed Postgres connection and apply migrations.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" onClick={onRetry}>Retry server bootstrap</Button>
        <Button variant="ghost" icon={<LogOut size={16} />} onClick={onSignOut}>Sign out</Button>
      </div>
    </div>
  )
}

function previousStep(step: StepId, steps: StepId[]): StepId {
  const index = steps.indexOf(step)
  if (index <= 0) return 'path'
  return steps[index - 1]
}

function toggle(items: string[], item: string) {
  return items.includes(item) ? items.filter((value) => value !== item) : [...items, item]
}

function errorMessage(caught: unknown) {
  return caught instanceof Error ? caught.message : String(caught)
}
