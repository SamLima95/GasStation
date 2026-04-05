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

// ---------- Catalog proxy ----------
router.get("/api/catalog", async (req, res) => {
  const catalogUrl = services.find((s) => s.key === "catalog")!.url;
  try {
    const r = await fetch(`${catalogUrl}/api/items`, {
      headers: { authorization: req.headers.authorization ?? "" },
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Catalog service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/api/catalog", async (req, res) => {
  const catalogUrl = services.find((s) => s.key === "catalog")!.url;
  try {
    const r = await fetch(`${catalogUrl}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: req.headers.authorization ?? "",
      },
      body: JSON.stringify(req.body),
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Catalog service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ---------- Order service proxy (clientes + pedidos) ----------
router.get("/api/clientes", async (req, res) => {
  const orderUrl = services.find((s) => s.key === "order")!.url;
  try {
    const qs = new URLSearchParams(req.query as Record<string, string>).toString();
    const r = await fetch(`${orderUrl}/api/clientes${qs ? `?${qs}` : ""}`, {
      headers: { authorization: req.headers.authorization ?? "" },
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Order service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/api/clientes", async (req, res) => {
  const orderUrl = services.find((s) => s.key === "order")!.url;
  try {
    const r = await fetch(`${orderUrl}/api/clientes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: req.headers.authorization ?? "",
      },
      body: JSON.stringify(req.body),
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Order service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.get("/api/pedidos", async (req, res) => {
  const orderUrl = services.find((s) => s.key === "order")!.url;
  try {
    const qs = new URLSearchParams(req.query as Record<string, string>).toString();
    const r = await fetch(`${orderUrl}/api/pedidos${qs ? `?${qs}` : ""}`, {
      headers: { authorization: req.headers.authorization ?? "" },
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Order service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/api/pedidos", async (req, res) => {
  const orderUrl = services.find((s) => s.key === "order")!.url;
  try {
    const r = await fetch(`${orderUrl}/api/pedidos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: req.headers.authorization ?? "",
      },
      body: JSON.stringify(req.body),
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Order service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.patch("/api/pedidos/:id/confirm", async (req, res) => {
  const orderUrl = services.find((s) => s.key === "order")!.url;
  try {
    const r = await fetch(`${orderUrl}/api/pedidos/${req.params.id}/confirm`, {
      method: "PATCH",
      headers: { authorization: req.headers.authorization ?? "" },
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Order service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ---------- Stock service proxy (vasilhames + movimentacoes) ----------
router.get("/api/vasilhames", async (req, res) => {
  const stockUrl = services.find((s) => s.key === "stock")!.url;
  try {
    const r = await fetch(`${stockUrl}/api/vasilhames`, {
      headers: { authorization: req.headers.authorization ?? "" },
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Stock service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/api/vasilhames", async (req, res) => {
  const stockUrl = services.find((s) => s.key === "stock")!.url;
  try {
    const r = await fetch(`${stockUrl}/api/vasilhames`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: req.headers.authorization ?? "",
      },
      body: JSON.stringify(req.body),
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Stock service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.get("/api/movimentacoes", async (req, res) => {
  const stockUrl = services.find((s) => s.key === "stock")!.url;
  try {
    const qs = new URLSearchParams(req.query as Record<string, string>).toString();
    const r = await fetch(`${stockUrl}/api/movimentacoes${qs ? `?${qs}` : ""}`, {
      headers: { authorization: req.headers.authorization ?? "" },
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Stock service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/api/movimentacoes", async (req, res) => {
  const stockUrl = services.find((s) => s.key === "stock")!.url;
  try {
    const r = await fetch(`${stockUrl}/api/movimentacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: req.headers.authorization ?? "",
      },
      body: JSON.stringify(req.body),
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Stock service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ---------- Financial service proxy (caixas + contas a receber) ----------
router.get("/api/caixas", async (req, res) => {
  const financialUrl = services.find((s) => s.key === "financial")!.url;
  try {
    const qs = new URLSearchParams(req.query as Record<string, string>).toString();
    const r = await fetch(`${financialUrl}/api/caixas${qs ? `?${qs}` : ""}`, {
      headers: { authorization: req.headers.authorization ?? "" },
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Financial service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/api/caixas", async (req, res) => {
  const financialUrl = services.find((s) => s.key === "financial")!.url;
  try {
    const r = await fetch(`${financialUrl}/api/caixas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: req.headers.authorization ?? "",
      },
      body: JSON.stringify(req.body),
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Financial service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.patch("/api/caixas/:id/close", async (req, res) => {
  const financialUrl = services.find((s) => s.key === "financial")!.url;
  try {
    const r = await fetch(`${financialUrl}/api/caixas/${req.params.id}/close`, {
      method: "PATCH",
      headers: { authorization: req.headers.authorization ?? "" },
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Financial service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.get("/api/contas-a-receber", async (req, res) => {
  const financialUrl = services.find((s) => s.key === "financial")!.url;
  try {
    const qs = new URLSearchParams(req.query as Record<string, string>).toString();
    const r = await fetch(`${financialUrl}/api/contas-a-receber${qs ? `?${qs}` : ""}`, {
      headers: { authorization: req.headers.authorization ?? "" },
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Financial service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/api/contas-a-receber", async (req, res) => {
  const financialUrl = services.find((s) => s.key === "financial")!.url;
  try {
    const r = await fetch(`${financialUrl}/api/contas-a-receber`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: req.headers.authorization ?? "",
      },
      body: JSON.stringify(req.body),
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Financial service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/api/contas-a-receber/:id/payment", async (req, res) => {
  const financialUrl = services.find((s) => s.key === "financial")!.url;
  try {
    const r = await fetch(`${financialUrl}/api/contas-a-receber/${req.params.id}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: req.headers.authorization ?? "",
      },
      body: JSON.stringify(req.body),
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Financial service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ---------- Logistics service proxy ----------
const logisticsResources = ["entregadores", "veiculos", "rotas", "entregas"] as const;

for (const resource of logisticsResources) {
  router.get(`/api/${resource}`, async (req, res) => {
    const logisticsUrl = services.find((s) => s.key === "logistics")!.url;
    try {
      const qs = new URLSearchParams(req.query as Record<string, string>).toString();
      const r = await fetch(`${logisticsUrl}/api/${resource}${qs ? `?${qs}` : ""}`, {
        headers: { authorization: req.headers.authorization ?? "" },
      });
      const body = await r.json();
      res.status(r.status).json(body);
    } catch (err) {
      res.status(502).json({ error: "Logistics service unavailable", detail: err instanceof Error ? err.message : String(err) });
    }
  });

  router.post(`/api/${resource}`, async (req, res) => {
    const logisticsUrl = services.find((s) => s.key === "logistics")!.url;
    try {
      const r = await fetch(`${logisticsUrl}/api/${resource}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: req.headers.authorization ?? "",
        },
        body: JSON.stringify(req.body),
      });
      const body = await r.json();
      res.status(r.status).json(body);
    } catch (err) {
      res.status(502).json({ error: "Logistics service unavailable", detail: err instanceof Error ? err.message : String(err) });
    }
  });
}

router.patch("/api/entregas/:id/assign", async (req, res) => {
  const logisticsUrl = services.find((s) => s.key === "logistics")!.url;
  try {
    const r = await fetch(`${logisticsUrl}/api/entregas/${req.params.id}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: req.headers.authorization ?? "",
      },
      body: JSON.stringify(req.body),
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Logistics service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.patch("/api/entregas/:id/confirm", async (req, res) => {
  const logisticsUrl = services.find((s) => s.key === "logistics")!.url;
  try {
    const r = await fetch(`${logisticsUrl}/api/entregas/${req.params.id}/confirm`, {
      method: "PATCH",
      headers: { authorization: req.headers.authorization ?? "" },
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Logistics service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

router.post("/api/rotas/:id/optimize", async (req, res) => {
  const logisticsUrl = services.find((s) => s.key === "logistics")!.url;
  try {
    const r = await fetch(`${logisticsUrl}/api/rotas/${req.params.id}/optimize`, {
      method: "POST",
      headers: { authorization: req.headers.authorization ?? "" },
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Logistics service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ---------- Audit service proxy ----------
router.get("/api/auditoria", async (req, res) => {
  const auditUrl = services.find((s) => s.key === "audit")!.url;
  try {
    const qs = new URLSearchParams(req.query as Record<string, string>).toString();
    const r = await fetch(`${auditUrl}/api/v1/auditoria${qs ? `?${qs}` : ""}`, {
      headers: { authorization: req.headers.authorization ?? "" },
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Audit service unavailable", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ---------- Auth register proxy ----------
router.post("/api/auth/register", async (req, res) => {
  const identityUrl = services.find((s) => s.key === "identity")!.url;
  try {
    const r = await fetch(`${identityUrl}/api/auth/register`, {
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
