import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Building2, Wallet, AlertCircle, Clock, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { useSuppliers, type SupplierRow } from "@/hooks/queries/useSuppliers";
import { useExpenses } from "@/hooks/queries/useExpenses";

type SupplierStatus = SupplierRow["status"];
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

const STATUS_FILTERS: (SupplierStatus | "all")[] = ["all", "ok", "balance", "overdue"];

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--gold))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--error))",
  "hsl(var(--muted-foreground))",
];

export default function Suppliers() {
  const { t } = useTranslation();
  const { data: suppliers = [] } = useSuppliers();
  const { data: expenses = [] } = useExpenses();
  const [statusFilter, setStatusFilter] = useState<SupplierStatus | "all">("all");

  // Aggregate supplier spend from expenses
  const enriched = useMemo(() => {
    const spend = new Map<string, number>();
    for (const e of expenses) spend.set(e.supplierId, (spend.get(e.supplierId) ?? 0) + e.amount);
    return suppliers.map((s) => ({ ...s, totalSpend: spend.get(s.id) ?? 0 }));
  }, [suppliers, expenses]);

  const rows = useMemo(
    () =>
      enriched
        .filter((r) => statusFilter === "all" || r.status === statusFilter)
        .sort((a, b) => b.totalSpend - a.totalSpend),
    [enriched, statusFilter],
  );

  const kpi = useMemo(() => {
    return {
      active: enriched.length,
      spend: enriched.reduce((s, x) => s + x.totalSpend, 0),
      outstanding: enriched.reduce((s, x) => s + x.outstanding, 0),
      overdue: enriched.filter((x) => x.status === "overdue").length,
      avgTerms: enriched.length ? Math.round(enriched.reduce((s, x) => s + x.paymentTerms, 0) / enriched.length) : 0,
    };
  }, [enriched]);

  const topData = useMemo(
    () =>
      [...enriched]
        .sort((a, b) => b.totalSpend - a.totalSpend)
        .slice(0, 8)
        .map((s) => ({ name: s.name, spend: s.totalSpend })),
    [enriched],
  );

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of expenses) totals[e.category] = (totals[e.category] ?? 0) + e.amount;
    return Object.entries(totals).map(([key, value]) => ({ key, value }));
  }, [expenses]);

  return (
    <div className="space-y-5">
      <PageHeader title={t("suppliers_page.title")} subtitle={t("suppliers_page.subtitle")} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiTile icon={<Building2  className="h-4 w-4" />} tone="primary" label={t("suppliers_page.kpi.active")}      value={String(kpi.active)} />
        <KpiTile icon={<Wallet     className="h-4 w-4" />} tone="gold"    label={t("suppliers_page.kpi.spend")}       value={formatDA(kpi.spend, { compact: true })} />
        <KpiTile icon={<AlertCircle className="h-4 w-4" />} tone="warning" label={t("suppliers_page.kpi.outstanding")} value={formatDA(kpi.outstanding, { compact: true })} />
        <KpiTile icon={<AlertCircle className="h-4 w-4" />} tone="error"   label={t("suppliers_page.kpi.overdue")}     value={String(kpi.overdue)} />
        <KpiTile icon={<Clock      className="h-4 w-4" />} tone="success" label={t("suppliers_page.kpi.avg_terms")}    value={`${kpi.avgTerms} j`} />
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
            {t(`suppliers_page.filter.${s}`)}
          </button>
        ))}
        <span className="ms-2 self-center text-xs text-muted-foreground font-mono-num">
          {rows.length} {t("common2.results")}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Section className="lg:col-span-7" title={t("suppliers_page.top_title")} subtitle={t("suppliers_page.top_sub")}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }} barCategoryGap="22%">
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v) => formatDA(Number(v), { compact: true }).replace(" DA", "")} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={140} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v)} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar dataKey="spend" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={20} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section className="lg:col-span-5" title={t("suppliers_page.category_title")} subtitle={t("suppliers_page.category_sub")}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="key" cx="50%" cy="50%" innerRadius={56} outerRadius={94} paddingAngle={2} animationDuration={900}>
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [formatDA(v), t(`categories.${n}`)]} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" formatter={(val) => t(`categories.${val}`)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title={t("suppliers_page.list_title")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pe-3">{t("suppliers_page.col.name")}</th>
                <th className="px-3">{t("suppliers_page.col.category")}</th>
                <th className="px-3">{t("suppliers_page.col.city")}</th>
                <th className="px-3 text-end">{t("suppliers_page.col.spend")}</th>
                <th className="px-3 text-end">{t("suppliers_page.col.outstanding")}</th>
                <th className="px-3 text-end">{t("suppliers_page.col.invoices")}</th>
                <th className="px-3 text-end">{t("suppliers_page.col.terms")}</th>
                <th className="px-3">{t("suppliers_page.col.contact")}</th>
                <th className="ps-3 text-end">{t("suppliers_page.col.status")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const tone =
                  r.status === "ok"      ? "bg-success/15 text-success" :
                  r.status === "balance" ? "bg-warning/15 text-warning" :
                                           "bg-error/15 text-error";
                return (
                  <tr key={r.id} className="border-b border-border/60 transition-colors hover:bg-muted/40">
                    <td className="py-2.5 pe-3 font-medium">{r.name}</td>
                    <td className="px-3 text-muted-foreground">{t(`categories.${r.category}`)}</td>
                    <td className="px-3 text-muted-foreground">{r.city}</td>
                    <td className="px-3 text-end font-mono-num">{formatDA(r.totalSpend, { compact: true })}</td>
                    <td className={cn("px-3 text-end font-mono-num", r.outstanding > 0 && "text-warning")}>
                      {formatDA(r.outstanding, { compact: true })}
                    </td>
                    <td className="px-3 text-end font-mono-num">{r.invoicesCount}</td>
                    <td className="px-3 text-end font-mono-num">{r.paymentTerms} j</td>
                    <td className="px-3 text-muted-foreground font-mono-num text-xs">{r.contact}</td>
                    <td className="ps-3 text-end">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", tone)}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {t(`suppliers_page.status.${r.status}`)}
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
