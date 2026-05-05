import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'
import { DataTable, type DataColumn } from './DataTable'
import { Modal } from './Modal'

function ModalHarness() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open modal</button>
      <Modal open={open} title="Log Test" description="A focused modal test." onClose={() => setOpen(false)}>
        <button type="button">Modal action</button>
      </Modal>
    </>
  )
}

function ConfirmHarness({ onCancel }: { onCancel: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Show confirm</button>
      {open && (
        <ConfirmDialog
          title="Clear Local Data"
          description="This confirms a destructive local action."
          confirmLabel="Clear"
          onCancel={() => {
            onCancel()
            setOpen(false)
          }}
        />
      )}
    </>
  )
}

describe('shared UI accessibility behavior', () => {
  it('labels modals, focuses them on open, closes on Escape, and restores focus', () => {
    render(<ModalHarness />)

    const openButton = screen.getByRole('button', { name: 'Open modal' })
    openButton.focus()
    fireEvent.click(openButton)

    const dialog = screen.getByRole('dialog', { name: 'Log Test' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleDescription('A focused modal test.')
    expect(dialog).toHaveFocus()

    fireEvent.keyDown(dialog, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(openButton).toHaveFocus()
  })

  it('labels confirm dialogs, cancels on Escape, and restores focus', () => {
    const onCancel = vi.fn()

    render(<ConfirmHarness onCancel={onCancel} />)

    const openButton = screen.getByRole('button', { name: 'Show confirm' })
    openButton.focus()
    fireEvent.click(openButton)

    const dialog = screen.getByRole('alertdialog', { name: 'Clear Local Data' })
    expect(dialog).toHaveAttribute('aria-modal', 'false')
    expect(dialog).toHaveAccessibleDescription('This confirms a destructive local action.')
    expect(dialog).toHaveFocus()

    fireEvent.keyDown(dialog, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(openButton).toHaveFocus()
  })

  it('lets keyboard users activate clickable data rows without stealing nested control keys', () => {
    type Row = { id: string; name: string; status: string }

    const onRowClick = vi.fn()
    const columns: DataColumn<Row>[] = [
      { header: 'Name', render: (row) => row.name },
      {
        header: 'Status',
        render: (row) => <button type="button">Nested {row.status}</button>,
      },
    ]

    render(
      <DataTable
        columns={columns}
        data={[{ id: 'row-1', name: 'Bench drill', status: 'Ready' }]}
        gridTemplate="1fr 1fr"
        onRowClick={onRowClick}
      />,
    )

    const row = screen.getByText('Bench drill').closest('[role="row"]')
    if (!row) throw new Error('Expected DataTable row to be rendered')

    expect(row).toHaveAttribute('tabindex', '0')

    fireEvent.keyDown(row, { key: 'Enter' })
    fireEvent.keyDown(row, { key: ' ' })

    expect(onRowClick).toHaveBeenCalledTimes(2)

    fireEvent.keyDown(screen.getByRole('button', { name: 'Nested Ready' }), { key: 'Enter' })

    expect(onRowClick).toHaveBeenCalledTimes(2)
  })
})
