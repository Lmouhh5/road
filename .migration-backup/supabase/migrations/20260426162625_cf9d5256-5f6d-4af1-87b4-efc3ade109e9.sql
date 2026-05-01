
-- ============ EXTEND EXPENSES ============
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS expense_date date NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS supplier_id uuid,
  ADD COLUMN IF NOT EXISTS employee_id uuid,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS method text,
  ADD COLUMN IF NOT EXISTS proof_url text;

-- ============ SUPPLIERS ============
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  phone text,
  contact text,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open read suppliers"   ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "prototype open insert suppliers" ON public.suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "prototype open update suppliers" ON public.suppliers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "prototype open delete suppliers" ON public.suppliers FOR DELETE USING (true);
CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ EMPLOYEES ============
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  base_salary numeric NOT NULL DEFAULT 0,
  days_worked_month integer NOT NULL DEFAULT 0,
  cash_held numeric NOT NULL DEFAULT 0,
  phone text,
  hire_date date,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open read employees"   ON public.employees FOR SELECT USING (true);
CREATE POLICY "prototype open insert employees" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "prototype open update employees" ON public.employees FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "prototype open delete employees" ON public.employees FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS idx_employees_project ON public.employees(project_id);
CREATE TRIGGER trg_employees_updated BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill expenses FKs now that suppliers/employees exist
ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL,
  ADD CONSTRAINT expenses_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_supplier ON public.expenses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_expenses_employee ON public.expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project  ON public.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date     ON public.expenses(expense_date);

-- ============ ASSETS (vehicles & machines) ============
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  type text NOT NULL DEFAULT 'machine',  -- machine | vehicle
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active', -- active | idle | maintenance
  hours_month numeric NOT NULL DEFAULT 0,
  fuel_month numeric NOT NULL DEFAULT 0,
  cost_month numeric NOT NULL DEFAULT 0,
  last_service date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open read assets"   ON public.assets FOR SELECT USING (true);
CREATE POLICY "prototype open insert assets" ON public.assets FOR INSERT WITH CHECK (true);
CREATE POLICY "prototype open update assets" ON public.assets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "prototype open delete assets" ON public.assets FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS idx_assets_project ON public.assets(project_id);
CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CASH HOLDERS ============
CREATE TABLE IF NOT EXISTS public.cash_holders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cash_holders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open read cash_holders"   ON public.cash_holders FOR SELECT USING (true);
CREATE POLICY "prototype open insert cash_holders" ON public.cash_holders FOR INSERT WITH CHECK (true);
CREATE POLICY "prototype open update cash_holders" ON public.cash_holders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "prototype open delete cash_holders" ON public.cash_holders FOR DELETE USING (true);
CREATE TRIGGER trg_cash_holders_updated BEFORE UPDATE ON public.cash_holders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CASH REQUESTS ============
CREATE TABLE IF NOT EXISTS public.cash_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  purpose text,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | issued | rejected
  request_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cash_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open read cash_requests"   ON public.cash_requests FOR SELECT USING (true);
CREATE POLICY "prototype open insert cash_requests" ON public.cash_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "prototype open update cash_requests" ON public.cash_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "prototype open delete cash_requests" ON public.cash_requests FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS idx_cash_requests_project ON public.cash_requests(project_id);
CREATE TRIGGER trg_cash_requests_updated BEFORE UPDATE ON public.cash_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CASH ISSUES ============
CREATE TABLE IF NOT EXISTS public.cash_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id uuid REFERENCES public.cash_holders(id) ON DELETE SET NULL,
  request_id uuid REFERENCES public.cash_requests(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  source text,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cash_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open read cash_issues"   ON public.cash_issues FOR SELECT USING (true);
CREATE POLICY "prototype open insert cash_issues" ON public.cash_issues FOR INSERT WITH CHECK (true);
CREATE POLICY "prototype open update cash_issues" ON public.cash_issues FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "prototype open delete cash_issues" ON public.cash_issues FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS idx_cash_issues_holder ON public.cash_issues(holder_id);

-- ============ REVENUE INVOICES ============
CREATE TABLE IF NOT EXISTS public.revenue_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text,
  client text NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  issued_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  status text NOT NULL DEFAULT 'pending', -- pending | partial | paid | overdue
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open read revenue_invoices"   ON public.revenue_invoices FOR SELECT USING (true);
CREATE POLICY "prototype open insert revenue_invoices" ON public.revenue_invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "prototype open update revenue_invoices" ON public.revenue_invoices FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "prototype open delete revenue_invoices" ON public.revenue_invoices FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON public.revenue_invoices(project_id);
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.revenue_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ REVENUE RECEIPTS ============
CREATE TABLE IF NOT EXISTS public.revenue_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.revenue_invoices(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  method text,
  receipt_date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open read revenue_receipts"   ON public.revenue_receipts FOR SELECT USING (true);
CREATE POLICY "prototype open insert revenue_receipts" ON public.revenue_receipts FOR INSERT WITH CHECK (true);
CREATE POLICY "prototype open update revenue_receipts" ON public.revenue_receipts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "prototype open delete revenue_receipts" ON public.revenue_receipts FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS idx_receipts_invoice ON public.revenue_receipts(invoice_id);

-- ============ ATTENDANCE ============
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  attendance_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'present', -- present | absent | leave | half
  hours numeric NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open read attendance"   ON public.attendance FOR SELECT USING (true);
CREATE POLICY "prototype open insert attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "prototype open update attendance" ON public.attendance FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "prototype open delete attendance" ON public.attendance FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON public.attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date     ON public.attendance(attendance_date);

-- ============ PAYROLL RUNS ============
CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_month date NOT NULL,  -- first of month
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  gross_amount numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft', -- draft | approved | paid
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open read payroll_runs"   ON public.payroll_runs FOR SELECT USING (true);
CREATE POLICY "prototype open insert payroll_runs" ON public.payroll_runs FOR INSERT WITH CHECK (true);
CREATE POLICY "prototype open update payroll_runs" ON public.payroll_runs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "prototype open delete payroll_runs" ON public.payroll_runs FOR DELETE USING (true);
CREATE TRIGGER trg_payroll_runs_updated BEFORE UPDATE ON public.payroll_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ALERTS ============
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,         -- uncleared_cash | missing_proof | overdue_invoice | budget_overrun | etc
  severity text NOT NULL DEFAULT 'medium', -- low | medium | high | critical
  message text NOT NULL,
  entity_type text,
  entity_id uuid,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open read alerts"   ON public.alerts FOR SELECT USING (true);
CREATE POLICY "prototype open insert alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "prototype open update alerts" ON public.alerts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "prototype open delete alerts" ON public.alerts FOR DELETE USING (true);
