import { Link } from 'react-router-dom'
import { getPartnerPerformance, getInternalKpis, buildTimeSeries } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/shared/KpiCard'
import { PartnerScoreBadge } from '@/components/shared/StatusBadges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DualTrendChart, TrafficChart, SimpleBarChart } from '@/components/shared/Charts'
import { formatPercent } from '@/lib/utils'

export function InternalExecutive() {
  const perf = getPartnerPerformance()
  const kpi = getInternalKpis()
  const ranked = [...perf].sort((a, b) => b.healthScore - a.healthScore)
  const top = ranked.slice(0, 5)
  const poor = [...ranked].reverse().slice(0, 5)
  const digitalHealth = ranked.reduce((s, p) => s + p.healthScore, 0) / ranked.length
  const series = buildTimeSeries('all', 'all', '30d')
  const scoreChart = ranked.map((p) => ({
    name: p.partner.code,
    score: p.healthScore,
  }))

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        description="Partner health scores, rankings, volume, and overall digital health"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Overall Digital Health Score" value={digitalHealth.toFixed(1)} tone="success" />
        <KpiCard title="Monthly API Availability" value={formatPercent(kpi.overallAvailability, 3)} />
        <KpiCard title="Transaction Volume (today)" value={kpi.todaysTransactions} />
        <KpiCard title="Critical Alerts" value={kpi.totalCriticalAlerts} tone={kpi.totalCriticalAlerts ? 'critical' : 'default'} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Partner Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={scoreChart} dataKey="score" nameKey="name" color="#0f766e" height={280} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Error Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <DualTrendChart data={series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Peak Hour Traffic Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficChart data={buildTimeSeries('all', 'all', '24h')} />
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Partners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {top.map((p, i) => (
              <Link
                key={p.partner.id}
                to={`/internal/partners?partner=${p.partner.id}`}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:bg-muted/50"
              >
                <span className="text-sm">
                  <span className="mr-2 text-muted-foreground">#{i + 1}</span>
                  {p.partner.name}
                </span>
                <PartnerScoreBadge tier={p.tier} score={p.healthScore} />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Poor Performing Partners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {poor.map((p) => (
              <Link
                key={p.partner.id}
                to={`/internal/health-matrix?partner=${p.partner.id}`}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:bg-muted/50"
              >
                <span className="text-sm">{p.partner.name}</span>
                <PartnerScoreBadge tier={p.tier} score={p.healthScore} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
