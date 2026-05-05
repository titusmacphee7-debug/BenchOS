export type OnboardingPath = 'quick' | 'guided' | 'power'

export type OnboardingProfileDraft = {
  workshopType?: string
  experienceLevel?: string
  spaceType?: string
  ownershipLevel?: string
  safetyPreference?: string
  projectInterests?: string[]
}

export type OnboardingPlatformDraft = {
  brand: string
  platform?: string
  favorite?: boolean
  cordlessPreference?: string
}

export type OnboardingSkillProfileDraft = {
  skillLevel?: string
  guidanceMode?: string
}

export type OnboardingDraft = {
  path?: OnboardingPath
  profile: OnboardingProfileDraft
  goals: string[]
  platforms: OnboardingPlatformDraft[]
  projectGoals: string[]
  skillProfile: OnboardingSkillProfileDraft
  wishlistStrategy: string[]
  sampleChoice?: 'empty' | 'one_project' | 'full_demo'
}

export type ServerOnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped'

export type ServerOnboardingState = {
  id: string
  status: ServerOnboardingStatus
  path?: OnboardingPath
  current_step: string
  data: Record<string, unknown>
}

export type BootstrapResponse = {
  user: {
    id: string
    email?: string
    displayName?: string
    avatarUrl?: string
  }
  workspace: {
    id: string
    name: string
    kind: 'primary' | 'demo'
    is_primary: boolean
    is_sample: boolean
  }
  onboarding: ServerOnboardingState
}
