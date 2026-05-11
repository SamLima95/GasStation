import express, { type Express, type Router } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { createLogisticsOpenApi } from "./openapi";
import { requestIdMiddleware, requestLoggingMiddleware, createErrorHandlerMiddleware, createDependencyReadinessChecks, isOperationalEndpointPath, registerOperationalEndpoints, apiVersionMiddleware } from "@lframework/shared";
import type { HttpErrorMapping, ReadinessDependencies } from "@lframework/shared";

export interface LogisticsAppContainer extends ReadinessDependencies {
  logisticsRoutes: Router;
  mapApplicationErrorToHttp: (error: unknown) => { statusCode: number; message: string } | null;
}

export function createApp(container: LogisticsAppContainer, options: { corsOrigin?: string; baseUrl?: string } = {}): Express {
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => isOperationalEndpointPath(req.path),
  }));
  app.use(requestIdMiddleware); app.use(requestLoggingMiddleware);
  if (options.corsOrigin) { const o = options.corsOrigin.split(",").map(s => s.trim()).filter(Boolean); if (o.length === 1 && o[0] === "*") app.use(cors({ origin: "*" })); else app.use(cors({ origin: o, credentials: true })); }
  app.use(express.json({ limit: "512kb" }));
  app.use(apiVersionMiddleware());
  if (options.baseUrl) { const spec = createLogisticsOpenApi(options.baseUrl); app.get("/api-docs.json", (_req, res) => res.json(spec)); app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: "Logistics Service API" })); }
  app.use("/api/v1", container.logisticsRoutes);
  app.use("/api", container.logisticsRoutes);
  registerOperationalEndpoints(app, {
    serviceName: "logistics-service",
    readinessChecks: createDependencyReadinessChecks(container),
  });
  app.use(createErrorHandlerMiddleware((err: unknown): HttpErrorMapping => container.mapApplicationErrorToHttp(err) ?? { statusCode: 500, message: "Internal server error" }));
  return app;
}
