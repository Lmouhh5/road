import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Line, ComposedChart, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  TrendingUp, Receipt, Coins, Wallet, FileWarning,
  AlertCircle, FileX2, Clock, Fuel,
} from "lucide-react";
import { KpiCard } from "@/components/kpi/KpiCard";
import { Section } from "@/components/Section";
import { kpis, sparks, alertSummary } from "@/data/mock";
import { useProjectFinancialSummary } from "@/hooks/queries/useProjectFinancialSummary";
import { useMonthlyCashflow, useExpenseDistribution } from "@/hooks/queries/useDerived";
import { formatDA } from "@/lib/format";
import { cn } from "@/lib/utils";

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--gold))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--error))",
  "hsl(var(--primary-glow))",
  "hsl(var(--muted-foreground))",
];

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
  boxShadow: "var(--shadow-md)",
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { data: projects = [] } = useProjectFinancialSummary();
  const monthlyCashflow = useMonthlyCashflow();
  const expenseDistribution = useExpenseDistribution();

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-[22px]">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="font-medium">{t("common.this_month")}</span>
          <span className="text-muted-foreground">· {t("common.vs_prev")}</span>
        </div>
      </header>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label={t("dashboard.kpi.revenue")}
          value={kpis.revenue.value} delta={kpis.revenue.delta}
          format={(n) => formatDA(n, { compact: true })}
          tone="gold" spark={sparks.revenue}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          label={t("dashboard.kpi.expenses")}
          value={kpis.expenses.value} delta={kpis.expenses.delta} invertDelta
          format={(n) => formatDA(n, { compact: true })}
          tone="warning" spark={sparks.expenses}
          icon={<Receipt className="h-4 w-4" />}
        />
        <KpiCard
          label={t("dashboard.kpi.profit")}
          value={kpis.profit.value} delta={kpis.profit.delta}
          format={(n) => formatDA(n, { compact: true })}
          tone="success" spark={sparks.profit}
          icon={<Coins className="h-4 w-4" />}
        />
        <KpiCard
          label={t("dashboard.kpi.uncleared")}
          value={kpis.uncleared.value} delta={kpis.uncleared.delta} invertDelta
          format={(n) => formatDA(n, { compact: true })}
          tone="warning" spark={sparks.uncleared}
          icon={<Wallet className="h-4 w-4" />}
        />
        <KpiCard
          label={t("dashboard.kpi.missing_proof")}
          value={kpis.missingProof.value} delta={kpis.missingProof.delta} invertDelta
          format={(n) => Math.round(n).toString()}
          tone="error" spark={sparks.missingProof}
          icon={<FileWarning className="h-4 w-4" />}
        />
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Section
          className="lg:col-span-7"
          title={t("dashboard.charts.cashflow_title")}
          subtitle={t("dashboard.charts.cashflow_sub")}
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyCashflow} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))" fontSize={11}
                  tickLine={false} axisLine={false}
                  tickFormatter={(v) => formatDA(Number(v), { compact: true }).replace(" DA", "")}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => formatDA(v)}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
                <Bar dataKey="revenue"  name={t("dashboard.kpi.revenue")}  fill="hsl(var(--gold))"    radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={800} />
                <Bar dataKey="expenses" name={t("dashboard.kpi.expenses")} fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={800} />
                <Line type="monotone" dataKey="profit" name={t("dashboard.kpi.profit")} stroke="hsl(var(--success))" strokeWidth={2.5} dot={{ r: 3 }} animationDuration={1000} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section
          className="lg:col-span-5"
          title={t("dashboard.charts.expense_dist_title")}
          subtitle={t("dashboard.charts.expense_dist_sub")}
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v)} />
                <Pie
                  data={expenseDistribution.map((d) => ({ name: t(`categories.${d.key}`), value: d.value }))}
                  innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value"
                  stroke="hsl(var(--card))" strokeWidth={2}
                  animationDuration={800}
                >
                  {expenseDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  iconType="circle"
                  layout="vertical" verticalAlign="middle" align="right"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section
          className="lg:col-span-12"
          title={t("dashboard.charts.project_status_title")}
          subtitle={t("dashboard.charts.project_status_sub")}
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projects.map((p) => ({
                  name: p.code,
                  full: p.name,
                  pct: Math.round((p.spent / p.budget) * 100),
                }))}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={84} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  formatter={(v: number) => `${v}%`}
                  labelFormatter={(_, p) => (p?.[0]?.payload as { full: string })?.full ?? ""}
                />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]} maxBarSize={18} animationDuration={800}>
                  {projects.map((p, i) => {
                    const pct = (p.spent / p.budget) * 100;
                    const fill = pct > 95 ? "hsl(var(--error))" : pct > 80 ? "hsl(var(--warning))" : "hsl(var(--primary))";
                    return <Cell key={i} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* PROJECTS TABLE */}
      <Section title={t("dashboard.projects.title")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pe-3">{t("dashboard.projects.name")}</th>
                <th className="px-3 text-end">{t("dashboard.projects.budget")}</th>
                <th className="px-3 text-end">{t("dashboard.projects.spent")}</th>
                <th className="px-3 text-end">{t("dashboard.projects.remaining")}</th>
                <th className="px-3 text-end">{t("dashboard.projects.margin")}</th>
                <th className="ps-3 text-end">{t("dashboard.projects.status")}</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const remaining = p.budget - p.spent;
                const pct = (p.spent / p.budget) * 100;
                return (
                  <tr key={p.id} className="border-b border-border/60 transition-colors hover:bg-muted/40">
                    <td className="py-2.5 pe-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{p.code}</div>
                    </td>
                    <td className="px-3 text-end font-mono-num">{formatDA(p.budget, { compact: true })}</td>
                    <td className="px-3 text-end font-mono-num">
                      <div>{formatDA(p.spent, { compact: true })}</div>
                      <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-muted ms-auto">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            pct > 95 ? "bg-error" : pct > 80 ? "bg-warning" : "bg-primary",
                          )}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-3 text-end font-mono-num">{formatDA(remaining, { compact: true })}</td>
                    <td className={cn("px-3 text-end font-mono-num font-semibold",
                      p.margin < 5 ? "text-error" : p.margin < 10 ? "text-warning" : "text-success")}>
                      {p.margin.toFixed(1)}%
                    </td>
                    <td className="ps-3 text-end">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ALERT BAR */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AlertCard tone="error"   icon={<AlertCircle className="h-4 w-4" />} count={alertSummary.uncleared}    label={t("dashboard.alerts.uncleared")} />
        <AlertCard tone="error"   icon={<FileX2 className="h-4 w-4" />}      count={alertSummary.missingProof} label={t("dashboard.alerts.missing_proof")} />
        <AlertCard tone="warning" icon={<Clock className="h-4 w-4" />}       count={alertSummary.overdue}      label={t("dashboard.alerts.overdue")} />
        <AlertCard tone="warning" icon={<Fuel className="h-4 w-4" />}        count={alertSummary.fuel}         label={t("dashboard.alerts.fuel")} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "on_track" | "at_risk" | "delayed" }) {
  const map = {
    on_track: { cls: "bg-success/15 text-success",   key: "dashboard.status.on_track" },
    at_risk:  { cls: "bg-warning/15 text-warning",   key: "dashboard.status.at_risk" },
    delayed:  { cls: "bg-error/15 text-error",       key: "dashboard.status.delayed" },
  } as const;
  const { cls, key } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {/* eslint-disable-next-line @typescript-eslint/no-require-imports */}
      <TranslatedKey k={key} />
    </span>
  );
}

function TranslatedKey({ k }: { k: string }) {
  const { t } = useTranslation();
  return <>{t(k)}</>;
}

function AlertCard({ tone, icon, count, label }: { tone: "error" | "warning"; icon: React.ReactNode; count: number; label: string }) {
  return (
    <button
      type="button"
      className={cn(
        "group flex items-center gap-3 rounded-xl border bg-card p-4 text-start shadow-elev-sm transition hover:shadow-elev-md",
        tone === "error" ? "border-error/40" : "border-warning/40",
      )}
    >
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
          tone === "error" ? "bg-error/15 text-error" : "bg-warning/15 text-warning",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono-num text-xl font-bold leading-none tracking-tight">{count}</div>
        <div className="mt-1 truncate text-xs text-muted-foreground">{label}</div>
      </div>
    </button>
  );
}