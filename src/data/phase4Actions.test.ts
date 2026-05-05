import { beforeEach, describe, expect, it } from 'vitest'
import {
  completeMasteryGuideStep,
  logMaintenance,
  logMaterialUsage,
  logToolUsage,
  updateUserTool,
} from './actions'
import { db } from './db'
import type { MasteryGuide, Material, Project, UserTool } from './schema'

const now = '2026-05-03T12:00'

describe('phase 4 actions', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    await db.userTools.put(tool())
    await db.materials.put(material())
    await db.projects.put(project())
    await db.masteryGuides.put(guide())
  })

  it('logs tool usage, updates last used and usage level, and awards project XP', async () => {
    await logToolUsage({
      userToolId: 'tool-1',
      projectId: 'project-1',
      usedAt: now,
      durationMinutes: 90,
      usageType: 'Project',
      notes: 'Built shelf frame.',
    })

    const updatedTool = await db.userTools.get('tool-1')
    const xp = (await db.xpEvents.toArray())[0]

    expect(await db.toolUsageLogs.count()).toBe(1)
    expect(updatedTool?.lastUsedAt).toBe(now)
    expect(updatedTool?.usageLevel).toBe('Medium')
    expect(xp?.xpAmount).toBe(25)
  })

  it('keeps previously cloud-linked edited records local after fallback sync removal', async () => {
    await db.userTools.update('tool-1', {
      ownerUserId: 'user-1',
      workshopId: 'workshop-1',
      syncStatus: 'synced',
      lastSyncedAt: '2026-05-03T00:00:00.000Z',
    })

    await updateUserTool('tool-1', {
      name: 'Updated Drill',
      type: 'Drill / Driver',
      category: 'Drilling',
      condition: 'Good',
      storageLocation: 'Wall',
      powerType: 'Battery',
    })

    const updatedTool = await db.userTools.get('tool-1')
    expect(updatedTool?.syncStatus).toBe('local')
    expect(updatedTool?.localOnly).toBe(false)
  })

  it('logs material usage, clamps stock at zero, creates low-stock notification, and awards XP', async () => {
    await logMaterialUsage({
      materialId: 'material-1',
      projectId: 'project-1',
      quantityUsed: 5,
      unit: 'Sheets',
      usedAt: now,
      notes: 'Used for cabinet sides.',
    })

    const updatedMaterial = await db.materials.get('material-1')
    const notification = await db.notifications.get('notification-material-material-1')

    expect(await db.materialUsageLogs.count()).toBe(1)
    expect(updatedMaterial?.quantity).toBe(0)
    expect(notification?.status).toBe('Active')
    expect(notification?.type).toBe('OutOfStock')
    expect((await db.xpEvents.toArray())[0]?.xpAmount).toBe(10)
  })

  it('logs maintenance and updates condition when conditionAfter is provided', async () => {
    await logMaintenance({
      userToolId: 'tool-1',
      maintenanceType: 'Repaired',
      performedAt: now,
      conditionAfter: 'Good',
      notes: 'Replaced switch.',
    })

    expect(await db.maintenanceLogs.count()).toBe(1)
    expect((await db.userTools.get('tool-1'))?.condition).toBe('Good')
    expect((await db.xpEvents.toArray())[0]?.xpAmount).toBe(25)
  })

  it('completes mastery steps once and awards mastery XP once', async () => {
    await completeMasteryGuideStep('guide-cordless-drill', 'step-safety', 'tool-1')
    await completeMasteryGuideStep('guide-cordless-drill', 'step-safety', 'tool-1')
    await completeMasteryGuideStep('guide-cordless-drill', 'step-setup', 'tool-1')

    const progress = (await db.masteryProgress.toArray())[0]
    const xpEvents = await db.xpEvents.toArray()

    expect(progress?.completedStepIds).toEqual(['step-safety', 'step-setup'])
    expect(progress?.status).toBe('Mastered')
    expect(progress?.xp).toBe(350)
    expect(xpEvents).toHaveLength(3)
  })
})

function tool(): UserTool {
  return {
    id: 'tool-1',
    toolTypeId: 'cordless-drill',
    name: 'Cordless Drill',
    type: 'Drill / Driver',
    category: 'Drilling',
    condition: 'Needs Repair',
    storageLocation: 'Wall',
    usageLevel: 'Low',
    powerType: 'Battery',
    createdAt: '',
    updatedAt: '',
  }
}

function material(): Material {
  return {
    id: 'material-1',
    name: 'Plywood',
    category: 'Sheet Goods',
    quantity: 2,
    unit: 'Sheets',
    minimumDesired: 2,
    storageLocation: 'Rack',
    createdAt: '',
    updatedAt: '',
  }
}

function project(): Project {
  return {
    id: 'project-1',
    name: 'Cabinet',
    status: 'In Progress',
    progress: 40,
    tags: [],
    createdAt: '',
    updatedAt: '',
  }
}

function guide(): MasteryGuide {
  return {
    id: 'guide-cordless-drill',
    toolTypeId: 'cordless-drill',
    toolName: 'Cordless Drill',
    category: 'Drilling',
    summary: 'Practice drilling.',
    sortOrder: 1,
    steps: [
      { id: 'step-safety', title: 'Safety', category: 'Safety', description: '', xp: 50, sortOrder: 1 },
      { id: 'step-setup', title: 'Setup', category: 'Setup', description: '', xp: 50, sortOrder: 2 },
    ],
    createdAt: '',
    updatedAt: '',
  }
}
