import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Users, UserCheck, Wallet, Coins, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { type EmployeeStatus } from "@/data/mock";
import { useEmployees } from "@/hooks/queries/useEmployees";
import { useProjectsList } from "@/hooks/queries/useProjectsList";
import { formatDA } from "@/lib/format";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
  boxShadow: "var(--shadow-md)",
};

const STATUS_FILTERS: (EmployeeStatus | "all")[] = ["all", "active", "leave", "inactive"];

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--gold))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--error))",
  "hsl(var(--muted-foreground))",
];

export default function Employees() {
  const { t } = useTranslation();
  const { data: employeeRoster = [] } = useEmployees();
  const { data: projects = [] } = useProjectsList();
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "all">("all");

  const filtered = useMemo(
    () => (statusFilter === "all" ? employeeRoster : employeeRoster.filter((e) => e.status === statusFilter)),
    [statusFilter, employeeRoster],
  );

  const kpi = useMemo(() => {
    const headcount  = employeeRoster.length;
    const active     = employeeRoster.filter((e) => e.status === "active").length;
    const payroll    = employeeRoster.reduce((s, e) => s + (e.status === "active" ? e.baseSalary : 0), 0);
    const cash       = employeeRoster.reduce((s, e) => s + e.cashHeld, 0);
    const uncleared  = employeeRoster.filter((e) => e.cashHeld > 0).length;
    return { headcount, active, payroll, cash, uncleared };
  }, [employeeRoster]);

  const byRole = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of employeeRoster) totals[e.role] = (totals[e.role] ?? 0) + 1;
    return Object.entries(totals).map(([role, count]) => ({ role, count }));
  }, [employeeRoster]);

  const byProject = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of employeeRoster) {
      if (e.status === "inactive") continue;
      totals[e.projectId] = (totals[e.projectId] ?? 0) + 1;
    }
    return projects.map((p) => ({ name: p.code, full: p.name, count: totals[p.id] ?? 0 }));
  }, [employeeRoster, projects]);

  return (
    <div className="space-y-5">
      <PageHeader title={t("employees_page.title")} subtitle={t("employees_page.subtitle")} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiTile icon={<Users       className="h-4 w-4" />} tone="primary" label={t("employees_page.kpi.headcount")} value={String(kpi.headcount)} />
        <KpiTile icon={<UserCheck   className="h-4 w-4" />} tone="success" label={t("employees_page.kpi.active")}    value={String(kpi.active)} />
        <KpiTile icon={<Wallet      className="h-4 w-4" />} tone="gold"    label={t("employees_page.kpi.payroll")}   value={formatDA(kpi.payroll, { compact: true })} />
        <KpiTile icon={<Coins       className="h-4 w-4" />} tone="warning" label={t("employees_page.kpi.cash")}      value={formatDA(kpi.cash, { compact: true })} />
        <KpiTile icon={<AlertCircle className="h-4 w-4" />} tone="error"   label={t("employees_page.kpi.uncleared")} value={String(kpi.uncleared)} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              statusFilter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted/40",
            )}
          >
            {t(`employees_page.filter.${s}`)}
          </button>
        ))}
        <span className="ms-2 self-center text-xs text-muted-foreground font-mono-num">
          {filtered.length} {t("common2.results")}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Section className="lg:col-span-5" title={t("employees_page.by_role_title")} subtitle={t("employees_page.by_role_sub")}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byRole} dataKey="count" nameKey="role" cx="50%" cy="50%" innerRadius={56} outerRadius={94} paddingAngle={2} animationDuration={900}>
                  {byRole.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section className="lg:col-span-7" title={t("employees_page.by_project_title")} subtitle={t("employees_page.by_project_sub")}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProject} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barCategoryGap="24%">
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  labelFormatter={(l, p) => (p?.[0]?.payload?.full ?? l)} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={36} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title={t("employees_page.list_title")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pe-3">{t("employees_page.col.name")}</th>
                <th className="px-3">{t("employees_page.col.role")}</th>
                <th className="px-3">{t("employees_page.col.project")}</th>
                <th className="px-3 text-end">{t("employees_page.col.days")}</th>
                <th className="px-3 text-end">{t("employees_page.col.salary")}</th>
                <th className="px-3 text-end">{t("employees_page.col.cash")}</th>
                <th className="px-3">{t("employees_page.col.phone")}</th>
                <th className="px-3">{t("employees_page.col.hire")}</th>
                <th className="ps-3 text-end">{t("employees_page.col.status")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const proj = projects.find((p) => p.id === e.projectId);
                const tone =
                  e.status === "active"   ? "bg-success/15 text-success" :
                  e.status === "leave"    ? "bg-warning/15 text-warning" :
                                            "bg-muted text-muted-foreground";
                return (
                  <tr key={e.id} className="border-b border-border/60 transition-colors hover:bg-muted/40">
                    <td className="py-2.5 pe-3 font-medium">{e.name}</td>
                    <td className="px-3 text-muted-foreground">{e.role}</td>
                    <td className="px-3 text-muted-foreground">{proj?.code ?? "—"}</td>
                    <td className="px-3 text-end font-mono-num">{e.daysWorkedMonth}</td>
                    <td className="px-3 text-end font-mono-num">{formatDA(e.baseSalary, { compact: true })}</td>
                    <td className={cn("px-3 text-end font-mono-num", e.cashHeld > 0 && "text-warning")}>
                      {e.cashHeld > 0 ? formatDA(e.cashHeld, { compact: true }) : "—"}
                    </td>
                    <td className="px-3 text-muted-foreground font-mono-num text-xs">{e.phone}</td>
                    <td className="px-3 text-muted-foreground font-mono-num text-xs">{e.hireDate}</td>
                    <td className="ps-3 text-end">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", tone)}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {t(`employees_page.status.${e.status}`)}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
