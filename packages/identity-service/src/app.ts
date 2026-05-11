import express, { type Express, type Router } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { createIdentityOpenApi } from "./openapi";
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

export interface AppContainer extends ReadinessDependencies {
  userRoutes: Router;
  authRoutes: Router;
  unidadeRoutes: Router;
  mapApplicationErrorToHttp: (error: unknown) => { statusCode: number; message: string } | null;
}

export interface CreateAppOptions {
  /** When set, enables CORS with the given origin(s). */
  corsOrigin?: string;
  /** When set, enables API docs and OpenAPI spec at /api-docs and /api-docs.json. */
  baseUrl?: string;
}

/**
 * Builds the Express application without listening.
 * Used by the server entry point and by integration tests (supertest).
 */
export function createApp(
  container: AppContainer,
  options: CreateAppOptions = {}
): Express {
  const app = express();
  // When behind the API gateway (Nginx), trust X-Forwarded-For so express-rate-limit can identify clients correctly.
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
    app.use(
      cors({
        origin: options.corsOrigin.split(",").map((s) => s.trim()),
        credentials: true,
      })
    );
  }
  app.use(express.json({ limit: "512kb" }));
  app.use(apiVersionMiddleware());

  if (options.baseUrl) {
    const openApiSpec = createIdentityOpenApi(options.baseUrl);
    app.get("/api-docs.json", (_req, res) => res.json(openApiSpec));
    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(openApiSpec, { customSiteTitle: "Identity Service API" })
    );
  }

  app.use("/api/v1", container.userRoutes);
  app.use("/api/v1", container.authRoutes);
  app.use("/api/v1", container.unidadeRoutes);
  // Alias retrocompatível
  app.use("/api", container.userRoutes);
  app.use("/api", container.authRoutes);
  app.use("/api", container.unidadeRoutes);

  registerOperationalEndpoints(app, {
    serviceName: "identity-service",
    readinessChecks: createDependencyReadinessChecks(container),
  });

  app.use(
    createErrorHandlerMiddleware(
      container.mapApplicationErrorToHttp as (err: unknown) => HttpErrorMapping
    )
  );

  return app;
}
