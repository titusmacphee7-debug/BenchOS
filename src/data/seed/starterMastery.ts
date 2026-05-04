import type { MasteryGuide, MasteryProgress, MasteryGuideStepCategory } from '../schema'

const now = '2026-05-03T00:00:00.000Z'

const guideTemplates = [
  ['cordless-drill', 'Cordless Drill', 'Drilling', 'Drill clean pilot holes, drive screws, and care for batteries.'],
  ['circular-saw', 'Circular Saw', 'Cutting', 'Make confident straight cuts in lumber and sheet goods.'],
  ['miter-saw', 'Miter Saw', 'Cutting', 'Set up repeatable crosscuts and accurate miters.'],
  ['jigsaw', 'Jigsaw', 'Cutting', 'Cut curves, notches, and rough shapes with control.'],
  ['random-orbital-sander', 'Random Orbital Sander', 'Sanding', 'Sand flat surfaces without swirl marks or uneven spots.'],
  ['tape-measure', 'Tape Measure', 'Measuring', 'Measure, mark, and verify parts before cutting.'],
  ['speed-square', 'Speed Square', 'Layout', 'Mark square lines, angles, and quick saw guides.'],
  ['bar-clamp', 'Bar Clamp', 'Clamping', 'Hold assemblies square and apply useful glue-up pressure.'],
  ['router', 'Router', 'Routing', 'Route edges, dados, rabbets, and template cuts safely.'],
  ['table-saw', 'Table Saw', 'Cutting', 'Rip boards and sheet goods with controlled setup and safety.'],
] as const

export const starterMasteryGuides: MasteryGuide[] = guideTemplates.map(([toolTypeId, toolName, category, summary], index) => ({
  id: `guide-${toolTypeId}`,
  toolTypeId,
  toolName,
  category,
  summary,
  sortOrder: index + 1,
  steps: buildSteps(toolTypeId, toolName),
  createdAt: now,
  updatedAt: now,
}))

export const starterMasteryProgress: MasteryProgress[] = [
  progress('mastery-cordless-drill', 'guide-cordless-drill', 'cordless-drill', 'tool-1', ['cordless-drill-overview', 'cordless-drill-safety', 'cordless-drill-setup'], 150),
  progress('mastery-circular-saw', 'guide-circular-saw', 'circular-saw', 'tool-2', ['circular-saw-overview', 'circular-saw-safety'], 100),
  progress('mastery-speed-square', 'guide-speed-square', 'speed-square', undefined, ['speed-square-overview', 'speed-square-safety', 'speed-square-setup', 'speed-square-basic-use', 'speed-square-common-mistakes', 'speed-square-practice-task', 'speed-square-maintenance'], 350),
]

function buildSteps(toolTypeId: string, toolName: string) {
  return ([
    ['overview', 'Overview', `Know the parts, common uses, and limits of the ${toolName}.`],
    ['safety', 'Safety', `Check PPE, workholding, and the safe setup habits for the ${toolName}.`],
    ['setup', 'Setup', `Prepare the ${toolName}, accessories, and workspace before starting.`],
    ['basic-use', 'Basic Use', `Practice the core operation with a controlled beginner task.`],
    ['common-mistakes', 'Common Mistakes', `Recognize bad setup, rushing, and the most common accuracy issues.`],
    ['practice-task', 'Practice Task', `Complete one simple repeatable exercise and inspect the result.`],
    ['maintenance', 'Maintenance', `Clean, inspect, store, and note what should be checked next time.`],
  ] as Array<[string, MasteryGuideStepCategory, string]>).map(([slug, category, description], index) => ({
    id: `${toolTypeId}-${slug}`,
    title: category,
    category,
    description,
    xp: 50,
    sortOrder: index + 1,
  }))
}

function progress(id: string, guideId: string, toolTypeId: string, userToolId: string | undefined, completedStepIds: string[], xp: number): MasteryProgress {
  const completedCount = completedStepIds.length
  const percent = Math.round((completedCount / 7) * 100)
  return {
    id,
    guideId,
    toolTypeId,
    userToolId,
    level: percent === 100 ? 5 : Math.max(1, Math.ceil(percent / 20)),
    xp,
    xpToNextLevel: 500,
    status: percent === 100 ? 'Mastered' : 'In Progress',
    completedStepIds,
    safetyProgress: completedStepIds.includes(`${toolTypeId}-safety`) ? 100 : 0,
    setupProgress: completedStepIds.includes(`${toolTypeId}-setup`) ? 100 : 0,
    operationProgress: Math.round((['overview', 'basic-use'].filter((slug) => completedStepIds.includes(`${toolTypeId}-${slug}`)).length / 2) * 100),
    accuracyProgress: Math.round((['common-mistakes', 'practice-task'].filter((slug) => completedStepIds.includes(`${toolTypeId}-${slug}`)).length / 2) * 100),
    maintenanceProgress: completedStepIds.includes(`${toolTypeId}-maintenance`) ? 100 : 0,
    lastPracticedAt: now,
    createdAt: now,
    updatedAt: now,
  }
}
