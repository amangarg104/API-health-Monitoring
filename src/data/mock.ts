import type {
  Partner,
  ApiName,
  ApiHealth,
  TimeSeriesPoint,
  ErrorRecord,
  ActionItem,
  Alert,
  NotificationItem,
  PartnerPerformance,
  SlaMetric,
  TriggerRule,
  OwnershipRecord,
  RootCauseStat,
  AuditLog,
  Trace,
  SecurityMetric,
  KpiSnapshot,
  InternalKpis,
  TimeRange,
} from '@/types'
import { calculateHealthScore, statusFromMetrics } from '@/lib/utils'

const APIS: ApiName[] = ['Quote', 'Proposal', 'Payment Sync', 'Status', 'COI']

export const PARTNERS: Partner[] = [
  { id: 'p1', name: 'PolicyBazaar', code: 'PBZ', environment: 'Production', contactEmail: 'ops@policybazaar.com', lastActivity: '2026-07-15T08:12:00+05:30' },
  { id: 'p2', name: 'PhonePe Insurance', code: 'PPE', environment: 'Production', contactEmail: 'insurance@phonepe.com', lastActivity: '2026-07-15T08:40:00+05:30' },
  { id: 'p3', name: 'Paytm Insurance', code: 'PTM', environment: 'Production', contactEmail: 'insure@paytm.com', lastActivity: '2026-07-15T07:55:00+05:30' },
  { id: 'p4', name: 'Turtlemint', code: 'TRT', environment: 'Production', contactEmail: 'tech@turtlemint.com', lastActivity: '2026-07-15T08:22:00+05:30' },
  { id: 'p5', name: 'InsuranceDekho', code: 'IDK', environment: 'Production', contactEmail: 'api@insurancedekho.com', lastActivity: '2026-07-15T06:10:00+05:30' },
  { id: 'p6', name: 'Acko Aggregator', code: 'ACK', environment: 'Sandbox', contactEmail: 'partners@acko.com', lastActivity: '2026-07-14T22:01:00+05:30' },
  { id: 'p7', name: 'BankBazaar', code: 'BBZ', environment: 'Production', contactEmail: 'digital@bankbazaar.com', lastActivity: '2026-07-15T08:05:00+05:30' },
  { id: 'p8', name: 'Coverfox', code: 'CVX', environment: 'Production', contactEmail: 'integrations@coverfox.com', lastActivity: '2026-07-15T05:44:00+05:30' },
  { id: 'p9', name: 'Digit Partner Hub', code: 'DGT', environment: 'Sandbox', contactEmail: 'hub@godigit.com', lastActivity: '2026-07-13T18:20:00+05:30' },
  { id: 'p10', name: 'HDFC Securities Ins', code: 'HSI', environment: 'Production', contactEmail: 'api@hdfcsec.com', lastActivity: '2026-07-15T08:33:00+05:30' },
]

/** Deterministic pseudo-random from string seed */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seeded(seed: string, min: number, max: number): number {
  const h = hash(seed)
  const r = (h % 10000) / 10000
  return min + r * (max - min)
}

const VERSION_MAP: Record<ApiName, string> = {
  Quote: 'v3.2.1',
  Proposal: 'v2.8.0',
  'Payment Sync': 'v1.9.4',
  Status: 'v2.1.0',
  COI: 'v1.5.2',
}

const RELEASE_MAP: Record<ApiName, string> = {
  Quote: '2026-05-12',
  Proposal: '2026-04-28',
  'Payment Sync': '2026-06-01',
  Status: '2026-03-15',
  COI: '2026-05-30',
}

function buildApiHealth(partnerId: string, api: ApiName): ApiHealth {
  const base = seeded(`${partnerId}-${api}`, 0, 1)
  const successRate = 88 + base * 11.5
  const avgResponseMs = 180 + (1 - base) * 2800
  const availability = 98.2 + base * 1.75
  const requestsToday = Math.floor(seeded(`${partnerId}-${api}-req`, 800, 45000))
  const failedCalls = Math.floor(requestsToday * (1 - successRate / 100))
  const status = statusFromMetrics(successRate, availability, avgResponseMs)

  return {
    api,
    partnerId,
    status,
    requestsToday,
    successRate: Math.round(successRate * 100) / 100,
    failedCalls,
    avgResponseMs: Math.round(avgResponseMs),
    maxResponseMs: Math.round(avgResponseMs * (1.8 + base)),
    p50: Math.round(avgResponseMs * 0.7),
    p95: Math.round(avgResponseMs * 1.6),
    p99: Math.round(avgResponseMs * 2.2),
    availability: Math.round(availability * 1000) / 1000,
    version: VERSION_MAP[api],
    releaseDate: RELEASE_MAP[api],
    lastDowntime: status === 'healthy' ? null : '2026-07-14T23:10:00+05:30',
    peakRps: Math.round(seeded(`${partnerId}-${api}-rps`, 12, 220)),
    errorRate: Math.round((100 - successRate) * 100) / 100,
  }
}

export const API_HEALTH: ApiHealth[] = PARTNERS.flatMap((p) =>
  APIS.map((api) => buildApiHealth(p.id, api)),
)

export function getPartnerApis(partnerId: string): ApiHealth[] {
  return API_HEALTH.filter((a) => a.partnerId === partnerId)
}

export function getApiHealth(partnerId: string, api: ApiName): ApiHealth | undefined {
  return API_HEALTH.find((a) => a.partnerId === partnerId && a.api === api)
}

export function buildTimeSeries(
  partnerId: string | 'all',
  api: ApiName | 'all',
  range: TimeRange,
): TimeSeriesPoint[] {
  const points = range === '24h' ? 24 : range === '7d' ? 7 : 30
  const unit = range === '24h' ? 'h' : 'd'
  const now = new Date('2026-07-15T09:00:00+05:30')

  return Array.from({ length: points }, (_, i) => {
    const t = new Date(now)
    if (unit === 'h') t.setHours(t.getHours() - (points - 1 - i))
    else t.setDate(t.getDate() - (points - 1 - i))
    const seed = `${partnerId}-${api}-${range}-${i}`
    const successRate = 90 + seeded(seed, 0, 9.5)
    const latencyMs = 200 + seeded(seed + 'l', 0, 1800)
    return {
      timestamp: t.toISOString(),
      label: unit === 'h' ? `${t.getHours().toString().padStart(2, '0')}:00` : `${t.getDate()}/${t.getMonth() + 1}`,
      successRate: Math.round(successRate * 10) / 10,
      errorRate: Math.round((100 - successRate) * 10) / 10,
      latencyMs: Math.round(latencyMs),
      traffic: Math.floor(seeded(seed + 't', 200, 8000)),
      availability: Math.round((99 + seeded(seed + 'a', 0, 0.95)) * 1000) / 1000,
    }
  })
}

const ERROR_MESSAGES = [
  { code: 400, message: 'Proposal Validation Failed', category: 'Validation' as const },
  { code: 400, message: 'Invalid Sum Insured', category: 'Validation' as const },
  { code: 401, message: 'Authentication Failed', category: 'Authentication' as const },
  { code: 403, message: 'Partner Timeout', category: 'Partner Issue' as const },
  { code: 404, message: 'Policy Not Found', category: 'Validation' as const },
  { code: 408, message: 'Gateway Timeout', category: 'Timeout' as const },
  { code: 422, message: 'KYC Pending', category: 'Partner Issue' as const },
  { code: 429, message: 'Rate Limit Exceeded', category: 'Partner Issue' as const },
  { code: 500, message: 'Database Timeout', category: 'Infrastructure' as const },
  { code: 502, message: 'Payment Sync Failed', category: 'Third Party' as const },
  { code: 503, message: 'Duplicate Proposal', category: 'Internal Issue' as const },
  { code: 504, message: 'Upstream Network Error', category: 'Network' as const },
]

export const ERRORS: ErrorRecord[] = PARTNERS.flatMap((p, pi) =>
  ERROR_MESSAGES.map((e, ei) => {
    const count = Math.floor(seeded(`${p.id}-err-${ei}`, 2, 420))
    const sev =
      e.code >= 500 ? 'critical' : e.code === 401 || e.code === 429 ? 'high' : e.code >= 400 ? 'medium' : 'low'
    return {
      id: `err-${p.id}-${ei}`,
      code: e.code,
      message: e.message,
      count,
      frequency: `${(count / 24).toFixed(1)}/hr`,
      severity: sev as ErrorRecord['severity'],
      lastOccurrence: `2026-07-15T0${(ei % 9)}:${(pi * 7) % 60}:00+05:30`,
      affectedApi: APIS[ei % APIS.length],
      partnerId: p.id,
      partnerName: p.name,
      impactLevel: sev === 'critical' ? 'High' : sev === 'high' ? 'Medium' : 'Low',
      recommendedAction:
        e.category === 'Authentication'
          ? 'Rotate API key and verify OAuth scopes'
          : e.category === 'Validation'
            ? 'Review field mapping against latest schema'
            : e.category === 'Timeout'
              ? 'Increase client timeout and check gateway capacity'
              : 'Escalate to owning squad with correlation ID',
      ownerTeam:
        e.category === 'Authentication'
          ? 'IAM / Security'
          : APIS[ei % APIS.length] === 'Payment Sync'
            ? 'Finance Integrations'
            : 'Digital API Ops',
      resolutionStatus: (['open', 'in_progress', 'resolved', 'monitoring'] as const)[ei % 4],
      eta: ei % 3 === 0 ? '2h' : ei % 3 === 1 ? '1d' : '4h',
      category: e.category,
      rootCause:
        e.category === 'Infrastructure'
          ? 'DB connection pool exhaustion'
          : e.category === 'Validation'
            ? 'Schema drift on partner payload'
            : e.category === 'Timeout'
              ? 'Downstream latency spike'
              : 'Misconfigured partner credentials',
      priority: sev as ErrorRecord['priority'],
    }
  }),
)

export const ACTION_ITEMS: ActionItem[] = [
  {
    id: 'act-1',
    issue: 'Proposal Validation Failed — missing nominee DOB',
    recommendedFix: 'Include nominee.dob in ISO-8601 format in proposal payload',
    docsLink: 'https://docs.icicilombard.example/apis/proposal#nominee',
    validationGuide: 'Field Validation Guide §4.2 Nominee Details',
    sampleRequest: `{\n  "productCode": "MOTOR_COMP",\n  "nominee": { "name": "Asha", "dob": "1990-04-12", "relation": "Spouse" }\n}`,
    sampleResponse: `{\n  "proposalId": "PRP-99821",\n  "status": "ACCEPTED"\n}`,
    ownerTeam: 'Partner Integration',
    supportContact: 'partner-support@icicilombard.com',
    expectedResolution: 'Within 4 business hours after fix deploy',
    api: 'Proposal',
    severity: 'high',
  },
  {
    id: 'act-2',
    issue: 'Payment Sync Delay > 15 minutes',
    recommendedFix: 'Retry sync with idempotency key; verify webhook endpoint SSL',
    docsLink: 'https://docs.icicilombard.example/apis/payment-sync',
    validationGuide: 'Payment Sync Runbook §2 Retry Policy',
    sampleRequest: `{\n  "transactionId": "TXN-44102",\n  "idempotencyKey": "pbz-44102-v1"\n}`,
    sampleResponse: `{\n  "syncStatus": "COMPLETED",\n  "policyNumber": "3001/XXXX"\n}`,
    ownerTeam: 'Finance Integrations',
    supportContact: 'payments-ops@icicilombard.com',
    expectedResolution: '15–30 minutes after webhook recovery',
    api: 'Payment Sync',
    severity: 'critical',
  },
  {
    id: 'act-3',
    issue: 'COI generation intermittent 503',
    recommendedFix: 'Use async COI retrieval; poll Status API with correlation ID',
    docsLink: 'https://docs.icicilombard.example/apis/coi',
    validationGuide: 'COI Async Flow Guide',
    sampleRequest: `{\n  "policyNumber": "3001/XXXX",\n  "format": "PDF"\n}`,
    sampleResponse: `{\n  "jobId": "COI-7721",\n  "status": "QUEUED"\n}`,
    ownerTeam: 'Policy Documents',
    supportContact: 'docs-api@icicilombard.com',
    expectedResolution: 'Next maintenance window if infra-related',
    api: 'COI',
    severity: 'medium',
  },
  {
    id: 'act-4',
    issue: 'Authentication Failed spike on Quote API',
    recommendedFix: 'Refresh partner token; ensure clock skew < 30s',
    docsLink: 'https://docs.icicilombard.example/auth',
    validationGuide: 'OAuth2 Partner Auth Guide',
    sampleRequest: `POST /oauth/token\nclient_id=...&grant_type=client_credentials`,
    sampleResponse: `{\n  "access_token": "...",\n  "expires_in": 3600\n}`,
    ownerTeam: 'IAM / Security',
    supportContact: 'api-security@icicilombard.com',
    expectedResolution: 'Immediate after credential rotation',
    api: 'Quote',
    severity: 'high',
  },
]

let alertStore: Alert[] = [
  { id: 'al-1', type: 'High Error Rate', message: 'Proposal API error rate exceeded 5% for PolicyBazaar', severity: 'high', api: 'Proposal', partnerId: 'p1', partnerName: 'PolicyBazaar', status: 'open', createdAt: '2026-07-15T07:40:00+05:30' },
  { id: 'al-2', type: 'API Down', message: 'COI API unavailable > 2 minutes — Coverfox', severity: 'critical', api: 'COI', partnerId: 'p8', partnerName: 'Coverfox', status: 'open', createdAt: '2026-07-15T08:01:00+05:30' },
  { id: 'al-3', type: 'Authentication Failure', message: '>100 auth failures in 10m — PhonePe', severity: 'critical', api: 'Quote', partnerId: 'p2', partnerName: 'PhonePe Insurance', status: 'acknowledged', createdAt: '2026-07-15T06:20:00+05:30', acknowledgedAt: '2026-07-15T06:35:00+05:30' },
  { id: 'al-4', type: 'Latency Spike', message: 'P95 latency > 3s on Status API — Turtlemint', severity: 'medium', api: 'Status', partnerId: 'p4', partnerName: 'Turtlemint', status: 'open', createdAt: '2026-07-15T08:15:00+05:30' },
  { id: 'al-5', type: 'Traffic Spike', message: 'Quote RPS 3× baseline — Paytm', severity: 'medium', api: 'Quote', partnerId: 'p3', partnerName: 'Paytm Insurance', status: 'open', createdAt: '2026-07-15T07:05:00+05:30' },
  { id: 'al-6', type: 'Payment Sync Delay', message: 'Payment sync lag 18 minutes — BankBazaar', severity: 'high', api: 'Payment Sync', partnerId: 'p7', partnerName: 'BankBazaar', status: 'open', createdAt: '2026-07-15T07:50:00+05:30' },
  { id: 'al-7', type: 'Certificate Generation Failure', message: 'COI failure rate > 5% — InsuranceDekho', severity: 'high', api: 'COI', partnerId: 'p5', partnerName: 'InsuranceDekho', status: 'resolved', createdAt: '2026-07-14T21:00:00+05:30' },
  { id: 'al-8', type: 'Latency Spike', message: 'Avg response time > 3s Quote — HDFC Securities', severity: 'medium', api: 'Quote', partnerId: 'p10', partnerName: 'HDFC Securities Ins', status: 'open', createdAt: '2026-07-15T08:28:00+05:30' },
]

export function getAlerts(): Alert[] {
  return alertStore
}

export function acknowledgeAlert(id: string): Alert[] {
  alertStore = alertStore.map((a) =>
    a.id === id
      ? { ...a, status: 'acknowledged', acknowledgedAt: new Date().toISOString() }
      : a,
  )
  try {
    localStorage.setItem('api-health-alerts', JSON.stringify(alertStore))
  } catch {
    /* ignore */
  }
  return alertStore
}

export function hydrateAlertsFromStorage() {
  try {
    const raw = localStorage.getItem('api-health-alerts')
    if (raw) alertStore = JSON.parse(raw) as Alert[]
  } catch {
    /* ignore */
  }
}

export const NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', type: 'Maintenance', title: 'Scheduled gateway maintenance', body: 'API Gateway maintenance window: 16 Jul 2026 01:00–03:00 IST. Expect brief elevated latency.', createdAt: '2026-07-14T10:00:00+05:30', read: false },
  { id: 'n2', type: 'Version Update', title: 'Quote API v3.3.0 release candidate', body: 'New rating attributes for EV products. Sandbox available now.', createdAt: '2026-07-13T16:30:00+05:30', read: false },
  { id: 'n3', type: 'Breaking Change', title: 'Proposal schema: nominee.relation enum', body: 'Deprecated values will be rejected after 1 Aug 2026. Migrate to v2 enums.', createdAt: '2026-07-12T09:00:00+05:30', read: true },
  { id: 'n4', type: 'Release', title: 'COI async job polling GA', body: 'Async COI retrieval is generally available in Production.', createdAt: '2026-07-10T11:00:00+05:30', read: true },
  { id: 'n5', type: 'API Change', title: 'Status API adds settlementStage', body: 'Optional field settlementStage added to Status response.', createdAt: '2026-07-08T14:20:00+05:30', read: true },
]

export function getPartnerPerformance(): PartnerPerformance[] {
  return PARTNERS.map((partner) => {
    const apis = getPartnerApis(partner.id)
    const by = (name: ApiName) => apis.find((a) => a.api === name)!
    const avgSuccess = apis.reduce((s, a) => s + a.successRate, 0) / apis.length
    const avgLatency = apis.reduce((s, a) => s + a.avgResponseMs, 0) / apis.length
    const availability = apis.reduce((s, a) => s + a.availability, 0) / apis.length
    const todaysErrors = apis.reduce((s, a) => s + a.failedCalls, 0)
    const criticalErrors = ERRORS.filter(
      (e) => e.partnerId === partner.id && e.severity === 'critical',
    ).reduce((s, e) => s + e.count, 0)
    const score = calculateHealthScore({
      availability,
      successRate: avgSuccess,
      avgLatencyMs: avgLatency,
      criticalIncidents: Math.min(8, Math.floor(criticalErrors / 50)),
      slaCompliance: availability >= 99.5 ? 98 : availability >= 99 ? 85 : 60,
      integrationQuality: 70 + seeded(partner.id + 'q', 0, 28),
    })
    return {
      partner,
      quotePct: by('Quote').successRate,
      proposalPct: by('Proposal').successRate,
      statusPct: by('Status').successRate,
      paymentPct: by('Payment Sync').successRate,
      coiPct: by('COI').successRate,
      avgResponseMs: Math.round(avgLatency),
      availability: Math.round(availability * 1000) / 1000,
      todaysErrors,
      criticalErrors,
      healthScore: score.total,
      tier: score.tier,
      status: statusFromMetrics(avgSuccess, availability, avgLatency),
    }
  })
}

export function getPartnerKpis(partnerId: string): KpiSnapshot {
  const apis = getPartnerApis(partnerId)
  const totalCallsToday = apis.reduce((s, a) => s + a.requestsToday, 0)
  const failedCalls = apis.reduce((s, a) => s + a.failedCalls, 0)
  const successfulCalls = totalCallsToday - failedCalls
  const successRate = (successfulCalls / totalCallsToday) * 100
  const avgResponseMs = apis.reduce((s, a) => s + a.avgResponseMs, 0) / apis.length
  const availability = apis.reduce((s, a) => s + a.availability, 0) / apis.length
  const alerts = getAlerts().filter((a) => a.partnerId === partnerId && a.status !== 'resolved')
  return {
    totalCallsToday,
    successfulCalls,
    failedCalls,
    successRate: Math.round(successRate * 100) / 100,
    avgResponseMs: Math.round(avgResponseMs),
    availability: Math.round(availability * 1000) / 1000,
    activeAlerts: alerts.length,
    pendingCritical: alerts.filter((a) => a.severity === 'critical').length,
  }
}

export function getInternalKpis(): InternalKpis {
  const perf = getPartnerPerformance()
  const totalApiCalls = API_HEALTH.reduce((s, a) => s + a.requestsToday, 0)
  const failed = API_HEALTH.reduce((s, a) => s + a.failedCalls, 0)
  const success = ((totalApiCalls - failed) / totalApiCalls) * 100
  const availability = API_HEALTH.reduce((s, a) => s + a.availability, 0) / API_HEALTH.length
  const alerts = getAlerts().filter((a) => a.status !== 'resolved')
  return {
    totalPartners: PARTNERS.length,
    activePartners: PARTNERS.filter((p) => p.environment === 'Production').length,
    totalApiCalls,
    todaysTransactions: Math.floor(totalApiCalls * 0.62),
    overallSuccessRate: Math.round(success * 100) / 100,
    overallFailureRate: Math.round((100 - success) * 100) / 100,
    overallAvailability: Math.round(availability * 1000) / 1000,
    totalCriticalAlerts: alerts.filter((a) => a.severity === 'critical').length,
    slaBreaches: perf.filter((p) => p.availability < 99.5).length,
  }
}

export const SLA_METRICS: SlaMetric[] = PARTNERS.map((p) => {
  const apis = getPartnerApis(p.id)
  const availability = apis.reduce((s, a) => s + a.availability, 0) / apis.length
  const avgResponseMs = apis.reduce((s, a) => s + a.avgResponseMs, 0) / apis.length
  const p95 = apis.reduce((s, a) => s + a.p95, 0) / apis.length
  const p99 = apis.reduce((s, a) => s + a.p99, 0) / apis.length
  const target = availability >= 99.7 ? '99.9%' : availability >= 99.3 ? '99.5%' : '99%'
  const downtimeMinutes = Math.round((100 - availability) * 43.2)
  return {
    partnerId: p.id,
    partnerName: p.name,
    target,
    availability: Math.round(availability * 1000) / 1000,
    avgResponseMs: Math.round(avgResponseMs),
    p95: Math.round(p95),
    p99: Math.round(p99),
    downtimeMinutes,
    monthlySla: Math.round(availability * 1000) / 1000,
    partnerSla: Math.round((availability - 0.05) * 1000) / 1000,
    errorBudgetRemaining: Math.max(0, Math.round((availability - 99) * 100)),
    breached: availability < 99.5,
  }
})

export const TRIGGERS: TriggerRule[] = [
  { id: 'tr-1', name: 'Failure Rate Warning', condition: 'Failure Rate > 5%', threshold: '5%', severity: 'medium', owner: 'Digital API Ops', email: 'api-ops@icicilombard.com', slack: '#api-alerts', teams: 'API Ops Channel', sms: '', escalation: 'L2 after 15m', enabled: true },
  { id: 'tr-2', name: 'Failure Rate Critical', condition: 'Failure Rate > 10%', threshold: '10%', severity: 'critical', owner: 'Digital API Ops', email: 'api-ops@icicilombard.com', slack: '#api-critical', teams: 'NOC Bridge', sms: '+91-98XXXXXX01', escalation: 'L3 after 10m', enabled: true },
  { id: 'tr-3', name: 'Performance Alert', condition: 'Response Time > 3 sec', threshold: '3000ms', severity: 'medium', owner: 'Platform Perf', email: 'perf@icicilombard.com', slack: '#latency', teams: 'Perf Guild', sms: '', escalation: 'L2 after 30m', enabled: true },
  { id: 'tr-4', name: 'API Down Critical', condition: 'API Down > 2 min', threshold: '2m', severity: 'critical', owner: 'NOC', email: 'noc@icicilombard.com', slack: '#noc', teams: 'NOC Bridge', sms: '+91-98XXXXXX02', escalation: 'Immediate L3', enabled: true },
  { id: 'tr-5', name: 'Security Auth Failures', condition: 'Authentication Failures > 100', threshold: '100/10m', severity: 'critical', owner: 'IAM / Security', email: 'secops@icicilombard.com', slack: '#sec-alerts', teams: 'Security Ops', sms: '+91-98XXXXXX03', escalation: 'SOC after 5m', enabled: true },
  { id: 'tr-6', name: 'Finance Payment Delay', condition: 'Payment Sync Delay > 15 min', threshold: '15m', severity: 'high', owner: 'Finance Integrations', email: 'payments-ops@icicilombard.com', slack: '#payments', teams: 'Finance IT', sms: '', escalation: 'Finance L2 after 20m', enabled: true },
  { id: 'tr-7', name: 'Policy COI Failure', condition: 'COI Failure > 5%', threshold: '5%', severity: 'high', owner: 'Policy Documents', email: 'docs-api@icicilombard.com', slack: '#coi-alerts', teams: 'Policy Ops', sms: '', escalation: 'L2 after 15m', enabled: true },
]

export const OWNERSHIP: OwnershipRecord[] = [
  { id: 'ow-1', issue: 'Proposal validation surge — PolicyBazaar', businessOwner: 'Ananya Mehta', technicalOwner: 'Rahul Desai', l2Team: 'Digital API Ops', l3Team: 'Core Underwriting Platform', vendor: 'N/A', priority: 'high', expectedResolution: '2026-07-15 18:00 IST', currentStatus: 'in_progress' },
  { id: 'ow-2', issue: 'COI outage — Coverfox', businessOwner: 'Vikram Shah', technicalOwner: 'Neha Kapoor', l2Team: 'Policy Documents', l3Team: 'Document Generation Svc', vendor: 'DocGen Vendor', priority: 'critical', expectedResolution: '2026-07-15 12:00 IST', currentStatus: 'open' },
  { id: 'ow-3', issue: 'Auth failure spike — PhonePe', businessOwner: 'Sanjay Iyer', technicalOwner: 'Priya Nair', l2Team: 'IAM', l3Team: 'Identity Platform', vendor: 'N/A', priority: 'critical', expectedResolution: '2026-07-15 11:00 IST', currentStatus: 'monitoring' },
  { id: 'ow-4', issue: 'Payment sync lag — BankBazaar', businessOwner: 'Meera Joshi', technicalOwner: 'Arjun Patel', l2Team: 'Finance Integrations', l3Team: 'Payment Hub', vendor: 'Payment Gateway', priority: 'high', expectedResolution: '2026-07-15 16:00 IST', currentStatus: 'in_progress' },
]

export const ROOT_CAUSES: RootCauseStat[] = [
  { cause: 'Schema / validation drift', count: 142, trend: 12, mttrMinutes: 48, mtbfHours: 36 },
  { cause: 'Auth / token expiry', count: 89, trend: -5, mttrMinutes: 22, mtbfHours: 52 },
  { cause: 'Downstream timeout', count: 76, trend: 8, mttrMinutes: 65, mtbfHours: 28 },
  { cause: 'DB pool exhaustion', count: 41, trend: 3, mttrMinutes: 90, mtbfHours: 120 },
  { cause: 'Partner rate-limit abuse', count: 38, trend: -2, mttrMinutes: 15, mtbfHours: 44 },
  { cause: 'Third-party payment lag', count: 29, trend: 6, mttrMinutes: 55, mtbfHours: 72 },
  { cause: 'Network / gateway blip', count: 24, trend: -8, mttrMinutes: 18, mtbfHours: 96 },
]

export const AUDIT_LOGS: AuditLog[] = [
  { id: 'au-1', action: 'Updated trigger threshold Failure Rate Critical to 10%', actor: 'ops.admin', category: 'Configuration', details: 'triggers/tr-2', timestamp: '2026-07-15T08:00:00+05:30' },
  { id: 'au-2', action: 'Acknowledged alert al-3', actor: 'priya.nair', category: 'Alert', details: 'Auth failure spike PhonePe', timestamp: '2026-07-15T06:35:00+05:30' },
  { id: 'au-3', action: 'Escalated COI outage to L3', actor: 'noc.bridge', category: 'Escalation', details: 'Coverfox COI', timestamp: '2026-07-15T08:10:00+05:30' },
  { id: 'au-4', action: 'Deployed Quote API v3.2.1', actor: 'release.bot', category: 'API Version', details: 'Production', timestamp: '2026-05-12T02:00:00+05:30' },
  { id: 'au-5', action: 'Role switch demo session', actor: 'demo.user', category: 'User Action', details: 'partner → internal', timestamp: '2026-07-15T09:00:00+05:30' },
  { id: 'au-6', action: 'Exported partner performance CSV', actor: 'exec.viewer', category: 'User Action', details: '/internal/partners', timestamp: '2026-07-14T17:22:00+05:30' },
]

export const TRACES: Trace[] = [
  {
    traceId: 'trc-9f2a1c8e4b7d',
    correlationId: 'corr-PBZ-44102',
    partnerId: 'p1',
    partnerName: 'PolicyBazaar',
    api: 'Proposal',
    totalDurationMs: 1840,
    status: 'error',
    timestamp: '2026-07-15T07:42:11+05:30',
    spans: [
      { id: 's1', name: 'API Gateway', service: 'apigw', durationMs: 45, status: 'ok', startOffsetMs: 0 },
      { id: 's2', name: 'Auth Validate', service: 'iam', durationMs: 62, status: 'ok', startOffsetMs: 45 },
      { id: 's3', name: 'Proposal Validate', service: 'proposal-svc', durationMs: 410, status: 'error', startOffsetMs: 110 },
      { id: 's4', name: 'Underwriting Rules', service: 'uw-engine', durationMs: 0, status: 'error', startOffsetMs: 520 },
    ],
  },
  {
    traceId: 'trc-1a2b3c4d5e6f',
    correlationId: 'corr-PPE-99211',
    partnerId: 'p2',
    partnerName: 'PhonePe Insurance',
    api: 'Quote',
    totalDurationMs: 312,
    status: 'ok',
    timestamp: '2026-07-15T08:11:03+05:30',
    spans: [
      { id: 's1', name: 'API Gateway', service: 'apigw', durationMs: 28, status: 'ok', startOffsetMs: 0 },
      { id: 's2', name: 'Auth Validate', service: 'iam', durationMs: 40, status: 'ok', startOffsetMs: 28 },
      { id: 's3', name: 'Rating Engine', service: 'quote-svc', durationMs: 180, status: 'ok', startOffsetMs: 70 },
      { id: 's4', name: 'Cache Write', service: 'redis', durationMs: 12, status: 'ok', startOffsetMs: 250 },
    ],
  },
  {
    traceId: 'trc-77aa88bb99cc',
    correlationId: 'corr-BBZ-10088',
    partnerId: 'p7',
    partnerName: 'BankBazaar',
    api: 'Payment Sync',
    totalDurationMs: 4200,
    status: 'error',
    timestamp: '2026-07-15T07:51:44+05:30',
    spans: [
      { id: 's1', name: 'API Gateway', service: 'apigw', durationMs: 35, status: 'ok', startOffsetMs: 0 },
      { id: 's2', name: 'Payment Hub', service: 'payment-hub', durationMs: 3900, status: 'error', startOffsetMs: 40 },
      { id: 's3', name: 'Policy Bind', service: 'policy-svc', durationMs: 0, status: 'error', startOffsetMs: 3940 },
    ],
  },
]

export const SECURITY_METRICS: SecurityMetric[] = [
  { label: 'Auth Failures (24h)', value: 1240, change: 18, severity: 'high' },
  { label: 'Rate Limit Violations', value: 312, change: -4, severity: 'medium' },
  { label: 'Suspicious IPs Flagged', value: 17, change: 5, severity: 'high' },
  { label: 'Token Rotations Due', value: 6, change: 0, severity: 'low' },
  { label: 'DDoS Indicator Score', value: 22, change: -3, severity: 'low' },
]

export const API_LABELS = APIS

export function getMatrixCell(partnerId: string, api: ApiName) {
  return getApiHealth(partnerId, api)?.status ?? 'healthy'
}
