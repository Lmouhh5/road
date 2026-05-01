import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from "recharts";
import {
  Receipt, FileWarning, Banknote, Tag, Search, Download, FileText, FileX2, Clock,
} from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { expenseCategoryKeys, type ExpenseCategory, type PaymentMethod, type ProofStatus } from "@/data/mock";
import { useExpenses } from "@/hooks/queries/useExpenses";
import { useSuppliers } from "@/hooks/queries/useSuppliers";
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

const CAT_COLORS: Record<ExpenseCategory, string> = {
  fuel:           "hsl(var(--gold))",
  labor:          "hsl(var(--primary))",
  materials:      "hsl(var(--primary-glow))",
  repairs:        "hsl(var(--warning))",
  transport:      "hsl(var(--success))",
  subcontracting: "hsl(var(--error))",
  other:          "hsl(var(--muted-foreground))",
};

export default function Expenses() {
  const { t } = useTranslation();
  const { data: expenses = [] } = useExpenses();
  const { data: suppliers = [] } = useSuppliers();
  const { data: projects = [] } = useProjectsList();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ExpenseCategory | "all">("all");
  const [method, setMethod] = useState<PaymentMethod | "all">("all");
  const [proof, setProof] = useState<ProofStatus | "all">("all");
  const [project, setProject] = useState<string>("all");

  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? id;
  const projectCode  = (id: string) => projects.find((p) => p.id === id)?.code ?? id;

  const filtered = useMemo(
    () =>
      expenses.filter((e) => {
        if (cat !== "all" && e.category !== cat) return false;
        if (method !== "all" && e.method !== method) return false;
        if (proof !== "all" && e.proof !== proof) return false;
        if (project !== "all" && e.projectId !== project) return false;
        if (q) {
          const hay = `${e.description} ${supplierName(e.supplierId)} ${projectCode(e.projectId)}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [cat, method, proof, project, q],
  );

  const kpi = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const missing = expenses.filter((e) => e.proof === "missing").length;
    const cashAmt = expenses.filter((e) => e.method === "cash").reduce((s, e) => s + e.amount, 0);
    const byCat = new Map<string, number>();
    expenses.forEach((e) => byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount));
    const top = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      total, missing,
      cashShare: total > 0 ? (cashAmt / total) * 100 : 0,
      topCategory: top ? t(`categories.${top[0]}`) : "—",
    };
  }, [t]);

  // Trend by month and method (last 6 months synthesized)
  const trend = useMemo(() => {
    const months = ["M-5", "M-4", "M-3", "M-2", "M-1", "M"];
    return months.map((m, i) => {
      const factor = 0.55 + i * 0.1;
      return {
        month: m,
        cash:   Math.round(28_000_000 * factor),
        bank:   Math.round(54_000_000 * factor),
        credit: Math.round( 9_000_000 * factor),
      };
    });
  }, []);

  const byCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    expenseCategoryKeys.forEach((k) => map.set(k, 0));
    expenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return [...map.entries()]
      .map(([k, v]) => ({ key: k, label: t(`categories.${k}`), value: v }))
      .sort((a, b) => b.value - a.value);
  }, [t]);

  const topSuppliers = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => map.set(e.supplierId, (map.get(e.supplierId) ?? 0) + e.amount));
    return [...map.entries()]
      .map(([id, v]) => ({ id, name: supplierName(id), value: v }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("expenses_page.title")}
        subtitle={t("expenses_page.subtitle")}
        action={<Button variant="outline" className="gap-2"><Download className="h-4 w-4" />{t("common2.export")}</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile icon={<Receipt    className="h-4 w-4" />} tone="warning" label={t("expenses_page.kpi.total_month")}    value={formatDA(kpi.total, { compact: true })} />
        <KpiTile icon={<FileWarning className="h-4 w-4" />} tone="error"   label={t("expenses_page.kpi.missing_proof")} value={String(kpi.missing)} />
        <KpiTile icon={<Banknote   className="h-4 w-4" />} tone="gold"    label={t("expenses_page.kpi.cash_share")}    value={`${kpi.cashShare.toFixed(0)}%`} />
        <KpiTile icon={<Tag        className="h-4 w-4" />} tone="primary" label={t("expenses_page.kpi.top_category")}  value={kpi.topCategory} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Section className="lg:col-span-7" title={t("expenses_page.trend_title")} subtitle={t("expenses_page.trend_sub")}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g-cash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="hsl(var(--gold))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="g-bank" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="g-credit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="hsl(var(--warning))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => formatDA(Number(v), { compact: true }).replace(" DA", "")} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v)} />
                <Area type="monotone" dataKey="bank"   name={t("method.bank")}   stackId="1" stroke="hsl(var(--primary))" fill="url(#g-bank)"   strokeWidth={2} animationDuration={800} />
                <Area type="monotone" dataKey="cash"   name={t("method.cash")}   stackId="1" stroke="hsl(var(--gold))"    fill="url(#g-cash)"   strokeWidth={2} animationDuration={800} />
                <Area type="monotone" dataKey="credit" name={t("method.credit")} stackId="1" stroke="hsl(var(--warning))" fill="url(#g-credit)" strokeWidth={2} animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section className="lg:col-span-5" title={t("expenses_page.by_category_title")} subtitle={t("expenses_page.by_category_sub")}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => formatDA(Number(v), { compact: true }).replace(" DA", "")} />
                <YAxis type="category" dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={92} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v)} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={20} animationDuration={800}>
                  {byCategory.map((d, i) => <Cell key={i} fill={CAT_COLORS[d.key]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section className="lg:col-span-12" title={t("expenses_page.top_suppliers_title")} subtitle={t("expenses_page.top_suppliers_sub")}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topSuppliers.map((s, i) => {
              const max = topSuppliers[0].value;
              const pct = (s.value / max) * 100;
              return (
                <div key={s.id} className="rounded-lg border border-border/60 bg-surface p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] text-muted-foreground font-mono-num">#{i + 1}</div>
                      <div className="truncate text-sm font-medium">{s.name}</div>
                    </div>
                    <div className="font-mono-num text-sm font-semibold">{formatDA(s.value, { compact: true })}</div>
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

      {/* Filter bar + Ledger */}
      <Section title={t("expenses_page.ledger_title")}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common2.search")} className="ps-9 h-9" />
          </div>
          <FilterSelect value={cat}     onChange={(v) => setCat(v as ExpenseCategory | "all")}  width="w-[160px]"
            options={[{ value: "all", label: t("expenses_page.all_categories") },
                      ...expenseCategoryKeys.map((k) => ({ value: k, label: t(`categories.${k}`) }))]} />
          <FilterSelect value={method}  onChange={(v) => setMethod(v as PaymentMethod | "all")} width="w-[150px]"
            options={[{ value: "all", label: t("expenses_page.all_methods") },
                      { value: "cash",   label: t("method.cash") },
                      { value: "bank",   label: t("method.bank") },
                      { value: "credit", label: t("method.credit") }]} />
          <FilterSelect value={proof}   onChange={(v) => setProof(v as ProofStatus | "all")}   width="w-[150px]"
            options={[{ value: "all", label: t("expenses_page.all_proofs") },
                      { value: "ok",      label: t("proof.ok") },
                      { value: "missing", label: t("proof.missing") },
                      { value: "pending", label: t("proof.pending") }]} />
          <FilterSelect value={project} onChange={setProject} width="w-[170px]"
            options={[{ value: "all", label: t("expenses_page.all_projects") },
                      ...projects.map((p) => ({ value: p.id, label: p.code }))]} />
          <span className="ms-auto text-xs text-muted-foreground font-mono-num">
            {filtered.length} {t("common2.results")}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2">{t("common2.date")}</th>
                <th className="px-3 py-2">{t("common2.description")}</th>
                <th className="px-3 py-2">{t("common2.project")}</th>
                <th className="px-3 py-2">{t("common2.category")}</th>
                <th className="px-3 py-2">{t("common2.supplier")}</th>
                <th className="px-3 py-2">{t("common2.method")}</th>
                <th className="px-3 py-2">{t("common2.proof")}</th>
                <th className="px-3 py-2 text-end">{t("common2.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t border-border/60 transition-colors hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono-num text-xs text-muted-foreground">{formatDate(e.date)}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{e.description}</div>
                  </td>
                  <td className="px-3 py-2 font-mono-num text-xs">{projectCode(e.projectId)}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="h-2 w-2 rounded-full" style={{ background: CAT_COLORS[e.category] }} />
                      {t(`categories.${e.category}`)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{supplierName(e.supplierId)}</td>
                  <td className="px-3 py-2"><MethodBadge m={e.method} /></td>
                  <td className="px-3 py-2"><StatusBadge status={e.proof} label={t(`proof.${e.proof}`)} /></td>
                  <td className="px-3 py-2 text-end font-mono-num font-semibold">{formatDA(e.amount, { compact: true })}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">{t("common.no_data")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function MethodBadge({ m }: { m: PaymentMethod }) {
  const { t } = useTranslation();
  const map: Record<PaymentMethod, string> = {
    cash:   "bg-gold/15 text-gold",
    bank:   "bg-primary/10 text-primary",
    credit: "bg-warning/15 text-warning",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", map[m])}>
      {t(`method.${m}`)}
    </span>
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

// touch unused imports
void FileText; void FileX2; void Clock;