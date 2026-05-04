import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../ui/Button'
import { Field, SelectInput, TextArea, TextInput } from '../ui/FormControls'
import { Modal } from '../ui/Modal'
import { logToolUsage, toolUsageDefaults, toolUsageFormSchema } from '../../data/actions'
import { useActiveProjects, useActiveUserTools } from '../../data/hooks'
import type { ToolUsageFormValues } from '../../data/schema'
import { toolUsageTypes } from '../../data/schema'

export function ToolUsageFormModal({
  open,
  defaultUserToolId,
  defaultProjectId,
  onClose,
}: {
  open: boolean
  defaultUserToolId?: string
  defaultProjectId?: string
  onClose: () => void
}) {
  const tools = useActiveUserTools()
  const projects = useActiveProjects()
  const form = useForm<ToolUsageFormValues>({
    resolver: zodResolver(toolUsageFormSchema),
    defaultValues: toolUsageDefaults(defaultUserToolId, defaultProjectId),
  })

  useEffect(() => {
    if (open) form.reset(toolUsageDefaults(defaultUserToolId, defaultProjectId))
  }, [defaultProjectId, defaultUserToolId, form, open])

  async function submit(values: ToolUsageFormValues) {
    await logToolUsage(values)
    onClose()
  }

  return (
    <Modal open={open} title="Log Tool Use" description="Record what you used, when, and whether it was tied to a project." onClose={onClose}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Owned Tool" error={form.formState.errors.userToolId?.message}>
            <SelectInput {...form.register('userToolId')}>
              <option value="">Choose tool</option>
              {tools.map((tool) => <option key={tool.id} value={tool.id}>{tool.name}</option>)}
            </SelectInput>
          </Field>
          <Field label="Project">
            <SelectInput {...form.register('projectId')}>
              <option value="">General use</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </SelectInput>
          </Field>
          <Field label="Usage Type">
            <SelectInput {...form.register('usageType')}>
              {toolUsageTypes.map((type) => <option key={type}>{type}</option>)}
            </SelectInput>
          </Field>
          <Field label="Used At" error={form.formState.errors.usedAt?.message}>
            <TextInput type="datetime-local" {...form.register('usedAt')} />
          </Field>
          <Field label="Duration Minutes">
            <TextInput type="number" min="0" {...form.register('durationMinutes', { setValueAs: (value) => value === '' ? undefined : Number(value) })} placeholder="Optional" />
          </Field>
        </div>
        <Field label="Notes">
          <TextArea {...form.register('notes')} placeholder="What did you do with this tool?" />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Tool Use</Button>
        </div>
      </form>
    </Modal>
  )
}
