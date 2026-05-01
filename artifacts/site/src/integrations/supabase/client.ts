// Supabase replaced with direct API calls to /api
// This shim keeps existing hook imports working without changes

const BASE = "/api";

const routeMap: Record<string, string> = {
  alerts: "alerts",
  assets: "assets",
  attendance: "attendance",
  cash_holders: "cash-holders",
  cash_issues: "cash-issues",
  employees: "employees",
  expense_categories: "expense-categories",
  expenses: "expenses",
  payroll_runs: "payroll_runs",
  projects: "projects",
  revenue_invoices: "revenue-invoices",
  revenue_receipts: "revenue-receipts",
  sub_cost_centers: "sub-cost-centers",
  suppliers: "suppliers",
  v_project_financial_summary: "projects/financial-summary",
};

async function execQuery(qb: any): Promise<{ data: unknown; error: Error | null }> {
  try {
    const route = routeMap[qb._table] ?? qb._table;
    const method: string = qb._method ?? "GET";
    let url = `${BASE}/${route}`;

    if (method === "GET") {
      const params = new URLSearchParams();
      if (qb._filterId != null) url += `/${qb._filterId}`;
      for (const f of qb._filters ?? []) {
        if (f.op === "eq") params.set(f.col, String(f.val));
        else if (f.op === "gte") params.set(`${f.col}_gte`, String(f.val));
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      return { data, error: null };
    }

    if ((method === "PATCH" || method === "DELETE") && qb._filterId != null) {
      url += `/${qb._filterId}`;
    }

    const resp = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method !== "DELETE" ? JSON.stringify(qb._body ?? {}) : undefined,
    });
    if (!resp.ok) throw new Error(await resp.text());
    const data = method === "DELETE" ? null : await resp.json();
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

function makeQB(table: string): any {
  const qb: any = {
    _table: table,
    _filters: [] as Array<{ col: string; op: string; val: unknown }>,
    _method: "GET" as string,
    _filterId: undefined as unknown,
    _body: undefined as unknown,

    select(_cols: string) { return qb; },
    eq(col: string, val: unknown) {
      if (col === "id") { qb._filterId = val; }
      else { qb._filters.push({ col, op: "eq", val }); }
      return qb;
    },
    gte(col: string, val: unknown) { qb._filters.push({ col, op: "gte", val }); return qb; },
    order(_col: string, _opts?: { ascending?: boolean }) { return qb; },

    update(data: Record<string, unknown>) { qb._method = "PATCH"; qb._body = data; return qb; },
    insert(data: Record<string, unknown> | Record<string, unknown>[]) {
      qb._method = "POST";
      qb._body = Array.isArray(data) ? data[0] : data;
      return qb;
    },
    delete() { qb._method = "DELETE"; return qb; },

    single() { return execQuery(qb); },
    then(resolve: (v: { data: unknown; error: Error | null }) => unknown, reject?: (e: unknown) => unknown) {
      return execQuery(qb).then(resolve, reject);
    },
  };
  return qb;
}

export const supabase = {
  from(table: string) { return makeQB(table); },
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async (_creds: unknown) => ({ data: null, error: new Error("Auth not configured") }),
    signUp: async (_creds: unknown) => ({ data: null, error: new Error("Auth not configured") }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (_cb: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
};
