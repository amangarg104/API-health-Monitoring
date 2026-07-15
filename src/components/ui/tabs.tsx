import { cn } from '@/lib/utils'

export function Tabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
  className?: string
}) {
  return (
    <div className={cn('inline-flex h-9 items-center rounded-lg border border-border bg-muted p-1', className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            'inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer',
            value === t.id
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
