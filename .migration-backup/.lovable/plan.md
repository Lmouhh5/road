# Wire Projects + Dashboard to a real database

## ⚠️ Security note first

You pasted your Supabase database password (`Messi2004Messi@`) into chat. That message is logged.
**Rotate it now**: Supabase Dashboard → Project Settings → Database → "Reset database password".

Lovable does **not** need that password. Lovable connects through the Supabase **anon (public) key + project URL**, both injected automatically by the Supabase integration button — never via the postgres connection string.

---

## Step 1 — Pick the connection (you must do this manually before I can build)

**Option A (recommended): Enable Lovable Cloud**
A managed Supabase backend, one click. I create all schema, seed it, and wire hooks. Your existing Supabase project (`uesdrarjicyqqiqmrxwz`) stays untouched.

**Option B: Connect your existing Supabase project**
Click the green **Supabase** button in the Lovable top bar → authorize → pick `uesdrarjicyqqiqmrxwz`. Lovable injects `VITE_SUPABASE_URL` + anon key. I then introspect the schema and either reuse existing tables or generate migrations.

I cannot do either step for you — both require a click in the Lovable UI.

---

## Step 2 — Create the `projects` table + view

Once connected, I run a migration creating:

```sql
-- Projects: source of truth for project metadata + budget
create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  name            text not null,
  budget          numeric(14,2) not null default 0,
  contract_value  numeric(14,2),
  status          text not null default 'on_track'
                  check (status in ('on_track','at_risk','delayed')),
  start_date      date,
  end_date        date,
  created_at      timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Prototype phase: single-user, no auth → permissive policy
create policy "prototype open access" on public.projects
  for all using (true) with check (true);

-- View consumed by Dashboard KPI/projects table.
-- For now `spent` and `margin` are computed; once expenses table exists
-- it will sum from there. v1 reads from a `spent` column we keep in projects.
create or replace view public.v_project_financial_summary as
select
  p.id,
  p.code,
  p.name,
  p.budget,
  coalesce(p.contract_value, p.budget) as contract_value,
  -- placeholder until expenses table lands; seeded with mock spent values
  coalesce((select sum(amount) from public.expenses e where e.project_id = p.id), 0) as spent,
  p.status,
  case when p.budget > 0
       then round(((coalesce(p.contract_value, p.budget) -
            coalesce((select sum(amount) from public.expenses e where e.project_id = p.id), 0))
            / p.budget) * 100, 1)
       else 0 end as margin
from public.projects p;
```

Note: the view depends on an `expenses` table. For this first turn I'll create a **stub** `expenses` table (id, project_id, amount, created_at — no UI consumes it yet) just so the view compiles. The full Expenses schema lands when we do the Expenses page in a later turn.

Then I seed `projects` with the 7 rows currently in `mock.ts` (RN1-AÏN, CW42-MED, RN6-BLD, CW17-TIP, RN5-BJA, RN18-CHL, CW09-BOU) and seed `expenses` with one summary row per project so `spent` matches today's mock numbers.

---

## Step 3 — Generate the Supabase client + types

After the migration, the Supabase JS client and TypeScript types are auto-generated at `src/integrations/supabase/{client.ts,types.ts}`. No manual setup.

---

## Step 4 — Add data hooks (new files, no UI files touched yet)

Create `src/hooks/queries/`:

- **`useProjects.ts`** — `useQuery(['projects'], () => supabase.from('projects').select('*').order('code'))`. Returns `ProjectRow[]` matching the existing `ProjectRow` shape from `mock.ts` so the page consumes it unchanged.
- **`useProjectFinancialSummary.ts`** — `useQuery(['v_project_financial_summary'], () => supabase.from('v_project_financial_summary').select('*'))`. Returns rows with `{ id, code, name, budget, spent, margin, status }` — exactly what Dashboard's projects table + horizontal bar chart consume today.

Both hooks return `{ data, isLoading, error }`. While loading, they return an empty array so the existing charts/tables render their normal empty state instead of crashing.

---

## Step 5 — Swap data sources in 2 page files (no UI changes)

**`src/pages/Projects.tsx`**
- Remove `import { projects } from "@/data/mock"`.
- Add `const { data: projects = [] } = useProjects();`.
- Everything else (cards, rings, layout, classes) untouched.

**`src/pages/Dashboard.tsx`**
- Remove `import { projects } from "@/data/mock"` (keep other mock imports — Dashboard also uses `kpis`, `sparks`, `monthlyCashflow`, `expenseDistribution`, `alertSummary` which belong to later turns).
- Add `const { data: projects = [] } = useProjectFinancialSummary();`.
- The horizontal bar chart and projects table consume `projects` exactly as before — same field names.

No JSX, no Tailwind classes, no chart configs change. Pure import/data-source swap.

---

## What this turn does NOT do

- No Expenses, Revenue, Cash, Payroll, Employees, Machines, Suppliers, Attendance, Alerts hooks. Each gets its own turn so changes stay reviewable.
- No insert/update mutations yet — Projects page is read-only today (no form). Mutations land alongside the Data Entry page wiring.
- No mock data deletion. `src/data/mock.ts` stays so the un-migrated pages keep working.
- No UI styling changes. Strict rule per your message.

---

## Files touched this turn

- **New**: `src/hooks/queries/useProjects.ts`, `src/hooks/queries/useProjectFinancialSummary.ts`
- **Migration**: creates `projects`, stub `expenses`, view `v_project_financial_summary`, seeds them
- **Edited (imports + 1 line each)**: `src/pages/Projects.tsx`, `src/pages/Dashboard.tsx`
- **Auto-generated** by Lovable Cloud: `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`

---

## Before I can start

Pick A or B in Step 1 and click the corresponding button. Reply here once done and I'll execute Steps 2–5 in one go.