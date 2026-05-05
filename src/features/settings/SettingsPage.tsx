import { AlertTriangle, Bell, Download, FileJson, FileSpreadsheet, HardDrive, Moon, RotateCcw, Settings, ShieldAlert, SlidersHorizontal, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { IconTile } from '../../components/ui/IconTile'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusPill } from '../../components/ui/StatusPill'
import { SEED_VERSION, type BackupTableName } from '../../data/schema'
import { useSettings } from '../../data/hooks'
import { db } from '../../data/db'
import { benchApi, jsonBody } from '../../lib/api/benchApi'
import { clearAuthSession } from '../../lib/auth/authService'
import { useBenchAuth0 } from '../../lib/auth/benchAuth0Context'
import { clearAllLocalData, exportBenchOsBackup, getTableCounts, importBenchOsBackup, resetSampleData, validateBenchOsBackup } from '../../lib/import-export/backup'
import { materialsToCsv, projectsToCsv, toolUsageToCsv, toolsToCsv, wishlistToCsv } from '../../lib/import-export/csv'
import { downloadTextFile, timestampedFilename } from '../../lib/import-export/download'
import { APP_VERSION_LABEL, APP_VERSION_RULE } from '../../lib/version'

type PendingAction = 'import' | 'resetSample' | 'clearAll' | undefined
type DeleteAccountResponse = {
  ok: boolean
  redirectTo?: string
}

export function SettingsPage() {
  const navigate = useNavigate()
  const auth0 = useBenchAuth0()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const settings = useSettings()
  const [counts, setCounts] = useState<Record<BackupTableName, number>>()
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()
  const [pendingAction, setPendingAction] = useState<PendingAction>()
  const [pendingBackup, setPendingBackup] = useState<unknown>()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteWorking, setDeleteWorking] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()

  useEffect(() => {
    let active = true
    getTableCounts().then((nextCounts) => {
      if (active) setCounts(nextCounts)
    })
    return () => {
      active = false
    }
  }, [message])

  const settingValue = (key: string) => settings.find((setting) => setting.key === key)?.value

  async function run(label: string, action: () => Promise<void>) {
    setError(undefined)
    setMessage(undefined)
    try {
      await action()
      setMessage(label)
      setPendingAction(undefined)
      setPendingBackup(undefined)
      setCounts(await getTableCounts())
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  async function exportJson() {
    await run('Exported BenchOS JSON backup.', async () => {
      const backup = await exportBenchOsBackup()
      downloadTextFile(timestampedFilename('benchos-backup', 'json'), JSON.stringify(backup, null, 2), 'application/json')
    })
  }

  async function importFile(file?: File) {
    if (!file) return
    setError(undefined)
    try {
      const backup = JSON.parse(await file.text()) as unknown
      if (!validateBenchOsBackup(backup)) throw new Error('This file is not a valid BenchOS backup.')
      setPendingBackup(backup)
      setPendingAction('import')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function exportCsv(kind: 'tools' | 'materials' | 'wishlist' | 'projects' | 'usage') {
    await run(`Exported ${kind} CSV.`, async () => {
      const csv = kind === 'tools'
        ? toolsToCsv(await db.userTools.toArray())
        : kind === 'materials'
          ? materialsToCsv(await db.materials.toArray())
          : kind === 'wishlist'
            ? wishlistToCsv(await db.wishlistItems.toArray())
            : kind === 'projects'
              ? projectsToCsv(await db.projects.toArray())
              : toolUsageToCsv(await db.toolUsageLogs.toArray())
      downloadTextFile(timestampedFilename(`benchos-${kind}`, 'csv'), csv, 'text/csv')
    })
  }

  function closeDeleteModal() {
    if (deleteWorking) return
    setDeleteModalOpen(false)
    setDeleteConfirmation('')
    setDeleteError(undefined)
  }

  async function deleteAccount() {
    if (deleteConfirmation !== 'DELETE' || deleteWorking) return
    if (!auth0.available) {
      setDeleteError('Auth0 session access is required before BenchOS can delete an account.')
      return
    }

    setDeleteWorking(true)
    setDeleteError(undefined)
    try {
      const response = await benchApi<DeleteAccountResponse>(auth0.getAccessToken, 'delete-account', {
        method: 'DELETE',
        body: jsonBody({ confirmation: deleteConfirmation }),
      })
      await clearAuthSession()
      const redirectTo = response.redirectTo || '/account-deleted'
      setDeleteModalOpen(false)
      navigate(redirectTo, { replace: true })
    } catch (caught) {
      setDeleteError(caught instanceof Error ? caught.message : String(caught))
      setDeleteWorking(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Local-first controls, app preferences, backup, import, export, and beta-safe reset tools."
        icon={Settings}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <Card>
            <CardTitle title="General" />
            {[
              ['Theme', 'Dark first', Moon],
              ['Default Units', 'Imperial', Settings],
              ['Workshop Name', 'Local Workshop', HardDrive],
              ['Notifications', 'Low stock and maintenance alerts', Bell],
              ['Buying Preferences', 'Recommendation tuning', SlidersHorizontal],
            ].map(([label, value, Icon]) => (
              <div key={String(label)} className="flex items-center justify-between gap-4 border-b border-bench-border py-4 last:border-b-0">
                <div className="flex items-center gap-3">
                  <IconTile icon={Icon as typeof Settings} size="sm" tone="orange" />
                  <div>
                    <p className="font-semibold">{String(label)}</p>
                    <p className="text-sm text-bench-muted">{String(value)}</p>
                  </div>
                </div>
                {label === 'Buying Preferences'
                  ? <Button size="sm" onClick={() => navigate('/settings/buying-preferences')}>Open</Button>
                  : <StatusPill label="Local" tone="green" />}
              </div>
            ))}
          </Card>

          <Card>
            <CardTitle title="Data Controls" action={<StatusPill label="Local-first" tone="green" />} />
            <div className="grid gap-3 md:grid-cols-2">
              <Button icon={<Download size={18} />} onClick={() => void exportJson()}>Export all JSON</Button>
              <Button icon={<Upload size={18} />} onClick={() => fileInputRef.current?.click()}>Import JSON backup</Button>
              <Button icon={<FileSpreadsheet size={18} />} onClick={() => void exportCsv('tools')}>Export tools CSV</Button>
              <Button icon={<FileSpreadsheet size={18} />} onClick={() => void exportCsv('materials')}>Export materials CSV</Button>
              <Button icon={<FileSpreadsheet size={18} />} onClick={() => void exportCsv('wishlist')}>Export wishlist CSV</Button>
              <Button icon={<FileSpreadsheet size={18} />} onClick={() => void exportCsv('projects')}>Export projects CSV</Button>
              <Button icon={<FileSpreadsheet size={18} />} onClick={() => void exportCsv('usage')}>Export usage CSV</Button>
              <Button icon={<RotateCcw size={18} />} onClick={() => setPendingAction('resetSample')}>Reset sample data</Button>
              <Button className="md:col-span-2" variant="danger" icon={<Trash2 size={18} />} onClick={() => setPendingAction('clearAll')}>Clear local data</Button>
            </div>
            <input ref={fileInputRef} className="hidden" type="file" accept="application/json,.json" onChange={(event) => void importFile(event.target.files?.[0])} />
            {message && <p className="mt-4 rounded-lg border border-bench-green/30 bg-bench-green/10 p-3 text-sm text-bench-green">{message}</p>}
            {error && <p className="mt-4 rounded-lg border border-bench-red/30 bg-bench-red/10 p-3 text-sm text-bench-red">{error}</p>}
          </Card>

          <Card>
            <CardTitle title="Local Table Counts" />
            <div className="grid gap-3 md:grid-cols-3">
              {counts && Object.entries(counts).map(([table, value]) => (
                <div key={table} className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
                  <p className="text-xs text-bench-muted">{table}</p>
                  <p className="mt-1 text-xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle title="Local-First Status" />
            <div className="flex items-center gap-4">
              <IconTile icon={HardDrive} tone="green" size="lg" />
              <div>
                <p className="text-xl font-bold">All systems local</p>
                <p className="text-sm text-bench-muted">Data never leaves this device unless you export or import a file.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between"><span className="text-bench-muted">App version</span><span>{APP_VERSION_LABEL}</span></div>
              <div className="flex justify-between"><span className="text-bench-muted">Version rule</span><span>{APP_VERSION_RULE}</span></div>
              <div className="flex justify-between"><span className="text-bench-muted">Seed version</span><span>{SEED_VERSION}</span></div>
              <div className="flex justify-between"><span className="text-bench-muted">Onboarding</span><span>{settingValue('onboardingComplete') === 'true' ? 'Complete' : 'Pending'}</span></div>
              <div className="flex justify-between"><span className="text-bench-muted">Last backup</span><span>{formatDate(settingValue('lastBackupAt'))}</span></div>
              <div className="flex justify-between"><span className="text-bench-muted">Last import</span><span>{formatDate(settingValue('lastImportedAt'))}</span></div>
            </div>
          </Card>

          <Card className="border-bench-red/30 bg-bench-red/5">
            <CardTitle title="Account / Danger Zone" action={<StatusPill label="Irreversible" tone="red" />} />
            <div className="flex items-start gap-4">
              <IconTile icon={ShieldAlert} tone="red" size="lg" />
              <div>
                <p className="font-semibold text-bench-text">Delete BenchOS account</p>
                <p className="mt-2 text-sm leading-6 text-bench-muted">
                  Permanently remove your BenchOS workspace, inventory, projects, wishlist, BenchXP progress, guide progress, preferences, and account record.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button icon={<Download size={18} />} onClick={() => void exportJson()}>
                Export first
              </Button>
              <Button variant="danger" icon={<Trash2 size={18} />} onClick={() => setDeleteModalOpen(true)}>
                Delete account
              </Button>
            </div>
          </Card>

          {pendingAction === 'import' && (
            <ConfirmDialog
              title="Import Backup"
              description="This will replace all current local BenchOS data with the selected backup."
              confirmLabel={<span className="inline-flex items-center gap-2"><FileJson size={16} /> Import</span>}
              onCancel={() => setPendingAction(undefined)}
              onConfirm={() => void run('Imported BenchOS backup.', async () => { await importBenchOsBackup(pendingBackup) })}
            />
          )}

          {pendingAction === 'resetSample' && (
            <ConfirmDialog
              title="Reset Sample Data"
              description="This clears workshop data and reloads the BenchOS starter sample set."
              confirmLabel={<span className="inline-flex items-center gap-2"><RotateCcw size={16} /> Reset</span>}
              onCancel={() => setPendingAction(undefined)}
              onConfirm={() => void run('Sample data reset.', async () => { await resetSampleData() })}
            />
          )}

          {pendingAction === 'clearAll' && (
            <ConfirmDialog
              title="Clear Local Data"
              description="This clears all local workshop data, keeps the app usable, and leaves the Tool Library ready for a clean start."
              confirmLabel={<span className="inline-flex items-center gap-2"><Trash2 size={16} /> Clear</span>}
              onCancel={() => setPendingAction(undefined)}
              onConfirm={() => void run('Local data cleared.', async () => { await clearAllLocalData() })}
            />
          )}
        </div>
      </div>

      <Modal
        open={deleteModalOpen}
        title="Delete BenchOS account?"
        description="This permanently deletes your BenchOS account and user-scoped workshop data. This action cannot be undone."
        onClose={closeDeleteModal}
      >
        <div className="grid gap-5">
          <div className="rounded-lg border border-bench-red/30 bg-bench-red/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 shrink-0 text-bench-red" size={20} />
              <p className="text-sm leading-6 text-bench-text">
                Your tools, projects, materials, wishlist, BenchXP progress, guide progress, settings, and setup history will be removed.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-bench-border bg-white/[0.025] p-4 text-sm leading-6 text-bench-muted">
            Want a copy first? Export your BenchOS data before deleting your account.
            <div className="mt-3">
              <Button size="sm" icon={<Download size={16} />} disabled={deleteWorking} onClick={() => void exportJson()}>
                Export my data first
              </Button>
            </div>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-bench-text" htmlFor="delete-confirmation">
            Type DELETE to confirm.
            <input
              id="delete-confirmation"
              value={deleteConfirmation}
              disabled={deleteWorking}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              className="min-h-11 rounded-lg border border-bench-border bg-bench-bg px-3 text-bench-text outline-none transition focus:border-bench-orange focus:ring-2 focus:ring-bench-orange/30"
              autoComplete="off"
            />
          </label>

          {deleteError && (
            <p className="rounded-lg border border-bench-red/30 bg-bench-red/10 p-3 text-sm text-bench-red">
              {deleteError}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" disabled={deleteWorking} onClick={closeDeleteModal}>Cancel</Button>
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              disabled={deleteConfirmation !== 'DELETE' || deleteWorking || !auth0.available}
              onClick={() => void deleteAccount()}
            >
              {deleteWorking ? 'Deleting account...' : 'Permanently delete account'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function formatDate(value?: string) {
  if (!value) return 'Never'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}
