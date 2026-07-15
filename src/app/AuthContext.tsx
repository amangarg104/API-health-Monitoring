import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from 'react'
import type { UserRole } from '@/types'
import { PARTNERS, hydrateAlertsFromStorage } from '@/data/mock'

interface AuthState {
  role: UserRole
  partnerId: string
  partnerName: string
  setRole: (role: UserRole) => void
  setPartnerId: (id: string) => void
}

const AuthContext = createContext<AuthState | null>(null)

const STORAGE_KEY = 'api-health-auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('internal')
  const [partnerId, setPartnerIdState] = useState('p1')

  useEffect(() => {
    hydrateAlertsFromStorage()
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { role: UserRole; partnerId: string }
        setRoleState(parsed.role)
        setPartnerIdState(parsed.partnerId || 'p1')
      }
    } catch {
      /* ignore */
    }
  }, [])

  function persist(nextRole: UserRole, nextPartner: string) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: nextRole, partnerId: nextPartner }))
    } catch {
      /* ignore */
    }
  }

  const value = useMemo(() => {
    const partner = PARTNERS.find((p) => p.id === partnerId) ?? PARTNERS[0]
    return {
      role,
      partnerId: partner.id,
      partnerName: partner.name,
      setRole: (r: UserRole) => {
        setRoleState(r)
        persist(r, partnerId)
      },
      setPartnerId: (id: string) => {
        setPartnerIdState(id)
        persist(role, id)
      },
    }
  }, [role, partnerId])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
