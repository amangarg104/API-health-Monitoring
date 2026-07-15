import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PARTNERS, API_LABELS, getMatrixCell, getApiHealth } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { HealthDot, HealthStatusBadge } from '@/components/shared/StatusBadges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMs, formatPercent, formatNumber } from '@/lib/utils'
import type { ApiName, HealthStatus } from '@/types'
import { Button } from '@/components/ui/button'

export function InternalHealthMatrix() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const focusPartner = params.get('partner')
  const [selected, setSelected] = useState<{ partnerId: string; api: ApiName } | null>(
    focusPartner ? { partnerId: focusPartner, api: 'Quote' } : null,
  )

  const detail = useMemo(() => {
    if (!selected) return null
    return getApiHealth(selected.partnerId, selected.api)
  }, [selected])

  const partnerName = PARTNERS.find((p) => p.id === selected?.partnerId)?.name

  return (
    <div>
      <PageHeader
        title="Multi-Partner API Health Matrix"
        description="Rows are partners; columns are APIs. Click a cell for detailed analytics."
      />
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="p-3 text-left text-xs font-semibold text-muted-foreground">Partner</th>
              {API_LABELS.map((api) => (
                <th key={api} className="p-3 text-center text-xs font-semibold text-muted-foreground">
                  {api}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PARTNERS.map((p) => (
              <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                <td className="p-3 font-medium whitespace-nowrap">
                  {p.name}
                  <span className="ml-2 font-mono text-[10px] text-muted-foreground">{p.code}</span>
                </td>
                {API_LABELS.map((api) => {
                  const status = getMatrixCell(p.id, api) as HealthStatus
                  const active = selected?.partnerId === p.id && selected.api === api
                  return (
                    <td key={api} className="p-3 text-center">
                      <button
                        type="button"
                        className={`inline-flex cursor-pointer rounded p-1 ${active ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelected({ partnerId: p.id, api })}
                        title={`${p.name} · ${api} · ${status}`}
                      >
                        <HealthDot status={status} className="h-5 w-5 rounded" />
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <HealthDot status="healthy" /> Healthy
        </span>
        <span className="inline-flex items-center gap-1.5">
          <HealthDot status="warning" /> Warning
        </span>
        <span className="inline-flex items-center gap-1.5">
          <HealthDot status="critical" /> Critical
        </span>
      </div>
      {detail && selected ? (
        <Card className="mt-6">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>
                {partnerName} — {selected.api} API
              </CardTitle>
              <div className="mt-2">
                <HealthStatusBadge status={detail.status} />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(`/internal/api-monitoring?api=${encodeURIComponent(selected.api)}&partner=${selected.partnerId}`)
              }
            >
              Open API Monitoring
            </Button>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Requests</dt>
                <dd className="font-semibold tabular-nums">{formatNumber(detail.requestsToday)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Success %</dt>
                <dd className="font-semibold tabular-nums">{formatPercent(detail.successRate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Error %</dt>
                <dd className="font-semibold tabular-nums">{formatPercent(detail.errorRate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Avg / P95 / P99</dt>
                <dd className="font-semibold tabular-nums">
                  {formatMs(detail.avgResponseMs)} / {formatMs(detail.p95)} / {formatMs(detail.p99)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Availability</dt>
                <dd className="font-semibold tabular-nums">{formatPercent(detail.availability, 3)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Version</dt>
                <dd className="font-mono text-xs">{detail.version}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
