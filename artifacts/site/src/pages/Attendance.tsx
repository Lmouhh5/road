import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  UserCheck, UserX, Plane, Percent, Search,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { type AttendanceStatus, type AttendanceCell } from "@/data/mock";
import { useTodayAttendance, useAttendanceHeatmap } from "@/hooks/queries/useAttendance";
import { useProjectsList } from "@/hooks/queries/useProjectsList";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
  boxShadow: "var(--shadow-md)",
};

const STATUS_TONE: Record<AttendanceStatus, string> = {
  present: "bg-success/15 text-success",
  absent:  "bg-error/15 text-error",
  leave:   "bg-gold/15 text-gold",
  rest:    "bg-muted text-muted-foreground",
};

/** Group heatmap into 12 columns (weeks) of 7 rows (days), aligned so latest day is bottom-right. */
function buildHeatGrid(cells: AttendanceCell[]) {
  if (cells.length === 0) return [];
  const first = new Date(cells[0].date + "T00:00:00");
  const firstDow = first.getDay();
  const padded: (AttendanceCell | null)[] = [];
  for (let i = 0; i < firstDow; i++) padded.push(null);
  cells.forEach((c) => padded.push(c));
  while (padded.length % 7 !== 0) padded.push(null);
  const weeks: (AttendanceCell | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }
  return weeks;
}

function intensity(present: number, max: number) {
  if (present === 0) return 0;
  const r = present / max;
  if (r < 0.25) return 1;
  if (r < 0.5)  return 2;
  if (r < 0.75) return 3;
  if (r < 0.95) return 4;
  return 5;
}

const HEAT_LEVELS = [
  "bg-muted/40",            // 0 - rest/no data
  "bg-success/15",          // 1
  "bg-success/30",          // 2
  "bg-success/50",          // 3
  "bg-success/75",          // 4
  "bg-success",             // 5
];

export default function Attendance() {
  const { t } = useTranslation();
  const { data: todayAttendance = [] } = useTodayAttendance();
  const { data: attendanceHeatmap = [] } = useAttendanceHeatmap();
  const { data: projects = [] } = useProjectsList();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AttendanceStatus | "all">("all");
  const [project, setProject] = useState<string>("all");

  const projectCode = (id: string) => projects.find((p) => p.id === id)?.code ?? id;

  const filtered = useMemo(
    () =>
      todayAttendance.filter((r) => {
        if (status !== "all" && r.status !== status) return false;
        if (project !== "all" && r.projectId !== project) return false;
        if (q && !`${r.name} ${r.role}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [status, project, q, todayAttendance, projects],
  );

  const kpi = useMemo(() => {
    const present = todayAttendance.filter((r) => r.status === "present").length;
    const absent  = todayAttendance.filter((r) => r.status === "absent").length;
    const leave   = todayAttendance.filter((r) => r.status === "leave").length;
    const total = present + absent + leave;
    const rate = total > 0 ? (present / total) * 100 : 0;
    return { present, absent, leave, rate };
  }, [todayAttendance]);

  const trend = useMemo(
    () =>
      attendanceHeatmap.slice(-30).map((c) => ({
        date: c.date.slice(5),
        present: c.present,
        absent: c.absent,
        leave: c.leave,
      })),
    [attendanceHeatmap],
  );

  const grid = useMemo(() => buildHeatGrid(attendanceHeatmap), [attendanceHeatmap]);
  const maxPresent = useMemo(
    () => Math.max(1, ...attendanceHeatmap.map((c) => c.present)),
    [attendanceHeatmap],
  );

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("attendance_page.title")}
        subtitle={t("attendance_page.subtitle")}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile icon={<UserCheck className="h-4 w-4" />} tone="success" label={t("attendance_page.kpi.present")} value={String(kpi.present)} />
        <KpiTile icon={<UserX     className="h-4 w-4" />} tone="error"   label={t("attendance_page.kpi.absent")}  value={String(kpi.absent)} />
        <KpiTile icon={<Plane     className="h-4 w-4" />} tone="gold"    label={t("attendance_page.kpi.leave")}   value={String(kpi.leave)} />
        <KpiTile icon={<Percent   className="h-4 w-4" />} tone="primary" label={t("attendance_page.kpi.rate")}    value={`${kpi.rate.toFixed(0)}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Section className="lg:col-span-7" title={t("attendance_page.heatmap_title")} subtitle={t("attendance_page.heatmap_sub")}>
          <div className="flex items-start gap-2 overflow-x-auto pb-2">
            <div className="flex flex-col gap-[3px] pe-1 pt-[2px] text-[10px] text-muted-foreground">
              {dayLabels.map((d, i) => (
                <div key={i} className="grid h-3 w-3 place-items-center">{i % 2 === 1 ? d : ""}</div>
              ))}
            </div>
            <div className="flex gap-[3px]">
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((cell, di) => {
                    if (!cell) return <div key={di} className="h-3 w-3 rounded-[2px]" />;
                    const lvl = intensity(cell.present, maxPresent);
                    return (
                      <div
                        key={di}
                        className={cn("h-3 w-3 rounded-[2px] transition-all hover:ring-1 hover:ring-primary", HEAT_LEVELS[lvl])}
                        title={`${cell.date} · ${cell.present} ${t("attendance_status.present").toLowerCase()}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{t("attendance_page.less")}</span>
            <div className="flex gap-[3px]">
              {HEAT_LEVELS.map((c, i) => (
                <div key={i} className={cn("h-3 w-3 rounded-[2px]", c)} />
              ))}
            </div>
            <span>{t("attendance_page.more")}</span>
          </div>
        </Section>

        <Section className="lg:col-span-5" title={t("attendance_page.trend_title")} subtitle={t("attendance_page.trend_sub")}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g-pres" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="hsl(var(--success))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="g-abs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="hsl(var(--error))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--error))" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="present" name={t("attendance_status.present")} stroke="hsl(var(--success))" fill="url(#g-pres)" strokeWidth={2} animationDuration={800} />
                <Area type="monotone" dataKey="absent"  name={t("attendance_status.absent")}  stroke="hsl(var(--error))"   fill="url(#g-abs)"  strokeWidth={2} animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title={t("attendance_page.today_title")} subtitle={t("attendance_page.today_sub")}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common2.search")} className="ps-9 h-9" />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as AttendanceStatus | "all")}>
            <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("attendance_page.all_statuses")}</SelectItem>
              <SelectItem value="present">{t("attendance_status.present")}</SelectItem>
              <SelectItem value="absent">{t("attendance_status.absent")}</SelectItem>
              <SelectItem value="leave">{t("attendance_status.leave")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={project} onValueChange={setProject}>
            <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("attendance_page.all_projects")}</SelectItem>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.code}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="ms-auto text-xs text-muted-foreground font-mono-num">
            {formatDate(new Date())} · {filtered.length} {t("common2.results")}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2">{t("payroll_page.employee")}</th>
                <th className="px-3 py-2">{t("payroll_page.role")}</th>
                <th className="px-3 py-2">{t("payroll_page.project")}</th>
                <th className="px-3 py-2">{t("attendance_page.check_in")}</th>
                <th className="px-3 py-2">{t("attendance_page.check_out")}</th>
                <th className="px-3 py-2 text-end">{t("attendance_page.hours")}</th>
                <th className="px-3 py-2">{t("payroll_page.status")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.employeeId} className="border-t border-border/60 transition-colors hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{r.name}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{r.role}</td>
                  <td className="px-3 py-2 font-mono-num text-xs">{projectCode(r.projectId)}</td>
                  <td className="px-3 py-2 font-mono-num text-xs">{r.checkIn ?? "—"}</td>
                  <td className="px-3 py-2 font-mono-num text-xs">{r.checkOut ?? "—"}</td>
                  <td className="px-3 py-2 text-end font-mono-num font-semibold">{r.hours || "—"}</td>
                  <td className="px-3 py-2">
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_TONE[r.status])}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {t(`attendance_status.${r.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">{t("common.no_data")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function KpiTile({ icon, tone, label, value }: { icon: React.ReactNode; tone: "primary" | "warning" | "success" | "gold" | "error"; label: string; value: string }) {
  const map = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
    gold:    "bg-gold/15 text-gold",
    error:   "bg-error/15 text-error",
  } as const;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-elev-sm">
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", map[tone])}>{icon}</span>
      <div className="min-w-0">
        <div className="font-mono-num text-lg font-bold leading-none tracking-tight">{value}</div>
        <div className="mt-1 truncate text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}