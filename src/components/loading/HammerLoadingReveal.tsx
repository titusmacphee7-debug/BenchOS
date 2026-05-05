import { useEffect, useState } from 'react'

type HammerLoadingRevealProps = {
  label: string
  slowLabel?: string
  fullScreen?: boolean
}

export function HammerLoadingReveal({ label, slowLabel, fullScreen = false }: HammerLoadingRevealProps) {
  const [visible, setVisible] = useState(false)
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const visibleTimer = window.setTimeout(() => setVisible(true), 250)
    const slowTimer = window.setTimeout(() => setSlow(true), 1200)
    return () => {
      window.clearTimeout(visibleTimer)
      window.clearTimeout(slowTimer)
    }
  }, [])

  if (!visible) {
    return <div className={fullScreen ? 'min-h-screen bg-bench-bg' : 'min-h-32'} aria-hidden="true" />
  }

  return (
    <div
      className={fullScreen ? 'flex min-h-screen items-center justify-center bg-bench-bg p-6 text-bench-text' : 'panel-surface rounded-xl p-5 text-bench-text'}
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="hammer-loader" aria-hidden="true">
          <div className="hammer-loader__plate hammer-loader__plate--left" />
          <div className="hammer-loader__plate hammer-loader__plate--right" />
          <svg className="hammer-loader__hammer" viewBox="0 0 96 96" role="img">
            <path d="M28 18h28l10 10-10 10H28l-8-8v-4l8-8Z" />
            <path d="M49 37 78 66l-8 8-29-29 8-8Z" />
          </svg>
          <span className="hammer-loader__ring" />
          <span className="hammer-loader__spark hammer-loader__spark--one" />
          <span className="hammer-loader__spark hammer-loader__spark--two" />
          <span className="hammer-loader__spark hammer-loader__spark--three" />
        </div>
        <p className="mt-4 text-sm font-semibold text-bench-text">{slow ? slowLabel ?? label : label}</p>
        {slow && (
          <p className="mt-2 text-xs leading-5 text-bench-muted">
            BenchOS is still loading the next workshop view. This should clear as soon as the route is ready.
          </p>
        )}
      </div>
    </div>
  )
}
