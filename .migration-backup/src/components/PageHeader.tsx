import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight md:text-[22px]">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function StatusBadge({
  status,
  label,
}: {
  status: "on_track" | "at_risk" | "delayed" | "ok" | "missing" | "pending";
  label: string;
}) {
  const tone =
    status === "on_track" || status === "ok"
      ? "bg-success/15 text-success"
      : status === "at_risk" || status === "pending"
      ? "bg-warning/15 text-warning"
      : "bg-error/15 text-error";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}