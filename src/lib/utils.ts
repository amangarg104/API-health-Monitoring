import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ScoreTier, HealthStatus, PartnerHealthScoreBreakdown } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(n))
}

export function formatPercent(n: number, digits = 2): string {
  return `${n.toFixed(digits)}%`
}

export function formatMs(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(2)}s`
  return `${Math.round(n)}ms`
}

export function tierFromScore(score: number): ScoreTier {
  if (score >= 90) return 'Gold'
  if (score >= 80) return 'Silver'
  if (score >= 70) return 'Bronze'
  return 'At Risk'
}

export function statusFromMetrics(
  successRate: number,
  availability: number,
  latencyMs: number,
): HealthStatus {
  if (successRate < 90 || availability < 99 || latencyMs > 3000) return 'critical'
  if (successRate < 97 || availability < 99.5 || latencyMs > 1500) return 'warning'
  return 'healthy'
}

/** Partner health score weights from the plan */
export function calculateHealthScore(input: {
  availability: number
  successRate: number
  avgLatencyMs: number
  criticalIncidents: number
  slaCompliance: number
  integrationQuality: number
}): PartnerHealthScoreBreakdown {
  const availabilityScore = Math.min(100, (input.availability / 100) * 100)
  const successScore = Math.min(100, input.successRate)
  const latencyScore = Math.max(0, Math.min(100, 100 - (input.avgLatencyMs / 50)))
  const criticalScore = Math.max(0, 100 - input.criticalIncidents * 15)
  const slaScore = Math.min(100, input.slaCompliance)
  const qualityScore = Math.min(100, input.integrationQuality)

  const total =
    availabilityScore * 0.3 +
    successScore * 0.25 +
    latencyScore * 0.15 +
    criticalScore * 0.15 +
    slaScore * 0.1 +
    qualityScore * 0.05

  return {
    availability: Math.round(availabilityScore * 10) / 10,
    successRate: Math.round(successScore * 10) / 10,
    latency: Math.round(latencyScore * 10) / 10,
    criticalIncidents: Math.round(criticalScore * 10) / 10,
    slaCompliance: Math.round(slaScore * 10) / 10,
    integrationQuality: Math.round(qualityScore * 10) / 10,
    total: Math.round(total * 10) / 10,
    tier: tierFromScore(total),
  }
}

export function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n')
}

export function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  downloadBlob(filename, toCsv(rows), 'text/csv;charset=utf-8')
}

export function exportExcelStub(filename: string, rows: Record<string, unknown>[]) {
  // Demo: Excel-compatible CSV (UTF-8 BOM)
  downloadBlob(filename.replace(/\.xlsx?$/, '.csv'), '\uFEFF' + toCsv(rows), 'text/csv;charset=utf-8')
}

export function exportPdfStub(title: string, rows: Record<string, unknown>[]) {
  const w = window.open('', '_blank')
  if (!w) return
  const headers = rows.length ? Object.keys(rows[0]) : []
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>body{font-family:system-ui;padding:24px}table{border-collapse:collapse;width:100%;font-size:12px}
    th,td{border:1px solid #ccc;padding:6px;text-align:left}h1{font-size:18px}</style></head><body>
    <h1>${title}</h1><p>Generated ${new Date().toLocaleString()} — print or Save as PDF</p>
    <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${headers.map((h) => `<td>${String(r[h] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
}
