import {
  Briefcase,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Gauge,
  Hammer,
  Heart,
  LayoutDashboard,
  Layers3,
  Settings,
  Star,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils/cn'
import { APP_VERSION_LABEL } from '../../lib/version'

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
  { label: 'Tool Library', to: '/tool-library', icon: Wrench },
  { label: 'My Tools', to: '/my-tools', icon: Briefcase },
  { label: 'Materials', to: '/materials', icon: Layers3 },
  { label: 'Projects', to: '/projects', icon: ClipboardList },
  { label: 'Templates', to: '/project-templates', icon: Hammer },
  { label: 'Gap Analyzer', to: '/gap-analyzer', icon: ChartNoAxesColumnIncreasing },
  { label: 'Workshop Score', to: '/workshop-score', icon: Gauge },
  { label: 'Wishlist', to: '/wishlist', icon: Heart },
  { label: 'Tool Mastery', to: '/mastery', icon: Star },
  { label: 'Settings', to: '/settings', icon: Settings },
]

function WorkbenchLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="h-7 w-7" fill="none">
      <path d="M6 10.5h20" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M8 13.5h16" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M10 15.5v9M22 15.5v9" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M8.5 24.5h15" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  )
}

export function SidebarNav() {
  return (
    <aside className="group/sidebar sticky top-0 z-30 hidden h-screen w-24 shrink-0 border-r border-bench-border/90 bg-bench-bg/92 p-3 backdrop-blur-xl transition-[width] duration-200 ease-out hover:w-64 focus-within:w-64 xl:block">
      <div className="flex h-full flex-col rounded-2xl border border-bench-border bg-white/[0.025] p-3">
        <div className="mb-8 grid grid-cols-[2.75rem_0fr] items-center gap-0 pt-2 transition-[grid-template-columns,gap] duration-200 group-hover/sidebar:grid-cols-[2.75rem_1fr] group-hover/sidebar:gap-3 group-focus-within/sidebar:grid-cols-[2.75rem_1fr] group-focus-within/sidebar:gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center justify-self-center rounded-xl bg-bench-orange text-white shadow-glow">
            <WorkbenchLogo />
          </span>
          <div className="min-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100">
            <p className="text-2xl font-bold text-bench-text">BenchOS</p>
            <p className="text-xs text-bench-muted">{APP_VERSION_LABEL}</p>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 items-center justify-center gap-0 rounded-lg border px-3 text-sm font-semibold transition group-hover/sidebar:justify-start group-hover/sidebar:gap-3 group-focus-within/sidebar:justify-start group-focus-within/sidebar:gap-3',
                  isActive
                    ? 'border-bench-orange/45 bg-bench-orange/12 text-bench-orange'
                    : 'border-transparent text-bench-muted hover:bg-white/[0.045] hover:text-bench-text',
                )
              }
            >
              <item.icon className="shrink-0" size={20} />
              <span className="w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover/sidebar:w-36 group-hover/sidebar:opacity-100 group-focus-within/sidebar:w-36 group-focus-within/sidebar:opacity-100">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
