import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

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
