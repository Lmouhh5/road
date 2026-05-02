CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`severity` text DEFAULT 'medium' NOT NULL,
	`message` text NOT NULL,
	`entity_id` text,
	`entity_type` text,
	`resolved` integer DEFAULT false NOT NULL,
	`resolved_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text,
	`name` text NOT NULL,
	`type` text DEFAULT 'truck' NOT NULL,
	`project_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`hours_month` real DEFAULT 0 NOT NULL,
	`fuel_month` real DEFAULT 0 NOT NULL,
	`cost_month` real DEFAULT 0 NOT NULL,
	`last_service` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_id` text,
	`project_id` text,
	`attendance_date` text NOT NULL,
	`status` text DEFAULT 'present' NOT NULL,
	`hours` real DEFAULT 8 NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cash_holders` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text,
	`balance` real DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cash_issues` (
	`id` text PRIMARY KEY NOT NULL,
	`holder_id` text,
	`request_id` text,
	`amount` real DEFAULT 0 NOT NULL,
	`source` text,
	`note` text,
	`issue_date` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`holder_id`) REFERENCES `cash_holders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`request_id`) REFERENCES `cash_requests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cash_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`requester_id` text,
	`amount` real DEFAULT 0 NOT NULL,
	`purpose` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`request_date` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`requester_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text,
	`project_id` text,
	`hire_date` text,
	`phone` text,
	`status` text DEFAULT 'active' NOT NULL,
	`base_salary` real DEFAULT 0 NOT NULL,
	`cash_held` real DEFAULT 0 NOT NULL,
	`days_worked_month` integer DEFAULT 26 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `expense_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`expense_date` text NOT NULL,
	`project_id` text,
	`category` text,
	`supplier_id` text,
	`employee_id` text,
	`description` text,
	`amount` real DEFAULT 0 NOT NULL,
	`method` text,
	`proof_url` text,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payroll_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`period_month` text NOT NULL,
	`gross_amount` real DEFAULT 0 NOT NULL,
	`net_amount` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`budget` real DEFAULT 0 NOT NULL,
	`contract_value` real,
	`status` text DEFAULT 'on_track' NOT NULL,
	`start_date` text,
	`end_date` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `revenue_invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_number` text,
	`issued_date` text NOT NULL,
	`due_date` text,
	`project_id` text,
	`client` text NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `revenue_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text,
	`receipt_date` text NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`method` text,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `revenue_invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sub_cost_centers` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`contact` text,
	`phone` text,
	`balance` real DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sid` text PRIMARY KEY NOT NULL,
	`sess` text NOT NULL,
	`expire` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `IDX_session_expire` ON `sessions` (`expire`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`first_name` text,
	`last_name` text,
	`profile_image_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);