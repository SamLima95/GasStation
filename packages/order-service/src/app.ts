import express, { type Express, type Router } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { createOrderOpenApi } from "./openapi";
import {
  requestIdMiddleware,
  requestLoggingMiddleware,
  createErrorHandlerMiddleware,
  createDependencyReadinessChecks,
  isOperationalEndpointPath,
  registerOperationalEndpoints,
  apiVersionMiddleware,
} from "@lframework/shared";
import type { HttpErrorMapping, ReadinessDependencies } from "@lframework/shared";

export interface OrderAppContainer extends ReadinessDependencies {
  orderRoutes: Router;
  mapApplicationErrorToHttp: (error: unknown) => { statusCode: number; message: string } | null;
}

export interface CreateAppOptions {
  corsOrigin?: string;
  baseUrl?: string;
}

export function createApp(container: OrderAppContainer, options: CreateAppOptions = {}): Express {
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
    const origins = options.corsOrigin.split(",").map((s) => s.trim()).filter(Boolean);
    const isWildcard = origins.length === 1 && origins[0] === "*";
    if (isWildcard) app.use(cors({ origin: "*" }));
    else app.use(cors({ origin: origins, credentials: true }));
  }
  app.use(express.json({ limit: "512kb" }));
  app.use(apiVersionMiddleware());

  if (options.baseUrl) {
    const openApiSpec = createOrderOpenApi(options.baseUrl);
    app.get("/api-docs.json", (_req, res) => res.json(openApiSpec));
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: "Order Service API" }));
  }

  app.use("/api/v1", container.orderRoutes);
  app.use("/api", container.orderRoutes);
  registerOperationalEndpoints(app, {
    serviceName: "order-service",
    readinessChecks: createDependencyReadinessChecks(container),
  });

  const errorMapper = (err: unknown): HttpErrorMapping =>
    container.mapApplicationErrorToHttp(err) ?? { statusCode: 500, message: "Internal server error" };
  app.use(createErrorHandlerMiddleware(errorMapper));

  return app;
}
