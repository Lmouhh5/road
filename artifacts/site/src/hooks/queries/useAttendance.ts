import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AttendanceStatus, DailyAttendanceRow, AttendanceCell } from "@/data/mock";

const BASE = "/api";
const API_HEADERS = { "x-api-source": "routis-web" };

type AttendanceRecord = {
  id: string;
  employee_id: string | null;
  project_id: string | null;
  status: string;
  hours: number | null;
  attendance_date: string;
  employee_name: string | null;
  employee_role: string | null;
};

type HeatmapRecord = {
  attendance_date: string;
  status: string;
};

export function useTodayAttendance() {
  return useQuery<DailyAttendanceRow[]>({
    queryKey: ["attendance", "today"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const resp = await fetch(`${BASE}/attendance?attendance_date=${today}`, { headers: API_HEADERS, credentials: "include" });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json() as AttendanceRecord[];
      return data.map((r) => ({
        employeeId: String(r.employee_id ?? ""),
        name: r.employee_name ?? "",
        role: r.employee_role ?? "",
        projectId: String(r.project_id ?? ""),
        status: ((r.status as AttendanceStatus) ?? "present"),
        hours: Number(r.hours ?? 0),
      }));
    },
  });
}

export function useAttendanceHeatmap() {
  return useQuery<AttendanceCell[]>({
    queryKey: ["attendance", "heatmap"],
    queryFn: async () => {
      const resp = await fetch(`${BASE}/attendance/heatmap`, { headers: API_HEADERS, credentials: "include" });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json() as HeatmapRecord[];
      const buckets = new Map<string, AttendanceCell>();
      for (let i = 83; i >= 0; i--) {
        const dt = new Date();
        dt.setDate(dt.getDate() - i);
        const k = dt.toISOString().slice(0, 10);
        buckets.set(k, { date: k, present: 0, absent: 0, leave: 0 });
      }
      for (const r of data) {
        const cell = buckets.get(r.attendance_date);
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
    mutationFn: async (input: {
      employee_id?: string | null;
      project_id?: string | null;
      attendance_date?: string;
      status?: string;
      hours?: number;
      note?: string;
    }) => {
      const resp = await fetch(`${BASE}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...API_HEADERS },
        credentials: "include",
        body: JSON.stringify(input),
      });
      if (!resp.ok) throw new Error(await resp.text());
      return resp.json() as Promise<AttendanceRecord>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}
