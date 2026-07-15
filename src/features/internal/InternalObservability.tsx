import { useState } from 'react'
import { TRACES, SECURITY_METRICS, API_HEALTH, buildTimeSeries } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/shared/KpiCard'
import { SeverityPill } from '@/components/shared/StatusBadges'
import { Badge } from '@/components/ui/badge'
import { formatMs } from '@/lib/utils'
import { LatencyTrendChart } from '@/components/shared/Charts'
import { cn } from '@/lib/utils'

const DEPENDENCIES = [
  { from: 'API Gateway', to: 'IAM' },
  { from: 'IAM', to: 'Quote / Proposal / Status' },
  { from: 'Proposal', to: 'UW Engine' },
  { from: 'Payment Sync', to: 'Payment Hub' },
  { from: 'Payment Hub', to: 'Policy Service' },
  { from: 'COI', to: 'DocGen' },
  { from: 'Status', to: 'Policy Service' },
]

export function InternalObservability() {
  const [traceId, setTraceId] = useState(TRACES[0]?.traceId)
  const trace = TRACES.find((t) => t.traceId === traceId) ?? TRACES[0]
  const p50 = API_HEALTH.reduce((s, a) => s + a.p50, 0) / API_HEALTH.length
  const p95 = API_HEALTH.reduce((s, a) => s + a.p95, 0) / API_HEALTH.length
  const p99 = API_HEALTH.reduce((s, a) => s + a.p99, 0) / API_HEALTH.length
  const series = buildTimeSeries('all', 'all', '24h')
  const maxDur = Math.max(...(trace?.spans.map((s) => s.startOffsetMs + s.durationMs) ?? [1]), 1)

  return (
    <div>
      <PageHeader
        title="Observability"
        description="Distributed traces, service dependency map, percentiles, and security monitoring (simulated)"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="P50 Latency" value={formatMs(p50)} />
        <KpiCard title="P95 Latency" value={formatMs(p95)} />
        <KpiCard title="P99 Latency" value={formatMs(p99)} />
        <KpiCard title="Throughput (peak RPS)" value={Math.max(...API_HEALTH.map((a) => a.peakRps))} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Journey (Trace)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {TRACES.map((t) => (
                <button
                  key={t.traceId}
                  type="button"
                  onClick={() => setTraceId(t.traceId)}
                  className={cn(
                    'rounded-md border px-2 py-1 font-mono text-[11px] cursor-pointer',
                    traceId === t.traceId ? 'border-primary bg-accent' : 'border-border hover:bg-muted',
                  )}
                >
                  {t.traceId}
                </button>
              ))}
            </div>
            {trace ? (
              <>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span>
                    Correlation ID:{' '}
                    <span className="font-mono">{trace.correlationId}</span>
                  </span>
                  <span>
                    {trace.partnerName} · {trace.api}
                  </span>
                  <Badge variant={trace.status === 'ok' ? 'success' : 'critical'}>{trace.status}</Badge>
                  <span className="text-muted-foreground">{formatMs(trace.totalDurationMs)} total</span>
                </div>
                <div className="space-y-2">
                  {trace.spans.map((span) => (
                    <div key={span.id} className="text-xs">
                      <div className="mb-1 flex justify-between">
                        <span className="font-medium">
                          {span.name} <span className="text-muted-foreground">({span.service})</span>
                        </span>
                        <span className={span.status === 'error' ? 'text-red-600' : 'text-muted-foreground'}>
                          {formatMs(span.durationMs)}
                        </span>
                      </div>
                      <div className="relative h-2 rounded bg-muted">
                        <div
                          className={cn(
                            'absolute h-2 rounded',
                            span.status === 'error' ? 'bg-red-500' : 'bg-teal-600',
                          )}
                          style={{
                            left: `${(span.startOffsetMs / maxDur) * 100}%`,
                            width: `${Math.max(2, (span.durationMs / maxDur) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Dependency Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {DEPENDENCIES.map((d) => (
                <div
                  key={`${d.from}-${d.to}`}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span className="rounded bg-muted px-2 py-0.5 font-medium">{d.from}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="rounded bg-accent px-2 py-0.5 font-medium text-accent-foreground">{d.to}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Upstream / downstream relationships for digital partnership APIs (demo topology).
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latency Percentiles (24h trend proxy)</CardTitle>
          </CardHeader>
          <CardContent>
            <LatencyTrendChart data={series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SECURITY_METRICS.map((m) => (
              <div key={m.label} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.change >= 0 ? '+' : ''}
                    {m.change}% vs prior day
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold tabular-nums">{m.value}</span>
                  <SeverityPill severity={m.severity} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
