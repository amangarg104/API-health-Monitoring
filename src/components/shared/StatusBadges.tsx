import { Badge } from '@/components/ui/badge'
import type { HealthStatus, ScoreTier, Severity, AlertStatus, ResolutionStatus } from '@/types'
import { cn } from '@/lib/utils'

export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  const map = {
    healthy: { label: 'Healthy', variant: 'success' as const, dot: 'bg-emerald-500' },
    warning: { label: 'Warning', variant: 'warning' as const, dot: 'bg-amber-500' },
    critical: { label: 'Critical', variant: 'critical' as const, dot: 'bg-red-500' },
  }
  const m = map[status]
  return (
    <Badge variant={m.variant} className="gap-1.5">
      <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
      {m.label}
    </Badge>
  )
}

export function HealthDot({ status, className }: { status: HealthStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-3 w-3 rounded-sm',
        status === 'healthy' && 'bg-emerald-500',
        status === 'warning' && 'bg-amber-500',
        status === 'critical' && 'bg-red-500',
        className,
      )}
      title={status}
    />
  )
}

export function PartnerScoreBadge({ tier, score }: { tier: ScoreTier; score?: number }) {
  const variant =
    tier === 'Gold' ? 'gold' : tier === 'Silver' ? 'silver' : tier === 'Bronze' ? 'bronze' : 'critical'
  return (
    <Badge variant={variant}>
      {tier}
      {typeof score === 'number' ? ` · ${score}` : ''}
    </Badge>
  )
}

export function SeverityPill({ severity }: { severity: Severity }) {
  const variant =
    severity === 'critical'
      ? 'critical'
      : severity === 'high'
        ? 'warning'
        : severity === 'medium'
          ? 'secondary'
          : 'outline'
  return <Badge variant={variant} className="capitalize">{severity}</Badge>
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  const variant = status === 'open' ? 'critical' : status === 'acknowledged' ? 'warning' : 'success'
  return <Badge variant={variant} className="capitalize">{status.replace('_', ' ')}</Badge>
}

export function ResolutionBadge({ status }: { status: ResolutionStatus }) {
  const variant =
    status === 'resolved' ? 'success' : status === 'in_progress' ? 'warning' : status === 'monitoring' ? 'secondary' : 'critical'
  return <Badge variant={variant} className="capitalize">{status.replace('_', ' ')}</Badge>
}
