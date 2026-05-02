# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

**App**: Routis — Construction Financial Accountability. A full-stack construction finance management dashboard. Configured for **offline Windows desktop deployment** via Electron + SQLite.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (`artifacts/site`) — 14-page dashboard app
- **API**: Express 5 (`artifacts/api-server`)
- **Database**: SQLite + Drizzle ORM (`lib/db`) via `better-sqlite3`
- **Desktop shell**: Electron (`artifacts/desktop`)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Build**: esbuild (CJS bundle for API), tsc (Electron main process)
- **i18n**: react-i18next (en/ar/fr)
- **Charts**: Recharts
- **UI**: shadcn/ui + Tailwind CSS

## Architecture

### PostgreSQL → SQLite migration
- All database types converted from `drizzle-orm/pg-core` to `drizzle-orm/sqlite-core`
- `pgTable` → `sqliteTable`; `uuid` → `text + $defaultFn(crypto.randomUUID)`
- `numeric` → `real`; `timestamp` → `integer({ mode: 'timestamp_ms' })`
- `boolean` → `integer({ mode: 'boolean' })`; `date` → `text` (ISO strings)
- `jsonb` → `text({ mode: 'json' })` (sessions table)
- DB file path: `SQLITE_PATH` env var → defaults to `app-data.sqlite` in CWD (dev) or `userData` AppData folder (packaged)
- `drizzle-kit` config updated to `dialect: "sqlite"`

### Electron Desktop Package (`artifacts/desktop`)
- **Main process** (`src/main.ts`): Sets `OFFLINE_MODE=true`, `SQLITE_PATH`, starts Express API on a random port, opens a `BrowserWindow`
- **Preload** (`src/preload.ts`): Exposes `window.__ELECTRON__.apiPort` and `apiBaseUrl` to the renderer via `contextBridge`
- **Build**: `tsc` compiles to `dist/`, electron-builder packages to `release/` with site's built files as extra resources
- In dev: loads Vite dev server (`http://localhost:5173`)
- In production: loads `site/dist/index.html` from packaged resources

### Offline Auth
- `OFFLINE_MODE=true` bypasses all OIDC auth in `authMiddleware`
- A default local user (`id: 'local-admin'`) is always set as the authenticated user
- Auth routes (login/callback/logout) remain in code but are unused in offline mode

### API Server changes
- `app.ts` now exports a `startServer(port?)` function returning `{ port }` — used by both `index.ts` (normal web mode) and `artifacts/desktop` (Electron mode)
- Package exports: `"."` → `src/index.ts`, `"./app"` → `src/app.ts`
- Raw SQL in `data.ts` migrated from PostgreSQL syntax to SQLite (`db.all()` replaces `db.execute()`, `::numeric` casts removed, `INTERVAL` → `date('now', ...)`)

### Database Tables
projects, employees, assets, suppliers, cash_holders, cash_issues, expense_categories, sub_cost_centers, expenses, revenue_invoices, revenue_receipts, attendance, alerts, payroll_runs + sessions, users (auth)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push SQLite schema to local DB file
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/site run dev` — run frontend locally
- `pnpm --filter @workspace/desktop run build:windows` — build Windows installer to `artifacts/desktop/release/`

## Workflows

- `artifacts/api-server: API Server` — Express API on $PORT
- `artifacts/site: web` — Vite React frontend on $PORT (previewPath: `/`)

## Pages (14 total)
Dashboard, Cash Management, Expenses, Revenue & Invoices, Payroll, Attendance, Projects, Machines & Vehicles, Suppliers, Employees, Finance Reports, Alerts & Leaks, Data Entry, Settings

## Environment Variables (Offline/Desktop mode)
- `SQLITE_PATH` — path to the SQLite database file (set by Electron main process)
- `OFFLINE_MODE=true` — disables OIDC auth, uses a local admin user
- `VITE_PORT` — Vite dev server port (default 5173), used by Electron in dev mode

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
