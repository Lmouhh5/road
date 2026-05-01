import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, PieChart, Pie, Cell, BarChart,
} from "recharts";
import {
  TrendingUp, TrendingDown, Wallet, Percent, FileText, FileSpreadsheet,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { expenseCategoryKeys, type ExpenseCategory } from "@/data/mock";
import { useProjectFinancialSummary } from "@/hooks/queries/useProjectFinancialSummary";
import { useMonthlyCashflow, useExpenseDistribution } from "@/hooks/queries/useDerived";
import { formatDA, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
  boxShadow: "var(--shadow-md)",
};

const CAT_COLORS: Record<ExpenseCategory, string> = {
  fuel:           "hsl(var(--gold))",
  labor:          "hsl(var(--primary))",
  materials:      "hsl(var(--primary-glow))",
  repairs:        "hsl(var(--warning))",
  transport:      "hsl(var(--success))",
  subcontracting: "hsl(var(--error))",
  other:          "hsl(var(--muted-foreground))",
};

export default function Reports() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<"6m" | "12m" | "ytd">("6m");
  const monthlyCashflow = useMonthlyCashflow();
  const expenseDistribution = useExpenseDistribution();
  const { data: projects = [] } = useProjectFinancialSummary();

  const totals = useMemo(() => {
    const revenue  = monthlyCashflow.reduce((s, m) => s + m.revenue, 0);
    const expenses = monthlyCashflow.reduce((s, m) => s + m.expenses, 0);
    const net = revenue - expenses;
    const margin = revenue > 0 ? (net / revenue) * 100 : 0;
    return { revenue, expenses, net, margin };
  }, [monthlyCashflow]);

  const marginSeries = useMemo(
    () =>
      monthlyCashflow.map((m) => ({
        month: m.month,
        margin: m.revenue > 0 ? +((m.profit / m.revenue) * 100).toFixed(1) : 0,
      })),
    [monthlyCashflow],
  );

  const expenseSplit = useMemo(
    () =>
      expenseDistribution.map((s) => ({
        key: s.key,
        label: t(`categories.${s.key}`),
        value: s.value,
        color: CAT_COLORS[s.key as ExpenseCategory] ?? "hsl(var(--muted-foreground))",
      })),
    [t, expenseDistribution],
  );

  const projectPerf = useMemo(
    () =>
      projects.map((p) => ({
        code: p.code,
        consumed: p.budget > 0 ? +((p.spent / p.budget) * 100).toFixed(1) : 0,
        margin: p.margin,
      })),
    [projects],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("reports_page.title")}
        subtitle={t("reports_page.subtitle")}
        action={
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="6m">{t("reports_page.period_6m")}</SelectItem>
                <SelectItem value="12m">{t("reports_page.period_12m")}</SelectItem>
                <SelectItem value="ytd">{t("reports_page.period_ytd")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2"><FileText className="h-4 w-4" />{t("reports_page.export_pdf")}</Button>
            <Button variant="outline" className="gap-2"><FileSpreadsheet className="h-4 w-4" />{t("reports_page.export_xlsx")}</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile icon={<TrendingUp   className="h-4 w-4" />} tone="success" label={t("reports_page.kpi.revenue")}  value={formatDA(totals.revenue,  { compact: true })} />
        <KpiTile icon={<TrendingDown className="h-4 w-4" />} tone="warning" label={t("reports_page.kpi.expenses")} value={formatDA(totals.expenses, { compact: true })} />
        <KpiTile icon={<Wallet       className="h-4 w-4" />} tone="primary" label={t("reports_page.kpi.net")}      value={formatDA(totals.net,      { compact: true })} />
        <KpiTile icon={<Percent      className="h-4 w-4" />} tone="gold"    label={t("reports_page.kpi.margin")}   value={`${totals.margin.toFixed(1)}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Section className="lg:col-span-8" title={t("reports_page.pl_title")} subtitle={t("reports_page.pl_sub")}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyCashflow} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => formatDA(Number(v), { compact: true }).replace(" DA", "")} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue"  name={t("reports_page.table_revenue")}  fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={800} />
                <Bar dataKey="expenses" name={t("reports_page.table_expenses")} fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={800} />
                <Line type="monotone" dataKey="profit" name={t("reports_page.table_profit")} stroke="hsl(var(--success))" strokeWidth={2.5} dot={{ r: 3 }} animationDuration={1000} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section className="lg:col-span-4" title={t("reports_page.split_title")} subtitle={t("reports_page.split_sub")}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseSplit} dataKey="value" nameKey="label" innerRadius={56} outerRadius={92} paddingAngle={2} animationDuration={800}>
                  {expenseSplit.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v, { compact: true })} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
              {expenseSplit.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5 truncate">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span className="truncate">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section className="lg:col-span-7" title={t("reports_page.margin_title")} subtitle={t("reports_page.margin_sub")}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marginSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g-mg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="hsl(var(--success))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
                <Area type="monotone" dataKey="margin" stroke="hsl(var(--success))" fill="url(#g-mg)" strokeWidth={2.5} animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section className="lg:col-span-5" title={t("reports_page.project_title")} subtitle={t("reports_page.project_sub")}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectPerf} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                <YAxis type="category" dataKey="code" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={88} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar dataKey="consumed" name={t("dashboard.projects.spent")} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={14} animationDuration={800} />
                <Bar dataKey="margin"   name={t("dashboard.projects.margin")} fill="hsl(var(--gold))"   radius={[0, 4, 4, 0]} maxBarSize={14} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title={t("reports_page.pl_title")}>
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2">{t("reports_page.table_month")}</th>
                <th className="px-3 py-2 text-end">{t("reports_page.table_revenue")}</th>
                <th className="px-3 py-2 text-end">{t("reports_page.table_expenses")}</th>
                <th className="px-3 py-2 text-end">{t("reports_page.table_profit")}</th>
                <th className="px-3 py-2 text-end">{t("reports_page.table_margin")}</th>
              </tr>
            </thead>
            <tbody>
              {monthlyCashflow.map((m) => {
                const margin = m.revenue > 0 ? (m.profit / m.revenue) * 100 : 0;
                const isPositive = m.profit >= 0;
                return (
                  <tr key={m.month} className="border-t border-border/60 transition-colors hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono-num text-xs">{m.month}</td>
                    <td className="px-3 py-2 text-end font-mono-num">{formatDA(m.revenue, { compact: true })}</td>
                    <td className="px-3 py-2 text-end font-mono-num">{formatDA(m.expenses, { compact: true })}</td>
                    <td className={cn("px-3 py-2 text-end font-mono-num font-semibold", isPositive ? "text-success" : "text-error")}>{formatDA(m.profit, { compact: true })}</td>
                    <td className={cn("px-3 py-2 text-end font-mono-num", isPositive ? "text-success" : "text-error")}>{formatPct(margin)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-muted/30">
              <tr className="border-t border-border/60">
                <td className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Σ</td>
                <td className="px-3 py-2 text-end font-mono-num font-bold">{formatDA(totals.revenue, { compact: true })}</td>
                <td className="px-3 py-2 text-end font-mono-num font-bold">{formatDA(totals.expenses, { compact: true })}</td>
                <td className="px-3 py-2 text-end font-mono-num font-bold text-success">{formatDA(totals.net, { compact: true })}</td>
                <td className="px-3 py-2 text-end font-mono-num font-bold text-success">{totals.margin.toFixed(1)}%</td>
              </tr>
            </tfoot>
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