
CREATE TABLE public.expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sub_cost_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_cost_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prototype open read expense_categories" ON public.expense_categories FOR SELECT USING (true);
CREATE POLICY "prototype open insert expense_categories" ON public.expense_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "prototype open update expense_categories" ON public.expense_categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "prototype open delete expense_categories" ON public.expense_categories FOR DELETE USING (true);

CREATE POLICY "prototype open read sub_cost_centers" ON public.sub_cost_centers FOR SELECT USING (true);
CREATE POLICY "prototype open insert sub_cost_centers" ON public.sub_cost_centers FOR INSERT WITH CHECK (true);
CREATE POLICY "prototype open update sub_cost_centers" ON public.sub_cost_centers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "prototype open delete sub_cost_centers" ON public.sub_cost_centers FOR DELETE USING (true);

CREATE TRIGGER set_updated_at_expense_categories
  BEFORE UPDATE ON public.expense_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_sub_cost_centers
  BEFORE UPDATE ON public.sub_cost_centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
