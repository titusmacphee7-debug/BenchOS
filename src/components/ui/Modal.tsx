import { X } from 'lucide-react'
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
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
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialogRef.current?.focus()

    return () => {
      previousFocusRef.current?.focus()
      previousFocusRef.current = null
    }
  }, [open])

  if (!open) return null

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className="panel-surface custom-scrollbar max-h-[92vh] w-full max-w-3xl overflow-auto rounded-xl p-5 shadow-panel focus:outline-none"
        onKeyDown={handleKeyDown}
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-bench-border pb-4">
          <div>
            <h2 id={titleId} className="text-xl font-semibold text-bench-text">{title}</h2>
            {description && <p id={descriptionId} className="mt-1 text-sm text-bench-muted">{description}</p>}
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
