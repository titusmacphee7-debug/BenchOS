import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { saveToolBuyingPreferences } from '../../data/actions'
import { useToolBuyingPreferences } from '../../data/hooks'
import type { BuyingPreferenceBudget, ToolBuyingPreferences } from '../../data/schema'
import { buyingPreferenceBudgets } from '../../data/schema'

export function BuyingPreferencesPage() {
  const preferences = useToolBuyingPreferences()

  return (
    <div>
      <PageHeader
        title="Buying Preferences"
        description="Tune recommendations by preferred brands, battery platforms, budget tier, and workshop style."
        icon={SlidersHorizontal}
      />
      <BuyingPreferencesForm key={preferences?.updatedAt ?? 'default'} preferences={preferences} />
    </div>
  )
}

function BuyingPreferencesForm({ preferences }: { preferences?: ToolBuyingPreferences }) {
  const [preferredBrands, setPreferredBrands] = useState(() => preferences?.preferredBrands.join(', ') ?? '')
  const [avoidedBrands, setAvoidedBrands] = useState(() => preferences?.avoidedBrands.join(', ') ?? '')
  const [preferredPlatforms, setPreferredPlatforms] = useState(() => preferences?.preferredBatteryPlatforms.join(', ') ?? '')
  const [budgetTier, setBudgetTier] = useState<BuyingPreferenceBudget>(() => preferences?.budgetTier ?? 'balanced')
  const [workshopType, setWorkshopType] = useState<ToolBuyingPreferences['workshopType']>(() => preferences?.workshopType ?? 'mixed')
  const [storageSensitivity, setStorageSensitivity] = useState<ToolBuyingPreferences['storageSensitivity']>(() => preferences?.storageSensitivity ?? 'medium')
  const [noiseSensitivity, setNoiseSensitivity] = useState<ToolBuyingPreferences['noiseSensitivity']>(() => preferences?.noiseSensitivity ?? 'medium')
  const [dustSensitivity, setDustSensitivity] = useState<ToolBuyingPreferences['dustSensitivity']>(() => preferences?.dustSensitivity ?? 'medium')
  const [preferCordless, setPreferCordless] = useState(() => preferences?.preferCordless ?? true)
  const [message, setMessage] = useState<string>()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const now = new Date().toISOString()
    await saveToolBuyingPreferences({
      id: 'default',
      preferredBrands: parseList(preferredBrands),
      avoidedBrands: parseList(avoidedBrands),
      preferredBatteryPlatforms: parseList(preferredPlatforms),
      budgetTier,
      workshopType,
      storageSensitivity,
      noiseSensitivity,
      dustSensitivity,
      preferCordless,
      createdAt: preferences?.createdAt ?? now,
      updatedAt: now,
    })
    setMessage('Buying preferences saved.')
    window.setTimeout(() => setMessage(undefined), 2500)
  }

  return (
    <Card>
        <CardTitle title="Recommendation Inputs" />
        <form className="grid gap-4" onSubmit={(event) => void submit(event)}>
          <Field label="Preferred brands" value={preferredBrands} onChange={setPreferredBrands} placeholder="DeWalt, Milwaukee, Makita" />
          <Field label="Avoided brands" value={avoidedBrands} onChange={setAvoidedBrands} placeholder="Brands you do not want recommended" />
          <Field label="Preferred battery platforms" value={preferredPlatforms} onChange={setPreferredPlatforms} placeholder="DeWalt 20V MAX, Milwaukee M18" />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-bench-text">
              Buying tier
              <select className="h-11 rounded-lg border border-bench-border bg-bench-bg px-3 text-sm outline-none focus:border-bench-orange/70" value={budgetTier} onChange={(event) => setBudgetTier(event.target.value as BuyingPreferenceBudget)}>
                {buyingPreferenceBudgets.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-bench-text">
              Workshop style
              <select className="h-11 rounded-lg border border-bench-border bg-bench-bg px-3 text-sm outline-none focus:border-bench-orange/70" value={workshopType} onChange={(event) => setWorkshopType(event.target.value as ToolBuyingPreferences['workshopType'])}>
                {['mixed', 'woodworking', 'home-repair', 'automotive', 'apartment', 'budget'].map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <SensitivityField label="Storage sensitivity" value={storageSensitivity} onChange={(value) => setStorageSensitivity(value as ToolBuyingPreferences['storageSensitivity'])} />
            <SensitivityField label="Noise sensitivity" value={noiseSensitivity} onChange={(value) => setNoiseSensitivity(value as ToolBuyingPreferences['noiseSensitivity'])} />
            <SensitivityField label="Dust sensitivity" value={dustSensitivity} onChange={(value) => setDustSensitivity(value as ToolBuyingPreferences['dustSensitivity'])} />
            <label className="flex min-h-11 items-center gap-3 rounded-lg border border-bench-border bg-white/[0.025] px-3 text-sm font-semibold text-bench-text">
              <input type="checkbox" checked={preferCordless} onChange={(event) => setPreferCordless(event.target.checked)} />
              Prefer cordless
            </label>
          </div>
          <Button type="submit">Save Preferences</Button>
          {message && <p className="rounded-lg border border-bench-green/30 bg-bench-green/10 p-3 text-sm text-bench-green">{message}</p>}
        </form>
    </Card>
  )
}

function SensitivityField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-bench-text">
      {label}
      <select className="h-11 rounded-lg border border-bench-border bg-bench-bg px-3 text-sm outline-none focus:border-bench-orange/70" value={value} onChange={(event) => onChange(event.target.value)}>
        {['low', 'medium', 'high'].map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-bench-text">
      {label}
      <input className="h-11 rounded-lg border border-bench-border bg-white/[0.035] px-3 text-sm outline-none focus:border-bench-orange/70" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

function parseList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}
