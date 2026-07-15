import { useState, useEffect } from 'react'
import { useAuth } from '@/app/AuthContext'
import { getAlerts, acknowledgeAlert } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { SeverityPill, AlertStatusBadge } from '@/components/shared/StatusBadges'
import { Button } from '@/components/ui/button'
import type { Alert } from '@/types'
import { toast } from 'sonner'
import { downloadBlob } from '@/lib/utils'

export function PartnerAlerts() {
  const { partnerId } = useAuth()
  const [alerts, setAlerts] = useState(() => getAlerts().filter((a) => a.partnerId === partnerId))

  useEffect(() => {
    setAlerts(getAlerts().filter((a) => a.partnerId === partnerId))
  }, [partnerId])

  function refresh() {
    setAlerts(getAlerts().filter((a) => a.partnerId === partnerId))
  }

  const columns: Column<Alert>[] = [
    { key: 'type', header: 'Alert', sortable: true, sortValue: (r) => r.type, render: (r) => <span className="font-medium">{r.type}</span> },
    { key: 'message', header: 'Message', render: (r) => <span className="text-xs">{r.message}</span> },
    { key: 'api', header: 'API', render: (r) => r.api ?? '—' },
    { key: 'severity', header: 'Severity', render: (r) => <SeverityPill severity={r.severity} /> },
    { key: 'status', header: 'Status', render: (r) => <AlertStatusBadge status={r.status} /> },
    {
      key: 'created',
      header: 'Created',
      sortable: true,
      sortValue: (r) => r.createdAt,
      render: (r) => new Date(r.createdAt).toLocaleString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <Button
            size="sm"
            variant="outline"
            disabled={r.status !== 'open'}
            onClick={() => {
              acknowledgeAlert(r.id)
              refresh()
              toast.success('Alert acknowledged')
            }}
          >
            Acknowledge
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              downloadBlob(
                `alert-${r.id}-logs.txt`,
                `Alert ${r.id}\nType: ${r.type}\n${r.message}\nCreated: ${r.createdAt}\n---\n[simulated gateway logs]\n`,
                'text/plain',
              )
              toast.success('Logs downloaded')
            }}
          >
            Logs
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toast.success('Support ticket raised (demo)')}
          >
            Ticket
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Alerts"
        description="Live alerts: error rate, downtime, auth, latency, traffic, payment sync, COI"
      />
      <DataTable data={alerts} columns={columns} searchKeys={['type', 'message']} searchPlaceholder="Search alerts…" />
    </div>
  )
}
