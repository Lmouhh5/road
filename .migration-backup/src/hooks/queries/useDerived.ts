import { useMemo } from "react";
import { useExpenses } from "./useExpenses";
import { useInvoices } from "./useInvoices";

export interface MonthlyCash {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

/** Derive last-6-months cashflow (revenue from invoices.amount, expenses from expenses.amount). */
export function useMonthlyCashflow() {
  const { data: expenses = [] } = useExpenses();
  const { data: invoices = [] } = useInvoices();

  return useMemo<MonthlyCash[]>(() => {
    const months: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: i === 0 ? "M" : `M-${i}`,
      });
    }
    const exp = new Map<string, number>();
    const rev = new Map<string, number>();
    for (const e of expenses) {
      const k = e.date.slice(0, 7);
      exp.set(k, (exp.get(k) ?? 0) + e.amount);
    }
    for (const i of invoices) {
      const k = i.date.slice(0, 7);
      rev.set(k, (rev.get(k) ?? 0) + i.amount);
    }
    return months.map((m) => {
      const r = rev.get(m.key) ?? 0;
      const x = exp.get(m.key) ?? 0;
      return { month: m.label, revenue: r, expenses: x, profit: r - x };
    });
  }, [expenses, invoices]);
}

/** Derive expense distribution by category from real expenses. */
export function useExpenseDistribution() {
  const { data: expenses = [] } = useExpenses();
  return useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of expenses) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    return Array.from(totals.entries()).map(([key, value]) => ({ key, value }));
  }, [expenses]);
}
