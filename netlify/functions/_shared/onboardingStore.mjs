import { transaction } from './db.mjs'

const defaultMissions = [
  ['add-first-tools', 'Add your first 5 tools', 'Inventory unlocks readiness checks and smarter wishlist gaps.', 'Add tools', '/my-tools', 'Starts real readiness scoring.'],
  ['pick-first-project', 'Pick your first project', 'Projects turn your tool library into practical next steps.', 'Browse projects', '/project-templates', 'Shows what you can build.'],
  ['wishlist-one-item', 'Add one wishlist item', 'Focused wishlist items prevent duplicate buys and platform drift.', 'Open wishlist', '/wishlist', 'Connects gaps to purchases.'],
  ['safety-checklist', 'Complete your safety gear checklist', 'Safety readiness keeps beginner guidance practical.', 'Review mastery', '/mastery', 'Improves safe project starts.'],
  ['battery-platform', 'Choose your battery platform', 'Platform choices improve compatible tool suggestions.', 'Open settings', '/settings/buying-preferences', 'Improves compatibility hints.'],
]

export async function bootstrapWorkspace(claims) {
  return transaction(async (client) => {
    const user = await upsertUser(client, claims)
    const workspace = await getOrCreatePrimaryWorkspace(client, user.id)
    const onboarding = await getOrCreateOnboardingState(client, user.id, workspace.id)
    return { user: publicUser(user), workspace, onboarding }
  })
}

export async function getOnboarding(claims) {
  return bootstrapWorkspace(claims)
}

export async function saveOnboarding(claims, payload) {
  return transaction(async (client) => {
    const user = await upsertUser(client, claims)
    const workspace = await getOrCreatePrimaryWorkspace(client, user.id)
    const currentStep = safeText(payload.currentStep) || 'welcome'
    const path = safePath(payload.path)
    const data = payload.data && typeof payload.data === 'object' ? payload.data : {}

    const onboarding = await client.query(
      `insert into onboarding_state(user_id, workspace_id, status, path, current_step, data, updated_at)
       values($1, $2, 'in_progress', $3, $4, $5::jsonb, now())
       on conflict(user_id, workspace_id)
       do update set status = case when onboarding_state.status in ('completed', 'skipped') then onboarding_state.status else 'in_progress' end,
         path = coalesce(excluded.path, onboarding_state.path),
         current_step = excluded.current_step,
         data = onboarding_state.data || excluded.data,
         updated_at = now()
       returning *`,
      [user.id, workspace.id, path, currentStep, JSON.stringify(data)],
    )

    await saveProfile(client, user.id, workspace.id, payload.profile)
    await replaceGoals(client, user.id, workspace.id, payload.goals)
    await replacePlatforms(client, user.id, workspace.id, payload.platforms)
    await replaceProjectGoals(client, user.id, workspace.id, payload.projectGoals)
    await saveSkillProfile(client, user.id, workspace.id, payload.skillProfile)
    await saveDashboardPreferences(client, user.id, workspace.id, payload.dashboardPreferences)

    return { user: publicUser(user), workspace, onboarding: onboarding.rows[0] }
  })
}

export async function completeOnboarding(claims, payload) {
  return transaction(async (client) => {
    const user = await upsertUser(client, claims)
    const workspace = await getOrCreatePrimaryWorkspace(client, user.id)
    const skipped = Boolean(payload.skipped)
    const status = skipped ? 'skipped' : 'completed'
    const path = safePath(payload.path)

    const onboarding = await client.query(
      `insert into onboarding_state(user_id, workspace_id, status, path, current_step, data, completed_at, skipped_at, updated_at)
       values($1, $2, $3, $4, 'summary', $5::jsonb, case when $3 = 'completed' then now() end, case when $3 = 'skipped' then now() end, now())
       on conflict(user_id, workspace_id)
       do update set status = excluded.status,
         path = coalesce(excluded.path, onboarding_state.path),
         current_step = 'summary',
         data = onboarding_state.data || excluded.data,
         completed_at = case when excluded.status = 'completed' then now() else onboarding_state.completed_at end,
         skipped_at = case when excluded.status = 'skipped' then now() else onboarding_state.skipped_at end,
         updated_at = now()
       returning *`,
      [user.id, workspace.id, status, path, JSON.stringify(payload.data ?? {})],
    )

    await ensureSetupMissions(client, user.id, workspace.id)
    return { user: publicUser(user), workspace, onboarding: onboarding.rows[0], missions: await listMissions(client, user.id, workspace.id) }
  })
}

export async function createSampleBatch(claims, payload) {
  return transaction(async (client) => {
    const user = await upsertUser(client, claims)
    const workspace = await getOrCreatePrimaryWorkspace(client, user.id)
    const sampleKind = payload.sampleKind === 'full_demo' ? 'full_demo' : 'one_project'
    const label = sampleKind === 'full_demo' ? 'BenchOS Full Demo Workspace' : 'BenchOS Sample Project'
    const batch = await client.query(
      `insert into sample_data_batches(user_id, workspace_id, label, sample_kind)
       values($1, $2, $3, $4)
       returning *`,
      [user.id, workspace.id, label, sampleKind],
    )
    return { batch: batch.rows[0], message: 'Sample batch tracking created. Demo records must be created by an explicit later step and remain labeled.' }
  })
}

export async function deleteSampleBatch(claims, payload) {
  return transaction(async (client) => {
    const user = await upsertUser(client, claims)
    const batchId = safeText(payload.batchId)
    if (!batchId) {
      const error = new Error('batchId is required.')
      error.statusCode = 400
      throw error
    }
    const result = await client.query(
      `update sample_data_batches
       set deleted_at = now()
       where id = $1 and user_id = $2
       returning *`,
      [batchId, user.id],
    )
    if (result.rowCount === 0) {
      const error = new Error('Sample batch was not found for this account.')
      error.statusCode = 404
      throw error
    }
    return { batch: result.rows[0] }
  })
}

async function upsertUser(client, claims) {
  const result = await client.query(
    `insert into app_users(auth0_sub, email, display_name, avatar_url, last_login_at, updated_at)
     values($1, $2, $3, $4, now(), now())
     on conflict(auth0_sub)
     do update set email = coalesce(excluded.email, app_users.email),
       display_name = coalesce(excluded.display_name, app_users.display_name),
       avatar_url = coalesce(excluded.avatar_url, app_users.avatar_url),
       last_login_at = now(),
       updated_at = now()
     returning *`,
    [claims.auth0Sub, claims.email, claims.displayName, claims.avatarUrl],
  )
  return result.rows[0]
}

async function getOrCreatePrimaryWorkspace(client, userId) {
  const existing = await client.query(
    `select * from workspaces where owner_user_id = $1 and is_primary = true limit 1`,
    [userId],
  )
  if (existing.rows[0]) return existing.rows[0]

  const created = await client.query(
    `insert into workspaces(owner_user_id, name, kind, is_primary)
     values($1, 'Primary Workshop', 'primary', true)
     returning *`,
    [userId],
  )
  return created.rows[0]
}

async function getOrCreateOnboardingState(client, userId, workspaceId) {
  const existing = await client.query(
    `select * from onboarding_state where user_id = $1 and workspace_id = $2 limit 1`,
    [userId, workspaceId],
  )
  if (existing.rows[0]) return existing.rows[0]

  const created = await client.query(
    `insert into onboarding_state(user_id, workspace_id, status, current_step)
     values($1, $2, 'not_started', 'boot')
     returning *`,
    [userId, workspaceId],
  )
  return created.rows[0]
}

async function saveProfile(client, userId, workspaceId, profile) {
  if (!profile || typeof profile !== 'object') return
  await client.query(
    `insert into workshop_preferences(user_id, workspace_id, workshop_type, space_type, experience_level, ownership_level, safety_preference, project_interests, updated_at)
     values($1, $2, $3, $4, $5, $6, $7, $8, now())
     on conflict(user_id, workspace_id)
     do update set workshop_type = excluded.workshop_type,
       space_type = excluded.space_type,
       experience_level = excluded.experience_level,
       ownership_level = excluded.ownership_level,
       safety_preference = excluded.safety_preference,
       project_interests = excluded.project_interests,
       updated_at = now()`,
    [
      userId,
      workspaceId,
      safeText(profile.workshopType),
      safeText(profile.spaceType),
      safeText(profile.experienceLevel),
      safeText(profile.ownershipLevel),
      safeText(profile.safetyPreference),
      arrayText(profile.projectInterests),
    ],
  )
}

async function replaceGoals(client, userId, workspaceId, goals) {
  if (!Array.isArray(goals)) return
  await client.query('delete from user_goals where user_id = $1 and workspace_id = $2', [userId, workspaceId])
  for (const goal of goals.map(safeText).filter(Boolean)) {
    await client.query(
      `insert into user_goals(user_id, workspace_id, goal_key) values($1, $2, $3) on conflict do nothing`,
      [userId, workspaceId, goal],
    )
  }
}

async function replacePlatforms(client, userId, workspaceId, platforms) {
  if (!Array.isArray(platforms)) return
  await client.query('delete from user_tool_platforms where user_id = $1 and workspace_id = $2', [userId, workspaceId])
  for (const platform of platforms) {
    const brand = safeText(platform?.brand)
    if (!brand) continue
    await client.query(
      `insert into user_tool_platforms(user_id, workspace_id, brand, platform, favorite, cordless_preference)
       values($1, $2, $3, $4, $5, $6)
       on conflict do nothing`,
      [userId, workspaceId, brand, safeText(platform.platform), Boolean(platform.favorite), safeText(platform.cordlessPreference)],
    )
  }
}

async function replaceProjectGoals(client, userId, workspaceId, projectGoals) {
  if (!Array.isArray(projectGoals)) return
  await client.query('delete from user_project_goals where user_id = $1 and workspace_id = $2', [userId, workspaceId])
  for (const projectKey of projectGoals.map(safeText).filter(Boolean)) {
    await client.query(
      `insert into user_project_goals(user_id, workspace_id, project_key, readiness_preview)
       values($1, $2, $3, '{}'::jsonb)
       on conflict do nothing`,
      [userId, workspaceId, projectKey],
    )
  }
}

async function saveSkillProfile(client, userId, workspaceId, skillProfile) {
  if (!skillProfile || typeof skillProfile !== 'object') return
  await client.query(
    `insert into user_skill_profile(user_id, workspace_id, skill_level, guidance_mode, updated_at)
     values($1, $2, $3, $4, now())
     on conflict(user_id, workspace_id)
     do update set skill_level = excluded.skill_level,
       guidance_mode = excluded.guidance_mode,
       updated_at = now()`,
    [userId, workspaceId, safeText(skillProfile.skillLevel), safeText(skillProfile.guidanceMode)],
  )
}

async function saveDashboardPreferences(client, userId, workspaceId, preferences) {
  if (!preferences || typeof preferences !== 'object') return
  await client.query(
    `insert into dashboard_preferences(user_id, workspace_id, preferences, updated_at)
     values($1, $2, $3::jsonb, now())
     on conflict(user_id, workspace_id)
     do update set preferences = excluded.preferences,
       updated_at = now()`,
    [userId, workspaceId, JSON.stringify(preferences)],
  )
}

async function ensureSetupMissions(client, userId, workspaceId) {
  for (const [missionKey, title, purpose, ctaLabel, ctaRoute, readinessImpact] of defaultMissions) {
    await client.query(
      `insert into setup_missions(user_id, workspace_id, mission_key, title, purpose, cta_label, cta_route, readiness_impact)
       values($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict do nothing`,
      [userId, workspaceId, missionKey, title, purpose, ctaLabel, ctaRoute, readinessImpact],
    )
  }
}

async function listMissions(client, userId, workspaceId) {
  const result = await client.query(
    `select * from setup_missions where user_id = $1 and workspace_id = $2 order by created_at asc`,
    [userId, workspaceId],
  )
  return result.rows
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
  }
}

function safePath(path) {
  return ['quick', 'guided', 'power'].includes(path) ? path : undefined
}

function safeText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function arrayText(value) {
  return Array.isArray(value) ? value.map(safeText).filter(Boolean) : []
}
