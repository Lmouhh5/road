import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, LineChart, Line, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { Briefcase, Wallet, Coins, Percent, LayoutGrid, List, MapPin, User } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { projectMeta, projectSpendTrend, type ProjectStatus, type ProjectRow } from "@/data/mock";
import { useProjects } from "@/hooks/queries/useProjects";

// Mock metadata is keyed by legacy mock IDs (p1..p7). The DB rows use UUIDs but
// share the same `code`. Build a code → meta lookup so the cards still hydrate
// while the metadata tables (manager, client, location, monthly trend) are not
// yet in the schema.
const META_BY_CODE: Record<string, { meta: typeof projectMeta[string]; trend: number[] }> = {
  "RN1-AÏN":  { meta: projectMeta.p1, trend: projectSpendTrend.p1 },
  "CW42-MED": { meta: projectMeta.p2, trend: projectSpendTrend.p2 },
  "RN6-BLD":  { meta: projectMeta.p3, trend: projectSpendTrend.p3 },
  "CW17-TIP": { meta: projectMeta.p4, trend: projectSpendTrend.p4 },
  "RN5-BJA":  { meta: projectMeta.p5, trend: projectSpendTrend.p5 },
  "RN18-CHL": { meta: projectMeta.p6, trend: projectSpendTrend.p6 },
  "CW09-BOU": { meta: projectMeta.p7, trend: projectSpendTrend.p7 },
};
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

const STATUS_FILTERS: (ProjectStatus | "all")[] = ["all", "on_track", "at_risk", "delayed"];

export default function Projects() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [view, setView] = useState<"grid" | "table">("grid");

  const { data: projects = [] } = useProjects();

  const filtered = useMemo(
    () => (statusFilter === "all" ? projects : projects.filter((p) => p.status === statusFilter)),
    [statusFilter, projects],
  );

  const kpi = useMemo(() => {
    if (projects.length === 0) return { count: 0, totalBudget: 0, totalSpent: 0, avgMargin: 0 };
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const totalSpent  = projects.reduce((s, p) => s + p.spent, 0);
    const avgMargin = projects.reduce((s, p) => s + p.margin, 0) / projects.length;
    return { count: projects.length, totalBudget, totalSpent, avgMargin };
  }, [projects]);

  const consumptionData = filtered.map((p) => ({
    name: p.code, full: p.name,
    budget: p.budget, spent: p.spent, remaining: Math.max(0, p.budget - p.spent),
  }));

  const marginData = filtered.map((p) => ({
    name: p.code, full: p.name,
    pct: Math.round((p.spent / p.budget) * 100),
    margin: p.margin,
    z: p.budget,
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("projects_page.title")}
        subtitle={t("projects_page.subtitle")}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile icon={<Briefcase className="h-4 w-4" />} tone="primary" label={t("projects_page.kpi.active")}     value={String(kpi.count)} />
        <KpiTile icon={<Wallet    className="h-4 w-4" />} tone="gold"    label={t("projects_page.kpi.budget")}     value={formatDA(kpi.totalBudget, { compact: true })} />
        <KpiTile icon={<Coins     className="h-4 w-4" />} tone="warning" label={t("projects_page.kpi.spent")}      value={formatDA(kpi.totalSpent,  { compact: true })} />
        <KpiTile icon={<Percent   className="h-4 w-4" />} tone="success" label={t("projects_page.kpi.avg_margin")} value={`${kpi.avgMargin.toFixed(1)}%`} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
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
              {t(`projects_page.filter.${s}`)}
            </button>
          ))}
          <span className="ms-2 self-center text-xs text-muted-foreground font-mono-num">
            {filtered.length} {t("common2.results")}
          </span>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
          <Button variant={view === "grid"  ? "default" : "ghost"} size="sm" className="h-8 gap-1.5" onClick={() => setView("grid")}><LayoutGrid className="h-4 w-4" />{t("projects_page.view_grid")}</Button>
          <Button variant={view === "table" ? "default" : "ghost"} size="sm" className="h-8 gap-1.5" onClick={() => setView("table")}><List       className="h-4 w-4" />{t("projects_page.view_table")}</Button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Section className="lg:col-span-7" title={t("projects_page.consumption_title")} subtitle={t("projects_page.consumption_sub")}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barCategoryGap="22%">
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => formatDA(Number(v), { compact: true }).replace(" DA", "")} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatDA(v)} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar dataKey="budget" name={t("dashboard.projects.budget")} fill="hsl(var(--primary) / 0.25)" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={800} />
                <Bar dataKey="spent"  name={t("dashboard.projects.spent")}  fill="hsl(var(--primary))"        radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section className="lg:col-span-5" title={t("projects_page.margin_title")} subtitle={t("projects_page.margin_sub")}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis type="number" dataKey="pct"    domain={[0, 100]} unit="%" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} name={t("dashboard.charts.project_status_sub")} />
                <YAxis type="number" dataKey="margin" domain={[0, 25]}  unit="%" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} name={t("dashboard.projects.margin")} />
                <ZAxis type="number" dataKey="z" range={[60, 320]} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }}
                  formatter={(v: number, n: string) => (n === "z" ? formatDA(v) : `${v}%`)}
                  labelFormatter={() => ""} />
                <Scatter data={marginData} animationDuration={900}>
                  {marginData.map((d, i) => {
                    const fill = d.margin < 5 ? "hsl(var(--error))" : d.margin < 10 ? "hsl(var(--warning))" : "hsl(var(--success))";
                    return <Cell key={i} fill={fill} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* List */}
      <Section title={t("projects_page.list_title")}>
        {view === "grid" ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pe-3">{t("dashboard.projects.name")}</th>
                  <th className="px-3">{t("common2.client")}</th>
                  <th className="px-3">{t("common2.manager")}</th>
                  <th className="px-3 text-end">{t("dashboard.projects.budget")}</th>
                  <th className="px-3 text-end">{t("dashboard.projects.spent")}</th>
                  <th className="px-3 text-end">{t("common2.progress")}</th>
                  <th className="ps-3 text-end">{t("dashboard.projects.status")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const m = META_BY_CODE[p.code]?.meta;
                  const pct = (p.spent / p.budget) * 100;
                  return (
                    <tr key={p.id} className="border-b border-border/60 transition-colors hover:bg-muted/40">
                      <td className="py-2.5 pe-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.code}</div>
                      </td>
                      <td className="px-3">{m?.client ?? "—"}</td>
                      <td className="px-3">{m?.manager ?? "—"}</td>
                      <td className="px-3 text-end font-mono-num">{formatDA(p.budget, { compact: true })}</td>
                      <td className="px-3 text-end font-mono-num">
                        <div>{formatDA(p.spent, { compact: true })}</div>
                        <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-muted ms-auto">
                          <div className={cn("h-full rounded-full",
                            pct > 95 ? "bg-error" : pct > 80 ? "bg-warning" : "bg-primary")}
                            style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                      </td>
                      <td className="px-3 text-end font-mono-num">{m?.progress ?? 0}%</td>
                      <td className="ps-3 text-end">
                        <StatusBadge status={p.status} label={t(`dashboard.status.${p.status}`)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

function ProjectCard({ project: p }: { project: ProjectRow }) {
  const { t } = useTranslation();
  const entry = META_BY_CODE[p.code];
  const m = entry?.meta;
  const pct = p.budget > 0 ? (p.spent / p.budget) * 100 : 0;
  const trend = (entry?.trend ?? []).map((v, i) => ({ i, v }));

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card p-4 shadow-elev-sm transition hover:shadow-elev-md">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{p.name}</h3>
          <p className="text-[11px] text-muted-foreground font-mono-num">{p.code}</p>
        </div>
        <StatusBadge status={p.status} label={t(`dashboard.status.${p.status}`)} />
      </header>

      <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-[11px]">
        <dt className="flex items-center gap-1 text-muted-foreground"><User   className="h-3 w-3" />{t("common2.manager")}</dt>
        <dd className="text-end font-medium">{m?.manager ?? "—"}</dd>
        <dt className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{t("common2.location")}</dt>
        <dd className="text-end font-medium">{m?.location ?? "—"}</dd>
      </dl>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">{t("dashboard.projects.spent")}</span>
          <span className="font-mono-num font-semibold">{formatDA(p.spent, { compact: true })} / {formatDA(p.budget, { compact: true })}</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full transition-all",
            pct > 95 ? "bg-error" : pct > 80 ? "bg-warning" : "bg-primary")}
            style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{pct.toFixed(0)}%</span>
          <span>{t("dashboard.projects.margin")} <span className={cn("font-mono-num font-semibold",
            p.margin < 5 ? "text-error" : p.margin < 10 ? "text-warning" : "text-success")}>{p.margin.toFixed(1)}%</span></span>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{t("projects_page.trend_6m")}</div>
        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} animationDuration={700} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </article>
  );
}

function KpiTile({ icon, tone, label, value }: { icon: React.ReactNode; tone: "primary" | "warning" | "success" | "gold"; label: string; value: string }) {
  const map = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
    gold:    "bg-gold/15 text-gold",
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