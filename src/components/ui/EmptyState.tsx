import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { Card } from './Card'
import { IconTile } from './IconTile'

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
}: {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: ReactNode
}) {
  return (
    <Card className="flex min-h-56 flex-col items-center justify-center text-center">
      <IconTile icon={icon} tone="orange" size="lg" />
      <h2 className="mt-5 text-xl font-semibold text-bench-text">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-bench-muted">{description}</p>
      {actionLabel && <Button className="mt-5" variant="primary">{actionLabel}</Button>}
    </Card>
  )
}
