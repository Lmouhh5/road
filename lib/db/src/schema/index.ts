import {
  sqliteTable,
  text,
  real,
  integer,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import crypto from "crypto";

function uuid(name: string) {
  return text(name).$defaultFn(() => crypto.randomUUID());
}

function now(name: string) {
  return integer(name, { mode: "timestamp_ms" }).$defaultFn(() => new Date());
}

function today(name: string) {
  return text(name).$defaultFn(() => new Date().toISOString().split("T")[0]);
}

export const projects = sqliteTable("projects", {
  id: uuid("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  budget: real("budget").notNull().default(0),
  contract_value: real("contract_value"),
  status: text("status").notNull().default("on_track"),
  start_date: text("start_date"),
  end_date: text("end_date"),
  created_at: now("created_at").notNull(),
  updated_at: now("updated_at").notNull(),
});

export const employees = sqliteTable("employees", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role"),
  project_id: text("project_id").references(() => projects.id),
  hire_date: text("hire_date"),
  phone: text("phone"),
  status: text("status").notNull().default("active"),
  base_salary: real("base_salary").notNull().default(0),
  cash_held: real("cash_held").notNull().default(0),
  days_worked_month: integer("days_worked_month").notNull().default(26),
  created_at: now("created_at").notNull(),
  updated_at: now("updated_at").notNull(),
});

export const assets = sqliteTable("assets", {
  id: uuid("id").primaryKey(),
  code: text("code"),
  name: text("name").notNull(),
  type: text("type").notNull().default("truck"),
  project_id: text("project_id").references(() => projects.id),
  status: text("status").notNull().default("active"),
  hours_month: real("hours_month").notNull().default(0),
  fuel_month: real("fuel_month").notNull().default(0),
  cost_month: real("cost_month").notNull().default(0),
  last_service: text("last_service"),
  created_at: now("created_at").notNull(),
  updated_at: now("updated_at").notNull(),
});

export const suppliers = sqliteTable("suppliers", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  contact: text("contact"),
  phone: text("phone"),
  balance: real("balance").notNull().default(0),
  created_at: now("created_at").notNull(),
  updated_at: now("updated_at").notNull(),
});

export const cash_holders = sqliteTable("cash_holders", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role"),
  balance: real("balance").notNull().default(0),
  created_at: now("created_at").notNull(),
  updated_at: now("updated_at").notNull(),
});

export const cash_requests = sqliteTable("cash_requests", {
  id: uuid("id").primaryKey(),
  project_id: text("project_id").references(() => projects.id),
  requester_id: text("requester_id").references(() => employees.id),
  amount: real("amount").notNull().default(0),
  purpose: text("purpose"),
  status: text("status").notNull().default("pending"),
  request_date: today("request_date").notNull(),
  created_at: now("created_at").notNull(),
  updated_at: now("updated_at").notNull(),
});

export const cash_issues = sqliteTable("cash_issues", {
  id: uuid("id").primaryKey(),
  holder_id: text("holder_id").references(() => cash_holders.id),
  request_id: text("request_id").references(() => cash_requests.id),
  amount: real("amount").notNull().default(0),
  source: text("source"),
  note: text("note"),
  issue_date: today("issue_date").notNull(),
  created_at: now("created_at").notNull(),
});

export const expense_categories = sqliteTable("expense_categories", {
  id: uuid("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: now("created_at").notNull(),
  updated_at: now("updated_at").notNull(),
});

export const sub_cost_centers = sqliteTable("sub_cost_centers", {
  id: uuid("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: now("created_at").notNull(),
  updated_at: now("updated_at").notNull(),
});

export const expenses = sqliteTable("expenses", {
  id: uuid("id").primaryKey(),
  expense_date: today("expense_date").notNull(),
  project_id: text("project_id").references(() => projects.id),
  category: text("category"),
  supplier_id: text("supplier_id").references(() => suppliers.id),
  employee_id: text("employee_id").references(() => employees.id),
  description: text("description"),
  amount: real("amount").notNull().default(0),
  method: text("method"),
  proof_url: text("proof_url"),
  note: text("note"),
  created_at: now("created_at").notNull(),
});

export const revenue_invoices = sqliteTable("revenue_invoices", {
  id: uuid("id").primaryKey(),
  invoice_number: text("invoice_number"),
  issued_date: today("issued_date").notNull(),
  due_date: text("due_date"),
  project_id: text("project_id").references(() => projects.id),
  client: text("client").notNull(),
  amount: real("amount").notNull().default(0),
  paid_amount: real("paid_amount").notNull().default(0),
  status: text("status").notNull().default("pending"),
  created_at: now("created_at").notNull(),
  updated_at: now("updated_at").notNull(),
});

export const revenue_receipts = sqliteTable("revenue_receipts", {
  id: uuid("id").primaryKey(),
  invoice_id: text("invoice_id").references(() => revenue_invoices.id),
  receipt_date: today("receipt_date").notNull(),
  amount: real("amount").notNull().default(0),
  method: text("method"),
  note: text("note"),
  created_at: now("created_at").notNull(),
});

export const attendance = sqliteTable("attendance", {
  id: uuid("id").primaryKey(),
  employee_id: text("employee_id").references(() => employees.id),
  project_id: text("project_id").references(() => projects.id),
  attendance_date: today("attendance_date").notNull(),
  status: text("status").notNull().default("present"),
  hours: real("hours").notNull().default(8),
  note: text("note"),
  created_at: now("created_at").notNull(),
});

export const payroll_runs = sqliteTable("payroll_runs", {
  id: uuid("id").primaryKey(),
  project_id: text("project_id").references(() => projects.id),
  period_month: text("period_month").notNull(),
  gross_amount: real("gross_amount").notNull().default(0),
  net_amount: real("net_amount").notNull().default(0),
  status: text("status").notNull().default("draft"),
  note: text("note"),
  created_at: now("created_at").notNull(),
  updated_at: now("updated_at").notNull(),
});

export const alerts = sqliteTable("alerts", {
  id: uuid("id").primaryKey(),
  type: text("type").notNull(),
  severity: text("severity").notNull().default("medium"),
  message: text("message").notNull(),
  entity_id: text("entity_id"),
  entity_type: text("entity_type"),
  resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
  resolved_at: integer("resolved_at", { mode: "timestamp_ms" }),
  created_at: now("created_at").notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, created_at: true, updated_at: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, created_at: true, updated_at: true });
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, created_at: true, updated_at: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, created_at: true, updated_at: true });
export const insertCashHolderSchema = createInsertSchema(cash_holders).omit({ id: true, created_at: true, updated_at: true });
export const insertCashIssueSchema = createInsertSchema(cash_issues).omit({ id: true, created_at: true });
export const insertExpenseCategorySchema = createInsertSchema(expense_categories).omit({ id: true, created_at: true, updated_at: true });
export const insertSubCostCenterSchema = createInsertSchema(sub_cost_centers).omit({ id: true, created_at: true, updated_at: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, created_at: true });
export const insertRevenueInvoiceSchema = createInsertSchema(revenue_invoices).omit({ id: true, created_at: true, updated_at: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, created_at: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, created_at: true });

export type Project = typeof projects.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type CashHolder = typeof cash_holders.$inferSelect;
export type CashIssue = typeof cash_issues.$inferSelect;
export type ExpenseCategory = typeof expense_categories.$inferSelect;
export type SubCostCenter = typeof sub_cost_centers.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type RevenueInvoice = typeof revenue_invoices.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Alert = typeof alerts.$inferSelect;

export * from "./auth";
