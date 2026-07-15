import { useState } from 'react'
import { TRIGGERS } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { SeverityPill } from '@/components/shared/StatusBadges'
import { Switch } from '@/components/ui/switch'
import type { TriggerRule } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function InternalTriggers() {
  const [rules, setRules] = useState(TRIGGERS)

  const columns: Column<TriggerRule>[] = [
    { key: 'name', header: 'Trigger', sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'condition', header: 'Condition', render: (r) => r.condition },
    { key: 'threshold', header: 'Threshold', render: (r) => <span className="font-mono text-xs">{r.threshold}</span> },
    { key: 'severity', header: 'Severity', render: (r) => <SeverityPill severity={r.severity} /> },
    { key: 'owner', header: 'Owner', render: (r) => r.owner },
    { key: 'email', header: 'Email', render: (r) => <span className="text-xs">{r.email}</span> },
    { key: 'slack', header: 'Slack', render: (r) => r.slack },
    { key: 'teams', header: 'Teams', render: (r) => r.teams },
    { key: 'sms', header: 'SMS', render: (r) => r.sms || '—' },
    { key: 'esc', header: 'Escalation', render: (r) => <span className="text-xs">{r.escalation}</span> },
    {
      key: 'enabled',
      header: 'Enabled',
      render: (r) => (
        <Switch
          checked={r.enabled}
          onCheckedChange={(v) => {
            setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, enabled: v } : x)))
            toast.success(`${r.name} ${v ? 'enabled' : 'disabled'}`)
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Trigger Management"
        description="Automated threshold alerts with multi-channel routing and escalation"
      />
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase text-muted-foreground">Active Rules</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{rules.filter((r) => r.enabled).length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase text-muted-foreground">Critical Routes</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {rules.filter((r) => r.severity === 'critical' && r.enabled).length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase text-muted-foreground">Channels</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Email · Slack · Teams · SMS</CardContent>
        </Card>
      </div>
      <DataTable data={rules} columns={columns} searchKeys={['name', 'condition', 'owner']} searchPlaceholder="Search triggers…" />
    </div>
  )
}
