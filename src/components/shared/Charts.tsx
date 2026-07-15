import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { TimeSeriesPoint } from '@/types'

const tooltipStyle = {
  backgroundColor: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  fontSize: 12,
}

export function SuccessTrendChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
        <YAxis domain={[85, 100]} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="successRate" name="Success %" stroke="#0d9488" fill="url(#successGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function LatencyTrendChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="latencyMs" name="Latency (ms)" stroke="#d97706" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function TrafficChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="traffic" name="Requests" fill="#0f766e" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DualTrendChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
        <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="successRate" name="Success %" stroke="#059669" strokeWidth={2} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="errorRate" name="Error %" stroke="#dc2626" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function SimpleBarChart({
  data,
  dataKey,
  nameKey,
  color = '#0f766e',
  height = 240,
}: {
  data: Record<string, string | number>[]
  dataKey: string
  nameKey: string
  color?: string
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
        <YAxis type="category" dataKey={nameKey} width={120} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey} fill={color} radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
