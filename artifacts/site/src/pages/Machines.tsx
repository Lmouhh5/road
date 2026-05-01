import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, Cell,
} from "recharts";
import { Truck, Fuel, Wrench, Activity, AlertOctagon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { fuelTrend, type MachineStatus } from "@/data/mock";
import { useMachines } from "@/hooks/queries/useMachines";
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

const STATUS_FILTERS: (MachineStatus | "all")[] = ["all", "active", "idle", "repair"];
const FUEL_LINES = [
  { key: "CAM-21", color: "hsl(var(--primary))" },
  { key: "PEL-07", color: "hsl(var(--gold))" },
  { key: "PEL-08", color: "hsl(var(--warning))" },
  { key: "CHA-09", color: "hsl(var(--success))" },
];

export default function Machines() {
  const { t } = useTranslation();
  const { data: machines = [] } = useMachines();
  const { data: projects = [] } = useProjectsList();
  const [statusFilter, setStatusFilter] = useState<MachineStatus | "all">("all");

  const filtered = useMemo(
    () => (statusFilter === "all" ? machines : machines.filter((m) => m.status === statusFilter)),
    [statusFilter, machines],
  );

  const kpi = useMemo(() => {
    const fleet       = machines.filter((m) => m.status !== "inactive" as never).length;
    const fuelCost    = machines.reduce((s, m) => s + m.fuelCostMonth, 0);
    const repairCost  = machines.reduce((s, m) => s + m.repairCostMonth, 0);
    const utilization = machines.length ? machines.reduce((s, m) => s + m.utilization, 0) / machines.length : 0;
    const downtime    = machines.filter((m) => m.status === "repair").length;
    return { fleet, fuelCost, repairCost, utilization, downtime };
  }, [machines]);

  const costData = useMemo(
    () =>
      [...filtered]
        .map((m) => ({
          name: m.code,
          full: m.name,
          fuel: m.fuelCostMonth,
          repair: m.repairCostMonth,
          total: m.fuelCostMonth + m.repairCostMonth,
        }))
        .sort((a, b) => b.total - a.total),
    [filtered],
  );

  return (
    <div className="space-y-5">
      <PageHeader title={t("machines_page.title")} subtitle={t("machines_page.subtitle")} />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiTile icon={<Truck       className="h-4 w-4" />} tone="primary" label={t("machines_page.kpi.fleet")}       value={String(kpi.fleet)} />
        <KpiTile icon={<Fuel        className="h-4 w-4" />} tone="gold"    label={t("machines_page.kpi.fuel_cost")}   value={formatDA(kpi.fuelCost,   { compact: true })} />
        <KpiTile icon={<Wrench      className="h-4 w-4" />} tone="warning" label={t("machines_page.kpi.repair_cost")} value={formatDA(kpi.repairCost, { compact: true })} />
        <KpiTile icon={<Activity    className="h-4 w-4" />} tone="success" label={t("machines_page.kpi.utilization")} value={`${kpi.utilization.toFixed(0)}%`} />
        <KpiTile icon={<AlertOctagon className="h-4 w-4" />} tone="error"  label={t("machines_page.kpi.downtime")}    value={String(kpi.downtime)} />
      </div>

      {/* Filters */}
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
            {t(`machines_page.filter.${s}`)}
          </button>
        ))}
        <span className="ms-2 self-center text-xs text-muted-foreground font-mono-num">
          {filtered.length} {t("common2.results")}
        </span>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Section className="lg:col-span-7" title={t("machines_page.fuel_trend_title")} subtitle={t("machines_page.fuel_trend_sub")}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fuelTrend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} unit=" L" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                {FUEL_LINES.map((l) => (
                  <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2} dot={false} animationDuration={800} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section className="lg:col-span-5" title={t("machines_page.cost_rank_title")} subtitle={t("machines_page.cost_rank_sub")}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }} barCategoryGap="20%">
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v) => formatDA(Number(v), { compact: true }).replace(" DA", "")} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={56} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v)} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                <Bar dataKey="fuel"   stackId="a" name={t("categories.fuel")}    fill="hsl(var(--gold))"    radius={[0, 0, 0, 0]} maxBarSize={16} animationDuration={800} />
                <Bar dataKey="repair" stackId="a" name={t("categories.repairs")} fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} maxBarSize={16} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* List */}
      <Section title={t("machines_page.list_title")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pe-3">{t("machines_page.col.machine")}</th>
                <th className="px-3">{t("machines_page.col.kind")}</th>
                <th className="px-3">{t("machines_page.col.project")}</th>
                <th className="px-3 text-end">{t("machines_page.col.hours")}</th>
                <th className="px-3 text-end">{t("machines_page.col.fuel_l")}</th>
                <th className="px-3 text-end">{t("machines_page.col.fuel_cost")}</th>
                <th className="px-3 text-end">{t("machines_page.col.repair")}</th>
                <th className="px-3 text-end">{t("machines_page.col.utilization")}</th>
                <th className="ps-3 text-end">{t("machines_page.col.status")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const proj = projects.find((p) => p.id === m.projectId);
                const tone =
                  m.status === "active" ? "bg-success/15 text-success" :
                  m.status === "idle"   ? "bg-warning/15 text-warning" :
                                          "bg-error/15 text-error";
                const utilTone =
                  m.utilization >= 70 ? "bg-success" :
                  m.utilization >= 40 ? "bg-warning" : "bg-error";
                return (
                  <tr key={m.id} className="border-b border-border/60 transition-colors hover:bg-muted/40">
                    <td className="py-2.5 pe-3">
                      <div className="font-medium">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono-num">{m.code}</div>
                    </td>
                    <td className="px-3 text-muted-foreground">{t(`machines_page.kind.${m.kind}`)}</td>
                    <td className="px-3 text-muted-foreground">{proj?.code ?? "—"}</td>
                    <td className="px-3 text-end font-mono-num">{m.hoursMonth}</td>
                    <td className="px-3 text-end font-mono-num">{m.fuelMonth.toLocaleString()}</td>
                    <td className="px-3 text-end font-mono-num">{formatDA(m.fuelCostMonth, { compact: true })}</td>
                    <td className="px-3 text-end font-mono-num">{formatDA(m.repairCostMonth, { compact: true })}</td>
                    <td className="px-3 text-end">
                      <div className="font-mono-num">{m.utilization}%</div>
                      <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-muted ms-auto">
                        <div className={cn("h-full rounded-full", utilTone)} style={{ width: `${m.utilization}%` }} />
                      </div>
                    </td>
                    <td className="ps-3 text-end">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", tone)}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {t(`machines_page.status.${m.status}`)}
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
