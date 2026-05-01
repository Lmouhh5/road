import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectRow, ProjectStatus } from "@/data/mock";

/**
 * Reads `v_project_financial_summary` from Supabase and returns rows in the
 * exact `ProjectRow` shape the existing pages already consume.
 * No UI changes required in consumers.
 */
export function useProjectFinancialSummary() {
  return useQuery<ProjectRow[]>({
    queryKey: ["v_project_financial_summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_project_financial_summary")
        .select("id, code, name, budget, spent, status, margin")
        .order("code", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((r) => ({
        id: String(r.id),
        code: r.code as string,
        name: r.name as string,
        budget: Number(r.budget ?? 0),
        spent: Number(r.spent ?? 0),
        margin: Number(r.margin ?? 0),
        status: (r.status as ProjectStatus) ?? "on_track",
      }));
    },
  });
}
