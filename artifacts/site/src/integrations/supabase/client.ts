// Supabase replaced with a typed fetch-based adapter.
// No @supabase/supabase-js dependency is used at runtime.

const BASE = "/api";

const ROUTE_MAP: Record<string, string> = {
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

type FilterEntry = { col: string; op: "eq" | "gte"; val: unknown };
type QueryMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface QueryBuilder {
  _table: string;
  _filters: FilterEntry[];
  _method: QueryMethod;
  _filterId: string | undefined;
  _body: Record<string, unknown> | undefined;
  select(cols?: string): QueryBuilder;
  eq(col: string, val: unknown): QueryBuilder;
  gte(col: string, val: unknown): QueryBuilder;
  order(col: string, opts?: { ascending?: boolean }): QueryBuilder;
  update(data: Record<string, unknown>): QueryBuilder;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert(data: Record<string, any> | Record<string, any>[]): QueryBuilder;
  delete(): QueryBuilder;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  single(): Promise<{ data: any; error: Error | null }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  then<TResult1 = { data: any; error: Error | null }, TResult2 = never>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: (v: { data: any; error: Error | null }) => TResult1 | PromiseLike<TResult1>,
    reject?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function execQuery(qb: QueryBuilder): Promise<{ data: any; error: Error | null }> {
  try {
    const route = ROUTE_MAP[qb._table] ?? qb._table;
    const method = qb._method;
    let url = `${BASE}/${route}`;

    if (method === "GET") {
      const params = new URLSearchParams();
      if (qb._filterId != null) {
        url += `/${qb._filterId}`;
      } else {
        for (const f of qb._filters) {
          if (f.op === "eq") params.set(f.col, String(f.val));
          else if (f.op === "gte") params.set(`${f.col}_gte`, String(f.val));
        }
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(await resp.text());
      return { data: await resp.json(), error: null };
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
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

function makeQB(table: string): QueryBuilder {
  const qb: QueryBuilder = {
    _table: table,
    _filters: [],
    _method: "GET",
    _filterId: undefined,
    _body: undefined,

    select(_cols?: string) { return qb; },

    eq(col: string, val: unknown) {
      if (col === "id") {
        qb._filterId = String(val);
      } else {
        qb._filters.push({ col, op: "eq", val });
      }
      return qb;
    },

    gte(col: string, val: unknown) {
      qb._filters.push({ col, op: "gte", val });
      return qb;
    },

    order(_col: string, _opts?: { ascending?: boolean }) { return qb; },

    update(data: Record<string, unknown>) {
      qb._method = "PATCH";
      qb._body = data;
      return qb;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insert(data: Record<string, any> | Record<string, any>[]) {
      qb._method = "POST";
      qb._body = Array.isArray(data) ? data[0] : data;
      return qb;
    },

    delete() {
      qb._method = "DELETE";
      return qb;
    },

    single() { return execQuery(qb); },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    then(resolve: (v: { data: any; error: Error | null }) => any, reject?: ((e: unknown) => any) | null) {
      return execQuery(qb).then(resolve, reject ?? undefined);
    },
  };
  return qb;
}

export const supabase = {
  from(table: string): QueryBuilder { return makeQB(table); },
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async (_creds: unknown) => ({ data: null, error: new Error("Auth not configured") }),
    signUp: async (_creds: unknown) => ({ data: null, error: new Error("Auth not configured") }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (_cb: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
};
