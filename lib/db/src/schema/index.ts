import { pgTable, uuid, text, numeric, boolean, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull(),
  name: text("name").notNull(),
  budget: numeric("budget", { precision: 18, scale: 2 }).notNull().default("0"),
  contract_value: numeric("contract_value", { precision: 18, scale: 2 }),
  status: text("status").notNull().default("on_track"),
  start_date: date("start_date"),
  end_date: date("end_date"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role"),
  project_id: uuid("project_id").references(() => projects.id),
  hire_date: date("hire_date"),
  phone: text("phone"),
  status: text("status").notNull().default("active"),
  base_salary: numeric("base_salary", { precision: 18, scale: 2 }).notNull().default("0"),
  cash_held: numeric("cash_held", { precision: 18, scale: 2 }).notNull().default("0"),
  days_worked_month: integer("days_worked_month").notNull().default(26),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code"),
  name: text("name").notNull(),
  type: text("type").notNull().default("truck"),
  project_id: uuid("project_id").references(() => projects.id),
  status: text("status").notNull().default("active"),
  hours_month: numeric("hours_month", { precision: 10, scale: 2 }).notNull().default("0"),
  fuel_month: numeric("fuel_month", { precision: 10, scale: 2 }).notNull().default("0"),
  cost_month: numeric("cost_month", { precision: 18, scale: 2 }).notNull().default("0"),
  last_service: date("last_service"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category"),
  contact: text("contact"),
  phone: text("phone"),
  balance: numeric("balance", { precision: 18, scale: 2 }).notNull().default("0"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cash_holders = pgTable("cash_holders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role"),
  balance: numeric("balance", { precision: 18, scale: 2 }).notNull().default("0"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cash_requests = pgTable("cash_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  project_id: uuid("project_id").references(() => projects.id),
  requester_id: uuid("requester_id").references(() => employees.id),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull().default("0"),
  purpose: text("purpose"),
  status: text("status").notNull().default("pending"),
  request_date: date("request_date").notNull().default(sql`CURRENT_DATE`),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cash_issues = pgTable("cash_issues", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  holder_id: uuid("holder_id").references(() => cash_holders.id),
  request_id: uuid("request_id").references(() => cash_requests.id),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull().default("0"),
  source: text("source"),
  note: text("note"),
  issue_date: date("issue_date").notNull().default(sql`CURRENT_DATE`),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const expense_categories = pgTable("expense_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull(),
  name: text("name").notNull(),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sub_cost_centers = pgTable("sub_cost_centers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull(),
  name: text("name").notNull(),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  expense_date: date("expense_date").notNull().default(sql`CURRENT_DATE`),
  project_id: uuid("project_id").references(() => projects.id),
  category: text("category"),
  supplier_id: uuid("supplier_id").references(() => suppliers.id),
  employee_id: uuid("employee_id").references(() => employees.id),
  description: text("description"),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull().default("0"),
  method: text("method"),
  proof_url: text("proof_url"),
  note: text("note"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const revenue_invoices = pgTable("revenue_invoices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoice_number: text("invoice_number"),
  issued_date: date("issued_date").notNull().default(sql`CURRENT_DATE`),
  due_date: date("due_date"),
  project_id: uuid("project_id").references(() => projects.id),
  client: text("client").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull().default("0"),
  paid_amount: numeric("paid_amount", { precision: 18, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("pending"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const revenue_receipts = pgTable("revenue_receipts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoice_id: uuid("invoice_id").references(() => revenue_invoices.id),
  receipt_date: date("receipt_date").notNull().default(sql`CURRENT_DATE`),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull().default("0"),
  method: text("method"),
  note: text("note"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employee_id: uuid("employee_id").references(() => employees.id),
  project_id: uuid("project_id").references(() => projects.id),
  attendance_date: date("attendance_date").notNull().default(sql`CURRENT_DATE`),
  status: text("status").notNull().default("present"),
  hours: numeric("hours", { precision: 5, scale: 2 }).notNull().default("8"),
  note: text("note"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payroll_runs = pgTable("payroll_runs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  project_id: uuid("project_id").references(() => projects.id),
  period_month: text("period_month").notNull(),
  gross_amount: numeric("gross_amount", { precision: 18, scale: 2 }).notNull().default("0"),
  net_amount: numeric("net_amount", { precision: 18, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("draft"),
  note: text("note"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  severity: text("severity").notNull().default("medium"),
  message: text("message").notNull(),
  entity_id: text("entity_id"),
  entity_type: text("entity_type"),
  resolved: boolean("resolved").notNull().default(false),
  resolved_at: timestamp("resolved_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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
