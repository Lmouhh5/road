import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend,
} from "recharts";
import {
  FileText, Wallet, Hourglass, AlertOctagon, Download, Search,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { monthlyRevenue, type InvoiceStatus } from "@/data/mock";
import { useInvoices } from "@/hooks/queries/useInvoices";
import { useProjectsList } from "@/hooks/queries/useProjectsList";
import { formatDA, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
  boxShadow: "var(--shadow-md)",
};

const STATUS_TONE: Record<InvoiceStatus, string> = {
  paid:    "bg-success/15 text-success",
  partial: "bg-primary/10 text-primary",
  pending: "bg-warning/15 text-warning",
  overdue: "bg-error/15 text-error",
};

export default function Revenue() {
  const { t } = useTranslation();
  const { data: invoices = [] } = useInvoices();
  const { data: projects = [] } = useProjectsList();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [client, setClient] = useState<string>("all");

  const clients = useMemo(
    () => Array.from(new Set(invoices.map((i) => i.client))).sort(),
    [],
  );
  const projectCode = (id: string) => projects.find((p) => p.id === id)?.code ?? id;

  const filtered = useMemo(
    () =>
      invoices.filter((i) => {
        if (status !== "all" && i.status !== status) return false;
        if (client !== "all" && i.client !== client) return false;
        if (q && !`${i.number} ${i.client} ${projectCode(i.projectId)}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [status, client, q],
  );

  const kpi = useMemo(() => {
    // last 30 days "this month"
    const cutoff = Date.now() - 30 * 86_400_000;
    const recent = invoices.filter((i) => new Date(i.date).getTime() >= cutoff);
    const invoiced = recent.reduce((s, i) => s + i.amount, 0);
    const collected = recent.reduce((s, i) => s + i.paid, 0);
    const outstanding = invoices.reduce((s, i) => s + (i.amount - i.paid), 0);
    const overdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + (i.amount - i.paid), 0);
    return { invoiced, collected, outstanding, overdue };
  }, []);

  const trend = useMemo(
    () => monthlyRevenue.map((m) => ({
      month: m.month,
      invoiced:  m.invoiced  * 1_000_000,
      collected: m.collected * 1_000_000,
    })),
    [],
  );

  const aging = useMemo(() => {
    const buckets = { "0_30": 0, "31_60": 0, "61_90": 0, "90p": 0 };
    invoices.forEach((i) => {
      const balance = i.amount - i.paid;
      if (balance <= 0) return;
      const days = Math.round((Date.now() - new Date(i.dueDate).getTime()) / 86_400_000);
      if (days <= 30) buckets["0_30"] += balance;
      else if (days <= 60) buckets["31_60"] += balance;
      else if (days <= 90) buckets["61_90"] += balance;
      else buckets["90p"] += balance;
    });
    return [
      { key: "0_30",  label: t("revenue_page.aging_0_30"),  value: buckets["0_30"],  color: "hsl(var(--success))" },
      { key: "31_60", label: t("revenue_page.aging_31_60"), value: buckets["31_60"], color: "hsl(var(--primary))" },
      { key: "61_90", label: t("revenue_page.aging_61_90"), value: buckets["61_90"], color: "hsl(var(--warning))" },
      { key: "90p",   label: t("revenue_page.aging_90p"),   value: buckets["90p"],   color: "hsl(var(--error))" },
    ];
  }, [t]);

  const byClient = useMemo(() => {
    const map = new Map<string, number>();
    invoices.forEach((i) => map.set(i.client, (map.get(i.client) ?? 0) + i.amount));
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("revenue_page.title")}
        subtitle={t("revenue_page.subtitle")}
        action={<Button variant="outline" className="gap-2"><Download className="h-4 w-4" />{t("common2.export")}</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile icon={<FileText      className="h-4 w-4" />} tone="primary" label={t("revenue_page.kpi.invoiced")}    value={formatDA(kpi.invoiced, { compact: true })} />
        <KpiTile icon={<Wallet        className="h-4 w-4" />} tone="success" label={t("revenue_page.kpi.collected")}   value={formatDA(kpi.collected, { compact: true })} />
        <KpiTile icon={<Hourglass     className="h-4 w-4" />} tone="warning" label={t("revenue_page.kpi.outstanding")} value={formatDA(kpi.outstanding, { compact: true })} />
        <KpiTile icon={<AlertOctagon  className="h-4 w-4" />} tone="error"   label={t("revenue_page.kpi.overdue")}     value={formatDA(kpi.overdue, { compact: true })} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Section className="lg:col-span-7" title={t("revenue_page.trend_title")} subtitle={t("revenue_page.trend_sub")}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => formatDA(Number(v), { compact: true }).replace(" DA", "")} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="invoiced"  name={t("revenue_page.kpi.invoiced")}  fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={800} />
                <Bar dataKey="collected" name={t("revenue_page.kpi.collected")} fill="hsl(var(--success))" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section className="lg:col-span-5" title={t("revenue_page.aging_title")} subtitle={t("revenue_page.aging_sub")}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aging} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => formatDA(Number(v), { compact: true }).replace(" DA", "")} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v)} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48} animationDuration={800}>
                  {aging.map((a, i) => <Cell key={i} fill={a.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section className="lg:col-span-12" title={t("revenue_page.by_client_title")} subtitle={t("revenue_page.by_client_sub")}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {byClient.map((c, i) => {
              const max = byClient[0].value;
              const pct = (c.value / max) * 100;
              return (
                <div key={c.name} className="rounded-lg border border-border/60 bg-surface p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] text-muted-foreground font-mono-num">#{i + 1}</div>
                      <div className="truncate text-sm font-medium">{c.name}</div>
                    </div>
                    <div className="font-mono-num text-sm font-semibold">{formatDA(c.value, { compact: true })}</div>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      <Section title={t("revenue_page.list_title")}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common2.search")} className="ps-9 h-9" />
          </div>
          <FilterSelect value={status} onChange={(v) => setStatus(v as InvoiceStatus | "all")} width="w-[160px]"
            options={[{ value: "all", label: t("revenue_page.all_statuses") },
                      { value: "paid",    label: t("invoice_status.paid") },
                      { value: "partial", label: t("invoice_status.partial") },
                      { value: "pending", label: t("invoice_status.pending") },
                      { value: "overdue", label: t("invoice_status.overdue") }]} />
          <FilterSelect value={client} onChange={setClient} width="w-[200px]"
            options={[{ value: "all", label: t("revenue_page.all_clients") },
                      ...clients.map((c) => ({ value: c, label: c }))]} />
          <span className="ms-auto text-xs text-muted-foreground font-mono-num">
            {filtered.length} {t("common2.results")}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2">{t("revenue_page.number")}</th>
                <th className="px-3 py-2">{t("revenue_page.date")}</th>
                <th className="px-3 py-2">{t("revenue_page.due")}</th>
                <th className="px-3 py-2">{t("common2.client")}</th>
                <th className="px-3 py-2">{t("common2.project")}</th>
                <th className="px-3 py-2 text-end">{t("revenue_page.amount")}</th>
                <th className="px-3 py-2 text-end">{t("revenue_page.paid")}</th>
                <th className="px-3 py-2 text-end">{t("revenue_page.balance")}</th>
                <th className="px-3 py-2">{t("revenue_page.status")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const balance = i.amount - i.paid;
                return (
                  <tr key={i.id} className="border-t border-border/60 transition-colors hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono-num text-xs font-semibold">{i.number}</td>
                    <td className="px-3 py-2 font-mono-num text-xs text-muted-foreground">{formatDate(i.date)}</td>
                    <td className="px-3 py-2 font-mono-num text-xs text-muted-foreground">{formatDate(i.dueDate)}</td>
                    <td className="px-3 py-2 text-xs">{i.client}</td>
                    <td className="px-3 py-2 font-mono-num text-xs">{projectCode(i.projectId)}</td>
                    <td className="px-3 py-2 text-end font-mono-num">{formatDA(i.amount, { compact: true })}</td>
                    <td className="px-3 py-2 text-end font-mono-num text-success">{formatDA(i.paid, { compact: true })}</td>
                    <td className="px-3 py-2 text-end font-mono-num font-semibold">{formatDA(balance, { compact: true })}</td>
                    <td className="px-3 py-2">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_TONE[i.status])}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {t(`invoice_status.${i.status}`)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-3 py-8 text-center text-sm text-muted-foreground">{t("common.no_data")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function FilterSelect({
  value, onChange, options, width,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  width?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-9", width)}><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
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