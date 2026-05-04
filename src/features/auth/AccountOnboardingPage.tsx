import { ArrowRight, HardDrive, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { StatusPill } from '../../components/ui/StatusPill'
import { completeAccountOnboarding } from '../../data/actions'
import { useAuthSessionState, useToolBuyingPreferences, useUserProfile, useWorkshopProfile } from '../../data/hooks'
import type { AccountOnboardingFormValues, BuyingPreferenceBudget, SkillLevel, WorkshopSpaceType, WorkshopType } from '../../data/schema'
import { buyingPreferenceBudgets, skillLevels, workshopSpaceTypes } from '../../data/schema'
import { enterLocalMode } from '../../lib/sync/localModeService'

const projectInterestOptions = [
  'Woodworking',
  'Home Improvement',
  'Outdoor Furniture',
  'Automotive',
  'Electrical',
  'Plumbing',
  'Shop Fixtures',
  'Storage',
]

const safetyPriorityOptions = [
  'Eye protection',
  'Hearing protection',
  'Dust protection',
  'Fire safety',
  'First aid',
]

const workshopTypes: WorkshopType[] = ['mixed', 'woodworking', 'home-repair', 'automotive']
const sensitivityOptions: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high']

export function AccountOnboardingPage() {
  const navigate = useNavigate()
  const session = useAuthSessionState()
  const userProfile = useUserProfile()
  const workshop = useWorkshopProfile()
  const preferences = useToolBuyingPreferences()
  const defaults = useMemo<AccountOnboardingFormValues>(() => ({
    displayName: userProfile?.displayName && userProfile.displayName !== 'Local Mode' ? userProfile.displayName : 'Titus',
    workshopName: workshop?.name ?? 'Local Workshop',
    workshopType: workshop?.type ?? 'mixed',
    skillLevel: workshop?.skillLevel ?? 'Beginner',
    spaceType: workshop?.spaceType ?? 'garage',
    projectInterests: workshop?.projectInterests?.length ? workshop.projectInterests : ['Home Improvement', 'Woodworking'],
    safetyPriorities: workshop?.safetyPriorities?.length ? workshop.safetyPriorities : ['Eye protection', 'Dust protection'],
    preferredBrands: preferences?.preferredBrands ?? [],
    avoidedBrands: preferences?.avoidedBrands ?? [],
    preferredBatteryPlatforms: preferences?.preferredBatteryPlatforms ?? [],
    budgetTier: preferences?.budgetTier ?? 'balanced',
    storageSensitivity: preferences?.storageSensitivity ?? 'medium',
    noiseSensitivity: preferences?.noiseSensitivity ?? 'medium',
    dustSensitivity: preferences?.dustSensitivity ?? 'medium',
    preferCordless: preferences?.preferCordless ?? true,
  }), [preferences, userProfile, workshop])
  const [draft, setDraft] = useState<Partial<AccountOnboardingFormValues>>({})
  const values: AccountOnboardingFormValues = { ...defaults, ...draft }
  const [preferredBrandsText, setPreferredBrandsText] = useState<string>()
  const [avoidedBrandsText, setAvoidedBrandsText] = useState<string>()
  const [platformsText, setPlatformsText] = useState<string>()
  const preferredBrandsInput = preferredBrandsText ?? defaults.preferredBrands.join(', ')
  const avoidedBrandsInput = avoidedBrandsText ?? defaults.avoidedBrands.join(', ')
  const platformsInput = platformsText ?? defaults.preferredBatteryPlatforms.join(', ')
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()
  const [working, setWorking] = useState(false)
  const signedIn = session?.status === 'signed_in'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setWorking(true)
    setMessage(undefined)
    setError(undefined)
    try {
      const result = await completeAccountOnboarding({
        ...values,
        preferredBrands: parseList(preferredBrandsInput),
        avoidedBrands: parseList(avoidedBrandsInput),
        preferredBatteryPlatforms: parseList(platformsInput),
      })
      if (result.syncError) {
        setMessage('Saved locally. Sync will retry from Account when Supabase is reachable.')
      } else {
        setMessage('Account onboarding saved.')
      }
      navigate('/')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setWorking(false)
    }
  }

  async function continueLocalMode() {
    await enterLocalMode()
    navigate('/local-mode')
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-5">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-bench-text">Set up your workshop intelligence</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-bench-muted">
            These answers tune templates, diagnostics, compatibility warnings, and sync-ready workshop preferences.
          </p>
        </div>
        <StatusPill label={signedIn ? 'Signed in' : 'Local Mode'} tone={signedIn ? 'green' : 'orange'} />
      </section>

      <form className="grid gap-5" onSubmit={(event) => void submit(event)}>
        <Card>
          <CardTitle title="Profile" action={<UserRound className="text-bench-orange" size={20} />} />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Display name" value={values.displayName} onChange={(displayName) => setDraft((current) => ({ ...current, displayName }))} />
            <TextField label="Workshop name" value={values.workshopName} onChange={(workshopName) => setDraft((current) => ({ ...current, workshopName }))} />
            <SelectField label="Workshop type" value={values.workshopType} options={workshopTypes} onChange={(workshopType) => setDraft((current) => ({ ...current, workshopType: workshopType as WorkshopType }))} />
            <SelectField label="Skill level" value={values.skillLevel} options={skillLevels} onChange={(skillLevel) => setDraft((current) => ({ ...current, skillLevel: skillLevel as SkillLevel }))} />
          </div>
        </Card>

        <Card>
          <CardTitle title="Workshop Fit" action={<SlidersHorizontal className="text-bench-orange" size={20} />} />
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Space type" value={values.spaceType} options={workshopSpaceTypes} onChange={(spaceType) => setDraft((current) => ({ ...current, spaceType: spaceType as WorkshopSpaceType }))} />
            <SelectField label="Budget tier" value={values.budgetTier} options={buyingPreferenceBudgets} onChange={(budgetTier) => setDraft((current) => ({ ...current, budgetTier: budgetTier as BuyingPreferenceBudget }))} />
            <SelectField label="Storage sensitivity" value={values.storageSensitivity} options={sensitivityOptions} onChange={(storageSensitivity) => setDraft((current) => ({ ...current, storageSensitivity: storageSensitivity as 'low' | 'medium' | 'high' }))} />
            <SelectField label="Noise sensitivity" value={values.noiseSensitivity} options={sensitivityOptions} onChange={(noiseSensitivity) => setDraft((current) => ({ ...current, noiseSensitivity: noiseSensitivity as 'low' | 'medium' | 'high' }))} />
            <SelectField label="Dust sensitivity" value={values.dustSensitivity} options={sensitivityOptions} onChange={(dustSensitivity) => setDraft((current) => ({ ...current, dustSensitivity: dustSensitivity as 'low' | 'medium' | 'high' }))} />
            <label className="flex min-h-11 items-center gap-3 rounded-lg border border-bench-border bg-white/[0.025] px-3 text-sm font-semibold text-bench-text">
              <input
                type="checkbox"
                checked={values.preferCordless}
                onChange={(event) => setDraft((current) => ({ ...current, preferCordless: event.target.checked }))}
              />
              Prefer cordless tools when practical
            </label>
          </div>
        </Card>

        <Card>
          <CardTitle title="Project and Safety Priorities" action={<ShieldCheck className="text-bench-orange" size={20} />} />
          <div className="grid gap-5 lg:grid-cols-2">
            <ChoiceGroup
              label="Project interests"
              options={projectInterestOptions}
              selected={values.projectInterests}
              onToggle={(projectInterests) => setDraft((current) => ({ ...current, projectInterests }))}
            />
            <ChoiceGroup
              label="Safety priorities"
              options={safetyPriorityOptions}
              selected={values.safetyPriorities}
              onToggle={(safetyPriorities) => setDraft((current) => ({ ...current, safetyPriorities }))}
            />
          </div>
        </Card>

        <Card>
          <CardTitle title="Brands and Platforms" />
          <div className="grid gap-4 md:grid-cols-3">
            <TextField label="Preferred brands" value={preferredBrandsInput} onChange={setPreferredBrandsText} placeholder="DeWalt, Milwaukee" />
            <TextField label="Avoided brands" value={avoidedBrandsInput} onChange={setAvoidedBrandsText} placeholder="Brands to avoid" />
            <TextField label="Battery platforms" value={platformsInput} onChange={setPlatformsText} placeholder="DeWalt 20V MAX, M18" />
          </div>
        </Card>

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" icon={<HardDrive size={16} />} onClick={() => void continueLocalMode()}>
            Continue in Local Mode
          </Button>
          <Button type="submit" variant="primary" icon={<ArrowRight size={16} />} disabled={working || !values.displayName.trim() || !values.workshopName.trim()}>
            Save and Continue
          </Button>
        </div>
        {message && <p className="rounded-lg border border-bench-green/30 bg-bench-green/10 p-3 text-sm text-bench-green">{message}</p>}
        {error && <p className="rounded-lg border border-bench-red/30 bg-bench-red/10 p-3 text-sm text-bench-red">{error}</p>}
      </form>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-bench-text">
      {label}
      <input
        className="h-11 rounded-lg border border-bench-border bg-white/[0.035] px-3 text-sm outline-none focus:border-bench-orange/70"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-bench-text">
      {label}
      <select className="h-11 rounded-lg border border-bench-border bg-bench-bg px-3 text-sm outline-none focus:border-bench-orange/70" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function ChoiceGroup({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (selected: string[]) => void }) {
  return (
    <section>
      <p className="text-sm font-semibold text-bench-text">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? 'border-bench-orange bg-bench-orange/12 text-bench-orange'
                  : 'border-bench-border bg-white/[0.025] text-bench-muted hover:border-bench-orange/45 hover:text-bench-text'
              }`}
              onClick={() => onToggle(active ? selected.filter((item) => item !== option) : [...selected, option])}
            >
              {option}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function parseList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}
