import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import {
  projects, employees, assets, suppliers, cash_holders, cash_requests,
  cash_issues, expense_categories, sub_cost_centers, expenses,
  revenue_invoices, revenue_receipts, attendance, payroll_runs, alerts,
} from "@workspace/db/schema";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

router.use(requireAuth);

async function deleteAllData(): Promise<void> {
  await db.delete(alerts);
  await db.delete(attendance);
  await db.delete(payroll_runs);
  await db.delete(revenue_receipts);
  await db.delete(cash_issues);
  await db.delete(expenses);
  await db.delete(cash_requests);
  await db.delete(revenue_invoices);
  await db.delete(cash_holders);
  await db.delete(sub_cost_centers);
  await db.delete(expense_categories);
  await db.delete(assets);
  await db.delete(employees);
  await db.delete(suppliers);
  await db.delete(projects);
}

router.get("/backup/export", async (req: Request, res: Response) => {
  try {
    const [
      projectRows, employeeRows, assetRows, supplierRows,
      cashHolderRows, cashRequestRows, cashIssueRows,
      expenseCategoryRows, subCostCenterRows, expenseRows,
      revenueInvoiceRows, revenueReceiptRows, attendanceRows,
      payrollRunRows, alertRows,
    ] = await Promise.all([
      db.select().from(projects),
      db.select().from(employees),
      db.select().from(assets),
      db.select().from(suppliers),
      db.select().from(cash_holders),
      db.select().from(cash_requests),
      db.select().from(cash_issues),
      db.select().from(expense_categories),
      db.select().from(sub_cost_centers),
      db.select().from(expenses),
      db.select().from(revenue_invoices),
      db.select().from(revenue_receipts),
      db.select().from(attendance),
      db.select().from(payroll_runs),
      db.select().from(alerts),
    ]);

    const backup = {
      version: 1,
      exported_at: new Date().toISOString(),
      data: {
        projects: projectRows,
        employees: employeeRows,
        assets: assetRows,
        suppliers: supplierRows,
        cash_holders: cashHolderRows,
        cash_requests: cashRequestRows,
        cash_issues: cashIssueRows,
        expense_categories: expenseCategoryRows,
        sub_cost_centers: subCostCenterRows,
        expenses: expenseRows,
        revenue_invoices: revenueInvoiceRows,
        revenue_receipts: revenueReceiptRows,
        attendance: attendanceRows,
        payroll_runs: payrollRunRows,
        alerts: alertRows,
      },
    };

    const filename = `routis-backup-${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.json(backup);
  } catch (err: unknown) {
    req.log.error({ err }, "GET /backup/export failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/backup/import", async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backup = req.body as { version?: number; data?: Record<string, any[]> };

    if (!backup?.data || typeof backup.data !== "object") {
      res.status(400).json({ error: "Invalid backup format: missing data object" });
      return;
    }

    const d = backup.data;

    await deleteAllData();

    // Insert in parent-first order to satisfy FK constraints
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ins = async (table: any, rows: any[] | undefined) => {
      if (rows?.length) await db.insert(table).values(rows);
    };

    await ins(projects, d["projects"]);
    await ins(suppliers, d["suppliers"]);
    await ins(employees, d["employees"]);
    await ins(assets, d["assets"]);
    await ins(expense_categories, d["expense_categories"]);
    await ins(sub_cost_centers, d["sub_cost_centers"]);
    await ins(cash_holders, d["cash_holders"]);
    await ins(revenue_invoices, d["revenue_invoices"]);
    await ins(cash_requests, d["cash_requests"]);
    await ins(cash_issues, d["cash_issues"]);
    await ins(expenses, d["expenses"]);
    await ins(revenue_receipts, d["revenue_receipts"]);
    await ins(payroll_runs, d["payroll_runs"]);
    await ins(attendance, d["attendance"]);
    await ins(alerts, d["alerts"]);

    res.json({ success: true });
  } catch (err: unknown) {
    req.log.error({ err }, "POST /backup/import failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/backup/reset", async (req: Request, res: Response) => {
  try {
    await deleteAllData();
    res.json({ success: true });
  } catch (err: unknown) {
    req.log.error({ err }, "POST /backup/reset failed");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
