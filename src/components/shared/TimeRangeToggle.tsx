import { Tabs } from '@/components/ui/tabs'
import type { TimeRange } from '@/types'

const RANGES: { id: TimeRange; label: string }[] = [
  { id: '24h', label: '24 Hours' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
]

export function TimeRangeToggle({
  value,
  onChange,
}: {
  value: TimeRange
  onChange: (v: TimeRange) => void
}) {
  return <Tabs tabs={RANGES} value={value} onChange={(id) => onChange(id as TimeRange)} />
}
