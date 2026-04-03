import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

import express from "express";
import swaggerUi from "swagger-ui-express";

const port = parseInt(process.env.API_DOCS_PORT ?? "3003", 10);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("API_DOCS_PORT must be a valid port (1-65535)");
  process.exit(1);
}

const services = [
  { name: "Identity Service", envKey: "IDENTITY_SPEC_URL", defaultPort: 3001 },
  { name: "Catalog Service", envKey: "CATALOG_SPEC_URL", defaultPort: 3002 },
  { name: "Stock Service", envKey: "STOCK_SPEC_URL", defaultPort: 3004 },
  { name: "Order Service", envKey: "ORDER_SPEC_URL", defaultPort: 3005 },
  { name: "Financial Service", envKey: "FINANCIAL_SPEC_URL", defaultPort: 3006 },
  { name: "Logistics Service", envKey: "LOGISTICS_SPEC_URL", defaultPort: 3007 },
  { name: "Audit Service", envKey: "AUDIT_SPEC_URL", defaultPort: 3008 },
  { name: "Dashboard Service", envKey: "DASHBOARD_SPEC_URL", defaultPort: 3009 },
];

function getSpecUrl(envKey: string, defaultPort: number): string {
  return process.env[envKey] ?? `http://localhost:${defaultPort}/api-docs.json`;
}

const app = express();

app.use((_req, res, next) => {
  res.setHeader("X-Served-By", "api-docs");
  next();
});

// Proxy each service spec through api-docs to avoid CORS issues
for (const svc of services) {
  const slug = svc.name.toLowerCase().replace(/\s+/g, "-");
  app.get(`/specs/${slug}.json`, async (_req, res) => {
    try {
      const url = getSpecUrl(svc.envKey, svc.defaultPort);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status}`);
      const spec = await response.json();
      res.json(spec);
    } catch (err) {
      res.status(502).json({
        error: `Failed to fetch spec for ${svc.name}`,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });
}

// Build the urls array for Swagger UI's spec selector dropdown
const urls = services.map((svc) => ({
  url: `/specs/${svc.name.toLowerCase().replace(/\s+/g, "-")}.json`,
  name: svc.name,
}));

// Serve swagger-ui assets
app.use("/", swaggerUi.serve);

// Custom handler to render Swagger UI with urls (multi-spec dropdown)
app.get("/", (_req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LFramework API</title>
  <link rel="stylesheet" type="text/css" href="./swagger-ui.css">
  <style>html { box-sizing: border-box; overflow-y: scroll; } *, *:before, *:after { box-sizing: inherit; } body { margin: 0; background: #fafafa; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="./swagger-ui-bundle.js"></script>
  <script src="./swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        urls: ${JSON.stringify(urls)},
        "urls.primaryName": "Identity Service",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

app.listen(port, () => {
  console.log(`API Docs (unified Swagger) at http://localhost:${port}`);
});
