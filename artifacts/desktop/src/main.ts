import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import http from "http";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

const BACKUP_KEEP = 5;
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

// ── Migrations ───────────────────────────────────────────────────────────────

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

// ── Auto-backup ──────────────────────────────────────────────────────────────

function getBackupDir(): string {
  const base = isDev ? process.cwd() : app.getPath("userData");
  const dir = path.join(base, "backups");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function fetchBackupData(apiPort: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${apiPort}/api/backup/export`, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

function pruneOldBackups(dir: string): void {
  try {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.startsWith("routis-backup-") && f.endsWith(".json"))
      .map((f) => ({ name: f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);

    files.slice(BACKUP_KEEP).forEach(({ name }) => {
      try {
        fs.unlinkSync(path.join(dir, name));
      } catch {
        // ignore individual deletion errors
      }
    });
  } catch (err) {
    console.warn("[desktop] Could not prune old backups:", err);
  }
}

async function createAutoBackup(apiPort: number): Promise<void> {
  try {
    const dir = getBackupDir();
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const filename = `routis-backup-${timestamp}.json`;
    const data = await fetchBackupData(apiPort);
    fs.writeFileSync(path.join(dir, filename), data);
    pruneOldBackups(dir);
    console.log(`[desktop] Auto-backup saved: ${filename}`);
  } catch (err) {
    console.error("[desktop] Auto-backup failed:", err);
  }
}

function scheduleAutoBackup(apiPort: number): void {
  void createAutoBackup(apiPort);
  setInterval(() => {
    void createAutoBackup(apiPort);
  }, BACKUP_INTERVAL_MS);
}

// ── Window ───────────────────────────────────────────────────────────────────

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

// ── Entry point ──────────────────────────────────────────────────────────────

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

  scheduleAutoBackup(port);
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
