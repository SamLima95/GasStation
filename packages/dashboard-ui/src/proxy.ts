import { Router } from "express";
import { services } from "./config";

const router = Router();

// ---------- Health check fan-out ----------
router.get("/api/health-check", async (_req, res) => {
  const results = await Promise.allSettled(
    services.map(async (svc) => {
      const start = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      try {
        const r = await fetch(`${svc.url}/health`, { signal: controller.signal });
        clearTimeout(timeout);
        const body = await r.json();
        return {
          name: svc.name,
          key: svc.key,
          url: svc.url,
          status: r.ok ? "ok" as const : "down" as const,
          responseTimeMs: Date.now() - start,
          detail: body,
        };
      } catch (err) {
        clearTimeout(timeout);
        return {
          name: svc.name,
          key: svc.key,
          url: svc.url,
          status: "down" as const,
          responseTimeMs: Date.now() - start,
          detail: err instanceof Error ? err.message : String(err),
        };
      }
    }),
  );

  const data = results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { name: "unknown", key: "unknown", url: "", status: "down" as const, responseTimeMs: 0, detail: String(r.reason) },
  );

  res.json(data);
});

// ---------- Dashboard proxy ----------
router.get("/api/dashboard", async (req, res) => {
  const dashboardUrl = services.find((s) => s.key === "dashboard")!.url;
  const qs = new URLSearchParams(req.query as Record<string, string>).toString();
  const url = `${dashboardUrl}/api/v1/dashboard${qs ? `?${qs}` : ""}`;

  try {
    const r = await fetch(url, {
      headers: { authorization: req.headers.authorization ?? "" },
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Dashboard service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ---------- Auth login proxy ----------
router.post("/api/auth/login", async (req, res) => {
  const identityUrl = services.find((s) => s.key === "identity")!.url;
  try {
    const r = await fetch(`${identityUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Identity service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
