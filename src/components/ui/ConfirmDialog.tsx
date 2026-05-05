import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { Button } from './Button'
import { Card } from './Card'

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: {
  title: string
  description: string
  confirmLabel: ReactNode
  cancelLabel?: ReactNode
  onConfirm?: () => void
  onCancel?: () => void
}) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialogRef.current?.focus()

    return () => {
      previouslyFocused?.focus()
    }
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && onCancel) {
      event.stopPropagation()
      onCancel()
    }
  }

  return (
    <div
      ref={dialogRef}
      role="alertdialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabIndex={-1}
      className="focus:outline-none"
      onKeyDown={handleKeyDown}
    >
      <Card className="max-w-md">
        <h2 id={titleId} className="text-lg font-semibold text-bench-text">{title}</h2>
        <p id={descriptionId} className="mt-2 text-sm text-bench-muted">{description}</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </Card>
    </div>
  )
}
