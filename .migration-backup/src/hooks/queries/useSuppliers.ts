import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SupplierRow {
  id: string;
  name: string;
  category: string;
  city: string;
  contact: string;
  phone: string;
  totalSpend: number;
  outstanding: number;
  invoicesCount: number;
  paymentTerms: number;
  lastInvoice: string;
  status: "ok" | "balance" | "overdue";
}

export function useSuppliers() {
  return useQuery<SupplierRow[]>({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, name, category, contact, phone, balance")
        .order("name");
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: String(r.id),
        name: r.name as string,
        category: (r.category as string) ?? "other",
        city: "",
        contact: (r.contact as string) ?? "",
        phone: (r.phone as string) ?? "",
        totalSpend: 0,
        outstanding: Number(r.balance ?? 0),
        invoicesCount: 0,
        paymentTerms: 30,
        lastInvoice: new Date().toISOString(),
        status: (Number(r.balance ?? 0) > 0 ? "balance" : "ok") as "ok" | "balance" | "overdue",
      }));
    },
  });
}

export function useInsertSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; category?: string; phone?: string; contact?: string }) => {
      const { data, error } = await supabase.from("suppliers").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}
