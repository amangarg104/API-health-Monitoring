import { OWNERSHIP } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { SeverityPill, ResolutionBadge } from '@/components/shared/StatusBadges'
import type { OwnershipRecord } from '@/types'

export function InternalOwnership() {
  const columns: Column<OwnershipRecord>[] = [
    { key: 'issue', header: 'Issue', sortable: true, sortValue: (r) => r.issue, render: (r) => <span className="font-medium">{r.issue}</span> },
    { key: 'biz', header: 'Business Owner', render: (r) => r.businessOwner },
    { key: 'tech', header: 'Technical Owner', render: (r) => r.technicalOwner },
    { key: 'l2', header: 'L2 Team', render: (r) => r.l2Team },
    { key: 'l3', header: 'L3 Team', render: (r) => r.l3Team },
    { key: 'vendor', header: 'Vendor', render: (r) => r.vendor },
    { key: 'priority', header: 'Priority', render: (r) => <SeverityPill severity={r.priority} /> },
    { key: 'eta', header: 'Expected Resolution', render: (r) => r.expectedResolution },
    { key: 'status', header: 'Status', render: (r) => <ResolutionBadge status={r.currentStatus} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Ownership Dashboard"
        description="Business, technical, L2/L3, and vendor ownership for every active issue"
      />
      <DataTable data={OWNERSHIP} columns={columns} searchKeys={['issue', 'businessOwner', 'technicalOwner', 'l2Team']} />
    </div>
  )
}
