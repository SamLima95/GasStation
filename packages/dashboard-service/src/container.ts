import { createContainer as createAwilixContainer, asValue, asFunction } from "awilix";
import Redis from "ioredis";
import { RedisCacheAdapter, createAuthMiddleware, JwtTokenVerifier } from "@lframework/shared";
import type { ICacheService } from "@lframework/shared";
import { InternalServiceClientAdapter } from "./adapters/driven/http-client/internal-service-client.adapter";
import { GetDashboardUseCase } from "./application/use-cases/get-dashboard.use-case";
import { ExportDashboardUseCase } from "./application/use-cases/export-dashboard.use-case";
import { DashboardController } from "./adapters/driving/http/dashboard.controller";
import { ExportController } from "./adapters/driving/http/export.controller";
import { createDashboardRoutes } from "./adapters/driving/http/routes";

export interface DashboardContainerConfig {
  redisUrl: string;
  jwtSecret: string;
  serviceUrls: { order: string; stock: string; financial: string; logistics: string };
  cacheOverride?: ICacheService;
}

interface DashboardCradle {
  config: DashboardContainerConfig;
  redis: Redis;
  cache: ICacheService;
  serviceClient: InternalServiceClientAdapter;
  getDashboardUseCase: GetDashboardUseCase;
  exportDashboardUseCase: ExportDashboardUseCase;
  dashboardController: DashboardController;
  exportController: ExportController;
  authMiddleware: ReturnType<typeof createAuthMiddleware>;
  dashboardRoutes: ReturnType<typeof createDashboardRoutes>;
}

export function createContainer(config: DashboardContainerConfig) {
  const awilix = createAwilixContainer<DashboardCradle>();

  awilix.register({
    config: asValue(config),

    redis: asFunction(({ config }: { config: DashboardContainerConfig }) =>
      new Redis(config.redisUrl, { connectTimeout: 5000, commandTimeout: 5000 })
    ).singleton(),

    cache: asFunction(({ config, redis }: { config: DashboardContainerConfig; redis: Redis }) =>
      config.cacheOverride ?? new RedisCacheAdapter(redis)
    ).singleton(),

    serviceClient: asFunction(({ config }: { config: DashboardContainerConfig }) =>
      new InternalServiceClientAdapter(config.serviceUrls)
    ).singleton(),

    getDashboardUseCase: asFunction((cradle: DashboardCradle) =>
      new GetDashboardUseCase(cradle.serviceClient, cradle.cache)
    ).singleton(),

    exportDashboardUseCase: asFunction((cradle: DashboardCradle) =>
      new ExportDashboardUseCase(cradle.getDashboardUseCase)
    ).singleton(),

    dashboardController: asFunction((cradle: DashboardCradle) =>
      new DashboardController(cradle.getDashboardUseCase)
    ).singleton(),

    exportController: asFunction((cradle: DashboardCradle) =>
      new ExportController(cradle.exportDashboardUseCase)
    ).singleton(),

    authMiddleware: asFunction(({ config }: { config: DashboardContainerConfig }) => {
      const verifier = new JwtTokenVerifier(config.jwtSecret);
      return createAuthMiddleware((token) => verifier.verify(token));
    }).singleton(),

    dashboardRoutes: asFunction((cradle: DashboardCradle) =>
      createDashboardRoutes(cradle.dashboardController, cradle.exportController, cradle.authMiddleware)
    ).singleton(),
  });

  const c = awilix.cradle;

  return {
    get redis() { return c.redis; },
    get dashboardRoutes() { return c.dashboardRoutes; },
    async disconnect(): Promise<void> {
      c.redis.disconnect();
    },
  };
}
