import type { LucideIcon } from 'lucide-react'
import type { StatusTone } from '../../data/mock/types'
import { Card } from './Card'
import { IconTile } from './IconTile'

export function StatCard({
  icon,
  label,
  value,
  detail,
  tone = 'orange',
}: {
  icon: LucideIcon
  label: string
  value: string | number
  detail: string
  tone?: StatusTone
}) {
  return (
    <Card className="flex min-h-28 items-center gap-3 p-4">
      <IconTile icon={icon} tone={tone} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-5 text-bench-muted">{label}</p>
        <p className="mt-1 text-3xl font-bold leading-none text-bench-text">{value}</p>
        <p className="mt-2 text-sm leading-5 text-bench-muted">{detail}</p>
      </div>
    </Card>
  )
}
