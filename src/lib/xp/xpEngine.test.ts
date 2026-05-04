import { describe, expect, it } from 'vitest'
import type { MasteryGuide, ToolUsageLog } from '../../data/schema'
import { calculateMasteryProgress, calculateUsageLevel, getBenchXpLevel, getToolUseXp } from './xpEngine'

describe('xp engine', () => {
  it('awards tool use XP based on project context', () => {
    expect(getToolUseXp()).toBe(10)
    expect(getToolUseXp('project-1')).toBe(25)
  })

  it('calculates BenchXP levels with 500 XP per level', () => {
    expect(getBenchXpLevel(0)).toMatchObject({ level: 1, xpIntoLevel: 0, progressPercent: 0 })
    expect(getBenchXpLevel(750)).toMatchObject({ level: 2, xpIntoLevel: 250, progressPercent: 50 })
  })

  it('calculates usage levels from count and duration', () => {
    expect(calculateUsageLevel([])).toBe('Low')
    expect(calculateUsageLevel([{ durationMinutes: 75 } as ToolUsageLog])).toBe('Medium')
    expect(calculateUsageLevel(Array.from({ length: 5 }, () => ({ durationMinutes: 5 } as ToolUsageLog)))).toBe('High')
  })

  it('calculates mastery progress from completed steps', () => {
    const guide: MasteryGuide = {
      id: 'guide-1',
      toolTypeId: 'cordless-drill',
      toolName: 'Cordless Drill',
      category: 'Drilling',
      summary: 'Practice drilling.',
      sortOrder: 1,
      steps: [
        { id: 'safety', title: 'Safety', category: 'Safety', description: '', xp: 50, sortOrder: 1 },
        { id: 'setup', title: 'Setup', category: 'Setup', description: '', xp: 50, sortOrder: 2 },
      ],
      createdAt: '',
      updatedAt: '',
    }

    expect(calculateMasteryProgress(guide, ['safety']).status).toBe('In Progress')
    expect(calculateMasteryProgress(guide, ['safety']).safetyProgress).toBe(100)
    expect(calculateMasteryProgress(guide, ['safety', 'setup']).status).toBe('Mastered')
  })
})
