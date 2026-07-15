import { cn, formatNumber, formatPercent, formatMs } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  tone = 'default',
}: {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: number
  tone?: 'default' | 'success' | 'warning' | 'critical'
}) {
  const toneClass =
    tone === 'success'
      ? 'border-l-emerald-500'
      : tone === 'warning'
        ? 'border-l-amber-500'
        : tone === 'critical'
          ? 'border-l-red-500'
          : 'border-l-primary'

  return (
    <div className={cn('rounded-lg border border-border bg-card p-4 shadow-sm border-l-4', toneClass)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        {subtitle ? <span>{subtitle}</span> : null}
        {typeof trend === 'number' ? (
          <span className={cn('inline-flex items-center gap-0.5', trend >= 0 ? 'text-emerald-600' : 'text-red-600')}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function formatKpiValue(kind: 'number' | 'percent' | 'ms', value: number) {
  if (kind === 'percent') return formatPercent(value)
  if (kind === 'ms') return formatMs(value)
  return formatNumber(value)
}
