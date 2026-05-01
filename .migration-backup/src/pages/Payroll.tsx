import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";
import {
  Users, Wallet, Gift, ArrowDownToLine, Download, CheckCheck, Search,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { monthlyPayroll, type PayrollStatus } from "@/data/mock";
import { usePayrollLines } from "@/hooks/queries/usePayroll";
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

const STATUS_TONE: Record<PayrollStatus, string> = {
  draft:     "bg-muted text-muted-foreground",
  validated: "bg-primary/10 text-primary",
  paid:      "bg-success/15 text-success",
};

export default function Payroll() {
  const { t } = useTranslation();
  const { data: payrollLines = [] } = usePayrollLines();
  const { data: projects = [] } = useProjectsList();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PayrollStatus | "all">("all");
  const [project, setProject] = useState<string>("all");

  const projectCode = (id: string) => projects.find((p) => p.id === id)?.code ?? id;

  const filtered = useMemo(
    () =>
      payrollLines.filter((l) => {
        if (status !== "all" && l.status !== status) return false;
        if (project !== "all" && l.projectId !== project) return false;
        if (q && !`${l.name} ${l.role} ${projectCode(l.projectId)}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [status, project, q, payrollLines, projects],
  );

  const kpi = useMemo(() => {
    const gross = payrollLines.reduce((s, l) => s + l.baseSalary + l.bonuses, 0);
    const net = payrollLines.reduce((s, l) => s + l.net, 0);
    const bonuses = payrollLines.reduce((s, l) => s + l.bonuses, 0);
    const advances = payrollLines.reduce((s, l) => s + l.advances, 0);
    return { gross, net, bonuses, advances };
  }, [payrollLines]);

  const trend = useMemo(
    () =>
      monthlyPayroll.map((m) => ({
        month: m.month,
        base:     m.base * 1_000,
        bonuses:  m.bonuses * 1_000,
        advances: m.advances * 1_000,
      })),
    [],
  );

  const byProject = useMemo(() => {
    const map = new Map<string, number>();
    payrollLines.forEach((l) => map.set(l.projectId, (map.get(l.projectId) ?? 0) + l.net));
    return [...map.entries()]
      .map(([id, value]) => ({ code: projectCode(id), value }))
      .sort((a, b) => b.value - a.value);
  }, [payrollLines, projects]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, l) => {
        acc.base += l.baseSalary;
        acc.bonuses += l.bonuses;
        acc.advances += l.advances;
        acc.deductions += l.deductions;
        acc.net += l.net;
        return acc;
      },
      { base: 0, bonuses: 0, advances: 0, deductions: 0, net: 0 },
    );
  }, [filtered]);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("payroll_page.title")}
        subtitle={t("payroll_page.subtitle")}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2"><CheckCheck className="h-4 w-4" />{t("payroll_page.validate_all")}</Button>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />{t("payroll_page.export")}</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile icon={<Users          className="h-4 w-4" />} tone="primary" label={t("payroll_page.kpi.gross")}    value={formatDA(kpi.gross, { compact: true })} />
        <KpiTile icon={<Wallet         className="h-4 w-4" />} tone="success" label={t("payroll_page.kpi.net")}      value={formatDA(kpi.net, { compact: true })} />
        <KpiTile icon={<Gift           className="h-4 w-4" />} tone="gold"    label={t("payroll_page.kpi.bonuses")}  value={formatDA(kpi.bonuses, { compact: true })} />
        <KpiTile icon={<ArrowDownToLine className="h-4 w-4" />} tone="warning" label={t("payroll_page.kpi.advances")} value={formatDA(kpi.advances, { compact: true })} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Section className="lg:col-span-7" title={t("payroll_page.trend_title")} subtitle={t("payroll_page.trend_sub")}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => formatDA(Number(v), { compact: true }).replace(" DA", "")} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="base"     name={t("payroll_page.base")}     stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} maxBarSize={28} animationDuration={800} />
                <Bar dataKey="bonuses"  name={t("payroll_page.bonuses")}  stackId="a" fill="hsl(var(--gold))"    radius={[0, 0, 0, 0]} maxBarSize={28} animationDuration={800} />
                <Bar dataKey="advances" name={t("payroll_page.advances")} stackId="a" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section className="lg:col-span-5" title={t("payroll_page.by_project_title")} subtitle={t("payroll_page.by_project_sub")}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProject} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v) => formatDA(Number(v), { compact: true }).replace(" DA", "")} />
                <YAxis type="category" dataKey="code" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={88} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v)} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={16} animationDuration={800}>
                  {byProject.map((_, i) => (
                    <Cell key={i} fill="hsl(var(--primary))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title={t("payroll_page.list_title")}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common2.search")} className="ps-9 h-9" />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as PayrollStatus | "all")}>
            <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("payroll_page.all_statuses")}</SelectItem>
              <SelectItem value="draft">{t("payroll_status.draft")}</SelectItem>
              <SelectItem value="validated">{t("payroll_status.validated")}</SelectItem>
              <SelectItem value="paid">{t("payroll_status.paid")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={project} onValueChange={setProject}>
            <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("payroll_page.all_projects")}</SelectItem>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.code}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="ms-auto text-xs text-muted-foreground font-mono-num">
            {filtered.length} {t("common2.results")}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2">{t("payroll_page.employee")}</th>
                <th className="px-3 py-2">{t("payroll_page.role")}</th>
                <th className="px-3 py-2">{t("payroll_page.project")}</th>
                <th className="px-3 py-2 text-end">{t("payroll_page.base")}</th>
                <th className="px-3 py-2 text-end">{t("payroll_page.days")}</th>
                <th className="px-3 py-2 text-end">{t("payroll_page.bonuses")}</th>
                <th className="px-3 py-2 text-end">{t("payroll_page.advances")}</th>
                <th className="px-3 py-2 text-end">{t("payroll_page.deductions")}</th>
                <th className="px-3 py-2 text-end">{t("payroll_page.net")}</th>
                <th className="px-3 py-2">{t("payroll_page.status")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-border/60 transition-colors hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <div className="font-medium">{l.name}</div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{l.role}</td>
                  <td className="px-3 py-2 font-mono-num text-xs">{projectCode(l.projectId)}</td>
                  <td className="px-3 py-2 text-end font-mono-num">{formatDA(l.baseSalary, { compact: true })}</td>
                  <td className="px-3 py-2 text-end font-mono-num text-xs">{l.daysWorked}/{l.daysPlanned}</td>
                  <td className="px-3 py-2 text-end font-mono-num text-gold">{l.bonuses ? formatDA(l.bonuses, { compact: true }) : "—"}</td>
                  <td className="px-3 py-2 text-end font-mono-num text-warning">{l.advances ? formatDA(l.advances, { compact: true }) : "—"}</td>
                  <td className="px-3 py-2 text-end font-mono-num text-error">{l.deductions ? formatDA(l.deductions, { compact: true }) : "—"}</td>
                  <td className="px-3 py-2 text-end font-mono-num font-bold">{formatDA(l.net, { compact: true })}</td>
                  <td className="px-3 py-2">
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_TONE[l.status])}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {t(`payroll_status.${l.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">{t("common.no_data")}</td></tr>
              )}
            </tbody>
            <tfoot className="bg-muted/30">
              <tr className="border-t border-border/60">
                <td colSpan={3} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Σ</td>
                <td className="px-3 py-2 text-end font-mono-num font-bold">{formatDA(totals.base, { compact: true })}</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-end font-mono-num font-bold text-gold">{formatDA(totals.bonuses, { compact: true })}</td>
                <td className="px-3 py-2 text-end font-mono-num font-bold text-warning">{formatDA(totals.advances, { compact: true })}</td>
                <td className="px-3 py-2 text-end font-mono-num font-bold text-error">{formatDA(totals.deductions, { compact: true })}</td>
                <td className="px-3 py-2 text-end font-mono-num font-bold">{formatDA(totals.net, { compact: true })}</td>
                <td className="px-3 py-2"></td>
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