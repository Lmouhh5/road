import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CashHolder, CashMove, CashDirection } from "@/data/mock";

export function useCashHolders() {
  return useQuery<CashHolder[]>({
    queryKey: ["cash_holders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_holders")
        .select("id, name, role, balance, updated_at")
        .order("name");
      if (error) throw error;
      return (data ?? []).map((r) => {
        const bal = Number(r.balance ?? 0);
        return {
          id: String(r.id),
          employeeId: "",
          name: r.name as string,
          role: (r.role as string) ?? "",
          balance: bal,
          lastClearedAt: (r.updated_at as string) ?? new Date().toISOString(),
          status: (bal > 1_000_000 ? "at_risk" : bal > 3_000_000 ? "overdue" : "ok") as "ok" | "at_risk" | "overdue",
        };
      });
    },
  });
}

export function useCashMovements() {
  return useQuery<CashMove[]>({
    queryKey: ["cash_issues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_issues")
        .select("id, issue_date, holder_id, amount, source, note")
        .order("issue_date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: String(r.id),
        date: (r.issue_date as string) ?? new Date().toISOString(),
        holderId: String(r.holder_id ?? ""),
        direction: (Number(r.amount ?? 0) >= 0 ? "out" : "in") as CashDirection,
        amount: Math.abs(Number(r.amount ?? 0)),
        reason: (r.note as string) ?? "",
        reference: (r.source as string) ?? undefined,
      }));
    },
  });
}

export function useInsertCashHolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; role?: string; balance?: number }) => {
      const { data, error } = await supabase.from("cash_holders").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cash_holders"] }),
  });
}

export function useInsertCashIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { issue_date?: string; holder_id?: string | null; amount: number; source?: string; note?: string }) => {
      const { data, error } = await supabase.from("cash_issues").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cash_issues"] }),
  });
}
