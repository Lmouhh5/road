import { contextBridge } from "electron";

const args = process.argv;
const apiPortArg = args.find((arg) => arg.startsWith("--api-port="));
const apiPort = apiPortArg ? parseInt(apiPortArg.split("=")[1]!, 10) : 3000;

contextBridge.exposeInMainWorld("__ELECTRON__", {
  apiPort,
  apiBaseUrl: `http://localhost:${apiPort}`,
});
