import type { Express, NextFunction, Request, Response } from "express";
import { createHealthHandler, createReadinessHandler, type ReadinessCheck } from "./health";

const OPERATIONAL_ENDPOINTS = new Set(["/health", "/ready", "/metrics"]);

export interface HttpMetricsSnapshot {
  requestsTotal: number;
  requestsByRoute: Map<string, number>;
  durationSecondsByRoute: Map<string, number>;
  startedAt: Date;
}

export interface OperationalEndpointOptions {
  serviceName: string;
  readinessChecks?: ReadinessCheck[];
}

export function isOperationalEndpointPath(path: string): boolean {
  return OPERATIONAL_ENDPOINTS.has(path);
}

export function createHttpMetricsMiddleware(
  metrics: HttpMetricsSnapshot
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      const durationSeconds = Number(process.hrtime.bigint() - start) / 1_000_000_000;
      const route = normalizeRoute(req);
      const key = `${req.method} ${route} ${res.statusCode}`;
      metrics.requestsTotal += 1;
      metrics.requestsByRoute.set(key, (metrics.requestsByRoute.get(key) ?? 0) + 1);
      metrics.durationSecondsByRoute.set(
        key,
        (metrics.durationSecondsByRoute.get(key) ?? 0) + durationSeconds
      );
    });

    next();
  };
}

export function createMetricsHandler(
  serviceName: string,
  metrics: HttpMetricsSnapshot
): (_req: Request, res: Response) => void {
  return (_req: Request, res: Response): void => {
    const lines = [
      "# HELP app_info Application identity.",
      "# TYPE app_info gauge",
      `app_info{service="${escapeLabelValue(serviceName)}"} 1`,
      "# HELP process_uptime_seconds Process uptime in seconds.",
      "# TYPE process_uptime_seconds gauge",
      `process_uptime_seconds ${process.uptime().toFixed(3)}`,
      "# HELP http_requests_total Total HTTP requests.",
      "# TYPE http_requests_total counter",
      ...formatCounter("http_requests_total", metrics.requestsByRoute),
      "# HELP http_request_duration_seconds_sum Total HTTP request duration in seconds.",
      "# TYPE http_request_duration_seconds_sum counter",
      ...formatCounter("http_request_duration_seconds_sum", metrics.durationSecondsByRoute),
    ];

    res.type("text/plain; version=0.0.4; charset=utf-8").send(`${lines.join("\n")}\n`);
  };
}

export function createHttpMetricsSnapshot(): HttpMetricsSnapshot {
  return {
    requestsTotal: 0,
    requestsByRoute: new Map<string, number>(),
    durationSecondsByRoute: new Map<string, number>(),
    startedAt: new Date(),
  };
}

export function registerOperationalEndpoints(
  app: Express,
  options: OperationalEndpointOptions
): void {
  const metrics = createHttpMetricsSnapshot();
  app.use(createHttpMetricsMiddleware(metrics));
  app.get("/health", createHealthHandler(options.serviceName));
  app.get("/ready", createReadinessHandler(options.serviceName, options.readinessChecks));
  app.get("/metrics", createMetricsHandler(options.serviceName, metrics));
}

function normalizeRoute(req: Request): string {
  const routePath = req.route?.path;
  if (typeof routePath === "string") return routePath;
  if (Array.isArray(routePath)) return routePath.join("|");
  return req.path;
}

function formatCounter(metricName: string, values: Map<string, number>): string[] {
  return Array.from(values.entries()).map(([key, value]) => {
    const [method, route, statusCode] = key.split(" ");
    return `${metricName}{method="${escapeLabelValue(method)}",route="${escapeLabelValue(route)}",status_code="${escapeLabelValue(statusCode)}"} ${value.toFixed(6)}`;
  });
}

function escapeLabelValue(value: string | undefined): string {
  return (value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}
