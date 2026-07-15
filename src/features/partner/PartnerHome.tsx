import { useAuth } from '@/app/AuthContext'
import { getPartnerKpis, buildTimeSeries, getAlerts } from '@/data/mock'
import { KpiCard } from '@/components/shared/KpiCard'
import { PageHeader } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DualTrendChart, TrafficChart } from '@/components/shared/Charts'
import { formatMs, formatPercent } from '@/lib/utils'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PhoneCall,
  ShieldCheck,
  Siren,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { HealthStatusBadge, SeverityPill } from '@/components/shared/StatusBadges'

export function PartnerHome() {
  const { partnerId, partnerName } = useAuth()
  const kpi = getPartnerKpis(partnerId)
  const series = buildTimeSeries(partnerId, 'all', '24h')
  const alerts = getAlerts().filter((a) => a.partnerId === partnerId && a.status !== 'resolved').slice(0, 5)

  return (
    <div>
      <PageHeader
        title={`${partnerName} — Dashboard`}
        description="Real-time API health overview for your integrations"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total API Calls Today" value={kpi.totalCallsToday} icon={Activity} trend={4} />
        <KpiCard title="Successful Calls" value={kpi.successfulCalls} icon={CheckCircle2} tone="success" />
        <KpiCard title="Failed Calls" value={kpi.failedCalls} icon={XCircle} tone="critical" />
        <KpiCard title="Success %" value={formatPercent(kpi.successRate)} icon={ShieldCheck} tone="success" />
        <KpiCard title="Avg Response Time" value={formatMs(kpi.avgResponseMs)} icon={Clock} />
        <KpiCard title="Availability %" value={formatPercent(kpi.availability, 3)} icon={PhoneCall} />
        <KpiCard title="Active Alerts" value={kpi.activeAlerts} icon={Siren} tone={kpi.activeAlerts ? 'warning' : 'default'} />
        <KpiCard title="Pending Critical" value={kpi.pendingCritical} icon={AlertTriangle} tone={kpi.pendingCritical ? 'critical' : 'default'} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Success vs Error Trend (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <DualTrendChart data={series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Traffic (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficChart data={series} />
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Live Alerts</CardTitle>
          <Link to="/partner/alerts" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active alerts</p>
          ) : (
            alerts.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{a.type}</p>
                  <p className="text-xs text-muted-foreground">{a.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityPill severity={a.severity} />
                  <HealthStatusBadge status={a.severity === 'critical' ? 'critical' : a.severity === 'high' ? 'warning' : 'healthy'} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
