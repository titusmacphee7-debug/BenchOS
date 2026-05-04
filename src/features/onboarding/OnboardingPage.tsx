import { FileJson, HardDrive, PackageCheck, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { IconTile } from '../../components/ui/IconTile'
import { clearWorkshopData, importBenchOsBackup, resetSampleData } from '../../lib/import-export/backup'

export function OnboardingPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string>()
  const [busy, setBusy] = useState(false)

  async function finish(action: () => Promise<unknown>) {
    setBusy(true)
    setMessage(undefined)
    try {
      await action()
      navigate('/', { replace: true })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    } finally {
      setBusy(false)
    }
  }

  async function importBackup(file?: File) {
    if (!file) return
    const text = await file.text()
    await finish(() => importBenchOsBackup(JSON.parse(text)))
  }

  return (
    <div className="min-h-screen bg-bench-bg p-6 text-bench-text">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-center">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <IconTile icon={HardDrive} tone="orange" size="lg" />
            <div>
              <h1 className="text-4xl font-bold">Welcome to BenchOS</h1>
              <p className="mt-2 text-bench-muted">Choose how this local workshop starts. Your data stays on this device.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Card className="flex flex-col">
            <IconTile icon={HardDrive} tone="blue" size="lg" />
            <h2 className="mt-5 text-xl font-semibold">Start Empty</h2>
            <p className="mt-2 flex-1 text-sm text-bench-muted">Keep the Tool Library and guides, but clear sample inventory, projects, logs, wishlist items, and XP.</p>
            <Button className="mt-6" disabled={busy} onClick={() => void finish(() => clearWorkshopData())}>Start Empty</Button>
          </Card>

          <Card className="flex flex-col border-bench-orange/40">
            <IconTile icon={PackageCheck} tone="orange" size="lg" />
            <h2 className="mt-5 text-xl font-semibold">Use Sample Data</h2>
            <p className="mt-2 flex-1 text-sm text-bench-muted">Load the starter workshop with tools, materials, projects, wishlist items, and mastery progress.</p>
            <Button className="mt-6" variant="primary" disabled={busy} onClick={() => void finish(() => resetSampleData())}>Load Sample Data</Button>
          </Card>

          <Card className="flex flex-col">
            <IconTile icon={Upload} tone="green" size="lg" />
            <h2 className="mt-5 text-xl font-semibold">Import Backup</h2>
            <p className="mt-2 flex-1 text-sm text-bench-muted">Restore a BenchOS JSON backup from another browser or previous export.</p>
            <Button className="mt-6" disabled={busy} icon={<FileJson size={17} />} onClick={() => inputRef.current?.click()}>Choose Backup</Button>
            <input ref={inputRef} className="hidden" type="file" accept="application/json,.json" onChange={(event) => void importBackup(event.target.files?.[0])} />
          </Card>
        </div>

        {message && <p className="mt-5 rounded-lg border border-bench-red/30 bg-bench-red/10 p-3 text-sm text-bench-red">{message}</p>}
      </div>
    </div>
  )
}
