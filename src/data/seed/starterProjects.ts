import type { Project, ProjectActivity, ProjectRequirement, ProjectStep, WishlistItem } from '../schema'

const now = '2026-05-03T00:00:00.000Z'

export const starterProjects: Project[] = [
  {
    id: 'workbench',
    name: 'Backyard Workbench',
    description: 'Sturdy workbench with vise and undershelf storage.',
    status: 'In Progress',
    progress: 75,
    category: 'Workshop',
    tags: ['Workbench', 'Outdoor'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'hall-tree',
    name: 'Hall Tree',
    description: 'Entryway storage with hooks, bench, and cubbies.',
    status: 'In Progress',
    progress: 65,
    category: 'Furniture',
    tags: ['Indoor', 'Storage'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'raised-garden-beds',
    name: 'Raised Garden Beds',
    description: 'Cedar garden beds for spring planting.',
    status: 'Planning',
    progress: 0,
    category: 'Outdoor',
    tags: ['Outdoor', 'Garden'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'floating-shelves',
    name: 'Floating Shelves',
    description: 'Minimal office shelves with hidden supports.',
    status: 'Planning',
    progress: 0,
    category: 'Storage',
    tags: ['Indoor', 'Shelving'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'media-console',
    name: 'Media Console',
    description: 'Modern media console with open shelves and drawers.',
    status: 'On Hold',
    progress: 10,
    category: 'Furniture',
    tags: ['Indoor', 'Living Room'],
    createdAt: now,
    updatedAt: now,
  },
]

export const starterProjectRequirements: ProjectRequirement[] = [
  req('req-workbench-cut-plywood', 'workbench', 'Capability', 'Cut plywood', true, { capabilityId: 'cut-plywood', notes: 'Circular saw, track saw, or table saw works.' }),
  req('req-workbench-drill', 'workbench', 'ToolType', 'Cordless Drill', true, { toolTypeId: 'cordless-drill' }),
  req('req-workbench-lumber', 'workbench', 'Material', '2x4 Lumber', true, { materialId: 'material-2', quantity: 8, unit: 'Pieces', notes: 'Starter inventory is short by a few boards.' }),
  req('req-workbench-screws', 'workbench', 'Material', 'Pocket Hole Screws', true, { materialId: 'material-3', quantity: 40, unit: 'Pieces' }),
  req('req-workbench-clamps', 'workbench', 'ToolCategory', 'Any clamp', false, { category: 'Clamping' }),

  req('req-hall-tree-cut', 'hall-tree', 'Capability', 'Cut plywood', true, { capabilityId: 'cut-plywood' }),
  req('req-hall-tree-drill', 'hall-tree', 'ToolType', 'Cordless Drill', true, { toolTypeId: 'cordless-drill' }),
  req('req-hall-tree-plywood', 'hall-tree', 'Material', '3/4" Plywood', true, { materialId: 'material-1', quantity: 2, unit: 'Sheets' }),
  req('req-hall-tree-sander', 'hall-tree', 'ToolType', 'Random Orbital Sander', false, { toolTypeId: 'random-orbital-sander' }),

  req('req-garden-cut', 'raised-garden-beds', 'ToolType', 'Circular Saw', true, { toolTypeId: 'circular-saw' }),
  req('req-garden-driver', 'raised-garden-beds', 'ToolType', 'Impact Driver', false, { toolTypeId: 'impact-driver' }),
  req('req-garden-boards', 'raised-garden-beds', 'Material', 'Cedar Boards', true, { quantity: 12, unit: 'Pieces', notes: 'No cedar boards are currently tracked.' }),
  req('req-garden-screws', 'raised-garden-beds', 'Material', 'Exterior Wood Screws', true, { quantity: 1, unit: 'Box' }),

  req('req-shelves-level', 'floating-shelves', 'ToolType', 'Level', true, { toolTypeId: 'level' }),
  req('req-shelves-drill', 'floating-shelves', 'ToolType', 'Cordless Drill', true, { toolTypeId: 'cordless-drill' }),
  req('req-shelves-screws', 'floating-shelves', 'Material', '2-1/2" Wood Screws', true, { quantity: 1, unit: 'Box' }),
  req('req-shelves-plywood', 'floating-shelves', 'Material', '3/4" Plywood', true, { materialId: 'material-1', quantity: 1, unit: 'Sheets' }),

  req('req-console-router', 'media-console', 'ToolType', 'Router', true, { toolTypeId: 'router' }),
  req('req-console-joinery', 'media-console', 'Capability', 'Drill pocket holes', false, { capabilityId: 'drill-pocket-holes' }),
  req('req-console-plywood', 'media-console', 'Material', '3/4" Plywood', true, { materialId: 'material-1', quantity: 3, unit: 'Sheets' }),
  req('req-console-hardware', 'media-console', 'Material', 'Drawer Slides', true, { quantity: 2, unit: 'Pairs' }),
]

export const starterProjectSteps: ProjectStep[] = [
  step('step-workbench-1', 'workbench', 'Break down sheet goods', true, 1),
  step('step-workbench-2', 'workbench', 'Assemble base frame', true, 2),
  step('step-workbench-3', 'workbench', 'Attach lower shelf', false, 3),
  step('step-workbench-4', 'workbench', 'Sand edges and finish', false, 4),
  step('step-hall-tree-1', 'hall-tree', 'Cut plywood panels', true, 1),
  step('step-hall-tree-2', 'hall-tree', 'Assemble bench box', false, 2),
  step('step-garden-1', 'raised-garden-beds', 'Buy cedar and exterior screws', false, 1),
  step('step-shelves-1', 'floating-shelves', 'Find wall studs and mark level line', false, 1),
  step('step-console-1', 'media-console', 'Choose drawer hardware', false, 1),
]

export const starterProjectActivity: ProjectActivity[] = [
  activity('activity-workbench-1', 'workbench', 'Progress updated', 'Backyard Workbench moved to 75%.'),
  activity('activity-hall-tree-1', 'hall-tree', 'Requirement added', 'Added plywood requirement.'),
  activity('activity-garden-1', 'raised-garden-beds', 'Project created', 'Raised Garden Beds entered planning.'),
  activity('activity-shelves-1', 'floating-shelves', 'Readiness checked', 'Floating Shelves has missing tools and materials.'),
]

export const starterWishlistItems: WishlistItem[] = [
  wish('wish-1', 'Tool', 'Track Saw', 'High', { linkedProjectId: 'floating-shelves', toolTypeId: 'track-saw', addedFor: 'Floating Shelves', notes: 'Cleaner long cuts for sheet goods.' }),
  wish('wish-2', 'Material', '3/4" Plywood Sheet', 'Medium', { linkedProjectId: 'hall-tree', materialId: 'material-1', quantity: 2, unit: 'Sheets', addedFor: 'Hall Tree' }),
  wish('wish-3', 'Material', '2-1/2" Deck Screws', 'Medium', { linkedProjectId: 'floating-shelves', quantity: 1, unit: 'Box', addedFor: 'Floating Shelves' }),
  wish('wish-4', 'Accessory', 'Pocket Hole Jig', 'Low', { linkedProjectId: 'media-console', toolTypeId: 'pocket-hole-jig', addedFor: 'Multiple Projects' }),
]

function req(
  id: string,
  projectId: string,
  requirementKind: ProjectRequirement['requirementKind'],
  displayName: string,
  required: boolean,
  extra: Partial<ProjectRequirement>,
): ProjectRequirement {
  return { id, projectId, requirementKind, displayName, required, createdAt: now, updatedAt: now, ...extra }
}

function step(id: string, projectId: string, title: string, completed: boolean, sortOrder: number): ProjectStep {
  return { id, projectId, title, completed, sortOrder, createdAt: now, updatedAt: now }
}

function activity(id: string, projectId: string, title: string, description: string): ProjectActivity {
  return { id, projectId, title, description, createdAt: now }
}

function wish(
  id: string,
  itemType: WishlistItem['itemType'],
  name: string,
  priority: WishlistItem['priority'],
  extra: Partial<WishlistItem>,
): WishlistItem {
  return { id, itemType, name, priority, status: 'Not Purchased', createdAt: now, updatedAt: now, ...extra }
}
