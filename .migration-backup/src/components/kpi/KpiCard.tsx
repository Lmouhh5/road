import { ReactNode, useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";
import { formatPct } from "@/lib/format";

type Tone = "primary" | "gold" | "success" | "warning" | "error";

interface Props {
  label: string;
  value: number;
  /** function to format the displayed value (e.g. formatDA) */
  format: (n: number) => string;
  delta?: number;
  /** when true, a positive delta is bad (e.g. expenses, missing proof) */
  invertDelta?: boolean;
  tone?: Tone;
  spark: { i: number; v: number }[];
  icon?: ReactNode;
}

function useCounter(target: number, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart
      setV(target * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

export function KpiCard({ label, value, format, delta, invertDelta, tone = "primary", spark, icon }: Props) {
  const animated = useCounter(value);
  const isGood = delta === undefined ? null : invertDelta ? delta <= 0 : delta >= 0;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-elev-sm transition hover:shadow-elev-md animate-fade-in-up">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {icon && (
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-md",
                tone === "primary" && "bg-primary/10 text-primary",
                tone === "gold"    && "bg-gold/15 text-gold",
                tone === "success" && "bg-success/15 text-success",
                tone === "warning" && "bg-warning/15 text-warning",
                tone === "error"   && "bg-error/15 text-error",
              )}
            >
              {icon}
            </span>
          )}
          <span className="truncate">{label}</span>
        </div>
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold",
              isGood ? "bg-success/15 text-success" : "bg-error/15 text-error",
            )}
          >
            {isGood ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {formatPct(Math.abs(delta), 1)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="font-mono-num text-[22px] font-semibold leading-none tracking-tight">
          {format(animated)}
        </div>
        <Sparkline data={spark} color={tone} />
      </div>
    </div>
  );
}