import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { API_LABELS, API_HEALTH, buildTimeSeries, PARTNERS } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { TimeRangeToggle } from '@/components/shared/TimeRangeToggle'
import { DualTrendChart, LatencyTrendChart, TrafficChart } from '@/components/shared/Charts'
import { formatMs, formatNumber, formatPercent } from '@/lib/utils'
import type { ApiName, TimeRange } from '@/types'
import { HealthStatusBadge } from '@/components/shared/StatusBadges'
import { KpiCard } from '@/components/shared/KpiCard'

export function InternalApiMonitoring() {
  const [params] = useSearchParams()
  const initialApi = (params.get('api') as ApiName) || 'Quote'
  const [api, setApi] = useState<ApiName>(API_LABELS.includes(initialApi) ? initialApi : 'Quote')
  const [partnerId, setPartnerId] = useState(params.get('partner') || 'all')
  const [range, setRange] = useState<TimeRange>('24h')

  const subset = useMemo(
    () => API_HEALTH.filter((a) => a.api === api && (partnerId === 'all' || a.partnerId === partnerId)),
    [api, partnerId],
  )

  const agg = useMemo(() => {
    const requests = subset.reduce((s, a) => s + a.requestsToday, 0)
    const failed = subset.reduce((s, a) => s + a.failedCalls, 0)
    const avgLatency = subset.reduce((s, a) => s + a.avgResponseMs, 0) / (subset.length || 1)
    const availability = subset.reduce((s, a) => s + a.availability, 0) / (subset.length || 1)
    const peak = Math.max(...subset.map((a) => a.peakRps), 0)
    const version = subset[0]?.version ?? '—'
    const releaseDate = subset[0]?.releaseDate ?? '—'
    const errorPct = requests ? (failed / requests) * 100 : 0
    const worst = subset.sort((a, b) => a.successRate - b.successRate)[0]
    return { requests, failed, avgLatency, availability, peak, version, releaseDate, errorPct, status: worst?.status ?? 'healthy' }
  }, [subset])

  const series = buildTimeSeries(partnerId === 'all' ? 'all' : partnerId, api, range)

  return (
    <div>
      <PageHeader
        title="API Monitoring"
        description="Traffic, latency, availability, error %, peak load, version, and trends"
        actions={
          <>
            <Select className="w-44" value={api} onChange={(e) => setApi(e.target.value as ApiName)}>
              {API_LABELS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
            <Select className="w-48" value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
              <option value="all">All partners</option>
              {PARTNERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <TimeRangeToggle value={range} onChange={setRange} />
          </>
        }
      />
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-lg font-semibold">{api} API</h3>
        <HealthStatusBadge status={agg.status} />
        <span className="text-xs font-mono text-muted-foreground">
          {agg.version} · released {agg.releaseDate}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Traffic (requests)" value={agg.requests} />
        <KpiCard title="Avg Latency" value={formatMs(agg.avgLatency)} />
        <KpiCard title="Availability" value={formatPercent(agg.availability, 3)} />
        <KpiCard title="Error %" value={formatPercent(agg.errorPct)} tone="warning" />
        <KpiCard title="Peak Load (RPS)" value={formatNumber(agg.peak)} />
        <KpiCard title="Failed Calls" value={agg.failed} tone="critical" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Success / Failure Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <DualTrendChart data={series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <LatencyTrendChart data={series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficChart data={series} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
