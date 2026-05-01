import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Invoice, InvoiceStatus } from "@/data/mock";

export function useInvoices() {
  return useQuery<Invoice[]>({
    queryKey: ["revenue_invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue_invoices")
        .select("id, invoice_number, issued_date, due_date, project_id, client, amount, paid_amount, status")
        .order("issued_date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: String(r.id),
        number: (r.invoice_number as string) ?? "",
        date: (r.issued_date as string) ?? new Date().toISOString(),
        dueDate: (r.due_date as string) ?? new Date().toISOString(),
        projectId: String(r.project_id ?? ""),
        client: r.client as string,
        amount: Number(r.amount ?? 0),
        paid: Number(r.paid_amount ?? 0),
        status: ((r.status as InvoiceStatus) ?? "pending"),
      }));
    },
  });
}

export function useInsertInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      client: string; amount: number; project_id?: string | null;
      invoice_number?: string; issued_date?: string; due_date?: string; status?: string;
    }) => {
      const { data, error } = await supabase.from("revenue_invoices").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["revenue_invoices"] }),
  });
}
