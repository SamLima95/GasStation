import express, { type Express, type Router } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { createFinancialOpenApi } from "./openapi";
import { requestIdMiddleware, requestLoggingMiddleware, createErrorHandlerMiddleware, createHealthHandler, apiVersionMiddleware } from "@lframework/shared";
import type { HttpErrorMapping } from "@lframework/shared";

export interface FinancialAppContainer {
  financialRoutes: Router;
  mapApplicationErrorToHttp: (error: unknown) => { statusCode: number; message: string } | null;
}

export function createApp(container: FinancialAppContainer, options: { corsOrigin?: string; baseUrl?: string } = {}): Express {
  const app = express();
  app.use(requestIdMiddleware);
  app.use(requestLoggingMiddleware);
  if (options.corsOrigin) {
    const origins = options.corsOrigin.split(",").map((s) => s.trim()).filter(Boolean);
    if (origins.length === 1 && origins[0] === "*") app.use(cors({ origin: "*" }));
    else app.use(cors({ origin: origins, credentials: true }));
  }
  app.use(express.json({ limit: "512kb" }));
  app.use(apiVersionMiddleware());
  if (options.baseUrl) {
    const spec = createFinancialOpenApi(options.baseUrl);
    app.get("/api-docs.json", (_req, res) => res.json(spec));
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: "Financial Service API" }));
  }
  app.use("/api/v1", container.financialRoutes);
  app.use("/api", container.financialRoutes);
  app.get("/health", createHealthHandler("financial-service"));
  app.use(createErrorHandlerMiddleware((err: unknown): HttpErrorMapping => container.mapApplicationErrorToHttp(err) ?? { statusCode: 500, message: "Internal server error" }));
  return app;
}
