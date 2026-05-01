import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Lightweight projects list (id, code, name) for selectors and lookups. */
export function useProjectsList() {
  return useQuery({
    queryKey: ["projects_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, code, name")
        .order("code");
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: String(r.id),
        code: r.code as string,
        name: r.name as string,
      }));
    },
  });
}

export function useInsertProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { code: string; name: string; budget?: number; status?: string }) => {
      const { data, error } = await supabase.from("projects").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects_list"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
