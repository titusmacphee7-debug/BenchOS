import { transaction } from './db.mjs'

const skillDimensions = ['Safety', 'Setup', 'Control', 'Accuracy', 'Maintenance', 'Project Use']

const defaultSkillScores = Object.freeze({
  Safety: 0,
  Setup: 0,
  Control: 0,
  Accuracy: 0,
  Maintenance: 0,
  'Project Use': 0,
})

const sourceXp = Object.freeze({
  guide_step: 50,
  guide_complete: 250,
  practice_task: 35,
  confidence_checkin: 10,
  mistake_log: 15,
  maintenance_log: 25,
  project_use: 25,
})

export async function getBenchXpState(claims) {
  return transaction(async (client) => {
    const account = await resolveAccount(client, claims)
    return readBenchXpState(client, account)
  })
}

export async function saveBenchXpAction(claims, payload) {
  return transaction(async (client) => {
    const account = await resolveAccount(client, claims)
    const action = safeText(payload.action)

    if (action === 'start-guide') await startGuide(client, account, payload)
    else if (action === 'complete-step') await completeGuideStep(client, account, payload)
    else if (action === 'log-practice') await logPracticeTask(client, account, payload)
    else if (action === 'confidence-checkin') await logConfidenceCheckIn(client, account, payload)
    else if (action === 'mistake-log') await logMistake(client, account, payload)
    else if (action === 'maintenance-log') await logMaintenance(client, account, payload)
    else if (action === 'dismiss-tooltip') await dismissTooltip(client, account, payload)
    else if (action === 'favorite-guide') await toggleFavoriteGuide(client, account, payload)
    else if (action === 'readiness-preferences') await saveReadinessPreferences(client, account, payload)
    else {
      const error = new Error('Unsupported BenchXP action.')
      error.statusCode = 400
      throw error
    }

    return readBenchXpState(client, account)
  })
}

async function resolveAccount(client, claims) {
  const userResult = await client.query(
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
  const user = userResult.rows[0]

  const existingWorkspace = await client.query(
    `select * from workspaces where owner_user_id = $1 and is_primary = true limit 1`,
    [user.id],
  )
  if (existingWorkspace.rows[0]) return { user, workspace: existingWorkspace.rows[0] }

  const createdWorkspace = await client.query(
    `insert into workspaces(owner_user_id, name, kind, is_primary)
     values($1, 'Primary Workshop', 'primary', true)
     returning *`,
    [user.id],
  )
  return { user, workspace: createdWorkspace.rows[0] }
}

async function readBenchXpState(client, account) {
  const params = [account.user.id, account.workspace.id]
  const [progress, events, evidence, practiceLogs, confidenceCheckins, mistakeLogs, maintenanceLogs, dismissedTooltips, favoriteGuides, readinessPreferences] = await Promise.all([
    client.query(`select * from user_guide_progress where user_id = $1 and workspace_id = $2 order by updated_at desc`, params),
    client.query(`select * from user_benchxp_events where user_id = $1 and workspace_id = $2 order by created_at desc limit 100`, params),
    client.query(`select * from user_skill_evidence where user_id = $1 and workspace_id = $2 order by created_at desc limit 150`, params),
    client.query(`select * from user_practice_task_logs where user_id = $1 and workspace_id = $2 order by created_at desc limit 80`, params),
    client.query(`select * from user_confidence_checkins where user_id = $1 and workspace_id = $2 order by created_at desc limit 80`, params),
    client.query(`select * from user_mistake_logs where user_id = $1 and workspace_id = $2 order by created_at desc limit 80`, params),
    client.query(`select * from user_maintenance_logs where user_id = $1 and workspace_id = $2 order by created_at desc limit 80`, params),
    client.query(`select * from dismissed_tooltips where user_id = $1 and workspace_id = $2`, params),
    client.query(`select * from user_favorite_guides where user_id = $1 and workspace_id = $2 order by created_at desc`, params),
    client.query(`select * from user_readiness_preferences where user_id = $1 and workspace_id = $2 limit 1`, params),
  ])

  const progressRows = progress.rows.map(publicProgress)
  const eventRows = events.rows.map(publicEvent)
  return {
    progress: progressRows,
    events: eventRows,
    evidence: evidence.rows.map(publicEvidence),
    practiceLogs: practiceLogs.rows.map(publicPracticeLog),
    confidenceCheckins: confidenceCheckins.rows.map(publicConfidenceCheckIn),
    mistakeLogs: mistakeLogs.rows.map(publicMistakeLog),
    maintenanceLogs: maintenanceLogs.rows.map(publicMaintenanceLog),
    dismissedTooltips: dismissedTooltips.rows.map((row) => row.tooltip_key),
    favoriteGuideIds: favoriteGuides.rows.map((row) => row.guide_id),
    readinessPreferences: readinessPreferences.rows[0] ? publicReadinessPreferences(readinessPreferences.rows[0]) : { mode: 'balanced', preferences: {} },
    recommendations: recommendationsFor(progressRows, evidence.rows, mistakeLogs.rows, maintenanceLogs.rows),
    summary: summarizeEvents(eventRows, progressRows),
  }
}

async function startGuide(client, account, payload) {
  const progress = await ensureProgress(client, account, progressInput(payload))
  if (progress.status === 'not_started') {
    await updateProgress(client, account, progress.id, { status: 'in_progress' })
  }
}

async function completeGuideStep(client, account, payload) {
  const input = progressInput(payload)
  const stepId = requiredText(payload.stepId, 'stepId')
  const stepTitle = safeText(payload.stepTitle) || 'Guide step'
  const stepCategory = safeText(payload.stepCategory)
  const progress = await ensureProgress(client, account, input)

  if (progress.completed_step_ids.includes(stepId)) return

  const dimensions = dimensionsForStep(stepCategory)
  const completedStepIds = unique([...progress.completed_step_ids, stepId])
  const totalStepCount = Math.max(safeNumber(payload.totalStepCount) || completedStepIds.length, completedStepIds.length, 1)
  const completed = completedStepIds.length >= totalStepCount
  const nextScores = improveScores(progress.skill_scores, dimensions, 18)

  const event = await awardEvent(client, account, {
    progressId: progress.id,
    eventKey: `guide-step:${input.guideId}:${input.userToolId ?? 'tool-type'}:${stepId}`,
    sourceType: 'guide_step',
    guideId: input.guideId,
    toolTypeId: input.toolTypeId,
    userToolId: input.userToolId,
    xpAmount: sourceXp.guide_step,
    dimensions,
    description: `Completed ${stepTitle}`,
    evidence: { stepId, stepTitle, stepCategory },
  })

  let awardedXp = event.awardedXp
  if (completed) {
    const completionEvent = await awardEvent(client, account, {
      progressId: progress.id,
      eventKey: `guide-complete:${input.guideId}:${input.userToolId ?? 'tool-type'}`,
      sourceType: 'guide_complete',
      guideId: input.guideId,
      toolTypeId: input.toolTypeId,
      userToolId: input.userToolId,
      xpAmount: sourceXp.guide_complete,
      dimensions: skillDimensions,
      description: 'Completed guide',
      evidence: { totalStepCount },
    })
    awardedXp += completionEvent.awardedXp
  }

  await updateProgress(client, account, progress.id, {
    completedStepIds,
    status: completed ? 'completed' : 'in_progress',
    skillScores: nextScores,
    familiarityScore: familiarityFrom(completedStepIds.length, totalStepCount, nextScores),
    xp: progress.xp + awardedXp,
    practiced: true,
  })

  if (event.row) {
    await addEvidence(client, account, progress.id, event.row.id, input, dimensions, 'guide_step', true, `Completed ${stepTitle}.`)
  }
}

async function logPracticeTask(client, account, payload) {
  const input = progressInput(payload)
  const taskId = requiredText(payload.taskId, 'taskId')
  const title = safeText(payload.title) || 'Practice task'
  const dimensions = normalizeDimensions(payload.dimensions)
  const progress = await ensureProgress(client, account, input)
  const event = await awardEvent(client, account, {
    progressId: progress.id,
    eventKey: `practice:${input.guideId}:${input.userToolId ?? 'tool-type'}:${taskId}:${todayKey()}`,
    sourceType: 'practice_task',
    guideId: input.guideId,
    toolTypeId: input.toolTypeId,
    userToolId: input.userToolId,
    xpAmount: clampXp(safeNumber(payload.xp) || sourceXp.practice_task, 15, 60),
    dimensions,
    description: `Logged practice: ${title}`,
    evidence: { taskId, title, result: safeText(payload.result) },
  })

  await client.query(
    `insert into user_practice_task_logs(user_id, workspace_id, progress_id, event_id, guide_id, tool_type_id, task_id, title, result, confidence, dimensions)
     values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [account.user.id, account.workspace.id, progress.id, event.row?.id, input.guideId, input.toolTypeId, taskId, title, safeText(payload.result), safeNumber(payload.confidence), dimensions],
  )

  const nextScores = improveScores(progress.skill_scores, dimensions, event.awardedXp > 0 ? 14 : 4)
  await updateProgress(client, account, progress.id, {
    status: progress.status === 'completed' ? 'completed' : 'in_progress',
    skillScores: nextScores,
    familiarityScore: Math.max(progress.familiarity_score, familiarityFrom(progress.completed_step_ids.length, safeNumber(payload.totalStepCount) || 7, nextScores) + 4),
    xp: progress.xp + event.awardedXp,
    practiced: true,
  })
  if (event.row) await addEvidence(client, account, progress.id, event.row.id, input, dimensions, 'practice_task', true, `Practice logged: ${title}.`)
}

async function logConfidenceCheckIn(client, account, payload) {
  const input = progressInput(payload)
  const confidence = Math.max(1, Math.min(5, safeNumber(payload.confidence) || 3))
  const progress = await ensureProgress(client, account, input)
  const event = await awardEvent(client, account, {
    progressId: progress.id,
    eventKey: `confidence:${input.guideId}:${input.userToolId ?? 'tool-type'}:${todayKey()}`,
    sourceType: 'confidence_checkin',
    guideId: input.guideId,
    toolTypeId: input.toolTypeId,
    userToolId: input.userToolId,
    xpAmount: sourceXp.confidence_checkin,
    dimensions: skillDimensions,
    description: `Confidence check-in: ${confidence}/5`,
    evidence: { confidence, note: safeText(payload.note) },
  })

  await client.query(
    `insert into user_confidence_checkins(user_id, workspace_id, progress_id, event_id, guide_id, tool_type_id, confidence, note)
     values($1, $2, $3, $4, $5, $6, $7, $8)`,
    [account.user.id, account.workspace.id, progress.id, event.row?.id, input.guideId, input.toolTypeId, confidence, safeText(payload.note)],
  )

  const boost = confidence >= 4 ? 5 : confidence === 3 ? 3 : 1
  const nextScores = improveScores(progress.skill_scores, skillDimensions, boost)
  await updateProgress(client, account, progress.id, {
    skillScores: nextScores,
    familiarityScore: Math.max(progress.familiarity_score, averageScore(nextScores)),
    xp: progress.xp + event.awardedXp,
  })
  if (event.row) await addEvidence(client, account, progress.id, event.row.id, input, skillDimensions, 'confidence_checkin', confidence >= 3, `Confidence check-in recorded at ${confidence}/5.`)
}

async function logMistake(client, account, payload) {
  const input = progressInput(payload)
  const mistakeKey = requiredText(payload.mistakeKey, 'mistakeKey')
  const recommendation = mistakeRecommendation(mistakeKey)
  const progress = await ensureProgress(client, account, input)
  const dimensions = mistakeDimensions(mistakeKey)
  const event = await awardEvent(client, account, {
    progressId: progress.id,
    eventKey: `mistake:${input.guideId}:${input.userToolId ?? 'tool-type'}:${mistakeKey}:${todayKey()}`,
    sourceType: 'mistake_log',
    guideId: input.guideId,
    toolTypeId: input.toolTypeId,
    userToolId: input.userToolId,
    xpAmount: sourceXp.mistake_log,
    dimensions,
    description: `Logged improvement note: ${mistakeKey.replace(/-/g, ' ')}`,
    evidence: { mistakeKey, note: safeText(payload.note), recommendation },
  })

  await client.query(
    `insert into user_mistake_logs(user_id, workspace_id, progress_id, event_id, guide_id, tool_type_id, mistake_key, note, recommendation)
     values($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [account.user.id, account.workspace.id, progress.id, event.row?.id, input.guideId, input.toolTypeId, mistakeKey, safeText(payload.note), recommendation],
  )

  const nextScores = improveScores(progress.skill_scores, dimensions, event.awardedXp > 0 ? 6 : 2)
  await updateProgress(client, account, progress.id, {
    status: progress.status === 'not_started' ? 'in_progress' : progress.status,
    skillScores: nextScores,
    familiarityScore: Math.max(progress.familiarity_score, averageScore(nextScores)),
    xp: progress.xp + event.awardedXp,
  })
  if (event.row) await addEvidence(client, account, progress.id, event.row.id, input, dimensions, 'mistake_log', false, `Mistake pattern logged. ${recommendation}`)
}

async function logMaintenance(client, account, payload) {
  const input = progressInput(payload)
  const maintenanceKey = requiredText(payload.maintenanceKey, 'maintenanceKey')
  const progress = await ensureProgress(client, account, input)
  const dimensions = ['Maintenance', 'Safety']
  const event = await awardEvent(client, account, {
    progressId: progress.id,
    eventKey: `maintenance:${input.guideId}:${input.userToolId ?? 'tool-type'}:${maintenanceKey}:${todayKey()}`,
    sourceType: 'maintenance_log',
    guideId: input.guideId,
    toolTypeId: input.toolTypeId,
    userToolId: input.userToolId,
    xpAmount: sourceXp.maintenance_log,
    dimensions,
    description: `Logged maintenance: ${maintenanceKey.replace(/-/g, ' ')}`,
    evidence: { maintenanceKey, note: safeText(payload.note) },
  })

  await client.query(
    `insert into user_maintenance_logs(user_id, workspace_id, progress_id, event_id, guide_id, tool_type_id, maintenance_key, note)
     values($1, $2, $3, $4, $5, $6, $7, $8)`,
    [account.user.id, account.workspace.id, progress.id, event.row?.id, input.guideId, input.toolTypeId, maintenanceKey, safeText(payload.note)],
  )

  const nextScores = improveScores(progress.skill_scores, dimensions, event.awardedXp > 0 ? 16 : 4)
  await updateProgress(client, account, progress.id, {
    status: progress.status === 'not_started' ? 'in_progress' : progress.status,
    skillScores: nextScores,
    familiarityScore: Math.max(progress.familiarity_score, averageScore(nextScores)),
    xp: progress.xp + event.awardedXp,
    practiced: true,
  })
  if (event.row) await addEvidence(client, account, progress.id, event.row.id, input, dimensions, 'maintenance_log', true, 'Maintenance evidence recorded.')
}

async function dismissTooltip(client, account, payload) {
  const tooltipKey = requiredText(payload.tooltipKey, 'tooltipKey')
  await client.query(
    `insert into dismissed_tooltips(user_id, workspace_id, tooltip_key)
     values($1, $2, $3)
     on conflict(user_id, workspace_id, tooltip_key)
     do update set dismissed_at = now()`,
    [account.user.id, account.workspace.id, tooltipKey],
  )
}

async function toggleFavoriteGuide(client, account, payload) {
  const guideId = requiredText(payload.guideId, 'guideId')
  const toolTypeId = safeText(payload.toolTypeId)
  const favorite = payload.favorite !== false

  if (!favorite) {
    await client.query(
      `delete from user_favorite_guides where user_id = $1 and workspace_id = $2 and guide_id = $3`,
      [account.user.id, account.workspace.id, guideId],
    )
    return
  }

  await client.query(
    `insert into user_favorite_guides(user_id, workspace_id, guide_id, tool_type_id)
     values($1, $2, $3, $4)
     on conflict(user_id, workspace_id, guide_id)
     do update set tool_type_id = excluded.tool_type_id`,
    [account.user.id, account.workspace.id, guideId, toolTypeId],
  )
}

async function saveReadinessPreferences(client, account, payload) {
  const mode = ['relaxed', 'balanced', 'strict'].includes(payload.mode) ? payload.mode : 'balanced'
  await client.query(
    `insert into user_readiness_preferences(user_id, workspace_id, mode, preferences, updated_at)
     values($1, $2, $3, $4::jsonb, now())
     on conflict(user_id, workspace_id)
     do update set mode = excluded.mode, preferences = excluded.preferences, updated_at = now()`,
    [account.user.id, account.workspace.id, mode, JSON.stringify(payload.preferences && typeof payload.preferences === 'object' ? payload.preferences : {})],
  )
}

async function ensureProgress(client, account, input) {
  const existing = await client.query(
    `select * from user_guide_progress
     where user_id = $1 and workspace_id = $2 and guide_id = $3 and coalesce(user_tool_id, '') = coalesce($4::text, '')
     limit 1`,
    [account.user.id, account.workspace.id, input.guideId, input.userToolId],
  )
  if (existing.rows[0]) return normalizeProgressRow(existing.rows[0])

  const created = await client.query(
    `insert into user_guide_progress(user_id, workspace_id, guide_id, tool_type_id, user_tool_id)
     values($1, $2, $3, $4, $5)
     returning *`,
    [account.user.id, account.workspace.id, input.guideId, input.toolTypeId, input.userToolId],
  )
  return normalizeProgressRow(created.rows[0])
}

async function updateProgress(client, account, progressId, next) {
  await client.query(
    `update user_guide_progress
     set status = coalesce($4, status),
       completed_step_ids = coalesce($5::text[], completed_step_ids),
       skill_scores = coalesce($6::jsonb, skill_scores),
       familiarity_score = greatest(familiarity_score, coalesce($7::integer, familiarity_score)),
       xp = coalesce($8::integer, xp),
       last_practiced_at = case when $9::boolean then now() else last_practiced_at end,
       updated_at = now()
     where id = $1 and user_id = $2 and workspace_id = $3`,
    [
      progressId,
      account.user.id,
      account.workspace.id,
      next.status,
      next.completedStepIds,
      next.skillScores ? JSON.stringify(next.skillScores) : undefined,
      next.familiarityScore,
      next.xp,
      Boolean(next.practiced),
    ],
  )
}

async function awardEvent(client, account, event) {
  const inserted = await client.query(
    `insert into user_benchxp_events(user_id, workspace_id, progress_id, event_key, source_type, guide_id, tool_type_id, user_tool_id, xp_amount, dimensions, description, evidence)
     values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
     on conflict(user_id, workspace_id, event_key) do nothing
     returning *`,
    [
      account.user.id,
      account.workspace.id,
      event.progressId,
      event.eventKey,
      event.sourceType,
      event.guideId,
      event.toolTypeId,
      event.userToolId,
      event.xpAmount,
      event.dimensions,
      event.description,
      JSON.stringify(event.evidence ?? {}),
    ],
  )
  const row = inserted.rows[0]
  return { row, awardedXp: row ? row.xp_amount : 0 }
}

async function addEvidence(client, account, progressId, eventId, input, dimensions, evidenceType, positive, summary) {
  for (const dimension of dimensions) {
    await client.query(
      `insert into user_skill_evidence(user_id, workspace_id, progress_id, event_id, guide_id, tool_type_id, dimension, evidence_type, positive, summary)
       values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [account.user.id, account.workspace.id, progressId, eventId, input.guideId, input.toolTypeId, dimension, evidenceType, positive, summary],
    )
  }
}

function progressInput(payload) {
  return {
    guideId: requiredText(payload.guideId, 'guideId'),
    toolTypeId: requiredText(payload.toolTypeId, 'toolTypeId'),
    userToolId: safeText(payload.userToolId),
  }
}

function normalizeProgressRow(row) {
  return {
    ...row,
    completed_step_ids: Array.isArray(row.completed_step_ids) ? row.completed_step_ids : [],
    skill_scores: normalizeScores(row.skill_scores),
  }
}

function publicProgress(row) {
  const normalized = normalizeProgressRow(row)
  return {
    id: normalized.id,
    guideId: normalized.guide_id,
    toolTypeId: normalized.tool_type_id,
    userToolId: normalized.user_tool_id ?? undefined,
    status: normalized.status,
    completedStepIds: normalized.completed_step_ids,
    skillScores: normalized.skill_scores,
    familiarityScore: normalized.familiarity_score,
    xp: normalized.xp,
    lastPracticedAt: normalized.last_practiced_at ?? undefined,
    createdAt: normalized.created_at,
    updatedAt: normalized.updated_at,
  }
}

function publicEvent(row) {
  return {
    id: row.id,
    progressId: row.progress_id ?? undefined,
    eventKey: row.event_key,
    sourceType: row.source_type,
    guideId: row.guide_id ?? undefined,
    toolTypeId: row.tool_type_id ?? undefined,
    userToolId: row.user_tool_id ?? undefined,
    xpAmount: row.xp_amount,
    dimensions: row.dimensions ?? [],
    description: row.description,
    evidence: row.evidence ?? {},
    createdAt: row.created_at,
  }
}

function publicEvidence(row) {
  return {
    id: row.id,
    progressId: row.progress_id ?? undefined,
    eventId: row.event_id ?? undefined,
    guideId: row.guide_id ?? undefined,
    toolTypeId: row.tool_type_id ?? undefined,
    dimension: row.dimension,
    evidenceType: row.evidence_type,
    positive: row.positive,
    summary: row.summary,
    createdAt: row.created_at,
  }
}

function publicPracticeLog(row) {
  return {
    id: row.id,
    progressId: row.progress_id ?? undefined,
    eventId: row.event_id ?? undefined,
    guideId: row.guide_id,
    toolTypeId: row.tool_type_id,
    taskId: row.task_id,
    title: row.title,
    result: row.result ?? undefined,
    confidence: row.confidence ?? undefined,
    dimensions: row.dimensions ?? [],
    createdAt: row.created_at,
  }
}

function publicConfidenceCheckIn(row) {
  return {
    id: row.id,
    progressId: row.progress_id ?? undefined,
    eventId: row.event_id ?? undefined,
    guideId: row.guide_id,
    toolTypeId: row.tool_type_id,
    confidence: row.confidence,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  }
}

function publicMistakeLog(row) {
  return {
    id: row.id,
    progressId: row.progress_id ?? undefined,
    eventId: row.event_id ?? undefined,
    guideId: row.guide_id,
    toolTypeId: row.tool_type_id,
    mistakeKey: row.mistake_key,
    note: row.note ?? undefined,
    recommendation: row.recommendation ?? undefined,
    createdAt: row.created_at,
  }
}

function publicMaintenanceLog(row) {
  return {
    id: row.id,
    progressId: row.progress_id ?? undefined,
    eventId: row.event_id ?? undefined,
    guideId: row.guide_id,
    toolTypeId: row.tool_type_id,
    maintenanceKey: row.maintenance_key,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  }
}

function publicReadinessPreferences(row) {
  return {
    mode: row.mode,
    preferences: row.preferences ?? {},
    updatedAt: row.updated_at,
  }
}

function summarizeEvents(events, progressRows) {
  const totalXp = events.reduce((sum, event) => sum + event.xpAmount, 0)
  const level = Math.floor(totalXp / 500) + 1
  const xpIntoLevel = totalXp % 500
  const completedGuides = progressRows.filter((progress) => progress.status === 'completed').length
  const inProgressGuides = progressRows.filter((progress) => progress.status === 'in_progress').length
  return {
    totalXp,
    level,
    xpIntoLevel,
    xpToNextLevel: 500,
    progressPercent: Math.min(100, Math.round((xpIntoLevel / 500) * 100)),
    completedGuides,
    inProgressGuides,
    averageFamiliarity: progressRows.length > 0 ? Math.round(progressRows.reduce((sum, progress) => sum + progress.familiarityScore, 0) / progressRows.length) : 0,
  }
}

function recommendationsFor(progressRows, evidenceRows, mistakeRows, maintenanceRows) {
  const recommendations = []
  const evidenceByProgress = groupBy(evidenceRows, (row) => row.progress_id)
  const maintenanceByProgress = groupBy(maintenanceRows, (row) => row.progress_id)

  for (const progress of progressRows) {
    const scores = progress.skillScores
    if ((scores.Safety ?? 0) < 50) {
      recommendations.push({
        id: `safety-${progress.guideId}`,
        guideId: progress.guideId,
        toolTypeId: progress.toolTypeId,
        title: 'Review safety setup next',
        detail: 'Safety familiarity is the weakest signal for this guide.',
        priority: 'high',
      })
    } else if ((scores.Accuracy ?? 0) < 45 || (scores.Control ?? 0) < 45) {
      recommendations.push({
        id: `practice-${progress.guideId}`,
        guideId: progress.guideId,
        toolTypeId: progress.toolTypeId,
        title: 'Log one controlled practice task',
        detail: 'Control and accuracy evidence will improve readiness confidence.',
        priority: 'medium',
      })
    }

    if (!maintenanceByProgress.get(progress.id)?.length && (scores.Maintenance ?? 0) < 40) {
      recommendations.push({
        id: `maintenance-${progress.guideId}`,
        guideId: progress.guideId,
        toolTypeId: progress.toolTypeId,
        title: 'Record maintenance familiarity',
        detail: 'Maintenance evidence is missing or thin for this tool type.',
        priority: 'low',
      })
    }

    if (!evidenceByProgress.get(progress.id)?.some((row) => row.evidence_type === 'confidence_checkin')) {
      recommendations.push({
        id: `confidence-${progress.guideId}`,
        guideId: progress.guideId,
        toolTypeId: progress.toolTypeId,
        title: 'Add a confidence check-in',
        detail: 'BenchXP can explain the score better when you record how confident you feel.',
        priority: 'low',
      })
    }
  }

  for (const mistake of mistakeRows.slice(0, 6)) {
    recommendations.push({
      id: `mistake-${mistake.id}`,
      guideId: mistake.guide_id,
      toolTypeId: mistake.tool_type_id,
      title: 'Turn a mistake into practice',
      detail: mistake.recommendation ?? 'Repeat the relevant practice task slowly and inspect the result.',
      priority: 'medium',
    })
  }

  return uniqueBy(recommendations, (item) => item.id).slice(0, 12)
}

function dimensionsForStep(category) {
  if (category === 'Safety') return ['Safety']
  if (category === 'Setup') return ['Setup']
  if (category === 'Basic Use') return ['Control']
  if (category === 'Common Mistakes') return ['Accuracy', 'Safety']
  if (category === 'Practice Task') return ['Control', 'Accuracy', 'Project Use']
  if (category === 'Maintenance') return ['Maintenance']
  return ['Project Use']
}

function mistakeDimensions(mistakeKey) {
  if (mistakeKey.includes('ppe') || mistakeKey.includes('safety')) return ['Safety']
  if (mistakeKey.includes('measurement') || mistakeKey.includes('straight') || mistakeKey.includes('accuracy')) return ['Accuracy']
  if (mistakeKey.includes('control') || mistakeKey.includes('overdriving')) return ['Control']
  if (mistakeKey.includes('bit') || mistakeKey.includes('blade') || mistakeKey.includes('setup')) return ['Setup']
  if (mistakeKey.includes('dust')) return ['Safety', 'Maintenance']
  return ['Control', 'Accuracy']
}

function mistakeRecommendation(mistakeKey) {
  if (mistakeKey.includes('measurement')) return 'Repeat layout and measurement checks before cutting or drilling.'
  if (mistakeKey.includes('bit') || mistakeKey.includes('blade')) return 'Review setup and accessory selection before the next attempt.'
  if (mistakeKey.includes('ppe')) return 'Put the PPE checklist first in the next shop-card run.'
  if (mistakeKey.includes('dust')) return 'Review dust collection, filters, and respiratory protection before repeating the task.'
  if (mistakeKey.includes('overdriving') || mistakeKey.includes('stripped')) return 'Practice slower trigger control and confirm bit fit on scrap.'
  return 'Repeat the relevant practice task slowly and inspect the result.'
}

function normalizeScores(value) {
  const source = value && typeof value === 'object' ? value : {}
  return Object.fromEntries(skillDimensions.map((dimension) => [dimension, clampScore(Number(source[dimension] ?? defaultSkillScores[dimension]))]))
}

function improveScores(scores, dimensions, increment) {
  const next = normalizeScores(scores)
  for (const dimension of normalizeDimensions(dimensions)) {
    next[dimension] = clampScore(next[dimension] + increment)
  }
  return next
}

function normalizeDimensions(value) {
  const source = Array.isArray(value) ? value : []
  const valid = source.filter((dimension) => skillDimensions.includes(dimension))
  return valid.length > 0 ? unique(valid) : ['Project Use']
}

function familiarityFrom(completedCount, totalCount, scores) {
  const guideCompletion = Math.round((completedCount / Math.max(1, totalCount)) * 70)
  const evidenceScore = Math.round(averageScore(scores) * 0.3)
  return clampScore(guideCompletion + evidenceScore)
}

function averageScore(scores) {
  const normalized = normalizeScores(scores)
  return Math.round(skillDimensions.reduce((sum, dimension) => sum + normalized[dimension], 0) / skillDimensions.length)
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)))
}

function clampXp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function requiredText(value, name) {
  const text = safeText(value)
  if (text) return text
  const error = new Error(`${name} is required.`)
  error.statusCode = 400
  throw error
}

function safeText(value) {
  if (typeof value !== 'string') return undefined
  const text = value.trim()
  return text || undefined
}

function safeNumber(value) {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : undefined
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function groupBy(items, getKey) {
  const grouped = new Map()
  for (const item of items) {
    const key = getKey(item)
    if (!key) continue
    grouped.set(key, [...(grouped.get(key) ?? []), item])
  }
  return grouped
}

function unique(items) {
  return [...new Set(items)]
}

function uniqueBy(items, getKey) {
  const seen = new Set()
  const result = []
  for (const item of items) {
    const key = getKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }
  return result
}
