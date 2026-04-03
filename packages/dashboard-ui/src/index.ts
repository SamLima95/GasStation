import path from "path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env") });
loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

import express from "express";
import { config } from "./config";
import proxyRoutes from "./proxy";

const app = express();

app.use(express.json());
app.use(proxyRoutes);
app.use(express.static(path.join(__dirname, "../public")));

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(config.port, () => {
  console.log(`Dashboard UI at http://localhost:${config.port}`);
});
