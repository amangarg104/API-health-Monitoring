# API Health Dashboard

Enterprise-style **API Health & Partner Monitoring Dashboard** for ICICI Lombard Digital Partnerships (frontend demo).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Recharts
- React Router
- next-themes (light / dark)
- Lucide icons

## Features

### Partner Portal
Dashboard KPIs, API health cards & trends, error analytics, error reports (CSV / Excel / PDF), action center, alerts (acknowledge / logs / ticket), notifications.

### Internal Ops Portal
Cross-partner KPIs, partner performance table, health matrix, API monitoring, SLA & error budget, error intelligence, triggers, ownership, root-cause analytics, executive scorecards, audit logs, reports, observability (traces, dependency map, security metrics).

### Demo controls
- **Role switcher** (top bar): Partner Portal ↔ Internal Ops
- **Partner selector** (when in Partner role)
- Theme toggle (light / dark)
- Mock data only — no backend

## Run

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

```bash
npm run build    # production build
npm run preview  # preview production build
```

## Partner health score

Weighted score used for Gold / Silver / Bronze / At Risk badges:

| Factor | Weight |
|--------|--------|
| Availability | 30% |
| Success rate | 25% |
| Avg latency | 15% |
| Critical incidents | 15% |
| SLA compliance | 10% |
| Integration quality | 5% |

## Project layout

```
src/
  app/           # Auth + router
  components/    # UI + layout + shared widgets
  data/mock.ts   # Seeded partners, APIs, errors, alerts, SLA, traces
  features/      # Partner + Internal pages
  lib/           # utils, health score, exports
  types/         # domain types
```

## Notes

This is a **frontend-only demo**. Alert acknowledgement persists in `localStorage`. Exports generate client-side CSV (Excel-compatible) or open a print dialog for PDF. Ticketing / email actions show toast confirmations only.
