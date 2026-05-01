-- Projects table
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
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "prototype open read projects"   on public.projects for select using (true);
create policy "prototype open insert projects" on public.projects for insert with check (true);
create policy "prototype open update projects" on public.projects for update using (true) with check (true);
create policy "prototype open delete projects" on public.projects for delete using (true);

-- Stub expenses table (full schema later, only used now to feed the view)
create table public.expenses (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references public.projects(id) on delete cascade,
  amount      numeric(14,2) not null default 0,
  category    text,
  note        text,
  created_at  timestamptz not null default now()
);

alter table public.expenses enable row level security;

create policy "prototype open read expenses"   on public.expenses for select using (true);
create policy "prototype open insert expenses" on public.expenses for insert with check (true);
create policy "prototype open update expenses" on public.expenses for update using (true) with check (true);
create policy "prototype open delete expenses" on public.expenses for delete using (true);

-- Updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_projects_updated_at
before update on public.projects
for each row execute function public.update_updated_at_column();

-- Financial summary view
create or replace view public.v_project_financial_summary as
select
  p.id,
  p.code,
  p.name,
  p.budget,
  coalesce(p.contract_value, p.budget) as contract_value,
  coalesce((select sum(e.amount) from public.expenses e where e.project_id = p.id), 0) as spent,
  p.status,
  case
    when p.budget > 0 then
      round(
        ((coalesce(p.contract_value, p.budget)
          - coalesce((select sum(e.amount) from public.expenses e where e.project_id = p.id), 0))
         / p.budget) * 100, 1)
    else 0
  end as margin
from public.projects p;

-- Seed projects (matches current mock.ts)
insert into public.projects (code, name, budget, status) values
  ('RN1-AÏN',  'RN1 — Aïn Defla, Section 4',      184000000, 'on_track'),
  ('CW42-MED', 'CW42 — Médéa Reprofilage',         92500000, 'at_risk'),
  ('RN6-BLD',  'RN6 — Boulevard Blida Sud',       156700000, 'on_track'),
  ('CW17-TIP', 'CW17 — Tipaza Échangeur',          68300000, 'delayed'),
  ('RN5-BJA',  'RN5 — Béjaïa Asphalte',           211000000, 'on_track'),
  ('RN18-CHL', 'RN18 — Chlef Drainage',            47900000, 'on_track'),
  ('CW09-BOU', 'CW09 — Boumerdès Réhabilitation', 134200000, 'at_risk');

-- Seed one summary expense per project so spent/margin match mock figures
insert into public.expenses (project_id, amount, category, note)
select id, 121400000, 'summary', 'seed' from public.projects where code = 'RN1-AÏN'
union all select id,  78900000, 'summary', 'seed' from public.projects where code = 'CW42-MED'
union all select id,  64300000, 'summary', 'seed' from public.projects where code = 'RN6-BLD'
union all select id,  65120000, 'summary', 'seed' from public.projects where code = 'CW17-TIP'
union all select id, 142800000, 'summary', 'seed' from public.projects where code = 'RN5-BJA'
union all select id,  22400000, 'summary', 'seed' from public.projects where code = 'RN18-CHL'
union all select id, 109600000, 'summary', 'seed' from public.projects where code = 'CW09-BOU';