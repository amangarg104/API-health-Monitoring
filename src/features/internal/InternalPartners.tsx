import { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getPartnerPerformance } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { HealthStatusBadge, PartnerScoreBadge } from '@/components/shared/StatusBadges'
import { ExportButtons } from '@/components/shared/ExportButtons'
import { Select } from '@/components/ui/select'
import { formatMs, formatPercent } from '@/lib/utils'
import type { PartnerPerformance, Environment } from '@/types'

export function InternalPartners() {
  const [params] = useSearchParams()
  const highlight = params.get('partner')
  const [env, setEnv] = useState<string>('all')
  const data = useMemo(() => {
    let rows = getPartnerPerformance().map((r) => ({
      ...r,
      id: r.partner.id,
      name: r.partner.name,
      code: r.partner.code,
    }))
    if (env !== 'all') rows = rows.filter((r) => r.partner.environment === env)
    if (highlight) rows = [...rows].sort((a, b) => (a.partner.id === highlight ? -1 : b.partner.id === highlight ? 1 : 0))
    return rows
  }, [env, highlight])

  const columns: Column<PartnerPerformance>[] = [
    {
      key: 'name',
      header: 'Partner',
      sortable: true,
      sortValue: (r) => r.partner.name,
      render: (r) => (
        <Link to={`/internal/health-matrix?partner=${r.partner.id}`} className="font-medium text-primary hover:underline">
          {r.partner.name}
        </Link>
      ),
    },
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.partner.code}</span> },
    { key: 'env', header: 'Environment', render: (r) => r.partner.environment },
    { key: 'quote', header: 'Quote %', sortable: true, sortValue: (r) => r.quotePct, render: (r) => formatPercent(r.quotePct) },
    { key: 'proposal', header: 'Proposal %', sortable: true, sortValue: (r) => r.proposalPct, render: (r) => formatPercent(r.proposalPct) },
    { key: 'status', header: 'Status %', sortable: true, sortValue: (r) => r.statusPct, render: (r) => formatPercent(r.statusPct) },
    { key: 'payment', header: 'Payment Sync %', sortable: true, sortValue: (r) => r.paymentPct, render: (r) => formatPercent(r.paymentPct) },
    { key: 'coi', header: 'COI %', sortable: true, sortValue: (r) => r.coiPct, render: (r) => formatPercent(r.coiPct) },
    { key: 'latency', header: 'Avg RT', sortable: true, sortValue: (r) => r.avgResponseMs, render: (r) => formatMs(r.avgResponseMs) },
    { key: 'avail', header: 'Availability', sortable: true, sortValue: (r) => r.availability, render: (r) => formatPercent(r.availability, 3) },
    { key: 'errors', header: "Today's Errors", sortable: true, sortValue: (r) => r.todaysErrors, render: (r) => r.todaysErrors },
    { key: 'crit', header: 'Critical Errors', sortable: true, sortValue: (r) => r.criticalErrors, render: (r) => r.criticalErrors },
    {
      key: 'activity',
      header: 'Last Activity',
      render: (r) => new Date(r.partner.lastActivity).toLocaleString(),
    },
    {
      key: 'score',
      header: 'Health Score',
      sortable: true,
      sortValue: (r) => r.healthScore,
      render: (r) => <PartnerScoreBadge tier={r.tier} score={r.healthScore} />,
    },
    { key: 'health', header: 'Status', render: (r) => <HealthStatusBadge status={r.status} /> },
  ]

  const exportRows = data.map((r) => ({
    partner: r.partner.name,
    code: r.partner.code,
    environment: r.partner.environment,
    quotePct: r.quotePct,
    proposalPct: r.proposalPct,
    statusPct: r.statusPct,
    paymentPct: r.paymentPct,
    coiPct: r.coiPct,
    avgResponseMs: r.avgResponseMs,
    availability: r.availability,
    todaysErrors: r.todaysErrors,
    criticalErrors: r.criticalErrors,
    healthScore: r.healthScore,
    tier: r.tier,
    status: r.status,
  }))

  return (
    <div>
      <PageHeader
        title="Partner Performance"
        description="Sortable, filterable cross-partner API success and health scorecard"
        actions={
          <>
            <Select className="w-40" value={env} onChange={(e) => setEnv(e.target.value)}>
              <option value="all">All environments</option>
              {(['Production', 'Sandbox'] as Environment[]).map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Select>
            <ExportButtons filename="partner-performance" rows={exportRows} title="Partner Performance" />
          </>
        }
      />
      <DataTable
        data={data}
        columns={columns}
        searchKeys={['name', 'code']}
        searchPlaceholder="Search partners…"
        pageSize={12}
      />
    </div>
  )
}
