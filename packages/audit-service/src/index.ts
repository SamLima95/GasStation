import { logger } from "@lframework/shared";
import { createContainer } from "./container";
import { createApp } from "./app";

const PORT = Number(process.env.AUDIT_SERVICE_PORT) || 3008;

const databaseUrl = process.env.AUDIT_DATABASE_URL ?? "postgresql://lframework:lframework@localhost:5435/lframework_audit";
const rabbitmqUrl = process.env.RABBITMQ_URL ?? "amqp://lframework:lframework@localhost:5675";
const jwtSecret = process.env.JWT_SECRET ?? "change-me-in-production-use-a-long-random-secret";
const baseUrl = process.env.BASE_URL ?? `http://localhost:${PORT}`;
const corsOrigin = process.env.CORS_ORIGIN;

async function bootstrap(): Promise<void> {
  const container = createContainer({ databaseUrl, rabbitmqUrl, jwtSecret });

  await container.connectRabbitMQ();
  logger.info("RabbitMQ audit consumer conectado");

  const app = createApp(container, { baseUrl, corsOrigin });

  app.listen(PORT, () => {
    logger.info("audit-service rodando na porta %d", PORT);
  });

  process.on("SIGTERM", async () => {
    logger.info("SIGTERM recebido — encerrando...");
    await container.disconnect();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, "Falha ao iniciar audit-service");
  process.exit(1);
});
