import { defineConfig } from "drizzle-kit";
import path from "path";

const dbPath =
  process.env["SQLITE_PATH"] ??
  path.join(process.cwd(), "app-data.sqlite");

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "sqlite",
  out: path.join(__dirname, "./drizzle"),
  dbCredentials: {
    url: dbPath,
  },
});
