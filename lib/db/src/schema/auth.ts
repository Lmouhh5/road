import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import crypto from "crypto";

export const sessionsTable = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess", { mode: "json" }).notNull().$type<Record<string, unknown>>(),
    expire: integer("expire", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export type UpsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
