import { logger } from "@lframework/shared";
import { createContainer } from "./container";
import { createApp } from "./app";

const PORT = Number(process.env.DASHBOARD_SERVICE_PORT) || 3009;

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6381";
const jwtSecret = process.env.JWT_SECRET ?? "change-me-in-production-use-a-long-random-secret";
const baseUrl = process.env.BASE_URL ?? `http://localhost:${PORT}`;
const corsOrigin = process.env.CORS_ORIGIN;

const serviceUrls = {
  order: process.env.ORDER_SERVICE_URL ?? "http://localhost:3005",
  stock: process.env.STOCK_SERVICE_URL ?? "http://localhost:3004",
  financial: process.env.FINANCIAL_SERVICE_URL ?? "http://localhost:3006",
  logistics: process.env.LOGISTICS_SERVICE_URL ?? "http://localhost:3007",
};

async function bootstrap(): Promise<void> {
  const container = createContainer({ redisUrl, jwtSecret, serviceUrls });
  const app = createApp(container, { baseUrl, corsOrigin });

  app.listen(PORT, () => {
    logger.info("dashboard-service rodando na porta %d", PORT);
  });

  process.on("SIGTERM", async () => {
    logger.info("SIGTERM recebido — encerrando...");
    await container.disconnect();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, "Falha ao iniciar dashboard-service");
  process.exit(1);
});
