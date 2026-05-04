import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  createUserTool,
  userToolDefaultsFromLibrary,
  userToolFormSchema,
} from '../../data/actions'
import type { ToolCatalogLibraryItem, ToolCondition, ToolLibraryItem, UserToolFormValues } from '../../data/schema'
import { powerTypes, toolCategories, toolConditions } from '../../data/schema'
import { Button } from '../ui/Button'
import { Field, SelectInput, TextArea, TextInput } from '../ui/FormControls'
import { Modal } from '../ui/Modal'

function toolLabel(tool?: ToolLibraryItem | ToolCatalogLibraryItem) {
  if (!tool) return undefined
  return 'displayName' in tool ? tool.displayName : tool.name
}

export function AddToolFormModal({
  tool,
  open,
  onClose,
  onSaved,
}: {
  tool?: ToolLibraryItem | ToolCatalogLibraryItem
  open: boolean
  onClose: () => void
  onSaved?: (toolName: string) => void
}) {
  const form = useForm<UserToolFormValues>({
    resolver: zodResolver(userToolFormSchema),
    defaultValues: userToolDefaultsFromLibrary(tool),
  })

  useEffect(() => {
    form.reset(userToolDefaultsFromLibrary(tool))
  }, [form, tool])

  async function submit(values: UserToolFormValues) {
    await createUserTool(values)
    onSaved?.(values.name)
    onClose()
  }

  return (
    <Modal
      open={open}
      title={tool ? `Add ${toolLabel(tool)}` : 'Add Custom Tool'}
      description="Save this library tool to your local workshop inventory."
      onClose={onClose}
    >
      <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tool Name" error={form.formState.errors.name?.message}>
            <TextInput {...form.register('name')} />
          </Field>
          <Field label="Tool Type" error={form.formState.errors.type?.message}>
            <TextInput {...form.register('type')} />
          </Field>
          <Field label="Brand">
            <TextInput {...form.register('brand')} placeholder="Optional" />
          </Field>
          <Field label="Model">
            <TextInput {...form.register('model')} placeholder="Optional" />
          </Field>
          <Field label="Category" error={form.formState.errors.category?.message}>
            <SelectInput {...form.register('category')}>
              <option value="">Choose category</option>
              {toolCategories.map((category) => <option key={category}>{category}</option>)}
            </SelectInput>
          </Field>
          <Field label="Condition" error={form.formState.errors.condition?.message}>
            <SelectInput {...form.register('condition')}>
              {toolConditions.map((condition: ToolCondition) => <option key={condition}>{condition}</option>)}
            </SelectInput>
          </Field>
          <Field label="Power Type" error={form.formState.errors.powerType?.message}>
            <SelectInput {...form.register('powerType')}>
              {powerTypes.map((powerType) => <option key={powerType}>{powerType}</option>)}
            </SelectInput>
          </Field>
          <Field label="Storage Location" error={form.formState.errors.storageLocation?.message}>
            <TextInput {...form.register('storageLocation')} placeholder="Wall Pegboard" />
          </Field>
          <Field label="Battery Platform">
            <TextInput {...form.register('batteryPlatform')} placeholder="Optional" />
          </Field>
          <Field label="Purchase Year">
            <TextInput type="number" {...form.register('purchaseYear', { setValueAs: (value) => value === '' ? undefined : Number(value) })} placeholder="Optional" />
          </Field>
        </div>
        <Field label="Notes">
          <TextArea {...form.register('notes')} placeholder="Care notes, accessories, or buying details..." />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Add to My Tools</Button>
        </div>
      </form>
    </Modal>
  )
}
