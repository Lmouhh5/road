import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ title, subtitle, action, children, className }: Props) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-5 shadow-elev-sm animate-fade-in-up", className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}