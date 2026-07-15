import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/app/AuthContext'
import { PARTNERS } from '@/data/mock'
import { useNavigate } from 'react-router-dom'
import { MobileMenuButton } from './Sidebar'
import { Badge } from '@/components/ui/badge'

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { role, partnerId, partnerName, setRole, setPartnerId } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur">
      <MobileMenuButton onClick={onMenu} />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold sm:text-base">
          API Health Dashboard
          <span className="ml-2 hidden text-xs font-normal text-muted-foreground sm:inline">
            ICICI Lombard Digital Partnerships
          </span>
        </h1>
      </div>
      <Badge variant="secondary" className="hidden sm:inline-flex">
        {role === 'partner' ? `Partner · ${partnerName}` : 'Internal Ops'}
      </Badge>
      <Select
        className="w-[140px]"
        value={role}
        onChange={(e) => {
          const r = e.target.value as 'partner' | 'internal'
          setRole(r)
          navigate(r === 'partner' ? '/partner' : '/internal')
        }}
        aria-label="Role switcher"
      >
        <option value="partner">Partner Portal</option>
        <option value="internal">Internal Ops</option>
      </Select>
      {role === 'partner' ? (
        <Select
          className="hidden w-[160px] md:flex"
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
          aria-label="Partner selector"
        >
          {PARTNERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      ) : null}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </header>
  )
}
