import type { MasteryGuide, ToolGuideSection } from '../../data/schema'

export type ResolvedToolGuide = {
  toolTypeId: string
  title: string
  sections: ToolGuideSection[]
  source: 'deep-guide' | 'mastery-fallback'
}

const fallbackSectionTypes: ToolGuideSection['sectionType'][] = ['Overview', 'Safety First', 'Setup', 'How to Use', 'Practice Task', 'Maintenance']

export function resolveToolGuide(
  toolTypeId: string,
  guideSections: ToolGuideSection[],
  masteryGuides: MasteryGuide[],
): ResolvedToolGuide | undefined {
  const deepSections = guideSections
    .filter((section) => section.toolTypeId === toolTypeId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  if (deepSections.length > 0) {
    return {
      toolTypeId,
      title: deepSections[0]?.toolTypeId ?? toolTypeId,
      sections: deepSections,
      source: 'deep-guide',
    }
  }

  const masteryGuide = masteryGuides.find((guide) => guide.toolTypeId === toolTypeId)
  if (!masteryGuide) return undefined
  const now = new Date().toISOString()
  return {
    toolTypeId,
    title: masteryGuide.toolName,
    source: 'mastery-fallback',
    sections: masteryGuide.steps.map((step, index) => ({
      id: `fallback-${step.id}`,
      toolTypeId,
      title: step.title,
      body: step.description,
      sortOrder: index,
      sectionType: fallbackSectionTypes[index % fallbackSectionTypes.length],
      createdAt: now,
      updatedAt: now,
    })),
  }
}
