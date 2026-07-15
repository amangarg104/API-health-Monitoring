import { Outlet, Navigate } from 'react-router-dom'
import { Sidebar, useSidebarState } from './Sidebar'
import { TopBar } from './TopBar'
import { useAuth } from '@/app/AuthContext'
import type { UserRole } from '@/types'

export function AppShell() {
  const { mobileOpen, setMobileOpen } = useSidebarState()

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function RequireRole({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { role: current } = useAuth()
  if (current !== role) {
    return <Navigate to={current === 'partner' ? '/partner' : '/internal'} replace />
  }
  return children
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
