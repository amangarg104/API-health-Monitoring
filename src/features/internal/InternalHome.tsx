import { getInternalKpis, buildTimeSeries, getAlerts, getPartnerPerformance } from '@/data/mock'
import { KpiCard } from '@/components/shared/KpiCard'
import { PageHeader } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DualTrendChart, TrafficChart } from '@/components/shared/Charts'
import { formatPercent } from '@/lib/utils'
import {
  Activity,
  AlertTriangle,
  Building2,
  Percent,
  ShieldAlert,
  Target,
  Users,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PartnerScoreBadge, SeverityPill } from '@/components/shared/StatusBadges'

export function InternalHome() {
  const kpi = getInternalKpis()
  const series = buildTimeSeries('all', 'all', '24h')
  const alerts = getAlerts().filter((a) => a.status !== 'resolved').slice(0, 6)
  const top = [...getPartnerPerformance()].sort((a, b) => b.healthScore - a.healthScore).slice(0, 5)

  return (
    <div>
      <PageHeader
        title="Internal Operations"
        description="Centralized NOC view across all digital partners"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard title="Total Partners" value={kpi.totalPartners} icon={Building2} />
        <KpiCard title="Active Partners" value={kpi.activePartners} icon={Users} tone="success" />
        <KpiCard title="Total API Calls" value={kpi.totalApiCalls} icon={Activity} />
        <KpiCard title="Today's Transactions" value={kpi.todaysTransactions} icon={Activity} />
        <KpiCard title="Overall Success Rate" value={formatPercent(kpi.overallSuccessRate)} icon={Percent} tone="success" />
        <KpiCard title="Overall Failure Rate" value={formatPercent(kpi.overallFailureRate)} icon={XCircle} tone="critical" />
        <KpiCard title="Overall Availability" value={formatPercent(kpi.overallAvailability, 3)} icon={Target} />
        <KpiCard title="Critical Alerts" value={kpi.totalCriticalAlerts} icon={AlertTriangle} tone={kpi.totalCriticalAlerts ? 'critical' : 'default'} />
        <KpiCard title="SLA Breaches" value={kpi.slaBreaches} icon={ShieldAlert} tone={kpi.slaBreaches ? 'warning' : 'default'} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Success / Error (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <DualTrendChart data={series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Platform Traffic (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficChart data={series} />
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Top Partner Scores</CardTitle>
            <Link to="/internal/executive" className="text-xs text-primary hover:underline">
              Executive view
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {top.map((p) => (
              <Link
                key={p.partner.id}
                to={`/internal/partners?partner=${p.partner.id}`}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:bg-muted/50"
              >
                <span className="text-sm font-medium">{p.partner.name}</span>
                <PartnerScoreBadge tier={p.tier} score={p.healthScore} />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Open Alerts</CardTitle>
            <Link to="/internal/errors" className="text-xs text-primary hover:underline">
              Error intelligence
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-2 rounded-md border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{a.partnerName} · {a.type}</p>
                  <p className="text-xs text-muted-foreground">{a.message}</p>
                </div>
                <SeverityPill severity={a.severity} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
