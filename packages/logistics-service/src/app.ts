import express, { type Express, type Router } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { createLogisticsOpenApi } from "./openapi";
import { requestIdMiddleware, requestLoggingMiddleware, createErrorHandlerMiddleware, createHealthHandler } from "@lframework/shared";
import type { HttpErrorMapping } from "@lframework/shared";

export interface LogisticsAppContainer {
  logisticsRoutes: Router;
  mapApplicationErrorToHttp: (error: unknown) => { statusCode: number; message: string } | null;
}

export function createApp(container: LogisticsAppContainer, options: { corsOrigin?: string; baseUrl?: string } = {}): Express {
  const app = express();
  app.use(requestIdMiddleware); app.use(requestLoggingMiddleware);
  if (options.corsOrigin) { const o = options.corsOrigin.split(",").map(s => s.trim()).filter(Boolean); if (o.length === 1 && o[0] === "*") app.use(cors({ origin: "*" })); else app.use(cors({ origin: o, credentials: true })); }
  app.use(express.json({ limit: "512kb" }));
  if (options.baseUrl) { const spec = createLogisticsOpenApi(options.baseUrl); app.get("/api-docs.json", (_req, res) => res.json(spec)); app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: "Logistics Service API" })); }
  app.use("/api", container.logisticsRoutes);
  app.get("/health", createHealthHandler("logistics-service"));
  app.use(createErrorHandlerMiddleware((err: unknown): HttpErrorMapping => container.mapApplicationErrorToHttp(err) ?? { statusCode: 500, message: "Internal server error" }));
  return app;
}
