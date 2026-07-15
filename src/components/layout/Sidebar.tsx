import { NavLink } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  Bell,
  FileBarChart,
  LayoutDashboard,
  Network,
  Radar,
  Siren,
  Users,
  Wrench,
  X,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/app/AuthContext'
import { useState } from 'react'

const partnerNav = [
  { to: '/partner', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/partner/api-health', label: 'API Health', icon: Activity },
  { to: '/partner/errors', label: 'Error Analytics', icon: AlertTriangle },
  { to: '/partner/error-reports', label: 'Error Reports', icon: FileBarChart },
  { to: '/partner/action-center', label: 'Action Center', icon: Wrench },
  { to: '/partner/alerts', label: 'Alerts', icon: Siren },
  { to: '/partner/notifications', label: 'Notifications', icon: Bell },
]

const internalNav = [
  { to: '/internal', label: 'Operations Home', icon: LayoutDashboard, end: true },
  { to: '/internal/partners', label: 'Partner Performance', icon: Users },
  { to: '/internal/health-matrix', label: 'Health Matrix', icon: Network },
  { to: '/internal/api-monitoring', label: 'API Monitoring', icon: Activity },
  { to: '/internal/observability', label: 'Observability', icon: Radar },
]

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { role } = useAuth()
  const nav = role === 'partner' ? partnerNav : internalNav

  return (
    <>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      ) : null}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <div>
            <p className="text-sm font-bold tracking-tight text-white">API Health</p>
            <p className="text-[10px] uppercase tracking-wider text-teal-400/90">ICICI Lombard Digital</p>
          </div>
          <button type="button" className="lg:hidden text-sidebar-foreground cursor-pointer" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-active text-white'
                    : 'text-sidebar-foreground hover:bg-white/5 hover:text-white',
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0 opacity-80" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3 text-[10px] text-sidebar-foreground/70">
          Demo · Frontend mock data · NOC view
        </div>
      </aside>
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="lg:hidden rounded-md p-2 hover:bg-muted cursor-pointer" onClick={onClick}>
      <Menu className="h-5 w-5" />
    </button>
  )
}

export function useSidebarState() {
  const [mobileOpen, setMobileOpen] = useState(false)
  return { mobileOpen, setMobileOpen }
}
