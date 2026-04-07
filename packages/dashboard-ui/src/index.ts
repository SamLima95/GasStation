import path from "path";
import fs from "fs";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env") });
loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

import express from "express";
import { config } from "./config";
import proxyRoutes from "./proxy";

const app = express();

app.use(express.json());
app.use(proxyRoutes);

const clientDist = path.join(__dirname, "../dist/client");
const publicDir = path.join(__dirname, "../public");
const staticDir = fs.existsSync(clientDist) ? clientDist : publicDir;

app.use(express.static(staticDir));

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(config.port, () => {
  console.log(`Dashboard UI at http://localhost:${config.port}`);
});
