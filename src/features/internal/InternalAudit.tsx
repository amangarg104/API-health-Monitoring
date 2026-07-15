import { AUDIT_LOGS } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import type { AuditLog } from '@/types'

export function InternalAudit() {
  const columns: Column<AuditLog>[] = [
    {
      key: 'time',
      header: 'Timestamp',
      sortable: true,
      sortValue: (r) => r.timestamp,
      render: (r) => new Date(r.timestamp).toLocaleString(),
    },
    { key: 'category', header: 'Category', render: (r) => <Badge variant="secondary">{r.category}</Badge> },
    { key: 'action', header: 'Action', render: (r) => r.action },
    { key: 'actor', header: 'Actor', render: (r) => <span className="font-mono text-xs">{r.actor}</span> },
    { key: 'details', header: 'Details', render: (r) => <span className="text-xs text-muted-foreground">{r.details}</span> },
  ]

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Configuration changes, user actions, alert acknowledgements, escalations, and API version changes"
      />
      <DataTable
        data={AUDIT_LOGS}
        columns={columns}
        searchKeys={['action', 'actor', 'details', 'category']}
        searchPlaceholder="Search audit trail…"
      />
    </div>
  )
}
