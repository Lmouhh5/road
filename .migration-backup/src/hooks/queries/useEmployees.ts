import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { EmployeeMeta, EmployeeStatus } from "@/data/mock";

export function useEmployees() {
  return useQuery<EmployeeMeta[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name, role, project_id, hire_date, phone, status, base_salary, cash_held, days_worked_month")
        .order("name");
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: String(r.id),
        name: r.name as string,
        role: (r.role as string) ?? "",
        projectId: String(r.project_id ?? ""),
        hireDate: (r.hire_date as string) ?? "",
        phone: (r.phone as string) ?? "",
        status: ((r.status as EmployeeStatus) ?? "active"),
        baseSalary: Number(r.base_salary ?? 0),
        cashHeld: Number(r.cash_held ?? 0),
        daysWorkedMonth: Number(r.days_worked_month ?? 0),
      }));
    },
  });
}

export function useInsertEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; role?: string; project_id?: string | null; phone?: string; base_salary?: number }) => {
      const { data, error } = await supabase.from("employees").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}
