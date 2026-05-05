import type { StatusTone } from '../../lib/types/status'
import { cn } from '../../lib/utils/cn'

const toneClass: Record<StatusTone, string> = {
  green: 'border-bench-green/30 bg-bench-green/10 text-bench-green',
  yellow: 'border-bench-yellow/30 bg-bench-yellow/10 text-bench-yellow',
  red: 'border-bench-red/30 bg-bench-red/10 text-bench-red',
  blue: 'border-bench-blue/30 bg-bench-blue/10 text-bench-blue',
  purple: 'border-bench-purple/30 bg-bench-purple/10 text-bench-purple',
  orange: 'border-bench-orange/35 bg-bench-orange/10 text-bench-orange',
  muted: 'border-bench-border bg-white/5 text-bench-muted',
}

export function StatusPill({ label, tone = 'muted', className }: { label: string; tone?: StatusTone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center justify-center rounded-md border px-2.5 text-xs font-semibold',
        toneClass[tone],
        className,
      )}
    >
      {label}
    </span>
  )
}
