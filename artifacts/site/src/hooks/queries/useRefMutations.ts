import { useMutation, useQueryClient } from "@tanstack/react-query";

type RefTable = "projects" | "employees" | "assets" | "suppliers" | "cash_holders" | "expense_categories" | "sub_cost_centers";

const BASE = "/api";

const ROUTE_MAP: Record<RefTable, string> = {
  projects: "projects",
  employees: "employees",
  assets: "assets",
  suppliers: "suppliers",
  cash_holders: "cash-holders",
  expense_categories: "expense-categories",
  sub_cost_centers: "sub-cost-centers",
};

const INVALIDATE: Record<RefTable, string[][]> = {
  projects: [["projects_list"], ["projects"]],
  employees: [["employees"]],
  assets: [["assets"]],
  suppliers: [["suppliers"]],
  cash_holders: [["cash_holders"]],
  expense_categories: [["expense_categories"]],
  sub_cost_centers: [["sub_cost_centers"]],
};

export function useUpdateRef(table: RefTable) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const route = ROUTE_MAP[table];
      const resp = await fetch(`${BASE}/${route}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (!resp.ok) throw new Error(await resp.text());
      return resp.json() as Promise<unknown>;
    },
    onSuccess: () => INVALIDATE[table].forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

export function useDeleteRef(table: RefTable) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const route = ROUTE_MAP[table];
      const resp = await fetch(`${BASE}/${route}/${id}`, { method: "DELETE", credentials: "include" });
      if (!resp.ok) throw new Error(await resp.text());
    },
    onSuccess: () => INVALIDATE[table].forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}
