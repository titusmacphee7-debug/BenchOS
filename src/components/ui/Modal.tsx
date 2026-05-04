import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <section className="panel-surface custom-scrollbar max-h-[92vh] w-full max-w-3xl overflow-auto rounded-xl p-5 shadow-panel">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-bench-border pb-4">
          <div>
            <h2 className="text-xl font-semibold text-bench-text">{title}</h2>
            {description && <p className="mt-1 text-sm text-bench-muted">{description}</p>}
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </Button>
        </div>
        {children}
      </section>
    </div>
  )
}
