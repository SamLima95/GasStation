import { createContainer as createAwilixContainer, asValue, asFunction } from "awilix";
import { PrismaClient } from "../generated/prisma-client";
import { createAuthMiddleware } from "@lframework/shared";
import { JwtTokenVerifier } from "@lframework/shared";
import { PrismaAuditoriaRepository } from "./adapters/driven/persistence/prisma-auditoria.repository";
import { RabbitMqAuditConsumer } from "./adapters/driving/messaging/rabbitmq-audit-consumer";
import { CreateAuditoriaUseCase } from "./application/use-cases/create-auditoria.use-case";
import { ListAuditoriaUseCase } from "./application/use-cases/list-auditoria.use-case";
import { AuditoriaController } from "./adapters/driving/http/auditoria.controller";
import { createAuditRoutes } from "./adapters/driving/http/routes";

export interface AuditContainerConfig {
  databaseUrl: string;
  rabbitmqUrl: string;
  jwtSecret: string;
}

interface AuditCradle {
  config: AuditContainerConfig;
  prisma: PrismaClient;
  auditoriaRepository: PrismaAuditoriaRepository;
  auditConsumer: RabbitMqAuditConsumer;
  createAuditoriaUseCase: CreateAuditoriaUseCase;
  listAuditoriaUseCase: ListAuditoriaUseCase;
  auditoriaController: AuditoriaController;
  authMiddleware: ReturnType<typeof createAuthMiddleware>;
  auditRoutes: ReturnType<typeof createAuditRoutes>;
}

export function createContainer(config: AuditContainerConfig) {
  const awilix = createAwilixContainer<AuditCradle>();

  awilix.register({
    config: asValue(config),

    prisma: asFunction(({ config }: { config: AuditContainerConfig }) =>
      new PrismaClient({ datasources: { db: { url: config.databaseUrl } } })
    ).singleton(),

    auditoriaRepository: asFunction(
      (cradle: AuditCradle) => new PrismaAuditoriaRepository(cradle.prisma)
    ).singleton(),

    auditConsumer: asFunction(
      ({ config }: { config: AuditContainerConfig }) => new RabbitMqAuditConsumer(config.rabbitmqUrl)
    ).singleton(),

    createAuditoriaUseCase: asFunction(
      (cradle: AuditCradle) => new CreateAuditoriaUseCase(cradle.auditoriaRepository)
    ).singleton(),

    listAuditoriaUseCase: asFunction(
      (cradle: AuditCradle) => new ListAuditoriaUseCase(cradle.auditoriaRepository)
    ).singleton(),

    auditoriaController: asFunction(
      (cradle: AuditCradle) => new AuditoriaController(cradle.listAuditoriaUseCase)
    ).singleton(),

    authMiddleware: asFunction(({ config }: { config: AuditContainerConfig }) => {
      const verifier = new JwtTokenVerifier(config.jwtSecret);
      return createAuthMiddleware((token) => verifier.verify(token));
    }).singleton(),

    auditRoutes: asFunction(
      (cradle: AuditCradle) => createAuditRoutes(cradle.auditoriaController, cradle.authMiddleware)
    ).singleton(),
  });

  const c = awilix.cradle;

  return {
    get prisma() { return c.prisma; },
    get auditRoutes() { return c.auditRoutes; },

    async connectRabbitMQ(): Promise<void> {
      c.auditConsumer.onAuditEvent((payload) => c.createAuditoriaUseCase.execute(payload).then(() => {}));
      await c.auditConsumer.start();
    },

    async disconnect(): Promise<void> {
      await c.auditConsumer.close();
      await c.prisma.$disconnect();
    },
  };
}
