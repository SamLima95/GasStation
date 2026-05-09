import express, { type Express, type Router } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { createDashboardOpenApi } from "./openapi";
import {
  requestIdMiddleware,
  requestLoggingMiddleware,
  createErrorHandlerMiddleware,
  createHealthHandler,
  apiVersionMiddleware,
} from "@lframework/shared";

export interface AppContainer {
  dashboardRoutes: Router;
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
    skip: (req) => req.path === "/health",
  }));
  app.use(requestIdMiddleware);
  app.use(requestLoggingMiddleware);

  if (options.corsOrigin) {
    app.use(cors({ origin: options.corsOrigin.split(",").map((s) => s.trim()), credentials: true }));
  }
  app.use(express.json({ limit: "512kb" }));
  app.use(apiVersionMiddleware());

  if (options.baseUrl) {
    const openApiSpec = createDashboardOpenApi(options.baseUrl);
    app.get("/api-docs.json", (_req, res) => res.json(openApiSpec));
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: "Dashboard Service API" }));
  }

  app.use("/api/v1", container.dashboardRoutes);
  app.use("/api", container.dashboardRoutes);
  app.get("/health", createHealthHandler("dashboard-service"));
  app.use(createErrorHandlerMiddleware());

  return app;
}
