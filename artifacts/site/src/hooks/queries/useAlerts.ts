import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AlertItem, AlertKind, AlertSeverity } from "@/data/mock";

export function useAlerts() {
  return useQuery<AlertItem[]>({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("id, type, severity, message, entity_id, entity_type, resolved, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: String(r.id),
        kind: ((r.type as AlertKind) ?? "missing_proof"),
        severity: ((r.severity as AlertSeverity) ?? "medium"),
        title: r.message as string,
        detail: "",
        projectId: r.entity_type === "project" ? (r.entity_id as string) : undefined,
        at: (r.created_at as string) ?? new Date().toISOString(),
        status: (r.resolved ? "resolved" : "open") as "open" | "ack" | "resolved",
      }));
    },
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("alerts")
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}
