import { useMemo, useState } from 'react'
import { useAuth } from '@/app/AuthContext'
import { ERRORS } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ExportButtons } from '@/components/shared/ExportButtons'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { SeverityPill, ResolutionBadge } from '@/components/shared/StatusBadges'
import type { ErrorRecord, Severity } from '@/types'
import { API_LABELS } from '@/data/mock'

export function PartnerErrorReports() {
  const { partnerId } = useAuth()
  const [severity, setSeverity] = useState<string>('all')
  const [api, setApi] = useState<string>('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    return ERRORS.filter((e) => e.partnerId === partnerId)
      .filter((e) => (severity === 'all' ? true : e.severity === severity))
      .filter((e) => (api === 'all' ? true : e.affectedApi === api))
      .filter((e) =>
        !q
          ? true
          : e.message.toLowerCase().includes(q.toLowerCase()) ||
            String(e.code).includes(q) ||
            e.ownerTeam.toLowerCase().includes(q.toLowerCase()),
      )
  }, [partnerId, severity, api, q])

  const columns: Column<ErrorRecord>[] = [
    { key: 'code', header: 'Code', sortable: true, sortValue: (r) => r.code, render: (r) => <span className="font-mono">{r.code}</span> },
    { key: 'message', header: 'Message', sortable: true, sortValue: (r) => r.message, render: (r) => r.message },
    { key: 'api', header: 'API', render: (r) => r.affectedApi },
    { key: 'count', header: 'Count', sortable: true, sortValue: (r) => r.count, render: (r) => r.count },
    { key: 'severity', header: 'Severity', render: (r) => <SeverityPill severity={r.severity} /> },
    { key: 'category', header: 'Category', render: (r) => r.category },
    { key: 'status', header: 'Status', render: (r) => <ResolutionBadge status={r.resolutionStatus} /> },
    { key: 'last', header: 'Last Seen', render: (r) => new Date(r.lastOccurrence).toLocaleString() },
  ]

  const exportRows = filtered.map((e) => ({
    code: e.code,
    message: e.message,
    api: e.affectedApi,
    count: e.count,
    severity: e.severity,
    category: e.category,
    status: e.resolutionStatus,
    lastOccurrence: e.lastOccurrence,
    owner: e.ownerTeam,
  }))

  return (
    <div>
      <PageHeader
        title="Error Reports"
        description="Search, filter, and export partner error reports"
        actions={<ExportButtons filename="partner-error-report" rows={exportRows} title="Partner Error Report" />}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Search code, message, team…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="w-40" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="all">All severities</option>
          {(['low', 'medium', 'high', 'critical'] as Severity[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select className="w-44" value={api} onChange={(e) => setApi(e.target.value)}>
          <option value="all">All APIs</option>
          {API_LABELS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>
      <DataTable data={filtered} columns={columns} pageSize={12} />
    </div>
  )
}
