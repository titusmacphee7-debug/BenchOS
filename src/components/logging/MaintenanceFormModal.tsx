import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../ui/Button'
import { Field, SelectInput, TextArea, TextInput } from '../ui/FormControls'
import { Modal } from '../ui/Modal'
import { logMaintenance, maintenanceDefaults, maintenanceFormSchema } from '../../data/actions'
import { useActiveUserTools } from '../../data/hooks'
import type { MaintenanceFormValues } from '../../data/schema'
import { maintenanceTypes, toolConditions } from '../../data/schema'

export function MaintenanceFormModal({
  open,
  defaultUserToolId,
  onClose,
}: {
  open: boolean
  defaultUserToolId?: string
  onClose: () => void
}) {
  const tools = useActiveUserTools()
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: maintenanceDefaults(defaultUserToolId),
  })

  useEffect(() => {
    if (open) form.reset(maintenanceDefaults(defaultUserToolId))
  }, [defaultUserToolId, form, open])

  async function submit(values: MaintenanceFormValues) {
    await logMaintenance(values)
    onClose()
  }

  return (
    <Modal open={open} title="Log Maintenance" description="Track cleaning, repairs, calibration, and condition changes." onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Owned Tool" error={form.formState.errors.userToolId?.message}>
            <SelectInput {...form.register('userToolId')}>
              <option value="">Choose tool</option>
              {tools.map((tool) => <option key={tool.id} value={tool.id}>{tool.name}</option>)}
            </SelectInput>
          </Field>
          <Field label="Maintenance Type">
            <SelectInput {...form.register('maintenanceType')}>
              {maintenanceTypes.map((type) => <option key={type}>{type}</option>)}
            </SelectInput>
          </Field>
          <Field label="Performed At" error={form.formState.errors.performedAt?.message}>
            <TextInput type="datetime-local" {...form.register('performedAt')} />
          </Field>
          <Field label="Condition After">
            <SelectInput {...form.register('conditionAfter', { setValueAs: (value) => value === '' ? undefined : value })}>
              <option value="">No change</option>
              {toolConditions.map((condition) => <option key={condition}>{condition}</option>)}
            </SelectInput>
          </Field>
        </div>
        <Field label="Notes">
          <TextArea {...form.register('notes')} placeholder="What changed, what should be checked next, or parts replaced..." />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Maintenance</Button>
        </div>
      </form>
    </Modal>
  )
}
