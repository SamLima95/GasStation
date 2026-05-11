import { EventEmitter } from "events";
import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import {
  createHttpMetricsMiddleware,
  createHttpMetricsSnapshot,
  createMetricsHandler,
  isOperationalEndpointPath,
} from "./observability";
import { createDependencyReadinessChecks, createReadinessHandler } from "./health";

describe("observability", () => {
  it("identifica endpoints operacionais", () => {
    expect(isOperationalEndpointPath("/health")).toBe(true);
    expect(isOperationalEndpointPath("/ready")).toBe(true);
    expect(isOperationalEndpointPath("/metrics")).toBe(true);
    expect(isOperationalEndpointPath("/api/v1/items")).toBe(false);
  });

  it("registra contadores e duracao de requests HTTP", () => {
    const metrics = createHttpMetricsSnapshot();
    const middleware = createHttpMetricsMiddleware(metrics);
    const res = new EventEmitter() as Response & EventEmitter;
    const next: NextFunction = vi.fn();

    middleware(
      { method: "GET", path: "/api/v1/items" } as Request,
      Object.assign(res, { statusCode: 200 }) as Response,
      next
    );
    res.emit("finish");

    expect(next).toHaveBeenCalledTimes(1);
    expect(metrics.requestsTotal).toBe(1);
    expect(metrics.requestsByRoute.get("GET /api/v1/items 200")).toBe(1);
    expect(metrics.durationSecondsByRoute.get("GET /api/v1/items 200")).toBeGreaterThanOrEqual(0);
  });

  it("expoe metricas em formato texto compativel com Prometheus", () => {
    const metrics = createHttpMetricsSnapshot();
    metrics.requestsByRoute.set("GET /health 200", 2);
    metrics.durationSecondsByRoute.set("GET /health 200", 0.25);
    const send = vi.fn();
    const type = vi.fn().mockReturnValue({ send });

    createMetricsHandler("identity-service", metrics)(
      {} as Request,
      { type } as unknown as Response
    );

    expect(type).toHaveBeenCalledWith("text/plain; version=0.0.4; charset=utf-8");
    expect(send.mock.calls[0][0]).toContain('app_info{service="identity-service"} 1');
    expect(send.mock.calls[0][0]).toContain(
      'http_requests_total{method="GET",route="/health",status_code="200"} 2.000000'
    );
  });

  it("retorna readiness 503 quando uma checagem falha", async () => {
    const status = vi.fn().mockReturnThis();
    const json = vi.fn();

    await createReadinessHandler("catalog-service", [
      () => ({ name: "database", status: "fail", details: { message: "down" } }),
    ])({} as Request, { status, json } as unknown as Response);

    expect(status).toHaveBeenCalledWith(503);
    expect(json).toHaveBeenCalledWith({
      status: "not_ready",
      service: "catalog-service",
      checks: [{ name: "database", status: "fail", details: { message: "down" } }],
    });
  });

  it("cria checagens de readiness para banco e Redis", async () => {
    const checks = createDependencyReadinessChecks({
      prisma: { $queryRaw: vi.fn().mockResolvedValue([{ result: 1 }]) },
      redis: { ping: vi.fn().mockResolvedValue("PONG") },
    });

    await expect(Promise.all(checks.map((check) => check()))).resolves.toEqual([
      { name: "database", status: "ok" },
      { name: "redis", status: "ok" },
    ]);
  });
});
