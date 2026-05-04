import { IconTile } from '../ui/IconTile'
import type { ToolCatalogLibraryItem } from '../../data/schema'
import { resolveToolIcon, toolCategoryTone } from './toolIconRules'

type ToolIconInput = Pick<ToolCatalogLibraryItem, 'internalToolTypeId' | 'displayName' | 'brand' | 'powerType' | 'searchTags' | 'toolType'>

export function ToolIconTile({ tool, size = 'md' }: { tool: ToolIconInput; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = resolveToolIcon(tool)
  return (
    <span title={`${tool.toolType.name} icon`} aria-label={`${tool.toolType.name} icon`}>
      <IconTile icon={Icon} tone={toolCategoryTone(tool.toolType.category)} size={size} />
    </span>
  )
}
