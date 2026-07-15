import { SLA_METRICS } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/shared/KpiCard'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { formatMs, formatPercent } from '@/lib/utils'
import type { SlaMetric } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SimpleBarChart } from '@/components/shared/Charts'

export function InternalSla() {
  const breached = SLA_METRICS.filter((s) => s.breached).length
  const avgAvail = SLA_METRICS.reduce((s, m) => s + m.availability, 0) / SLA_METRICS.length
  const avgBudget = SLA_METRICS.reduce((s, m) => s + m.errorBudgetRemaining, 0) / SLA_METRICS.length

  const columns: Column<SlaMetric>[] = [
    { key: 'partner', header: 'Partner', sortable: true, sortValue: (r) => r.partnerName, render: (r) => r.partnerName },
    { key: 'target', header: 'Target', render: (r) => r.target },
    { key: 'avail', header: 'Availability', sortable: true, sortValue: (r) => r.availability, render: (r) => formatPercent(r.availability, 3) },
    { key: 'avg', header: 'Avg RT', sortable: true, sortValue: (r) => r.avgResponseMs, render: (r) => formatMs(r.avgResponseMs) },
    { key: 'p95', header: 'P95', sortable: true, sortValue: (r) => r.p95, render: (r) => formatMs(r.p95) },
    { key: 'p99', header: 'P99', sortable: true, sortValue: (r) => r.p99, render: (r) => formatMs(r.p99) },
    { key: 'down', header: 'Downtime (min)', sortable: true, sortValue: (r) => r.downtimeMinutes, render: (r) => r.downtimeMinutes },
    { key: 'monthly', header: 'Monthly SLA', render: (r) => formatPercent(r.monthlySla, 3) },
    { key: 'partnerSla', header: 'Partner SLA', render: (r) => formatPercent(r.partnerSla, 3) },
    { key: 'budget', header: 'Error Budget Left', sortable: true, sortValue: (r) => r.errorBudgetRemaining, render: (r) => `${r.errorBudgetRemaining}%` },
    {
      key: 'breach',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.breached ? 'critical' : 'success'}>{r.breached ? 'Breached' : 'Compliant'}</Badge>
      ),
    },
  ]

  const budgetChart = SLA_METRICS.map((m) => ({
    name: m.partnerName.split(' ')[0],
    budget: m.errorBudgetRemaining,
  }))

  return (
    <div>
      <PageHeader
        title="SLA Dashboard"
        description="Track 99.9% / 99.5% / 99% targets, percentiles, downtime, and error budget"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Avg Availability" value={formatPercent(avgAvail, 3)} />
        <KpiCard title="SLA Breaches" value={breached} tone={breached ? 'critical' : 'success'} />
        <KpiCard title="Avg Error Budget Left" value={`${avgBudget.toFixed(0)}%`} />
        <KpiCard title="Partners Tracked" value={SLA_METRICS.length} />
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Error Budget Remaining by Partner</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart data={budgetChart} dataKey="budget" nameKey="name" color="#0f766e" />
        </CardContent>
      </Card>
      <div className="mt-6">
        <DataTable
          data={SLA_METRICS.map((s) => ({ ...s, id: s.partnerId }))}
          columns={columns}
          searchKeys={['partnerName']}
          searchPlaceholder="Search partners…"
        />
      </div>
    </div>
  )
}
