import type { StatusTone } from '../../data/mock/types'
import { cn } from '../../lib/utils/cn'

const toneClass: Record<StatusTone, string> = {
  green: 'bg-bench-green',
  yellow: 'bg-bench-yellow',
  red: 'bg-bench-red',
  blue: 'bg-bench-blue',
  purple: 'bg-bench-purple',
  orange: 'bg-bench-orange',
  muted: 'bg-bench-muted',
}

export function ProgressBar({
  value,
  tone = 'orange',
  className,
}: {
  value: number
  tone?: StatusTone
  className?: string
}) {
  const width = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-white/10', className)}>
      <div className={cn('h-full rounded-full transition-all', toneClass[tone])} style={{ width: `${width}%` }} />
    </div>
  )
}
