import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ExpenseRow, ExpenseCategory, PaymentMethod, ProofStatus } from "@/data/mock";

export function useExpenses() {
  return useQuery<ExpenseRow[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("id, expense_date, project_id, category, supplier_id, employee_id, description, amount, method, proof_url, note")
        .order("expense_date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: String(r.id),
        date: (r.expense_date as string) ?? new Date().toISOString(),
        projectId: String(r.project_id ?? ""),
        category: ((r.category as ExpenseCategory) ?? "other"),
        supplierId: String(r.supplier_id ?? ""),
        description: (r.description as string) ?? (r.note as string) ?? "",
        amount: Number(r.amount ?? 0),
        method: ((r.method as PaymentMethod) ?? "cash"),
        proof: (r.proof_url ? "ok" : "missing") as ProofStatus,
        paidBy: String(r.employee_id ?? ""),
      }));
    },
  });
}

export interface InsertExpenseInput {
  expense_date: string;
  project_id?: string | null;
  category?: string | null;
  supplier_id?: string | null;
  employee_id?: string | null;
  description?: string | null;
  amount: number;
  method?: string | null;
  proof_url?: string | null;
}

export function useInsertExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: InsertExpenseInput) => {
      const { data, error } = await supabase.from("expenses").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["v_project_financial_summary"] });
    },
  });
}
