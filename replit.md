# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

**App**: Routis — Construction Financial Accountability. A full-stack construction finance management dashboard ported from Lovable.dev to Replit. Replaces Supabase with Replit PostgreSQL + Drizzle ORM.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (`artifacts/site`) — 14-page dashboard app
- **API**: Express 5 (`artifacts/api-server`)
- **Database**: PostgreSQL + Drizzle ORM (`lib/db`)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Build**: esbuild (CJS bundle)
- **i18n**: react-i18next (en/ar/fr)
- **Charts**: Recharts
- **UI**: shadcn/ui + Tailwind CSS

## Architecture

### Supabase → Replit migration
- Original Lovable app used Supabase for data. All Supabase calls replaced with fetch-based API calls to `artifacts/api-server`.
- `artifacts/site/src/integrations/supabase/client.ts` — shim that maps table names to REST API routes (no real Supabase dependency at runtime)
- `artifacts/api-server/src/routes/data.ts` — all CRUD routes for 13 tables
- `lib/db/src/schema/index.ts` — Drizzle schema for all tables

### Database Tables
projects, employees, assets, suppliers, cash_holders, cash_issues, expense_categories, sub_cost_centers, expenses, revenue_invoices, revenue_receipts, attendance, alerts, payroll_runs

### Route mapping (supabase shim)
| Table name | API route |
|---|---|
| cash_holders | /cash-holders |
| cash_issues | /cash-issues |
| expense_categories | /expense-categories |
| sub_cost_centers | /sub-cost-centers |
| revenue_invoices | /revenue-invoices |
| v_project_financial_summary | /projects/financial-summary |
| all others | /{table-name} |

### Special endpoints
- `GET /api/projects/financial-summary` — projects with budget/spent/margin% aggregated from expenses
- `GET /api/attendance/heatmap` — attendance data joined with employee names

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/site run dev` — run frontend locally

## Workflows

- `artifacts/api-server: API Server` — Express API on $PORT
- `artifacts/site: web` — Vite React frontend on $PORT (previewPath: `/`)

## Pages (14 total)
Dashboard, Cash Management, Expenses, Revenue & Invoices, Payroll, Attendance, Projects, Machines & Vehicles, Suppliers, Employees, Finance Reports, Alerts & Leaks, Data Entry, Settings

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
