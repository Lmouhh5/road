import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AttendanceStatus, DailyAttendanceRow, AttendanceCell } from "@/data/mock";

export function useTodayAttendance() {
  return useQuery<DailyAttendanceRow[]>({
    queryKey: ["attendance", "today"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("attendance")
        .select("id, employee_id, project_id, status, hours, attendance_date, employees(name, role)")
        .eq("attendance_date", today);
      if (error) throw error;
      return (data ?? []).map((r) => {
        const emp = (r as unknown as { employees?: { name: string; role: string } }).employees;
        return {
          employeeId: String(r.employee_id ?? ""),
          name: emp?.name ?? "",
          role: emp?.role ?? "",
          projectId: String(r.project_id ?? ""),
          status: ((r.status as AttendanceStatus) ?? "present"),
          hours: Number(r.hours ?? 0),
        };
      });
    },
  });
}

export function useAttendanceHeatmap() {
  return useQuery<AttendanceCell[]>({
    queryKey: ["attendance", "heatmap"],
    queryFn: async () => {
      const start = new Date();
      start.setDate(start.getDate() - 83);
      const { data, error } = await supabase
        .from("attendance")
        .select("attendance_date, status")
        .gte("attendance_date", start.toISOString().slice(0, 10));
      if (error) throw error;
      const buckets = new Map<string, AttendanceCell>();
      for (let i = 83; i >= 0; i--) {
        const dt = new Date();
        dt.setDate(dt.getDate() - i);
        const k = dt.toISOString().slice(0, 10);
        buckets.set(k, { date: k, present: 0, absent: 0, leave: 0 });
      }
      for (const r of data ?? []) {
        const k = r.attendance_date as string;
        const cell = buckets.get(k);
        if (!cell) continue;
        if (r.status === "present") cell.present += 1;
        else if (r.status === "absent") cell.absent += 1;
        else if (r.status === "leave") cell.leave += 1;
      }
      return Array.from(buckets.values());
    },
  });
}

export function useInsertAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { employee_id?: string | null; project_id?: string | null; attendance_date?: string; status?: string; hours?: number; note?: string }) => {
      const { data, error } = await supabase.from("attendance").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}
