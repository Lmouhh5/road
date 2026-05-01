import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Wallet, Landmark, AlertTriangle, Users, Download, ArrowDownRight, ArrowUpRight, Search,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cashDailyBalance, type CashHolder } from "@/data/mock";
import { useCashHolders, useCashMovements } from "@/hooks/queries/useCash";
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

function daysSince(iso: string) {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

export default function Cash() {
  const { t } = useTranslation();
  const { data: cashHolders = [] } = useCashHolders();
  const { data: cashMovements = [] } = useCashMovements();
  const [q, setQ] = useState("");

  const totals = useMemo(() => {
    const lastDay = cashDailyBalance[cashDailyBalance.length - 1];
    const bank = lastDay.bank * 1_000_000;
    const cash = lastDay.cash * 1_000_000;
    const advances = cashHolders.reduce((s, h) => s + h.balance, 0);
    return { bank, cash, advances, holders: cashHolders.length };
  }, [cashHolders]);

  const composition = useMemo(
    () => [
      { key: "bank",     label: t("cash_page.kpi.bank"),      value: totals.bank,     color: "hsl(var(--primary))" },
      { key: "cash",     label: t("cash_page.kpi.cash"),      value: totals.cash,     color: "hsl(var(--gold))" },
      { key: "advances", label: t("cash_page.kpi.uncleared"), value: totals.advances, color: "hsl(var(--warning))" },
    ],
    [t, totals],
  );

  const filteredMoves = useMemo(() => {
    if (!q) return cashMovements;
    const ql = q.toLowerCase();
    return cashMovements.filter((m) => {
      const holder = cashHolders.find((h) => h.id === m.holderId)?.name ?? "";
      return `${m.reason} ${holder} ${m.reference ?? ""}`.toLowerCase().includes(ql);
    });
  }, [q, cashMovements, cashHolders]);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("cash_page.title")}
        subtitle={t("cash_page.subtitle")}
        action={<Button variant="outline" className="gap-2"><Download className="h-4 w-4" />{t("common2.export")}</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile icon={<Landmark      className="h-4 w-4" />} tone="primary" label={t("cash_page.kpi.bank")}      value={formatDA(totals.bank, { compact: true })} />
        <KpiTile icon={<Wallet        className="h-4 w-4" />} tone="gold"    label={t("cash_page.kpi.cash")}      value={formatDA(totals.cash, { compact: true })} />
        <KpiTile icon={<AlertTriangle className="h-4 w-4" />} tone="warning" label={t("cash_page.kpi.uncleared")} value={formatDA(totals.advances, { compact: true })} />
        <KpiTile icon={<Users         className="h-4 w-4" />} tone="success" label={t("cash_page.kpi.holders")}   value={String(totals.holders)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Section className="lg:col-span-8" title={t("cash_page.balance_title")} subtitle={t("cash_page.balance_sub")}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashDailyBalance} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g-bk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="g-cs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="hsl(var(--gold))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v.slice(5)} interval={3} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${v}M`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toFixed(2)} M DA`} />
                <Area type="monotone" dataKey="bank" name={t("cash_page.kpi.bank")} stroke="hsl(var(--primary))" fill="url(#g-bk)" strokeWidth={2} animationDuration={800} />
                <Area type="monotone" dataKey="cash" name={t("cash_page.kpi.cash")} stroke="hsl(var(--gold))"   fill="url(#g-cs)" strokeWidth={2} animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section className="lg:col-span-4" title={t("cash_page.split_title")} subtitle={t("cash_page.split_sub")}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={composition} dataKey="value" nameKey="label" innerRadius={60} outerRadius={92} paddingAngle={2} animationDuration={800}>
                  {composition.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v, { compact: true })} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title={t("cash_page.holders_title")} subtitle={t("cash_page.holders_sub")}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cashHolders.map((h) => <HolderCard key={h.id} h={h} />)}
        </div>
      </Section>

      <Section title={t("cash_page.movements_title")} subtitle={t("cash_page.movements_sub")}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common2.search")} className="ps-9 h-9" />
          </div>
          <span className="ms-auto text-xs text-muted-foreground font-mono-num">
            {filteredMoves.length} {t("common2.results")}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2">{t("common2.date")}</th>
                <th className="px-3 py-2">{t("cash_page.holder")}</th>
                <th className="px-3 py-2">{t("cash_page.reason")}</th>
                <th className="px-3 py-2">{t("cash_page.ref")}</th>
                <th className="px-3 py-2 text-end">{t("common2.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMoves.map((m) => {
                const holder = cashHolders.find((h) => h.id === m.holderId);
                const isIn = m.direction === "in";
                return (
                  <tr key={m.id} className="border-t border-border/60 transition-colors hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono-num text-xs text-muted-foreground">{formatDate(m.date)}</td>
                    <td className="px-3 py-2 text-xs">{holder?.name ?? "—"}</td>
                    <td className="px-3 py-2">{m.reason}</td>
                    <td className="px-3 py-2 font-mono-num text-xs text-muted-foreground">{m.reference ?? "—"}</td>
                    <td className="px-3 py-2 text-end">
                      <span className={cn(
                        "inline-flex items-center gap-1 font-mono-num font-semibold",
                        isIn ? "text-success" : "text-error",
                      )}>
                        {isIn ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                        {formatDA(m.amount, { compact: true })}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredMoves.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">{t("common.no_data")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function HolderCard({ h }: { h: CashHolder }) {
  const { t } = useTranslation();
  const days = daysSince(h.lastClearedAt);
  const tone =
    h.status === "ok" ? "bg-success/15 text-success"
    : h.status === "at_risk" ? "bg-warning/15 text-warning"
    : "bg-error/15 text-error";
  const label =
    h.status === "ok" ? t("cash_page.status_ok")
    : h.status === "at_risk" ? t("cash_page.status_at_risk")
    : t("cash_page.status_overdue");
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-elev-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{h.name}</div>
          <div className="truncate text-xs text-muted-foreground">{h.role}</div>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", tone)}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />{label}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-[11px] text-muted-foreground">{t("cash_page.balance")}</div>
          <div className="font-mono-num text-lg font-bold tracking-tight">{formatDA(h.balance, { compact: true })}</div>
        </div>
        <div className="text-end">
          <div className="text-[11px] text-muted-foreground">{t("cash_page.last_cleared")}</div>
          <div className="font-mono-num text-xs">{formatDate(h.lastClearedAt)}</div>
          <div className="font-mono-num text-[11px] text-muted-foreground">{days} {t("cash_page.days_open")}</div>
        </div>
      </div>
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