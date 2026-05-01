import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Briefcase, Layers, Tags, Users, Truck, Building2, Wallet,
  Database, FileText, Languages, Calendar, Palette, Sun, Moon,
  Download, RefreshCw, AlertTriangle, ChevronRight, Save,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";
import {
  projects, employees, suppliers, machines, cashHolders, expenseCategoryKeys,
} from "@/data/mock";
import { cn } from "@/lib/utils";
import { ReferenceManagerDialog } from "@/components/settings/ReferenceManagerDialog";

type TabKey = "reference" | "thresholds" | "display" | "data";

const TABS: { key: TabKey; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "reference",  icon: Database  },
  { key: "thresholds", icon: AlertTriangle },
  { key: "display",    icon: Palette   },
  { key: "data",       icon: FileText  },
];

export default function Settings() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabKey>("reference");

  return (
    <div className="space-y-5">
      <PageHeader title={t("settings_page.title")} subtitle={t("settings_page.subtitle")} />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition",
              tab === key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {t(`settings_page.tabs.${key}`)}
          </button>
        ))}
      </div>

      {tab === "reference"  && <ReferenceTab />}
      {tab === "thresholds" && <ThresholdsTab />}
      {tab === "display"    && <DisplayTab />}
      {tab === "data"       && <DataTab />}
    </div>
  );
}

/* ---------- Reference data ---------- */

function ReferenceTab() {
  const { t } = useTranslation();
  const [openKind, setOpenKind] = useState<null | "projects" | "employees" | "machines" | "suppliers" | "cash_holders" | "categories" | "subcost">(null);

  const items = useMemo(
    () => [
      { key: "projects",     icon: Briefcase, count: projects.length,             entity: "projects" as const },
      { key: "subcost",      icon: Layers,    count: projects.length * 9,         entity: "subcost" as const },
      { key: "categories",   icon: Tags,      count: expenseCategoryKeys.length,  entity: "categories" as const },
      { key: "employees",    icon: Users,     count: employees.length,            entity: "employees" as const },
      { key: "machines",     icon: Truck,     count: machines.length,             entity: "machines" as const },
      { key: "suppliers",    icon: Building2, count: suppliers.length,            entity: "suppliers" as const },
      { key: "cash_holders", icon: Wallet,    count: cashHolders.length,          entity: "cash_holders" as const },
    ],
    [],
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map(({ key, icon: Icon, count, entity }) => (
          <button
            key={key}
            onClick={() => entity ? setOpenKind(entity) : toast.info(t("page.coming_soon"))}
            className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-start shadow-elev-sm transition hover:border-primary/40 hover:shadow-elev-md"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{t(`settings_page.ref.${key}`)}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{t("settings_page.ref.hint")}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2 text-xs">
              <span className="rounded-md bg-muted px-2 py-0.5 font-mono-num font-semibold">
                {count} {t("settings_page.ref.items")}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground rtl:rotate-180" />
            </span>
          </button>
        ))}
      </div>
      {openKind && (
        <ReferenceManagerDialog
          kind={openKind}
          open={!!openKind}
          onOpenChange={(o) => !o && setOpenKind(null)}
        />
      )}
    </>
  );
}

/* ---------- Thresholds ---------- */

function ThresholdsTab() {
  const { t } = useTranslation();
  const [fuelMax, setFuelMax]   = useState(420);
  const [clearance, setClearance] = useState(7);
  const [trace, setTrace]       = useState(70);
  const [alerts, setAlerts]     = useState({ uncleared: true, proof: true, fuel: true, overdue: true });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Section title={t("settings_page.thresholds.fuel_title")} subtitle={t("settings_page.thresholds.fuel_desc")}>
        <div className="flex items-center gap-4">
          <Slider value={[fuelMax]} min={100} max={1000} step={10} onValueChange={(v) => setFuelMax(v[0])} className="flex-1" />
          <div className="w-24 shrink-0 rounded-md border border-border bg-muted px-3 py-1.5 text-end font-mono-num text-sm font-semibold">
            {fuelMax} L
          </div>
        </div>
      </Section>

      <Section title={t("settings_page.thresholds.clearance_title")} subtitle={t("settings_page.thresholds.clearance_desc")}>
        <div className="flex items-center gap-4">
          <Slider value={[clearance]} min={1} max={30} step={1} onValueChange={(v) => setClearance(v[0])} className="flex-1" />
          <div className="w-24 shrink-0 rounded-md border border-border bg-muted px-3 py-1.5 text-end font-mono-num text-sm font-semibold">
            {clearance} j
          </div>
        </div>
      </Section>

      <Section title={t("settings_page.thresholds.trace_title")} subtitle={t("settings_page.thresholds.trace_desc")}>
        <div className="flex items-center gap-4">
          <Slider value={[trace]} min={0} max={100} step={5} onValueChange={(v) => setTrace(v[0])} className="flex-1" />
          <div className="w-24 shrink-0 rounded-md border border-border bg-muted px-3 py-1.5 text-end font-mono-num text-sm font-semibold">
            {trace} / 100
          </div>
        </div>
      </Section>

      <Section title={t("settings_page.thresholds.alerts_title")} subtitle={t("settings_page.thresholds.alerts_desc")}>
        <div className="space-y-3">
          {(Object.keys(alerts) as (keyof typeof alerts)[]).map((k) => (
            <div key={k} className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2">
              <Label htmlFor={`alert-${k}`} className="cursor-pointer text-sm">
                {t(`settings_page.thresholds.alerts_${k}`)}
              </Label>
              <Switch
                id={`alert-${k}`}
                checked={alerts[k]}
                onCheckedChange={(v) => setAlerts((s) => ({ ...s, [k]: v }))}
              />
            </div>
          ))}
        </div>
      </Section>

      <div className="lg:col-span-2 flex justify-end">
        <Button onClick={() => toast.success(t("settings_page.saved"))} className="gap-2">
          <Save className="h-4 w-4" />
          {t("settings_page.save")}
        </Button>
      </div>
    </div>
  );
}

/* ---------- Display ---------- */

function DisplayTab() {
  const { t, i18n } = useTranslation();
  const { theme, toggle } = useTheme();
  const [currency, setCurrency] = useState("DA-grouped");
  const [dateFmt,  setDateFmt]  = useState("dmy-slash");
  const lang = (i18n.language?.slice(0, 2) ?? "fr") as "fr" | "ar" | "en";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Section title={t("settings_page.display.language_title")} subtitle={t("settings_page.display.language_desc")}>
        <div className="flex items-center gap-3">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <Select value={lang} onValueChange={(v) => i18n.changeLanguage(v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title={t("settings_page.display.currency_title")} subtitle={t("settings_page.display.currency_desc")}>
        <div className="flex items-center gap-3">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DA-grouped">1 240 000 DA</SelectItem>
              <SelectItem value="DA-compact">1.24 M DA</SelectItem>
              <SelectItem value="DA-suffix">1240000 DA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title={t("settings_page.display.date_title")} subtitle={t("settings_page.display.date_desc")}>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={dateFmt} onValueChange={setDateFmt}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dmy-slash">31/12/2025</SelectItem>
              <SelectItem value="dmy-dash">31-12-2025</SelectItem>
              <SelectItem value="ymd">2025-12-31</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title={t("settings_page.display.theme_title")} subtitle={t("settings_page.display.theme_desc")}>
        <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="text-sm">
              {theme === "dark" ? t("settings_page.display.theme_dark") : t("settings_page.display.theme_light")}
            </span>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggle} />
        </div>
      </Section>
    </div>
  );
}

/* ---------- Data & export ---------- */

function DataTab() {
  const { t } = useTranslation();
  const [reportFmt, setReportFmt] = useState("a4");

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Section title={t("settings_page.data.export_title")} subtitle={t("settings_page.data.export_desc")}>
        <Button
          onClick={() => toast.success(t("page.coming_soon"))}
          variant="outline"
          className="w-full justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          {t("settings_page.data.export_btn")}
        </Button>
      </Section>

      <Section title={t("settings_page.data.report_title")} subtitle={t("settings_page.data.report_desc")}>
        <div className="flex items-center gap-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Select value={reportFmt} onValueChange={setReportFmt}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">{t("settings_page.data.report_a4")}</SelectItem>
              <SelectItem value="a4l">{t("settings_page.data.report_a4l")}</SelectItem>
              <SelectItem value="letter">{t("settings_page.data.report_letter")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section
        className="lg:col-span-2 border-error/40"
        title={t("settings_page.data.reset_title")}
        subtitle={t("settings_page.data.reset_desc")}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-error/15 px-2.5 py-1 text-[11px] font-semibold text-error">
            <AlertTriangle className="h-3 w-3" />
            {t("settings_page.data.danger")}
          </span>
          <Button
            onClick={() => toast.success(t("settings_page.saved"))}
            variant="destructive"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("settings_page.data.reset_btn")}
          </Button>
        </div>
      </Section>
    </div>
  );
}
