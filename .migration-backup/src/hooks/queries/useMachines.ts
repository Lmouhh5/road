import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Machine, MachineKind, MachineStatus } from "@/data/mock";

const KIND_MAP: Record<string, MachineKind> = {
  truck: "truck", excavator: "excavator", loader: "loader",
  roller: "roller", grader: "grader", paver: "paver", pickup: "pickup",
};

export function useMachines() {
  return useQuery<Machine[]>({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("id, code, name, type, project_id, status, hours_month, fuel_month, cost_month, last_service")
        .order("code");
      if (error) throw error;
      return (data ?? []).map((r) => {
        const fuelLiters = Number(r.fuel_month ?? 0);
        const cost = Number(r.cost_month ?? 0);
        return {
          id: String(r.id),
          code: (r.code as string) ?? "",
          name: r.name as string,
          kind: KIND_MAP[(r.type as string) ?? ""] ?? "truck",
          projectId: String(r.project_id ?? ""),
          status: ((r.status as MachineStatus) ?? "active"),
          hoursMonth: Number(r.hours_month ?? 0),
          fuelMonth: fuelLiters,
          fuelCostMonth: Math.round(cost * 0.7),
          repairCostMonth: Math.round(cost * 0.3),
          utilization: Math.min(100, Math.round((Number(r.hours_month ?? 0) / 200) * 100)),
          odometer: 0,
          lastService: (r.last_service as string) ?? new Date().toISOString(),
        };
      });
    },
  });
}

export function useInsertMachine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; code?: string; type?: string; project_id?: string | null }) => {
      const { data, error } = await supabase.from("assets").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}
