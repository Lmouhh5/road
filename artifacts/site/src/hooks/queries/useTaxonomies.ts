import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RefRow {
  id: string;
  code: string;
  name: string;
  sort_order: number;
}

export function useExpenseCategories() {
  return useQuery<RefRow[]>({
    queryKey: ["expense_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_categories")
        .select("id, code, name, sort_order")
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: String(r.id), code: r.code as string, name: r.name as string,
        sort_order: Number(r.sort_order ?? 0),
      }));
    },
  });
}

export function useInsertExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { code: string; name: string; sort_order?: number }) => {
      const { data, error } = await supabase.from("expense_categories").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expense_categories"] }),
  });
}

export function useSubCostCenters() {
  return useQuery<RefRow[]>({
    queryKey: ["sub_cost_centers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sub_cost_centers")
        .select("id, code, name, sort_order")
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: String(r.id), code: r.code as string, name: r.name as string,
        sort_order: Number(r.sort_order ?? 0),
      }));
    },
  });
}

export function useInsertSubCostCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { code: string; name: string; sort_order?: number }) => {
      const { data, error } = await supabase.from("sub_cost_centers").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sub_cost_centers"] }),
  });
}
