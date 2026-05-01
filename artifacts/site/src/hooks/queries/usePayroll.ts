import { useQuery } from "@tanstack/react-query";
import type { PayrollLine, PayrollStatus } from "@/data/mock";

const BASE = "/api";

/**
 * Payroll lines are derived from active employees.
 * Fetches only employees with status="active" via the server-side filter.
 */
export function usePayrollLines() {
  return useQuery<PayrollLine[]>({
    queryKey: ["payroll_lines"],
    queryFn: async () => {
      const resp = await fetch(`${BASE}/employees?status=active`, { credentials: "include" });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json() as Array<{
        id: string;
        name: string;
        role: string | null;
        project_id: string | null;
        base_salary: string | number | null;
        days_worked_month: number | null;
        status: string | null;
      }>;
      return data.map((e, i) => {
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
          name: e.name,
          role: e.role ?? "",
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
