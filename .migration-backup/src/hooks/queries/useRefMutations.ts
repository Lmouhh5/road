import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type RefTable = "projects" | "employees" | "assets" | "suppliers" | "cash_holders" | "expense_categories" | "sub_cost_centers";

const INVALIDATE: Record<RefTable, string[][]> = {
  projects: [["projects_list"], ["projects"]],
  employees: [["employees"]],
  assets: [["assets"]],
  suppliers: [["suppliers"]],
  cash_holders: [["cash_holders"]],
  expense_categories: [["expense_categories"]],
  sub_cost_centers: [["sub_cost_centers"]],
};

export function useUpdateRef(table: RefTable) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { data, error } = await (supabase.from(table) as any).update(values).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => INVALIDATE[table].forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

export function useDeleteRef(table: RefTable) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from(table) as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => INVALIDATE[table].forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}
