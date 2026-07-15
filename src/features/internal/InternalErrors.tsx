import { useMemo, useState } from 'react'
import { ERRORS, PARTNERS, API_LABELS } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { SeverityPill, ResolutionBadge } from '@/components/shared/StatusBadges'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ExportButtons } from '@/components/shared/ExportButtons'
import type { ErrorCategory, ErrorRecord } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SimpleBarChart } from '@/components/shared/Charts'

const CATEGORIES: ErrorCategory[] = [
  'Infrastructure',
  'Authentication',
  'Validation',
  'Partner Issue',
  'Internal Issue',
  'Timeout',
  'Network',
  'Third Party',
  'Unknown',
]

export function InternalErrors() {
  const [partner, setPartner] = useState('all')
  const [api, setApi] = useState('all')
  const [category, setCategory] = useState('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    return ERRORS.filter((e) => (partner === 'all' ? true : e.partnerId === partner))
      .filter((e) => (api === 'all' ? true : e.affectedApi === api))
      .filter((e) => (category === 'all' ? true : e.category === category))
      .filter((e) =>
        !q
          ? true
          : e.message.toLowerCase().includes(q.toLowerCase()) ||
            String(e.code).includes(q) ||
            e.rootCause.toLowerCase().includes(q.toLowerCase()),
      )
  }, [partner, api, category, q])

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.count))
    return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  }, [filtered])

  const columns: Column<ErrorRecord>[] = [
    { key: 'code', header: 'Code', sortable: true, sortValue: (r) => r.code, render: (r) => <span className="font-mono">{r.code}</span> },
    { key: 'message', header: 'Message', render: (r) => r.message },
    { key: 'occ', header: 'Occurrences', sortable: true, sortValue: (r) => r.count, render: (r) => r.count },
    { key: 'partner', header: 'Partner', render: (r) => r.partnerName },
    { key: 'api', header: 'API', render: (r) => r.affectedApi },
    { key: 'root', header: 'Root Cause', className: 'max-w-[180px]', render: (r) => <span className="text-xs">{r.rootCause}</span> },
    { key: 'cat', header: 'Classification', render: (r) => r.category },
    { key: 'owner', header: 'Owner', render: (r) => r.ownerTeam },
    { key: 'priority', header: 'Priority', render: (r) => <SeverityPill severity={r.priority} /> },
    { key: 'sev', header: 'Severity', render: (r) => <SeverityPill severity={r.severity} /> },
    { key: 'status', header: 'Status', render: (r) => <ResolutionBadge status={r.resolutionStatus} /> },
    { key: 'eta', header: 'Resolution', render: (r) => r.eta },
    { key: 'updated', header: 'Last Updated', render: (r) => new Date(r.lastOccurrence).toLocaleString() },
  ]

  const exportRows = filtered.map((e) => ({
    code: e.code,
    message: e.message,
    occurrences: e.count,
    partner: e.partnerName,
    api: e.affectedApi,
    rootCause: e.rootCause,
    category: e.category,
    owner: e.ownerTeam,
    priority: e.priority,
    severity: e.severity,
    status: e.resolutionStatus,
  }))

  return (
    <div>
      <PageHeader
        title="Error Intelligence"
        description="Centralized error repository with automatic classification"
        actions={<ExportButtons filename="error-intelligence" rows={exportRows} title="Error Intelligence" />}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="w-44" value={partner} onChange={(e) => setPartner(e.target.value)}>
          <option value="all">All partners</option>
          {PARTNERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select className="w-40" value={api} onChange={(e) => setApi(e.target.value)}>
          <option value="all">All APIs</option>
          {API_LABELS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
        <Select className="w-44" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Classification Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart data={byCategory} dataKey="count" nameKey="name" color="#d97706" />
        </CardContent>
      </Card>
      <DataTable data={filtered} columns={columns} pageSize={10} />
    </div>
  )
}
