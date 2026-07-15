import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/app/AuthContext'
import { AppShell, RequireRole } from '@/components/layout/AppShell'
import { PartnerHome } from '@/features/partner/PartnerHome'
import { PartnerApiHealth } from '@/features/partner/PartnerApiHealth'
import { PartnerErrors } from '@/features/partner/PartnerErrors'
import { PartnerErrorReports } from '@/features/partner/PartnerErrorReports'
import { PartnerActionCenter } from '@/features/partner/PartnerActionCenter'
import { PartnerAlerts } from '@/features/partner/PartnerAlerts'
import { PartnerNotifications } from '@/features/partner/PartnerNotifications'
import { InternalHome } from '@/features/internal/InternalHome'
import { InternalPartners } from '@/features/internal/InternalPartners'
import { InternalHealthMatrix } from '@/features/internal/InternalHealthMatrix'
import { InternalApiMonitoring } from '@/features/internal/InternalApiMonitoring'
import { InternalObservability } from '@/features/internal/InternalObservability'

export function AppRouter() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/internal" replace />} />
            <Route element={<AppShell />}>
              <Route
                path="/partner"
                element={
                  <RequireRole role="partner">
                    <PartnerHome />
                  </RequireRole>
                }
              />
              <Route
                path="/partner/api-health"
                element={
                  <RequireRole role="partner">
                    <PartnerApiHealth />
                  </RequireRole>
                }
              />
              <Route
                path="/partner/errors"
                element={
                  <RequireRole role="partner">
                    <PartnerErrors />
                  </RequireRole>
                }
              />
              <Route
                path="/partner/error-reports"
                element={
                  <RequireRole role="partner">
                    <PartnerErrorReports />
                  </RequireRole>
                }
              />
              <Route
                path="/partner/action-center"
                element={
                  <RequireRole role="partner">
                    <PartnerActionCenter />
                  </RequireRole>
                }
              />
              <Route
                path="/partner/alerts"
                element={
                  <RequireRole role="partner">
                    <PartnerAlerts />
                  </RequireRole>
                }
              />
              <Route
                path="/partner/notifications"
                element={
                  <RequireRole role="partner">
                    <PartnerNotifications />
                  </RequireRole>
                }
              />

              <Route
                path="/internal"
                element={
                  <RequireRole role="internal">
                    <InternalHome />
                  </RequireRole>
                }
              />
              <Route
                path="/internal/partners"
                element={
                  <RequireRole role="internal">
                    <InternalPartners />
                  </RequireRole>
                }
              />
              <Route
                path="/internal/health-matrix"
                element={
                  <RequireRole role="internal">
                    <InternalHealthMatrix />
                  </RequireRole>
                }
              />
              <Route
                path="/internal/api-monitoring"
                element={
                  <RequireRole role="internal">
                    <InternalApiMonitoring />
                  </RequireRole>
                }
              />
              <Route
                path="/internal/observability"
                element={
                  <RequireRole role="internal">
                    <InternalObservability />
                  </RequireRole>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/internal" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
