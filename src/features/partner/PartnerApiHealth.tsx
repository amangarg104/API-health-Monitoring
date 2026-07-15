import { useState } from 'react'
import { useAuth } from '@/app/AuthContext'
import { getPartnerApis, buildTimeSeries } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HealthStatusBadge } from '@/components/shared/StatusBadges'
import { TimeRangeToggle } from '@/components/shared/TimeRangeToggle'
import { SuccessTrendChart, LatencyTrendChart } from '@/components/shared/Charts'
import { formatMs, formatNumber, formatPercent } from '@/lib/utils'
import type { TimeRange } from '@/types'

export function PartnerApiHealth() {
  const { partnerId } = useAuth()
  const apis = getPartnerApis(partnerId)
  const [range, setRange] = useState<TimeRange>('24h')
  const [selected, setSelected] = useState(apis[0]?.api ?? 'Quote')
  const series = buildTimeSeries(partnerId, selected, range)

  return (
    <div>
      <PageHeader
        title="API Health"
        description="Health status for Quote, Proposal, Payment Sync, Status, and COI APIs"
        actions={<TimeRangeToggle value={range} onChange={setRange} />}
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {apis.map((api) => (
          <button
            key={api.api}
            type="button"
            onClick={() => setSelected(api.api)}
            className={`text-left rounded-lg border bg-card p-4 shadow-sm transition-all cursor-pointer hover:border-primary ${
              selected === api.api ? 'border-primary ring-1 ring-primary/30' : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{api.api} API</h3>
              <HealthStatusBadge status={api.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <div>
                <dt className="text-muted-foreground">Requests Today</dt>
                <dd className="font-medium tabular-nums">{formatNumber(api.requestsToday)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Success %</dt>
                <dd className="font-medium tabular-nums">{formatPercent(api.successRate)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Failed Calls</dt>
                <dd className="font-medium tabular-nums">{formatNumber(api.failedCalls)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Avg Response</dt>
                <dd className="font-medium tabular-nums">{formatMs(api.avgResponseMs)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Max Response</dt>
                <dd className="font-medium tabular-nums">{formatMs(api.maxResponseMs)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Version</dt>
                <dd className="font-mono text-[11px]">{api.version}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Last Downtime</dt>
                <dd className="font-medium">{api.lastDowntime ? new Date(api.lastDowntime).toLocaleString() : 'None'}</dd>
              </div>
            </dl>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{selected} — Success Trend ({range})</CardTitle>
          </CardHeader>
          <CardContent>
            <SuccessTrendChart data={series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{selected} — Latency Trend ({range})</CardTitle>
          </CardHeader>
          <CardContent>
            <LatencyTrendChart data={series} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
