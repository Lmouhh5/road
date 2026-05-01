// Typed fetch-based adapter replacing @supabase/supabase-js.
// No runtime dependency on the Supabase SDK.

const BASE = "/api";
const API_SOURCE_HEADER = { "x-api-source": "routis-web" };

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

// Data returned from the API. Using a well-known JSON-safe type without circular self-reference.
type JsonObject = Record<string, unknown>;
type JsonValue = JsonObject | JsonObject[] | string | number | boolean | null;

type QueryResult = { data: JsonValue; error: null } | { data: null; error: Error };

interface QueryBuilder {
  readonly _table: string;
  readonly _filters: FilterEntry[];
  _method: QueryMethod;
  _filterId: string | undefined;
  _body: Record<string, unknown> | undefined;
  select(cols?: string): QueryBuilder;
  eq(col: string, val: unknown): QueryBuilder;
  gte(col: string, val: unknown): QueryBuilder;
  order(col: string, opts?: { ascending?: boolean }): QueryBuilder;
  update(data: Record<string, unknown>): QueryBuilder;
  insert(data: Record<string, unknown> | Record<string, unknown>[]): QueryBuilder;
  delete(): QueryBuilder;
  single(): Promise<QueryResult>;
  then<TResult1 = QueryResult, TResult2 = never>(
    resolve: (v: QueryResult) => TResult1 | PromiseLike<TResult1>,
    reject?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
}

async function execQuery(qb: QueryBuilder): Promise<QueryResult> {
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
      const resp = await fetch(url, { headers: API_SOURCE_HEADER });
      if (!resp.ok) throw new Error(await resp.text());
      return { data: (await resp.json()) as JsonValue, error: null };
    }

    if ((method === "PATCH" || method === "DELETE") && qb._filterId != null) {
      url += `/${qb._filterId}`;
    }

    const resp = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...API_SOURCE_HEADER },
      body: method !== "DELETE" ? JSON.stringify(qb._body ?? {}) : undefined,
    });
    if (!resp.ok) throw new Error(await resp.text());
    const data = method === "DELETE" ? null : (await resp.json()) as JsonValue;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

function makeQB(table: string): QueryBuilder {
  const filters: FilterEntry[] = [];
  let method: QueryMethod = "GET";
  let filterId: string | undefined;
  let body: Record<string, unknown> | undefined;

  const qb: QueryBuilder = {
    get _table() { return table; },
    get _filters() { return filters; },
    get _method() { return method; },
    set _method(v) { method = v; },
    get _filterId() { return filterId; },
    set _filterId(v) { filterId = v; },
    get _body() { return body; },
    set _body(v) { body = v; },

    select(_cols?: string) { return qb; },

    eq(col: string, val: unknown) {
      if (col === "id") filterId = String(val);
      else filters.push({ col, op: "eq", val });
      return qb;
    },

    gte(col: string, val: unknown) {
      filters.push({ col, op: "gte", val });
      return qb;
    },

    order(_col: string, _opts?: { ascending?: boolean }) { return qb; },

    update(data: Record<string, unknown>) {
      method = "PATCH";
      body = data;
      return qb;
    },

    insert(data: Record<string, unknown> | Record<string, unknown>[]) {
      method = "POST";
      body = Array.isArray(data) ? data[0] : data;
      return qb;
    },

    delete() {
      method = "DELETE";
      return qb;
    },

    single() { return execQuery(qb); },

    then<TResult1 = QueryResult, TResult2 = never>(
      resolve: (v: QueryResult) => TResult1 | PromiseLike<TResult1>,
      reject?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
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
