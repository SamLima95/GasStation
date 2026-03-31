import path from "path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env") });

import { createContainer } from "./container";
import { createApp } from "./app";
import { logger } from "@lframework/shared";

const port = parseInt(process.env.STOCK_SERVICE_PORT ?? "3004", 10);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  logger.error("STOCK_SERVICE_PORT must be a valid port (1-65535)");
  process.exit(1);
}
const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.STOCK_DATABASE_URL) {
  logger.error("STOCK_DATABASE_URL must be set in production");
  process.exit(1);
}
if (isProduction && !process.env.REDIS_URL) {
  logger.error("REDIS_URL must be set in production");
  process.exit(1);
}
if (isProduction && !process.env.RABBITMQ_URL) {
  logger.error("RABBITMQ_URL must be set in production");
  process.exit(1);
}
if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  logger.error("JWT_SECRET must be set and at least 32 characters in production");
  process.exit(1);
}

const databaseUrl = isProduction
  ? process.env.STOCK_DATABASE_URL!
  : (process.env.STOCK_DATABASE_URL ?? "postgresql://lframework:lframework@localhost:5432/lframework_stock");
const redisUrl = isProduction
  ? process.env.REDIS_URL!
  : (process.env.REDIS_URL ?? "redis://localhost:6379");
const rabbitmqUrl = isProduction
  ? process.env.RABBITMQ_URL!
  : (process.env.RABBITMQ_URL ?? "amqp://lframework:lframework@localhost:5672");
const jwtSecret = process.env.JWT_SECRET ?? (isProduction ? "" : "dev-secret-min-32-chars-for-jwt-signing");
const baseUrl = process.env.BASE_URL ?? `http://localhost:${port}`;

async function bootstrap() {
  const container = createContainer({
    databaseUrl,
    redisUrl,
    rabbitmqUrl,
    jwtSecret,
  });

  await container.connectRabbitMQ((payload) =>
    container.handleUserCreatedUseCase.execute(payload)
  );

  const app = createApp(container, {
    baseUrl,
    corsOrigin: process.env.CORS_ORIGIN,
  });

  app.listen(port, () => {
    logger.info(`Stock service listening on http://localhost:${port}`);
  });

  process.on("SIGTERM", async () => {
    try {
      await container.disconnect();
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "Disconnect failed on SIGTERM");
      process.exit(1);
    }
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "Failed to start stock-service");
  process.exit(1);
});
