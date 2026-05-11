import express, { type Express, type Router } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { createAuditOpenApi } from "./openapi";
import {
  requestIdMiddleware,
  requestLoggingMiddleware,
  createErrorHandlerMiddleware,
  createDependencyReadinessChecks,
  isOperationalEndpointPath,
  registerOperationalEndpoints,
  apiVersionMiddleware,
} from "@lframework/shared";
import type { ReadinessDependencies } from "@lframework/shared";

export interface AppContainer extends ReadinessDependencies {
  auditRoutes: Router;
}

export interface CreateAppOptions {
  corsOrigin?: string;
  baseUrl?: string;
}

export function createApp(container: AppContainer, options: CreateAppOptions = {}): Express {
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
  app.use(requestIdMiddleware);
  app.use(requestLoggingMiddleware);

  if (options.corsOrigin) {
    app.use(cors({ origin: options.corsOrigin.split(",").map((s) => s.trim()), credentials: true }));
  }
  app.use(express.json({ limit: "512kb" }));
  app.use(apiVersionMiddleware());

  if (options.baseUrl) {
    const openApiSpec = createAuditOpenApi(options.baseUrl);
    app.get("/api-docs.json", (_req, res) => res.json(openApiSpec));
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: "Audit Service API" }));
  }

  app.use("/api/v1", container.auditRoutes);
  app.use("/api", container.auditRoutes);
  registerOperationalEndpoints(app, {
    serviceName: "audit-service",
    readinessChecks: createDependencyReadinessChecks(container),
  });
  app.use(createErrorHandlerMiddleware());

  return app;
}
