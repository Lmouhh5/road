import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Receipt, TrendingUp, Wallet, Users, Save, ArrowDownLeft, ArrowUpRight,
  FileText, FileWarning, Activity,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { expenseCategoryKeys, recentActivity } from "@/data/mock";
import { useProjectsList } from "@/hooks/queries/useProjectsList";
import { useSuppliers } from "@/hooks/queries/useSuppliers";
import { useEmployees } from "@/hooks/queries/useEmployees";
import { useInsertExpense } from "@/hooks/queries/useExpenses";
import { useInsertInvoice } from "@/hooks/queries/useInvoices";
import { useInsertCashIssue } from "@/hooks/queries/useCash";
import { useInsertAttendance } from "@/hooks/queries/useAttendance";
import { formatDA, formatRelativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";

const todayIso = new Date().toISOString().slice(0, 10);

export default function DataEntry() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [tab, setTab] = useState("expense");
  const { data: projects = [] } = useProjectsList();
  const { data: suppliers = [] } = useSuppliers();
  const { data: employees = [] } = useEmployees();
  const insertExpense = useInsertExpense();
  const insertInvoice = useInsertInvoice();
  const insertCash = useInsertCashIssue();
  const insertAttendance = useInsertAttendance();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const get = (k: string) => (fd.get(k) as string) || "";
    const num = (k: string) => Number(fd.get(k) || 0);
    try {
      if (tab === "expense") {
        await insertExpense.mutateAsync({
          expense_date: get("date") || new Date().toISOString().slice(0, 10),
          amount: num("amount"),
          project_id: get("project") || null,
          category: get("category") || null,
          supplier_id: get("supplier") || null,
          method: get("method") || null,
          description: get("description") || null,
        });
      } else if (tab === "revenue") {
        await insertInvoice.mutateAsync({
          client: get("client") || "—",
          amount: num("amount"),
          invoice_number: get("invoice") || undefined,
          issued_date: get("date") || undefined,
          project_id: get("project") || null,
        });
      } else if (tab === "cash") {
        await insertCash.mutateAsync({
          issue_date: get("date") || undefined,
          amount: num("amount"),
          holder_id: get("holder") || null,
          note: get("description") || undefined,
        });
      } else if (tab === "attendance") {
        await insertAttendance.mutateAsync({
          attendance_date: get("date") || undefined,
          project_id: get("project") || null,
          employee_id: get("manager") || null,
          hours: num("team") || 0,
          note: get("description") || undefined,
        });
      }
      toast({ title: t("data_entry.form.saved"), description: t(`data_entry.tabs.${tab}`) });
      form.reset();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const todaySummary = useMemo(() => {
    const exp = recentActivity.filter((a) => a.kind === "expense");
    const rev = recentActivity.filter((a) => a.kind === "revenue");
    const cash = recentActivity.filter((a) => a.kind === "cash_in" || a.kind === "cash_out");
    return {
      total: recentActivity.length,
      exp: exp.reduce((s, a) => s + (a.amount ?? 0), 0),
      rev: rev.reduce((s, a) => s + (a.amount ?? 0), 0),
      cash: cash.length,
    };
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader title={t("data_entry.title")} subtitle={t("data_entry.subtitle")} />

      {/* Today summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile icon={<Activity className="h-4 w-4" />} tone="primary" label={t("data_entry.today_summary.entries")} value={String(todaySummary.total)} />
        <SummaryTile icon={<Receipt   className="h-4 w-4" />} tone="warning" label={t("data_entry.today_summary.expenses")} value={formatDA(todaySummary.exp, { compact: true })} />
        <SummaryTile icon={<TrendingUp className="h-4 w-4" />} tone="success" label={t("data_entry.today_summary.revenues")} value={formatDA(todaySummary.rev, { compact: true })} />
        <SummaryTile icon={<Wallet    className="h-4 w-4" />} tone="gold"    label={t("data_entry.today_summary.cash_moves")} value={String(todaySummary.cash)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Form */}
        <Section className="lg:col-span-8" title={t("data_entry.title")} subtitle={t("data_entry.subtitle")}>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="expense">    <Receipt   className="me-1.5 h-4 w-4" />{t("data_entry.tabs.expense")}</TabsTrigger>
              <TabsTrigger value="revenue">    <TrendingUp className="me-1.5 h-4 w-4" />{t("data_entry.tabs.revenue")}</TabsTrigger>
              <TabsTrigger value="cash">       <Wallet    className="me-1.5 h-4 w-4" />{t("data_entry.tabs.cash")}</TabsTrigger>
              <TabsTrigger value="attendance"> <Users     className="me-1.5 h-4 w-4" />{t("data_entry.tabs.attendance")}</TabsTrigger>
            </TabsList>

            <TabsContent value="expense" className="mt-5">
              <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label={t("common2.date")}><Input name="date" type="date" defaultValue={todayIso} /></Field>
                <Field label={t("common2.amount") + " (DA)"}><Input name="amount" type="number" inputMode="numeric" placeholder="0" className="font-mono-num" /></Field>
                <Field label={t("common2.project")}>
                  <PickList name="project" placeholder={t("data_entry.form.select_project")} options={projects.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` }))} />
                </Field>
                <Field label={t("common2.category")}>
                  <PickList name="category" placeholder={t("data_entry.form.select_category")} options={expenseCategoryKeys.map((k) => ({ value: k, label: t(`categories.${k}`) }))} />
                </Field>
                <Field label={t("common2.supplier")}>
                  <PickList name="supplier" placeholder={t("data_entry.form.select_supplier")} options={suppliers.map((s) => ({ value: s.id, label: s.name }))} />
                </Field>
                <Field label={t("common2.method")}>
                  <PickList name="method" placeholder={t("data_entry.form.select_method")} options={[
                    { value: "cash", label: t("method.cash") },
                    { value: "bank", label: t("method.bank") },
                    { value: "credit", label: t("method.credit") },
                  ]} />
                </Field>
                <Field label={t("common2.description")} className="md:col-span-2">
                  <Textarea name="description" placeholder={t("data_entry.form.description_ph")} rows={2} />
                </Field>
                <SubmitRow t={t} />
              </form>
            </TabsContent>

            <TabsContent value="revenue" className="mt-5">
              <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label={t("common2.date")}><Input name="date" type="date" defaultValue={todayIso} /></Field>
                <Field label={t("data_entry.form.invoice_number")}><Input name="invoice" placeholder="FA-2025-…" className="font-mono-num" /></Field>
                <Field label={t("data_entry.form.client")}><Input name="client" placeholder="DTP / Wilaya / APC…" /></Field>
                <Field label={t("common2.project")}>
                  <PickList name="project" placeholder={t("data_entry.form.select_project")} options={projects.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` }))} />
                </Field>
                <Field label={t("common2.amount") + " (DA)"}><Input name="amount" type="number" inputMode="numeric" placeholder="0" className="font-mono-num" /></Field>
                <Field label={t("common2.method")}>
                  <PickList name="method" placeholder={t("data_entry.form.select_method")} options={[
                    { value: "bank", label: t("method.bank") },
                    { value: "cash", label: t("method.cash") },
                  ]} />
                </Field>
                <Field label={t("common2.description")} className="md:col-span-2">
                  <Textarea name="description" placeholder={t("data_entry.form.description_ph")} rows={2} />
                </Field>
                <SubmitRow t={t} />
              </form>
            </TabsContent>

            <TabsContent value="cash" className="mt-5">
              <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label={t("data_entry.form.direction")} className="md:col-span-2">
                  <div className="grid grid-cols-2 gap-2">
                    <DirectionTile dir="in"  label={t("data_entry.form.in")} />
                    <DirectionTile dir="out" label={t("data_entry.form.out")} />
                  </div>
                </Field>
                <Field label={t("common2.date")}><Input name="date" type="date" defaultValue={todayIso} /></Field>
                <Field label={t("common2.amount") + " (DA)"}><Input name="amount" type="number" inputMode="numeric" placeholder="0" className="font-mono-num" /></Field>
                <Field label={t("data_entry.form.holder")}>
                  <PickList name="holder" placeholder={t("data_entry.form.holder")} options={employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.role}` }))} />
                </Field>
                <Field label={t("common2.project")}>
                  <PickList name="project" placeholder={t("data_entry.form.select_project")} options={projects.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` }))} />
                </Field>
                <Field label={t("common2.description")} className="md:col-span-2">
                  <Textarea name="description" placeholder={t("data_entry.form.description_ph")} rows={2} />
                </Field>
                <SubmitRow t={t} />
              </form>
            </TabsContent>

            <TabsContent value="attendance" className="mt-5">
              <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label={t("data_entry.form.date_present")}><Input name="date" type="date" defaultValue={todayIso} /></Field>
                <Field label={t("common2.project")}>
                  <PickList name="project" placeholder={t("data_entry.form.select_project")} options={projects.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` }))} />
                </Field>
                <Field label={t("data_entry.form.team_size")}><Input name="team" type="number" inputMode="numeric" placeholder="0" className="font-mono-num" /></Field>
                <Field label={t("common2.manager")}>
                  <PickList name="manager" placeholder={t("common2.manager")} options={employees.map((e) => ({ value: e.id, label: e.name }))} />
                </Field>
                <Field label={t("common2.description")} className="md:col-span-2">
                  <Textarea name="description" placeholder={t("data_entry.form.description_ph")} rows={2} />
                </Field>
                <SubmitRow t={t} />
              </form>
            </TabsContent>
          </Tabs>
        </Section>

        {/* Recent activity */}
        <Section
          className="lg:col-span-4"
          title={t("data_entry.recent.title")}
          subtitle={t("data_entry.recent.subtitle")}
        >
          <ul className="space-y-2">
            {recentActivity.map((a) => (
              <ActivityRow key={a.id} item={a} />
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function PickList({ options, placeholder, name }: { options: { value: string; label: string }[]; placeholder?: string; name?: string }) {
  const [val, setVal] = useState("");
  return (
    <>
      <Select value={val} onValueChange={setVal}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {name && <input type="hidden" name={name} value={val} />}
    </>
  );
}

function SubmitRow({ t }: { t: (k: string) => string }) {
  return (
    <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
      <Button type="button" variant="ghost">{t("common2.cancel")}</Button>
      <Button type="submit" className="gap-2"><Save className="h-4 w-4" />{t("data_entry.form.submit")}</Button>
    </div>
  );
}

function DirectionTile({ dir, label }: { dir: "in" | "out"; label: string }) {
  const Icon = dir === "in" ? ArrowDownLeft : ArrowUpRight;
  const tone = dir === "in" ? "border-success/40 hover:bg-success/10 text-success" : "border-warning/40 hover:bg-warning/10 text-warning";
  return (
    <button type="button" className={cn("flex items-center justify-center gap-2 rounded-lg border bg-card p-3 text-sm font-medium transition", tone)}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function SummaryTile({ icon, tone, label, value }: { icon: React.ReactNode; tone: "primary" | "warning" | "success" | "gold"; label: string; value: string }) {
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

function ActivityRow({ item }: { item: typeof recentActivity[number] }) {
  const { t } = useTranslation();
  const meta: Record<string, { Icon: React.ComponentType<{ className?: string }>; tone: string; key: string }> = {
    expense:    { Icon: Receipt,     tone: "bg-warning/15 text-warning", key: "data_entry.recent.expense" },
    revenue:    { Icon: TrendingUp,  tone: "bg-success/15 text-success", key: "data_entry.recent.revenue" },
    cash_in:    { Icon: ArrowDownLeft, tone: "bg-primary/15 text-primary", key: "data_entry.recent.cash_in" },
    cash_out:   { Icon: ArrowUpRight,  tone: "bg-gold/15 text-gold",      key: "data_entry.recent.cash_out" },
    attendance: { Icon: Users,       tone: "bg-accent text-accent-foreground", key: "data_entry.recent.attendance" },
  };
  const { Icon, tone, key } = meta[item.kind];
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border/60 bg-surface px-3 py-2 transition hover:bg-muted/40">
      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md", tone)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{item.label}</span>
          {item.amount != null && <span className="font-mono-num text-xs font-semibold">{formatDA(item.amount, { compact: true })}</span>}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{t(key)}</span>
          <span>·</span>
          <span>{item.by}</span>
          <span>·</span>
          <span className="font-mono-num">{formatRelativeDays(item.at)}</span>
        </div>
      </div>
    </li>
  );
}

// Unused imports kept intentionally minimal — remove icons we didn't use:
void FileText; void FileWarning;