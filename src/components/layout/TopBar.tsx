import {
  Bell,
  ChevronDown,
  Cloud,
  Command,
  LogIn,
  LogOut,
  Palette,
  Search,
  Settings,
  Sun,
  X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActiveNotifications, useAuthSessionState, useUserProfile } from '../../data/hooks'
import { signOut } from '../../lib/auth/authService'
import { Button } from '../ui/Button'

export function TopBar() {
  const navigate = useNavigate()
  const session = useAuthSessionState()
  const userProfile = useUserProfile()
  const notifications = useActiveNotifications()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [modePromptOpen, setModePromptOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const signedIn = session?.status === 'signed_in'
  const label = signedIn ? 'Synced' : 'Sign in'
  const profileName = userProfile?.displayName?.trim()
  const displayName = profileName && profileName !== 'Local Mode' ? profileName : session?.email?.split('@')[0] ?? 'Account'
  const activeNotifications = notifications ?? []

  function openSearch() {
    setSearchOpen(true)
    window.setTimeout(() => searchInputRef.current?.focus(), 0)
  }

  async function handleAccountAuth() {
    setAccountOpen(false)
    if (!signedIn) {
      navigate('/login')
      return
    }

    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex min-h-24 items-center justify-between gap-4 border-b border-white/[0.06] bg-bench-bg/88 px-5 py-4 backdrop-blur-xl lg:px-8">
      {searchOpen ? (
        <label className="relative w-full max-w-2xl">
          <span className="sr-only">Search BenchOS</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-bench-muted" size={20} />
          <input
            ref={searchInputRef}
            className="h-14 w-full rounded-xl border border-bench-border bg-white/[0.035] pl-12 pr-16 text-sm text-bench-text outline-none transition placeholder:text-bench-muted focus:border-bench-orange/70"
            placeholder="Search tools, materials, projects..."
            onKeyDown={(event) => {
              if (event.key === 'Escape') setSearchOpen(false)
            }}
            readOnly
          />
          <span className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md border border-bench-border bg-white/[0.04] px-2 py-1 text-xs text-bench-muted">
            <Command size={13} /> K
          </span>
        </label>
      ) : (
        <Button size="icon" variant="secondary" aria-label="Open search" onClick={openSearch}>
          <Search size={20} />
        </Button>
      )}

      <div className="hidden items-center gap-3 md:flex">
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-bench-green/30 bg-bench-green/10 px-3 text-sm font-semibold text-bench-green transition hover:border-bench-green/60 hover:bg-bench-green/15"
          onClick={() => {
            setModePromptOpen(true)
            setNotificationsOpen(false)
            setAccountOpen(false)
          }}
        >
          <Cloud size={17} />
          {label}
        </button>
        <Button size="icon" variant="secondary" aria-label="Settings" onClick={() => navigate('/settings')}>
          <Settings size={20} />
        </Button>
        <Button size="icon" variant="secondary" aria-label="Theme toggle">
          <Sun size={20} />
        </Button>

        <div className="relative">
          <Button
            size="icon"
            variant="secondary"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((open) => !open)
              setAccountOpen(false)
              setModePromptOpen(false)
            }}
          >
            <Bell size={20} />
          </Button>
          {notificationsOpen && (
            <div className="absolute right-0 top-14 w-80 rounded-xl border border-bench-border bg-bench-panel p-4 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-bench-text">Notifications</p>
                <button
                  className="rounded-md p-1 text-bench-muted transition hover:bg-white/5 hover:text-bench-text"
                  aria-label="Close notifications"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
              {activeNotifications.length === 0 ? (
                <p className="mt-4 rounded-lg border border-bench-border bg-white/[0.025] p-3 text-sm text-bench-muted">You're all caught up!</p>
              ) : (
                <div className="mt-3 grid gap-3">
                  {activeNotifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="rounded-lg border border-bench-border bg-white/[0.025] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-bench-text">{notification.title}</p>
                        <span className="shrink-0 text-[11px] text-bench-muted">{formatNotificationDate(notification.updatedAt)}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-bench-muted">{notification.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            className="min-w-36 justify-between"
            variant="secondary"
            aria-expanded={accountOpen}
            onClick={() => {
              setAccountOpen((open) => !open)
              setNotificationsOpen(false)
              setModePromptOpen(false)
            }}
          >
            <span className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-bench-border bg-bench-orange/15 text-sm font-bold text-bench-orange">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
              {displayName}
            </span>
            <ChevronDown size={17} />
          </Button>
          {accountOpen && (
            <div className="absolute right-0 top-14 w-56 rounded-xl border border-bench-border bg-bench-panel p-2 shadow-2xl">
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-bench-text transition hover:bg-white/[0.06]"
                onClick={() => void handleAccountAuth()}
              >
                {signedIn ? <LogOut size={16} /> : <LogIn size={16} />}
                {signedIn ? 'Log out' : 'Online sign-in'}
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-bench-text transition hover:bg-white/[0.06]"
                onClick={() => {
                  setAccountOpen(false)
                  navigate('/settings')
                }}
              >
                <Settings size={16} />
                Settings
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-bench-muted"
                onClick={() => setAccountOpen(false)}
              >
                <Palette size={16} />
                Personalization
              </button>
            </div>
          )}
        </div>
      </div>

      {modePromptOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/35 px-6 pt-24 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-bench-border bg-bench-panel p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-bench-text">Switch to online mode?</p>
                <p className="mt-2 text-sm leading-6 text-bench-muted">
                  BenchOS production uses sign-in for account access. Open Account to review sync status or sign out of this device.
                </p>
              </div>
              <button
                className="rounded-md p-1 text-bench-muted transition hover:bg-white/5 hover:text-bench-text"
                aria-label="Close online mode prompt"
                onClick={() => setModePromptOpen(false)}
              >
                <X size={17} />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setModePromptOpen(false)}>Close</Button>
              <Button
                variant="primary"
                icon={<Cloud size={16} />}
                onClick={() => {
                  setModePromptOpen(false)
                  navigate(signedIn ? '/account' : '/login')
                }}
              >
                Open Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function formatNotificationDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
