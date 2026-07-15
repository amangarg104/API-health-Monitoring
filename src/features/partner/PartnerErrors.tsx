import { useMemo } from 'react'
import { useAuth } from '@/app/AuthContext'
import { ERRORS } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SimpleBarChart } from '@/components/shared/Charts'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { SeverityPill, ResolutionBadge } from '@/components/shared/StatusBadges'
import type { ErrorRecord } from '@/types'

export function PartnerErrors() {
  const { partnerId } = useAuth()
  const errors = useMemo(() => ERRORS.filter((e) => e.partnerId === partnerId), [partnerId])

  const byCode = useMemo(() => {
    const map = new Map<number, number>()
    errors.forEach((e) => map.set(e.code, (map.get(e.code) ?? 0) + e.count))
    return [...map.entries()]
      .map(([code, count]) => ({ code: String(code), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 11)
  }, [errors])

  const byMessage = useMemo(() => {
    const map = new Map<string, number>()
    errors.forEach((e) => map.set(e.message, (map.get(e.message) ?? 0) + e.count))
    return [...map.entries()]
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [errors])

  const columns: Column<ErrorRecord>[] = [
    { key: 'code', header: 'Code', sortable: true, sortValue: (r) => r.code, render: (r) => <span className="font-mono">{r.code}</span> },
    { key: 'message', header: 'Message', sortable: true, sortValue: (r) => r.message, render: (r) => r.message },
    { key: 'count', header: 'Count', sortable: true, sortValue: (r) => r.count, render: (r) => r.count },
    { key: 'frequency', header: 'Frequency', render: (r) => r.frequency },
    { key: 'severity', header: 'Severity', render: (r) => <SeverityPill severity={r.severity} /> },
    { key: 'last', header: 'Last Occurrence', render: (r) => new Date(r.lastOccurrence).toLocaleString() },
    { key: 'api', header: 'API', render: (r) => r.affectedApi },
    { key: 'impact', header: 'Impact', render: (r) => r.impactLevel },
    { key: 'action', header: 'Recommended Action', className: 'max-w-[200px]', render: (r) => <span className="text-xs">{r.recommendedAction}</span> },
    { key: 'owner', header: 'Owner Team', render: (r) => r.ownerTeam },
    { key: 'status', header: 'Status', render: (r) => <ResolutionBadge status={r.resolutionStatus} /> },
    { key: 'eta', header: 'ETA', render: (r) => r.eta },
  ]

  return (
    <div>
      <PageHeader title="Error Analytics" description="Top error codes, messages, and actionable detail" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Error Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={byCode} dataKey="count" nameKey="code" color="#dc2626" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Error Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={byMessage} dataKey="count" nameKey="message" color="#d97706" height={280} />
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <DataTable data={errors} columns={columns} searchKeys={['message', 'affectedApi', 'ownerTeam']} searchPlaceholder="Search errors…" pageSize={8} />
      </div>
    </div>
  )
}
