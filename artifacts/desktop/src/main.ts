import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

function applyMigrations(dbPath: string): void {
  const migrationsFolder = isDev
    ? path.resolve(__dirname, "../../../lib/db/drizzle")
    : path.join(process.resourcesPath, "migrations");

  console.log(`[desktop] Applying migrations from: ${migrationsFolder}`);
  const sqlite = new Database(dbPath);
  try {
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    const tempDb = drizzle(sqlite);
    migrate(tempDb, { migrationsFolder });
    console.log("[desktop] Migrations applied successfully");
  } finally {
    sqlite.close();
  }
}

async function createWindow(apiPort: number): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      additionalArguments: [`--api-port=${apiPort}`],
    },
  });

  if (isDev) {
    const vitePort = process.env["VITE_PORT"] ?? "5173";
    await win.loadURL(`http://localhost:${vitePort}`);
    win.webContents.openDevTools();
  } else {
    const indexPath = path.join(
      process.resourcesPath,
      "site",
      "dist",
      "index.html",
    );
    await win.loadFile(indexPath);
  }

  return win;
}

async function main() {
  await app.whenReady();

  const dbPath = isDev
    ? path.join(process.cwd(), "app-data.sqlite")
    : path.join(app.getPath("userData"), "app-data.sqlite");

  process.env["SQLITE_PATH"] = dbPath;
  process.env["OFFLINE_MODE"] = "true";
  process.env["NODE_ENV"] = isDev ? "development" : "production";

  applyMigrations(dbPath);

  const { startServer } = await import("@workspace/api-server/app");
  const { port } = await startServer();

  await createWindow(port);

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow(port);
    }
  });
}

main().catch(console.error);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
