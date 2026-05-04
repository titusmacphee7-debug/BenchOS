import { Outlet } from 'react-router-dom'
import { SidebarNav } from './SidebarNav'
import { TopBar } from './TopBar'

export function AppShell() {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-bench-bg text-bench-text">
      <SidebarNav />
      <div className="min-w-0 flex-1">
        <TopBar />
        <main className="custom-scrollbar mx-auto w-full max-w-[1680px] px-5 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
