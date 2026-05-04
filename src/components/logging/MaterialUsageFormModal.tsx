import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '../ui/Button'
import { Field, SelectInput, TextArea, TextInput } from '../ui/FormControls'
import { Modal } from '../ui/Modal'
import { logMaterialUsage, materialUsageDefaults, materialUsageFormSchema } from '../../data/actions'
import { useActiveMaterials, useActiveProjects } from '../../data/hooks'
import type { MaterialUsageFormValues } from '../../data/schema'

export function MaterialUsageFormModal({
  open,
  defaultMaterialId,
  defaultProjectId,
  onClose,
}: {
  open: boolean
  defaultMaterialId?: string
  defaultProjectId?: string
  onClose: () => void
}) {
  const materials = useActiveMaterials()
  const projects = useActiveProjects()
  const defaultMaterial = materials.find((material) => material.id === defaultMaterialId)
  const form = useForm<MaterialUsageFormValues>({
    resolver: zodResolver(materialUsageFormSchema),
    defaultValues: materialUsageDefaults(defaultMaterial, defaultProjectId),
  })
  const materialId = useWatch({ control: form.control, name: 'materialId' })

  useEffect(() => {
    if (open) form.reset(materialUsageDefaults(defaultMaterial, defaultProjectId))
  }, [defaultMaterial, defaultProjectId, form, open])

  useEffect(() => {
    const material = materials.find((item) => item.id === materialId)
    if (material) form.setValue('unit', material.unit)
  }, [form, materialId, materials])

  async function submit(values: MaterialUsageFormValues) {
    await logMaterialUsage(values)
    onClose()
  }

  return (
    <Modal open={open} title="Log Material Usage" description="Reduce inventory and create low-stock alerts when needed." onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Material" error={form.formState.errors.materialId?.message}>
            <SelectInput {...form.register('materialId')}>
              <option value="">Choose material</option>
              {materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
            </SelectInput>
          </Field>
          <Field label="Project">
            <SelectInput {...form.register('projectId')}>
              <option value="">General use</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </SelectInput>
          </Field>
          <Field label="Quantity Used" error={form.formState.errors.quantityUsed?.message}>
            <TextInput type="number" step="0.01" min="0" {...form.register('quantityUsed', { valueAsNumber: true })} />
          </Field>
          <Field label="Unit" error={form.formState.errors.unit?.message}>
            <TextInput {...form.register('unit')} />
          </Field>
          <Field label="Used At" error={form.formState.errors.usedAt?.message}>
            <TextInput type="datetime-local" {...form.register('usedAt')} />
          </Field>
        </div>
        <Field label="Notes">
          <TextArea {...form.register('notes')} placeholder="What project or task used this material?" />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Material Usage</Button>
        </div>
      </form>
    </Modal>
  )
}
