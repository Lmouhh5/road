import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, Cell,
} from "recharts";
import {
  AlertTriangle, AlertOctagon, Droplet, CheckCircle2, FileWarning, Wallet, Fuel,
  TrendingUp, Receipt, Copy, Activity, Check, EyeOff,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { alertTrend, leakByCategory, type AlertSeverity, type AlertKind } from "@/data/mock";
import { useAlerts } from "@/hooks/queries/useAlerts";
import { useProjectsList } from "@/hooks/queries/useProjectsList";
import { formatDA, formatRelativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
  boxShadow: "var(--shadow-md)",
};

const SEV_COLOR: Record<AlertSeverity, string> = {
  critical: "hsl(var(--error))",
  high:     "hsl(var(--warning))",
  medium:   "hsl(var(--gold))",
  low:      "hsl(var(--primary))",
};

const SEV_TONE: Record<AlertSeverity, string> = {
  critical: "bg-error/15 text-error border-error/30",
  high:     "bg-warning/15 text-warning border-warning/30",
  medium:   "bg-gold/15 text-gold border-gold/30",
  low:      "bg-primary/10 text-primary border-primary/30",
};

const KIND_ICON: Record<AlertKind, React.ReactNode> = {
  missing_proof:     <FileWarning className="h-4 w-4" />,
  uncleared_advance: <Wallet      className="h-4 w-4" />,
  fuel_anomaly:      <Fuel        className="h-4 w-4" />,
  budget_overrun:    <TrendingUp  className="h-4 w-4" />,
  overdue_invoice:   <Receipt     className="h-4 w-4" />,
  duplicate_expense: <Copy        className="h-4 w-4" />,
  supplier_spike:    <Activity    className="h-4 w-4" />,
};

export default function Alerts() {
  const { t } = useTranslation();
  const { data: alerts = [] } = useAlerts();
  const { data: projects = [] } = useProjectsList();
  const [sev, setSev] = useState<AlertSeverity | "all">("all");
  const [kind, setKind] = useState<AlertKind | "all">("all");

  const projectCode = (id?: string) => (id ? projects.find((p) => p.id === id)?.code ?? id : "—");

  const filtered = useMemo(
    () =>
      alerts.filter((a) => {
        if (sev !== "all" && a.severity !== sev) return false;
        if (kind !== "all" && a.kind !== kind) return false;
        return true;
      }),
    [sev, kind, alerts],
  );

  const kpi = useMemo(() => {
    const open = alerts.filter((a) => a.status === "open").length;
    const critical = alerts.filter((a) => a.severity === "critical" && a.status !== "resolved").length;
    const leakage = leakByCategory.reduce((s, l) => s + l.value, 0);
    const resolved = alerts.filter((a) => a.status === "resolved").length;
    return { open, critical, leakage, resolved };
  }, [alerts]);

  const leakChart = useMemo(
    () =>
      leakByCategory
        .map((l) => ({ key: l.key, label: t(`leak_cat.${l.key}`), value: l.value }))
        .sort((a, b) => b.value - a.value),
    [t],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("alerts_page.title")}
        subtitle={t("alerts_page.subtitle")}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile icon={<AlertTriangle className="h-4 w-4" />} tone="warning" label={t("alerts_page.kpi.open")}     value={String(kpi.open)} />
        <KpiTile icon={<AlertOctagon  className="h-4 w-4" />} tone="error"   label={t("alerts_page.kpi.critical")} value={String(kpi.critical)} />
        <KpiTile icon={<Droplet       className="h-4 w-4" />} tone="gold"    label={t("alerts_page.kpi.leakage")}  value={formatDA(kpi.leakage, { compact: true })} />
        <KpiTile icon={<CheckCircle2  className="h-4 w-4" />} tone="success" label={t("alerts_page.kpi.resolved")} value={String(kpi.resolved)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Section className="lg:col-span-8" title={t("alerts_page.trend_title")} subtitle={t("alerts_page.trend_sub")}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={alertTrend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  {(["critical", "high", "medium", "low"] as AlertSeverity[]).map((s) => (
                    <linearGradient key={s} id={`g-al-${s}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor={SEV_COLOR[s]} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={SEV_COLOR[s]} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="critical" name={t("alert_severity.critical")} stackId="1" stroke={SEV_COLOR.critical} fill="url(#g-al-critical)" strokeWidth={2} animationDuration={800} />
                <Area type="monotone" dataKey="high"     name={t("alert_severity.high")}     stackId="1" stroke={SEV_COLOR.high}     fill="url(#g-al-high)"     strokeWidth={2} animationDuration={800} />
                <Area type="monotone" dataKey="medium"   name={t("alert_severity.medium")}   stackId="1" stroke={SEV_COLOR.medium}   fill="url(#g-al-medium)"   strokeWidth={2} animationDuration={800} />
                <Area type="monotone" dataKey="low"      name={t("alert_severity.low")}      stackId="1" stroke={SEV_COLOR.low}      fill="url(#g-al-low)"      strokeWidth={2} animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section className="lg:col-span-4" title={t("alerts_page.leak_title")} subtitle={t("alerts_page.leak_sub")}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leakChart} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v) => formatDA(Number(v), { compact: true }).replace(" DA", "")} />
                <YAxis type="category" dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={100} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v)} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={20} animationDuration={800}>
                  {leakChart.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "hsl(var(--error))" : i === 1 ? "hsl(var(--warning))" : "hsl(var(--gold))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title={t("alerts_page.feed_title")} subtitle={t("alerts_page.feed_sub")}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Select value={sev} onValueChange={(v) => setSev(v as AlertSeverity | "all")}>
            <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("alerts_page.all_severities")}</SelectItem>
              <SelectItem value="critical">{t("alert_severity.critical")}</SelectItem>
              <SelectItem value="high">{t("alert_severity.high")}</SelectItem>
              <SelectItem value="medium">{t("alert_severity.medium")}</SelectItem>
              <SelectItem value="low">{t("alert_severity.low")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={kind} onValueChange={(v) => setKind(v as AlertKind | "all")}>
            <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("alerts_page.all_kinds")}</SelectItem>
              {(Object.keys(KIND_ICON) as AlertKind[]).map((k) => (
                <SelectItem key={k} value={k}>{t(`alert_kind.${k}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ms-auto text-xs text-muted-foreground font-mono-num">
            {filtered.length} {t("common2.results")}
          </span>
        </div>

        <div className="space-y-2">
          {filtered.map((a) => (
            <div
              key={a.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border bg-surface p-3 transition-colors hover:bg-muted/30",
                "border-l-4",
                a.severity === "critical" ? "border-l-error border-border" :
                a.severity === "high"     ? "border-l-warning border-border" :
                a.severity === "medium"   ? "border-l-gold border-border" :
                                            "border-l-primary border-border",
              )}
            >
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg border", SEV_TONE[a.severity])}>
                {KIND_ICON[a.kind]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", SEV_TONE[a.severity])}>
                    {t(`alert_severity.${a.severity}`)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{t(`alert_kind.${a.kind}`)}</span>
                  {a.projectId && <span className="font-mono-num text-[11px] text-muted-foreground">· {projectCode(a.projectId)}</span>}
                  <span className="ms-auto font-mono-num text-[11px] text-muted-foreground">{formatRelativeDays(a.at)}</span>
                </div>
                <div className="mt-1 text-sm font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.detail}</div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {a.amount !== undefined && (
                  <div className="font-mono-num text-sm font-bold">{formatDA(a.amount, { compact: true })}</div>
                )}
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px]">
                    <EyeOff className="h-3 w-3" />{t("alerts_page.ack")}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px] text-success">
                    <Check className="h-3 w-3" />{t("alerts_page.resolve")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">{t("common.no_data")}</div>
          )}
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