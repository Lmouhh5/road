import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import {
  projects, employees, assets, suppliers, cash_holders, cash_issues,
  expense_categories, sub_cost_centers, expenses, revenue_invoices,
  revenue_receipts, attendance, payroll_runs, alerts,
} from "@workspace/db/schema";
import { eq, sql, desc, asc } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

router.use(requireAuth);

// ─── PROJECTS ───────────────────────────────────────────────────────────────

router.get("/projects", async (req, res) => {
  try {
    const rows = await db.select().from(projects).orderBy(asc(projects.code));
    res.json(rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /projects failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get("/projects/financial-summary", async (req, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT p.id, p.code, p.name, p.budget::numeric AS budget, p.status,
        COALESCE(SUM(e.amount)::numeric, 0) AS spent,
        CASE WHEN p.budget > 0
          THEN ROUND(((p.budget - COALESCE(SUM(e.amount)::numeric, 0)) / p.budget * 100)::numeric, 2)
          ELSE 0
        END AS margin
      FROM projects p
      LEFT JOIN expenses e ON e.project_id = p.id
      GROUP BY p.id, p.code, p.name, p.budget, p.status
      ORDER BY p.code
    `);
    res.json(rows.rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /projects/financial-summary failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const [row] = await db.insert(projects).values(req.body).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "POST /projects failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.patch("/projects/:id", async (req, res) => {
  try {
    const [row] = await db.update(projects).set({ ...req.body, updated_at: new Date() }).where(eq(projects.id, req.params.id)).returning();
    res.json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "PATCH /projects/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    await db.delete(projects).where(eq(projects.id, req.params.id));
    res.status(204).end();
  } catch (err: unknown) {
    req.log.error({ err }, "DELETE /projects/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── EMPLOYEES ──────────────────────────────────────────────────────────────

router.get("/employees", async (req, res) => {
  try {
    const { status } = req.query;
    const query = db.select().from(employees).orderBy(asc(employees.name));
    const rows = status
      ? await query.where(eq(employees.status, status as string))
      : await query;
    res.json(rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /employees failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/employees", async (req, res) => {
  try {
    const [row] = await db.insert(employees).values(req.body).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "POST /employees failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.patch("/employees/:id", async (req, res) => {
  try {
    const [row] = await db.update(employees).set({ ...req.body, updated_at: new Date() }).where(eq(employees.id, req.params.id)).returning();
    res.json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "PATCH /employees/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.delete("/employees/:id", async (req, res) => {
  try {
    await db.delete(employees).where(eq(employees.id, req.params.id));
    res.status(204).end();
  } catch (err: unknown) {
    req.log.error({ err }, "DELETE /employees/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── ASSETS (MACHINES) ──────────────────────────────────────────────────────

router.get("/assets", async (req, res) => {
  try {
    const rows = await db.select().from(assets).orderBy(asc(assets.code));
    res.json(rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /assets failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/assets", async (req, res) => {
  try {
    const [row] = await db.insert(assets).values(req.body).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "POST /assets failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.patch("/assets/:id", async (req, res) => {
  try {
    const [row] = await db.update(assets).set({ ...req.body, updated_at: new Date() }).where(eq(assets.id, req.params.id)).returning();
    res.json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "PATCH /assets/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.delete("/assets/:id", async (req, res) => {
  try {
    await db.delete(assets).where(eq(assets.id, req.params.id));
    res.status(204).end();
  } catch (err: unknown) {
    req.log.error({ err }, "DELETE /assets/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── SUPPLIERS ──────────────────────────────────────────────────────────────

router.get("/suppliers", async (req, res) => {
  try {
    const rows = await db.select().from(suppliers).orderBy(asc(suppliers.name));
    res.json(rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /suppliers failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/suppliers", async (req, res) => {
  try {
    const [row] = await db.insert(suppliers).values(req.body).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "POST /suppliers failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.patch("/suppliers/:id", async (req, res) => {
  try {
    const [row] = await db.update(suppliers).set({ ...req.body, updated_at: new Date() }).where(eq(suppliers.id, req.params.id)).returning();
    res.json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "PATCH /suppliers/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.delete("/suppliers/:id", async (req, res) => {
  try {
    await db.delete(suppliers).where(eq(suppliers.id, req.params.id));
    res.status(204).end();
  } catch (err: unknown) {
    req.log.error({ err }, "DELETE /suppliers/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── CASH HOLDERS ────────────────────────────────────────────────────────────

router.get("/cash-holders", async (req, res) => {
  try {
    const rows = await db.select().from(cash_holders).orderBy(asc(cash_holders.name));
    res.json(rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /cash-holders failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/cash-holders", async (req, res) => {
  try {
    const [row] = await db.insert(cash_holders).values(req.body).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "POST /cash-holders failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.patch("/cash-holders/:id", async (req, res) => {
  try {
    const [row] = await db.update(cash_holders).set({ ...req.body, updated_at: new Date() }).where(eq(cash_holders.id, req.params.id)).returning();
    res.json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "PATCH /cash-holders/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.delete("/cash-holders/:id", async (req, res) => {
  try {
    await db.delete(cash_holders).where(eq(cash_holders.id, req.params.id));
    res.status(204).end();
  } catch (err: unknown) {
    req.log.error({ err }, "DELETE /cash-holders/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── CASH ISSUES ─────────────────────────────────────────────────────────────

router.get("/cash-issues", async (req, res) => {
  try {
    const rows = await db.select().from(cash_issues).orderBy(desc(cash_issues.issue_date));
    res.json(rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /cash-issues failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/cash-issues", async (req, res) => {
  try {
    const [row] = await db.insert(cash_issues).values(req.body).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "POST /cash-issues failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── EXPENSE CATEGORIES ──────────────────────────────────────────────────────

router.get("/expense-categories", async (req, res) => {
  try {
    const rows = await db.select().from(expense_categories).orderBy(asc(expense_categories.sort_order), asc(expense_categories.name));
    res.json(rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /expense-categories failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/expense-categories", async (req, res) => {
  try {
    const [row] = await db.insert(expense_categories).values(req.body).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "POST /expense-categories failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.patch("/expense-categories/:id", async (req, res) => {
  try {
    const [row] = await db.update(expense_categories).set({ ...req.body, updated_at: new Date() }).where(eq(expense_categories.id, req.params.id)).returning();
    res.json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "PATCH /expense-categories/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.delete("/expense-categories/:id", async (req, res) => {
  try {
    await db.delete(expense_categories).where(eq(expense_categories.id, req.params.id));
    res.status(204).end();
  } catch (err: unknown) {
    req.log.error({ err }, "DELETE /expense-categories/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── SUB COST CENTERS ────────────────────────────────────────────────────────

router.get("/sub-cost-centers", async (req, res) => {
  try {
    const rows = await db.select().from(sub_cost_centers).orderBy(asc(sub_cost_centers.sort_order), asc(sub_cost_centers.name));
    res.json(rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /sub-cost-centers failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/sub-cost-centers", async (req, res) => {
  try {
    const [row] = await db.insert(sub_cost_centers).values(req.body).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "POST /sub-cost-centers failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.patch("/sub-cost-centers/:id", async (req, res) => {
  try {
    const [row] = await db.update(sub_cost_centers).set({ ...req.body, updated_at: new Date() }).where(eq(sub_cost_centers.id, req.params.id)).returning();
    res.json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "PATCH /sub-cost-centers/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.delete("/sub-cost-centers/:id", async (req, res) => {
  try {
    await db.delete(sub_cost_centers).where(eq(sub_cost_centers.id, req.params.id));
    res.status(204).end();
  } catch (err: unknown) {
    req.log.error({ err }, "DELETE /sub-cost-centers/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── EXPENSES ────────────────────────────────────────────────────────────────

router.get("/expenses", async (req, res) => {
  try {
    const rows = await db.select().from(expenses).orderBy(desc(expenses.expense_date));
    res.json(rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /expenses failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/expenses", async (req, res) => {
  try {
    const [row] = await db.insert(expenses).values(req.body).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "POST /expenses failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── REVENUE INVOICES ────────────────────────────────────────────────────────

router.get("/revenue-invoices", async (req, res) => {
  try {
    const rows = await db.select().from(revenue_invoices).orderBy(desc(revenue_invoices.issued_date));
    res.json(rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /revenue-invoices failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/revenue-invoices", async (req, res) => {
  try {
    const [row] = await db.insert(revenue_invoices).values(req.body).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "POST /revenue-invoices failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── ATTENDANCE ──────────────────────────────────────────────────────────────

router.get("/attendance", async (req, res) => {
  try {
    // Accept both ?date= and ?attendance_date= for compatibility
    const dateFilter = (req.query.attendance_date ?? req.query.date) as string | undefined;
    const query = db.select({
      id: attendance.id,
      employee_id: attendance.employee_id,
      project_id: attendance.project_id,
      status: attendance.status,
      hours: attendance.hours,
      attendance_date: attendance.attendance_date,
      employee_name: employees.name,
      employee_role: employees.role,
    }).from(attendance).leftJoin(employees, eq(attendance.employee_id, employees.id));

    const rows = dateFilter
      ? await query.where(eq(attendance.attendance_date, dateFilter))
      : await query.orderBy(desc(attendance.attendance_date));
    res.json(rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /attendance failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.get("/attendance/heatmap", async (req, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT attendance_date, status
      FROM attendance
      WHERE attendance_date >= CURRENT_DATE - INTERVAL '83 days'
      ORDER BY attendance_date
    `);
    res.json(rows.rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /attendance/heatmap failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/attendance", async (req, res) => {
  try {
    const [row] = await db.insert(attendance).values(req.body).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "POST /attendance failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── ALERTS ──────────────────────────────────────────────────────────────────

router.get("/alerts", async (req, res) => {
  try {
    const rows = await db.select().from(alerts).orderBy(desc(alerts.created_at));
    res.json(rows);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /alerts failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.patch("/alerts/:id", async (req, res) => {
  try {
    const [row] = await db.update(alerts).set(req.body).where(eq(alerts.id, req.params.id)).returning();
    res.json(row);
  } catch (err: unknown) {
    req.log.error({ err }, "PATCH /alerts/:id failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
