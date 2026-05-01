import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PayrollLine, PayrollStatus } from "@/data/mock";

/**
 * Payroll lines are derived from employees + payroll_runs. For the prototype we
 * generate one line per active employee using their base_salary and project.
 */
export function usePayrollLines() {
  return useQuery<PayrollLine[]>({
    queryKey: ["payroll_lines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name, role, project_id, base_salary, days_worked_month, status")
        .eq("status", "active");
      if (error) throw error;
      return (data ?? []).map((e, i) => {
        const base = Number(e.base_salary ?? 0);
        const days = Number(e.days_worked_month ?? 26);
        const planned = 26;
        const bonuses = 0;
        const advances = 0;
        const deductions = 0;
        const net = Math.round((base * days) / planned + bonuses - advances - deductions);
        return {
          id: `pl-${e.id}`,
          employeeId: String(e.id),
          name: e.name as string,
          role: (e.role as string) ?? "",
          projectId: String(e.project_id ?? ""),
          baseSalary: base,
          daysWorked: days,
          daysPlanned: planned,
          bonuses, advances, deductions, net,
          status: (i % 3 === 0 ? "draft" : i % 3 === 1 ? "validated" : "paid") as PayrollStatus,
        };
      });
    },
  });
}
