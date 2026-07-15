import { ROOT_CAUSES, buildTimeSeries } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/shared/KpiCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SimpleBarChart, DualTrendChart } from '@/components/shared/Charts'
import { DataTable, type Column } from '@/components/shared/DataTable'
import type { RootCauseStat } from '@/types'
import { cn } from '@/lib/utils'

export function InternalRca() {
  const avgMttr = ROOT_CAUSES.reduce((s, r) => s + r.mttrMinutes, 0) / ROOT_CAUSES.length
  const avgMtbf = ROOT_CAUSES.reduce((s, r) => s + r.mtbfHours, 0) / ROOT_CAUSES.length
  const series = buildTimeSeries('all', 'all', '30d')

  const columns: Column<RootCauseStat & { id: string }>[] = [
    { key: 'cause', header: 'Root Cause', sortable: true, sortValue: (r) => r.cause, render: (r) => r.cause },
    { key: 'count', header: 'Occurrences', sortable: true, sortValue: (r) => r.count, render: (r) => r.count },
    {
      key: 'trend',
      header: 'Trend',
      sortable: true,
      sortValue: (r) => r.trend,
      render: (r) => (
        <span className={cn(r.trend >= 0 ? 'text-red-600' : 'text-emerald-600')}>
          {r.trend >= 0 ? '+' : ''}
          {r.trend}%
        </span>
      ),
    },
    { key: 'mttr', header: 'MTTR (min)', sortable: true, sortValue: (r) => r.mttrMinutes, render: (r) => r.mttrMinutes },
    { key: 'mtbf', header: 'MTBF (hrs)', sortable: true, sortValue: (r) => r.mtbfHours, render: (r) => r.mtbfHours },
  ]

  return (
    <div>
      <PageHeader
        title="Root Cause Analytics"
        description="Top root causes, recurring issues, MTTR / MTBF, and problem clusters"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Avg MTTR" value={`${avgMttr.toFixed(0)} min`} />
        <KpiCard title="Avg MTBF" value={`${avgMtbf.toFixed(0)} hrs`} />
        <KpiCard title="MTTD (est.)" value="8 min" subtitle="Mean time to detect" />
        <KpiCard title="Problem Clusters" value={ROOT_CAUSES.length} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Root Causes</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={ROOT_CAUSES.map((r) => ({ name: r.cause.split(' ')[0] + '…', count: r.count }))}
              dataKey="count"
              nameKey="name"
              color="#dc2626"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Issue Trend (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <DualTrendChart data={series} />
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <DataTable
          data={ROOT_CAUSES.map((r, i) => ({ ...r, id: `rc-${i}` }))}
          columns={columns}
          searchKeys={['cause']}
        />
      </div>
    </div>
  )
}
