import type { LucideIcon } from 'lucide-react'
import type { StatusTone } from '../../lib/types/status'
import { cn } from '../../lib/utils/cn'

const toneClass: Record<StatusTone, string> = {
  green: 'border-bench-green/20 bg-bench-green/10 text-bench-green',
  yellow: 'border-bench-yellow/20 bg-bench-yellow/10 text-bench-yellow',
  red: 'border-bench-red/20 bg-bench-red/10 text-bench-red',
  blue: 'border-bench-blue/20 bg-bench-blue/10 text-bench-blue',
  purple: 'border-bench-purple/20 bg-bench-purple/10 text-bench-purple',
  orange: 'border-bench-orange/20 bg-bench-orange/10 text-bench-orange',
  muted: 'border-bench-border bg-white/5 text-bench-muted',
}

export function IconTile({
  icon: Icon,
  tone = 'orange',
  className,
  size = 'md',
}: {
  icon: LucideIcon
  tone?: StatusTone
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const iconSize = size === 'lg' ? 34 : size === 'sm' ? 18 : 24

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl border',
        size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-9 w-9 rounded-lg' : 'h-12 w-12',
        toneClass[tone],
        className,
      )}
    >
      <Icon size={iconSize} strokeWidth={2.2} />
    </span>
  )
}
