import { beforeEach, describe, expect, it } from 'vitest'
import {
  addMissingItemsToWishlist,
  convertWishlistItemToInventory,
  markWishlistPurchased,
} from './actions'
import { db } from './db'
import type { MissingMaterialItem, MissingToolItem, Project, WishlistItem } from './schema'

const project: Project = {
  id: 'project-1',
  name: 'Floating Shelves',
  status: 'Planning',
  progress: 0,
  tags: [],
  createdAt: '',
  updatedAt: '',
}

describe('wishlist actions', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    await db.projects.put(project)
  })

  it('adds missing items to wishlist and prevents duplicates', async () => {
    const missingTool: MissingToolItem = {
      requirementId: 'req-tool',
      projectId: project.id,
      requirementKind: 'ToolType',
      name: 'Level',
      required: true,
      toolTypeId: 'level',
    }
    const missingMaterial: MissingMaterialItem = {
      requirementId: 'req-material',
      projectId: project.id,
      name: 'Wood Screws',
      required: true,
      quantity: 1,
      unit: 'Box',
      onHand: 0,
      shortage: 1,
    }

    const first = await addMissingItemsToWishlist(project, [missingTool], [missingMaterial])
    const second = await addMissingItemsToWishlist(project, [missingTool], [missingMaterial])

    expect(first).toHaveLength(2)
    expect(second).toHaveLength(0)
    expect(await db.wishlistItems.count()).toBe(2)
  })

  it('converts purchased material wishlist item into existing material stock', async () => {
    await db.materials.put({
      id: 'material-1',
      name: 'Wood Screws',
      category: 'Fasteners',
      quantity: 2,
      unit: 'Box',
      minimumDesired: 1,
      storageLocation: 'Bins',
      createdAt: '',
      updatedAt: '',
    })
    await db.wishlistItems.put(wish({ id: 'wish-material', itemType: 'Material', name: 'Wood Screws', materialId: 'material-1', quantity: 3, unit: 'Box', status: 'Purchased' }))

    await convertWishlistItemToInventory('wish-material')

    expect((await db.materials.get('material-1'))?.quantity).toBe(5)
    expect((await db.wishlistItems.get('wish-material'))?.status).toBe('Converted')
    expect(await db.purchaseHistory.count()).toBe(1)
  })

  it('converts purchased material wishlist item into a new material when no material is linked', async () => {
    await db.wishlistItems.put(wish({ id: 'wish-new-material', itemType: 'Material', name: 'Drawer Slides', quantity: 2, unit: 'Pairs', status: 'Purchased' }))

    const createdId = await convertWishlistItemToInventory('wish-new-material')

    expect(createdId).toBeTruthy()
    expect(await db.materials.count()).toBe(1)
    expect((await db.wishlistItems.get('wish-new-material'))?.status).toBe('Converted')
  })

  it('marks a wishlist tool purchased and converts it into owned tools', async () => {
    await db.toolTypes.put({
      id: 'level',
      name: 'Level',
      category: 'Measuring',
      description: 'Check level and plumb.',
      materials: [],
      commonProjects: [],
      powerType: 'Manual',
      skillLevel: 'Beginner',
      safety: [],
      createdAt: '',
      updatedAt: '',
    })
    await db.wishlistItems.put(wish({ id: 'wish-tool', itemType: 'Tool', name: 'Level', toolTypeId: 'level' }))

    await markWishlistPurchased('wish-tool')
    await convertWishlistItemToInventory('wish-tool')

    expect(await db.userTools.count()).toBe(1)
    expect((await db.wishlistItems.get('wish-tool'))?.status).toBe('Converted')
  })
})

function wish(overrides: Partial<WishlistItem>): WishlistItem {
  return {
    id: 'wish',
    itemType: 'Tool',
    name: 'Wishlist Item',
    status: 'Not Purchased',
    priority: 'High',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}
