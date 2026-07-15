import { getPartnerPerformance, getInternalKpis, ERRORS, getAlerts } from '@/data/mock'
import { PageHeader } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExportButtons } from '@/components/shared/ExportButtons'
import { toast } from 'sonner'
import { Mail } from 'lucide-react'

const PERIODS = [
  { id: 'daily', label: 'Daily Report', desc: 'Last 24 hours operational summary' },
  { id: 'weekly', label: 'Weekly Report', desc: 'Partner scorecard and incident digest' },
  { id: 'monthly', label: 'Monthly Report', desc: 'SLA compliance and volume trends' },
  { id: 'quarterly', label: 'Quarterly Report', desc: 'Executive digital health review' },
] as const

export function InternalReports() {
  const kpi = getInternalKpis()
  const perf = getPartnerPerformance()
  const rows = perf.map((p) => ({
    partner: p.partner.name,
    code: p.partner.code,
    healthScore: p.healthScore,
    tier: p.tier,
    availability: p.availability,
    successQuote: p.quotePct,
    todaysErrors: p.todaysErrors,
    status: p.status,
  }))

  const summaryRows = [
    {
      metric: 'Total API Calls',
      value: kpi.totalApiCalls,
      successRate: kpi.overallSuccessRate,
      availability: kpi.overallAvailability,
      criticalAlerts: kpi.totalCriticalAlerts,
      slaBreaches: kpi.slaBreaches,
      openErrors: ERRORS.filter((e) => e.resolutionStatus === 'open').length,
      openAlerts: getAlerts().filter((a) => a.status === 'open').length,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate daily, weekly, monthly, and quarterly operational reports"
        actions={
          <>
            <ExportButtons filename="ops-report" rows={rows} title="Operations Report" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Report emailed to ops-distribution@icicilombard.com (demo)')}
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </Button>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {PERIODS.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.label}</CardTitle>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <ExportButtons
                filename={`${p.id}-report`}
                rows={p.id === 'daily' ? summaryRows : rows}
                title={p.label}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.success(`${p.label} queued for email delivery (demo)`)}
              >
                <Mail className="h-3.5 w-3.5" /> Email {p.label}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
