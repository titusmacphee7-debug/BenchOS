import type { ReactNode } from 'react'
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
  return (
    <Card className="max-w-md">
      <h2 className="text-lg font-semibold text-bench-text">{title}</h2>
      <p className="mt-2 text-sm text-bench-muted">{description}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Card>
  )
}
