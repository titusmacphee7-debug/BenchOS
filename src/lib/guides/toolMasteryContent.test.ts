import { describe, expect, it } from 'vitest'
import {
  getFamiliarityLabel,
  guideSectionsForMode,
  toolMasteryGuideContents,
  toolMasteryGuideToSections,
} from './toolMasteryContent'

const priorityToolTypeIds = [
  'cordless-drill',
  'impact-driver',
  'circular-saw',
  'miter-saw',
  'random-orbital-sander',
  'tape-measure',
  'speed-square',
  'bar-clamp',
  'shop-vac',
  'socket-set',
]

describe('tool mastery content', () => {
  it('covers the first 10 priority guide tool types', () => {
    expect(toolMasteryGuideContents.map((guide) => guide.toolTypeId)).toEqual(priorityToolTypeIds)
  })

  it('keeps each priority guide useful for safety, setup, practice, and readiness', () => {
    for (const guide of toolMasteryGuideContents) {
      expect(guide.summary.length).toBeGreaterThan(30)
      expect(guide.ppe.length).toBeGreaterThan(0)
      expect(guide.setup.length).toBeGreaterThan(2)
      expect(guide.basicUse.length).toBeGreaterThan(2)
      expect(guide.commonMistakes.length).toBeGreaterThan(2)
      expect(guide.practiceTasks.length).toBeGreaterThan(0)
      expect(guide.readinessWarnings.length).toBeGreaterThan(0)
      expect(guide.shopCardChecklist.length).toBeGreaterThan(2)
    }
  })

  it('exports legacy deep guide sections for the existing seed table', () => {
    const sections = toolMasteryGuideToSections(toolMasteryGuideContents[0])
    expect(sections).toHaveLength(12)
    expect(sections.map((section) => section.sectionType)).toContain('Safety First')
    expect(sections.map((section) => section.sectionType)).toContain('Practice Task')
  })

  it('supports quick, full, and shop card guide depth modes', () => {
    const guide = toolMasteryGuideContents[0]
    expect(guideSectionsForMode(guide, 'quick').map((section) => section.title)).toEqual([
      'Safety First',
      'Setup',
      'Basic Use',
      'Common Mistakes',
    ])
    expect(guideSectionsForMode(guide, 'full').length).toBeGreaterThan(guideSectionsForMode(guide, 'quick').length)
    expect(guideSectionsForMode(guide, 'shop-card').map((section) => section.title)).toContain('Shop Card Checklist')
  })

  it('uses familiarity labels without certification language', () => {
    expect(getFamiliarityLabel(0)).toBe('Unfamiliar')
    expect(getFamiliarityLabel(25)).toBe('Beginner')
    expect(getFamiliarityLabel(45)).toBe('Learning')
    expect(getFamiliarityLabel(65)).toBe('Comfortable')
    expect(getFamiliarityLabel(85)).toBe('Skilled')
    expect(getFamiliarityLabel(100)).toBe('Highly Familiar')
  })
})
