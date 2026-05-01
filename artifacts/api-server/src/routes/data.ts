import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  projects, employees, assets, suppliers, cash_holders, cash_issues,
  expense_categories, sub_cost_centers, expenses, revenue_invoices,
  revenue_receipts, attendance, payroll_runs, alerts,
} from "@workspace/db/schema";
import { eq, sql, desc, asc } from "drizzle-orm";

const router: IRouter = Router();

// ─── PROJECTS ───────────────────────────────────────────────────────────────

router.get("/projects", async (req, res) => {
  try {
    const rows = await db.select().from(projects).orderBy(asc(projects.code));
    res.json(rows);
  } catch (e: any) {
    req.log.error({ err: e }, "GET /projects failed");
    res.status(500).json({ error: e.message });
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
  } catch (e: any) {
    req.log.error({ err: e }, "GET /projects/financial-summary failed");
    res.status(500).json({ error: e.message });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const [row] = await db.insert(projects).values(req.body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "POST /projects failed");
    res.status(500).json({ error: e.message });
  }
});

router.patch("/projects/:id", async (req, res) => {
  try {
    const [row] = await db.update(projects).set({ ...req.body, updated_at: new Date() }).where(eq(projects.id, req.params.id)).returning();
    res.json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "PATCH /projects/:id failed");
    res.status(500).json({ error: e.message });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    await db.delete(projects).where(eq(projects.id, req.params.id));
    res.status(204).end();
  } catch (e: any) {
    req.log.error({ err: e }, "DELETE /projects/:id failed");
    res.status(500).json({ error: e.message });
  }
});

// ─── EMPLOYEES ──────────────────────────────────────────────────────────────

router.get("/employees", async (req, res) => {
  try {
    const rows = await db.select().from(employees).orderBy(asc(employees.name));
    res.json(rows);
  } catch (e: any) {
    req.log.error({ err: e }, "GET /employees failed");
    res.status(500).json({ error: e.message });
  }
});

router.post("/employees", async (req, res) => {
  try {
    const [row] = await db.insert(employees).values(req.body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "POST /employees failed");
    res.status(500).json({ error: e.message });
  }
});

router.patch("/employees/:id", async (req, res) => {
  try {
    const [row] = await db.update(employees).set({ ...req.body, updated_at: new Date() }).where(eq(employees.id, req.params.id)).returning();
    res.json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "PATCH /employees/:id failed");
    res.status(500).json({ error: e.message });
  }
});

router.delete("/employees/:id", async (req, res) => {
  try {
    await db.delete(employees).where(eq(employees.id, req.params.id));
    res.status(204).end();
  } catch (e: any) {
    req.log.error({ err: e }, "DELETE /employees/:id failed");
    res.status(500).json({ error: e.message });
  }
});

// ─── ASSETS (MACHINES) ──────────────────────────────────────────────────────

router.get("/assets", async (req, res) => {
  try {
    const rows = await db.select().from(assets).orderBy(asc(assets.code));
    res.json(rows);
  } catch (e: any) {
    req.log.error({ err: e }, "GET /assets failed");
    res.status(500).json({ error: e.message });
  }
});

router.post("/assets", async (req, res) => {
  try {
    const [row] = await db.insert(assets).values(req.body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "POST /assets failed");
    res.status(500).json({ error: e.message });
  }
});

router.patch("/assets/:id", async (req, res) => {
  try {
    const [row] = await db.update(assets).set({ ...req.body, updated_at: new Date() }).where(eq(assets.id, req.params.id)).returning();
    res.json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "PATCH /assets/:id failed");
    res.status(500).json({ error: e.message });
  }
});

router.delete("/assets/:id", async (req, res) => {
  try {
    await db.delete(assets).where(eq(assets.id, req.params.id));
    res.status(204).end();
  } catch (e: any) {
    req.log.error({ err: e }, "DELETE /assets/:id failed");
    res.status(500).json({ error: e.message });
  }
});

// ─── SUPPLIERS ──────────────────────────────────────────────────────────────

router.get("/suppliers", async (req, res) => {
  try {
    const rows = await db.select().from(suppliers).orderBy(asc(suppliers.name));
    res.json(rows);
  } catch (e: any) {
    req.log.error({ err: e }, "GET /suppliers failed");
    res.status(500).json({ error: e.message });
  }
});

router.post("/suppliers", async (req, res) => {
  try {
    const [row] = await db.insert(suppliers).values(req.body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "POST /suppliers failed");
    res.status(500).json({ error: e.message });
  }
});

router.patch("/suppliers/:id", async (req, res) => {
  try {
    const [row] = await db.update(suppliers).set({ ...req.body, updated_at: new Date() }).where(eq(suppliers.id, req.params.id)).returning();
    res.json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "PATCH /suppliers/:id failed");
    res.status(500).json({ error: e.message });
  }
});

router.delete("/suppliers/:id", async (req, res) => {
  try {
    await db.delete(suppliers).where(eq(suppliers.id, req.params.id));
    res.status(204).end();
  } catch (e: any) {
    req.log.error({ err: e }, "DELETE /suppliers/:id failed");
    res.status(500).json({ error: e.message });
  }
});

// ─── CASH HOLDERS ────────────────────────────────────────────────────────────

router.get("/cash-holders", async (req, res) => {
  try {
    const rows = await db.select().from(cash_holders).orderBy(asc(cash_holders.name));
    res.json(rows);
  } catch (e: any) {
    req.log.error({ err: e }, "GET /cash-holders failed");
    res.status(500).json({ error: e.message });
  }
});

router.post("/cash-holders", async (req, res) => {
  try {
    const [row] = await db.insert(cash_holders).values(req.body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "POST /cash-holders failed");
    res.status(500).json({ error: e.message });
  }
});

router.patch("/cash-holders/:id", async (req, res) => {
  try {
    const [row] = await db.update(cash_holders).set({ ...req.body, updated_at: new Date() }).where(eq(cash_holders.id, req.params.id)).returning();
    res.json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "PATCH /cash-holders/:id failed");
    res.status(500).json({ error: e.message });
  }
});

router.delete("/cash-holders/:id", async (req, res) => {
  try {
    await db.delete(cash_holders).where(eq(cash_holders.id, req.params.id));
    res.status(204).end();
  } catch (e: any) {
    req.log.error({ err: e }, "DELETE /cash-holders/:id failed");
    res.status(500).json({ error: e.message });
  }
});

// ─── CASH ISSUES ─────────────────────────────────────────────────────────────

router.get("/cash-issues", async (req, res) => {
  try {
    const rows = await db.select().from(cash_issues).orderBy(desc(cash_issues.issue_date));
    res.json(rows);
  } catch (e: any) {
    req.log.error({ err: e }, "GET /cash-issues failed");
    res.status(500).json({ error: e.message });
  }
});

router.post("/cash-issues", async (req, res) => {
  try {
    const [row] = await db.insert(cash_issues).values(req.body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "POST /cash-issues failed");
    res.status(500).json({ error: e.message });
  }
});

// ─── EXPENSE CATEGORIES ──────────────────────────────────────────────────────

router.get("/expense-categories", async (req, res) => {
  try {
    const rows = await db.select().from(expense_categories).orderBy(asc(expense_categories.sort_order), asc(expense_categories.name));
    res.json(rows);
  } catch (e: any) {
    req.log.error({ err: e }, "GET /expense-categories failed");
    res.status(500).json({ error: e.message });
  }
});

router.post("/expense-categories", async (req, res) => {
  try {
    const [row] = await db.insert(expense_categories).values(req.body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "POST /expense-categories failed");
    res.status(500).json({ error: e.message });
  }
});

router.patch("/expense-categories/:id", async (req, res) => {
  try {
    const [row] = await db.update(expense_categories).set({ ...req.body, updated_at: new Date() }).where(eq(expense_categories.id, req.params.id)).returning();
    res.json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "PATCH /expense-categories/:id failed");
    res.status(500).json({ error: e.message });
  }
});

router.delete("/expense-categories/:id", async (req, res) => {
  try {
    await db.delete(expense_categories).where(eq(expense_categories.id, req.params.id));
    res.status(204).end();
  } catch (e: any) {
    req.log.error({ err: e }, "DELETE /expense-categories/:id failed");
    res.status(500).json({ error: e.message });
  }
});

// ─── SUB COST CENTERS ────────────────────────────────────────────────────────

router.get("/sub-cost-centers", async (req, res) => {
  try {
    const rows = await db.select().from(sub_cost_centers).orderBy(asc(sub_cost_centers.sort_order), asc(sub_cost_centers.name));
    res.json(rows);
  } catch (e: any) {
    req.log.error({ err: e }, "GET /sub-cost-centers failed");
    res.status(500).json({ error: e.message });
  }
});

router.post("/sub-cost-centers", async (req, res) => {
  try {
    const [row] = await db.insert(sub_cost_centers).values(req.body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "POST /sub-cost-centers failed");
    res.status(500).json({ error: e.message });
  }
});

router.patch("/sub-cost-centers/:id", async (req, res) => {
  try {
    const [row] = await db.update(sub_cost_centers).set({ ...req.body, updated_at: new Date() }).where(eq(sub_cost_centers.id, req.params.id)).returning();
    res.json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "PATCH /sub-cost-centers/:id failed");
    res.status(500).json({ error: e.message });
  }
});

router.delete("/sub-cost-centers/:id", async (req, res) => {
  try {
    await db.delete(sub_cost_centers).where(eq(sub_cost_centers.id, req.params.id));
    res.status(204).end();
  } catch (e: any) {
    req.log.error({ err: e }, "DELETE /sub-cost-centers/:id failed");
    res.status(500).json({ error: e.message });
  }
});

// ─── EXPENSES ────────────────────────────────────────────────────────────────

router.get("/expenses", async (req, res) => {
  try {
    const rows = await db.select().from(expenses).orderBy(desc(expenses.expense_date));
    res.json(rows);
  } catch (e: any) {
    req.log.error({ err: e }, "GET /expenses failed");
    res.status(500).json({ error: e.message });
  }
});

router.post("/expenses", async (req, res) => {
  try {
    const [row] = await db.insert(expenses).values(req.body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "POST /expenses failed");
    res.status(500).json({ error: e.message });
  }
});

// ─── REVENUE INVOICES ────────────────────────────────────────────────────────

router.get("/revenue-invoices", async (req, res) => {
  try {
    const rows = await db.select().from(revenue_invoices).orderBy(desc(revenue_invoices.issued_date));
    res.json(rows);
  } catch (e: any) {
    req.log.error({ err: e }, "GET /revenue-invoices failed");
    res.status(500).json({ error: e.message });
  }
});

router.post("/revenue-invoices", async (req, res) => {
  try {
    const [row] = await db.insert(revenue_invoices).values(req.body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "POST /revenue-invoices failed");
    res.status(500).json({ error: e.message });
  }
});

// ─── ATTENDANCE ──────────────────────────────────────────────────────────────

router.get("/attendance", async (req, res) => {
  try {
    const { date } = req.query;
    let query = db.select({
      id: attendance.id,
      employee_id: attendance.employee_id,
      project_id: attendance.project_id,
      status: attendance.status,
      hours: attendance.hours,
      attendance_date: attendance.attendance_date,
      employee_name: employees.name,
      employee_role: employees.role,
    }).from(attendance).leftJoin(employees, eq(attendance.employee_id, employees.id));

    const rows = date
      ? await query.where(eq(attendance.attendance_date, date as string))
      : await query.orderBy(desc(attendance.attendance_date));
    res.json(rows);
  } catch (e: any) {
    req.log.error({ err: e }, "GET /attendance failed");
    res.status(500).json({ error: e.message });
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
  } catch (e: any) {
    req.log.error({ err: e }, "GET /attendance/heatmap failed");
    res.status(500).json({ error: e.message });
  }
});

router.post("/attendance", async (req, res) => {
  try {
    const [row] = await db.insert(attendance).values(req.body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "POST /attendance failed");
    res.status(500).json({ error: e.message });
  }
});

// ─── ALERTS ──────────────────────────────────────────────────────────────────

router.get("/alerts", async (req, res) => {
  try {
    const rows = await db.select().from(alerts).orderBy(desc(alerts.created_at));
    res.json(rows);
  } catch (e: any) {
    req.log.error({ err: e }, "GET /alerts failed");
    res.status(500).json({ error: e.message });
  }
});

router.patch("/alerts/:id", async (req, res) => {
  try {
    const [row] = await db.update(alerts).set(req.body).where(eq(alerts.id, req.params.id)).returning();
    res.json(row);
  } catch (e: any) {
    req.log.error({ err: e }, "PATCH /alerts/:id failed");
    res.status(500).json({ error: e.message });
  }
});

export default router;
