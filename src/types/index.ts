export type UserRole = 'partner' | 'internal'

export type ApiName =
  | 'Quote'
  | 'Proposal'
  | 'Payment Sync'
  | 'Status'
  | 'COI'

export type HealthStatus = 'healthy' | 'warning' | 'critical'
export type Environment = 'Sandbox' | 'Production'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'open' | 'acknowledged' | 'resolved'
export type ResolutionStatus = 'open' | 'in_progress' | 'resolved' | 'monitoring'
export type ScoreTier = 'Gold' | 'Silver' | 'Bronze' | 'At Risk'

export type ErrorCategory =
  | 'Infrastructure'
  | 'Authentication'
  | 'Validation'
  | 'Partner Issue'
  | 'Internal Issue'
  | 'Timeout'
  | 'Network'
  | 'Third Party'
  | 'Unknown'

export type TimeRange = '24h' | '7d' | '30d'

export interface Partner {
  id: string
  name: string
  code: string
  environment: Environment
  contactEmail: string
  lastActivity: string
}

export interface ApiHealth {
  api: ApiName
  partnerId: string
  status: HealthStatus
  requestsToday: number
  successRate: number
  failedCalls: number
  avgResponseMs: number
  maxResponseMs: number
  p50: number
  p95: number
  p99: number
  availability: number
  version: string
  releaseDate: string
  lastDowntime: string | null
  peakRps: number
  errorRate: number
}

export interface KpiSnapshot {
  totalCallsToday: number
  successfulCalls: number
  failedCalls: number
  successRate: number
  avgResponseMs: number
  availability: number
  activeAlerts: number
  pendingCritical: number
}

export interface InternalKpis {
  totalPartners: number
  activePartners: number
  totalApiCalls: number
  todaysTransactions: number
  overallSuccessRate: number
  overallFailureRate: number
  overallAvailability: number
  totalCriticalAlerts: number
  slaBreaches: number
}

export interface TimeSeriesPoint {
  timestamp: string
  label: string
  successRate: number
  errorRate: number
  latencyMs: number
  traffic: number
  availability: number
}

export interface ErrorRecord {
  id: string
  code: number
  message: string
  count: number
  frequency: string
  severity: Severity
  lastOccurrence: string
  affectedApi: ApiName
  partnerId: string
  partnerName: string
  impactLevel: string
  recommendedAction: string
  ownerTeam: string
  resolutionStatus: ResolutionStatus
  eta: string
  category: ErrorCategory
  rootCause: string
  priority: Severity
}

export interface ActionItem {
  id: string
  issue: string
  recommendedFix: string
  docsLink: string
  validationGuide: string
  sampleRequest: string
  sampleResponse: string
  ownerTeam: string
  supportContact: string
  expectedResolution: string
  api: ApiName
  severity: Severity
}

export interface Alert {
  id: string
  type: string
  message: string
  severity: Severity
  api?: ApiName
  partnerId: string
  partnerName: string
  status: AlertStatus
  createdAt: string
  acknowledgedAt?: string
}

export interface NotificationItem {
  id: string
  type: 'API Change' | 'Version Update' | 'Maintenance' | 'Release' | 'Breaking Change'
  title: string
  body: string
  createdAt: string
  read: boolean
}

export interface PartnerPerformance {
  partner: Partner
  quotePct: number
  proposalPct: number
  statusPct: number
  paymentPct: number
  coiPct: number
  avgResponseMs: number
  availability: number
  todaysErrors: number
  criticalErrors: number
  healthScore: number
  tier: ScoreTier
  status: HealthStatus
}

export interface SlaMetric {
  partnerId: string
  partnerName: string
  target: '99.9%' | '99.5%' | '99%'
  availability: number
  avgResponseMs: number
  p95: number
  p99: number
  downtimeMinutes: number
  monthlySla: number
  partnerSla: number
  errorBudgetRemaining: number
  breached: boolean
}

export interface TriggerRule {
  id: string
  name: string
  condition: string
  threshold: string
  severity: Severity
  owner: string
  email: string
  slack: string
  teams: string
  sms: string
  escalation: string
  enabled: boolean
}

export interface OwnershipRecord {
  id: string
  issue: string
  businessOwner: string
  technicalOwner: string
  l2Team: string
  l3Team: string
  vendor: string
  priority: Severity
  expectedResolution: string
  currentStatus: ResolutionStatus
}

export interface RootCauseStat {
  cause: string
  count: number
  trend: number
  mttrMinutes: number
  mtbfHours: number
}

export interface AuditLog {
  id: string
  action: string
  actor: string
  category: 'Configuration' | 'User Action' | 'Alert' | 'Escalation' | 'API Version'
  details: string
  timestamp: string
}

export interface TraceSpan {
  id: string
  name: string
  service: string
  durationMs: number
  status: 'ok' | 'error'
  startOffsetMs: number
}

export interface Trace {
  traceId: string
  correlationId: string
  partnerId: string
  partnerName: string
  api: ApiName
  totalDurationMs: number
  status: 'ok' | 'error'
  timestamp: string
  spans: TraceSpan[]
}

export interface SecurityMetric {
  label: string
  value: number
  change: number
  severity: Severity
}

export interface PartnerHealthScoreBreakdown {
  availability: number
  successRate: number
  latency: number
  criticalIncidents: number
  slaCompliance: number
  integrationQuality: number
  total: number
  tier: ScoreTier
}
