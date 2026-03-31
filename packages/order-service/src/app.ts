import express, { type Express, type Router } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { createOrderOpenApi } from "./openapi";
import {
  requestIdMiddleware,
  requestLoggingMiddleware,
  createErrorHandlerMiddleware,
  createHealthHandler,
} from "@lframework/shared";
import type { HttpErrorMapping } from "@lframework/shared";

export interface OrderAppContainer {
  orderRoutes: Router;
  mapApplicationErrorToHttp: (error: unknown) => { statusCode: number; message: string } | null;
}

export interface CreateAppOptions {
  corsOrigin?: string;
  baseUrl?: string;
}

export function createApp(container: OrderAppContainer, options: CreateAppOptions = {}): Express {
  const app = express();
  app.use(requestIdMiddleware);
  app.use(requestLoggingMiddleware);

  if (options.corsOrigin) {
    const origins = options.corsOrigin.split(",").map((s) => s.trim()).filter(Boolean);
    const isWildcard = origins.length === 1 && origins[0] === "*";
    if (isWildcard) app.use(cors({ origin: "*" }));
    else app.use(cors({ origin: origins, credentials: true }));
  }
  app.use(express.json({ limit: "512kb" }));

  if (options.baseUrl) {
    const openApiSpec = createOrderOpenApi(options.baseUrl);
    app.get("/api-docs.json", (_req, res) => res.json(openApiSpec));
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: "Order Service API" }));
  }

  app.use("/api", container.orderRoutes);
  app.get("/health", createHealthHandler("order-service"));

  const errorMapper = (err: unknown): HttpErrorMapping =>
    container.mapApplicationErrorToHttp(err) ?? { statusCode: 500, message: "Internal server error" };
  app.use(createErrorHandlerMiddleware(errorMapper));

  return app;
}
