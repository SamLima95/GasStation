import { createContainer as createAwilixContainer, asValue, asFunction } from "awilix";
import { PrismaClient } from "../generated/prisma-client";
import Redis from "ioredis";
import amqp from "amqplib";
import type { UserCreatedPayload } from "@lframework/shared";
import type { ICacheService } from "@lframework/shared";
import { RedisCacheAdapter, createAuthMiddleware, JwtTokenVerifier } from "@lframework/shared";
import { PrismaEntregadorRepository } from "./adapters/driven/persistence/prisma-entregador.repository";
import { PrismaVeiculoRepository } from "./adapters/driven/persistence/prisma-veiculo.repository";
import { PrismaRotaRepository } from "./adapters/driven/persistence/prisma-rota.repository";
import { PrismaEntregaRepository } from "./adapters/driven/persistence/prisma-entrega.repository";
import { PrismaReplicatedUserStore } from "./adapters/driven/persistence/prisma-replicated-user.store";
import { RabbitMqEventPublisher } from "./adapters/driven/messaging/rabbitmq-event-publisher.adapter";
import { RabbitMqLogisticsEventsAdapter } from "./adapters/driving/messaging/rabbitmq-logistics-events.adapter";
import { CreateEntregadorUseCase } from "./application/use-cases/create-entregador.use-case";
import { ListEntregadoresUseCase } from "./application/use-cases/list-entregadores.use-case";
import { CreateVeiculoUseCase } from "./application/use-cases/create-veiculo.use-case";
import { ListVeiculosUseCase } from "./application/use-cases/list-veiculos.use-case";
import { CreateRotaUseCase } from "./application/use-cases/create-rota.use-case";
import { ListRotasUseCase } from "./application/use-cases/list-rotas.use-case";
import { ListEntregasUseCase } from "./application/use-cases/list-entregas.use-case";
import { AssignEntregaUseCase } from "./application/use-cases/assign-entrega.use-case";
import { ConfirmEntregaUseCase } from "./application/use-cases/confirm-entrega.use-case";
import { HandleOrderConfirmedUseCase } from "./application/use-cases/handle-order-confirmed.use-case";
import { HandleUserCreatedUseCase } from "./application/use-cases/handle-user-created.use-case";
import { EntregadorController } from "./adapters/driving/http/entregador.controller";
import { VeiculoController } from "./adapters/driving/http/veiculo.controller";
import { RotaController } from "./adapters/driving/http/rota.controller";
import { EntregaController } from "./adapters/driving/http/entrega.controller";
import { createLogisticsRoutes } from "./adapters/driving/http/routes";
import { mapApplicationErrorToHttp } from "./adapters/driving/http/error-to-http.mapper";
import type { IEventPublisher } from "./application/ports/event-publisher.port";
import type { OrderConfirmedPayload } from "./application/ports/event-consumer.port";

export interface TestEventConsumer { start(): Promise<void>; close(): Promise<void>; }
export interface LogisticsContainerConfig {
  databaseUrl: string; redisUrl: string; rabbitmqUrl: string; jwtSecret: string;
  cacheOverride?: ICacheService; eventConsumerOverride?: TestEventConsumer; eventPublisherOverride?: IEventPublisher;
}

export function createContainer(config: LogisticsContainerConfig) {
  const awilix = createAwilixContainer<any>();
  let eventPublisher: IEventPublisher | null = config.eventPublisherOverride ?? null;
  const getPublisher = (): IEventPublisher => { if (!eventPublisher) throw new Error("Call connectRabbitMQ first"); return eventPublisher; };

  awilix.register({
    config: asValue(config),
    prisma: asFunction(({ config: c }: any) => new PrismaClient({ datasources: { db: { url: c.databaseUrl } } })).singleton(),
    redis: asFunction(({ config: c }: any) => new Redis(c.redisUrl, { connectTimeout: 5000, commandTimeout: 5000 })).singleton(),
    cache: asFunction(({ config: c, redis }: any) => c.cacheOverride ?? new RedisCacheAdapter(redis)).singleton(),

    entregadorRepository: asFunction((c: any) => new PrismaEntregadorRepository(c.prisma)).singleton(),
    veiculoRepository: asFunction((c: any) => new PrismaVeiculoRepository(c.prisma)).singleton(),
    rotaRepository: asFunction((c: any) => new PrismaRotaRepository(c.prisma)).singleton(),
    entregaRepository: asFunction((c: any) => new PrismaEntregaRepository(c.prisma)).singleton(),
    replicatedUserStore: asFunction((c: any) => new PrismaReplicatedUserStore(c.prisma)).singleton(),

    createEntregadorUseCase: asFunction((c: any) => new CreateEntregadorUseCase(c.entregadorRepository)).singleton(),
    listEntregadoresUseCase: asFunction((c: any) => new ListEntregadoresUseCase(c.entregadorRepository)).singleton(),
    createVeiculoUseCase: asFunction((c: any) => new CreateVeiculoUseCase(c.veiculoRepository)).singleton(),
    listVeiculosUseCase: asFunction((c: any) => new ListVeiculosUseCase(c.veiculoRepository)).singleton(),
    createRotaUseCase: asFunction((c: any) => new CreateRotaUseCase(c.rotaRepository, c.entregadorRepository, c.veiculoRepository)).singleton(),
    listRotasUseCase: asFunction((c: any) => new ListRotasUseCase(c.rotaRepository)).singleton(),
    listEntregasUseCase: asFunction((c: any) => new ListEntregasUseCase(c.entregaRepository)).singleton(),
    assignEntregaUseCase: asFunction((c: any) => new AssignEntregaUseCase(c.entregaRepository, c.rotaRepository)).singleton(),
    confirmEntregaUseCase: asFunction((c: any) => new ConfirmEntregaUseCase(c.entregaRepository, getPublisher())).singleton(),
    handleOrderConfirmedUseCase: asFunction((c: any) => new HandleOrderConfirmedUseCase(c.entregaRepository)).singleton(),
    handleUserCreatedUseCase: asFunction((c: any) => new HandleUserCreatedUseCase(c.replicatedUserStore, c.cache)).singleton(),

    entregadorController: asFunction((c: any) => new EntregadorController(c.createEntregadorUseCase, c.listEntregadoresUseCase)).singleton(),
    veiculoController: asFunction((c: any) => new VeiculoController(c.createVeiculoUseCase, c.listVeiculosUseCase)).singleton(),
    rotaController: asFunction((c: any) => new RotaController(c.createRotaUseCase, c.listRotasUseCase)).singleton(),
    entregaController: asFunction((c: any) => new EntregaController(c.listEntregasUseCase, c.assignEntregaUseCase, c.confirmEntregaUseCase)).singleton(),

    tokenVerifier: asFunction(({ config: c }: any) => new JwtTokenVerifier(c.jwtSecret)).singleton(),
    authMiddleware: asFunction(({ tokenVerifier }: any) => createAuthMiddleware((token: string) => tokenVerifier.verify(token))).singleton(),
    logisticsRoutes: asFunction(({ entregadorController, veiculoController, rotaController, entregaController, authMiddleware }: any) =>
      createLogisticsRoutes(entregadorController, veiculoController, rotaController, entregaController, authMiddleware)).singleton(),
    eventConsumer: asFunction(({ config: c }: any) => new RabbitMqLogisticsEventsAdapter(c.rabbitmqUrl)).singleton(),
  });

  const c = awilix.cradle;
  let activeConsumer: { close(): Promise<void> } | null = null;
  let publisherConnection: Awaited<ReturnType<typeof amqp.connect>> | null = null;

  return {
    get prisma() { return c.prisma; }, get redis() { return c.redis; },
    get logisticsRoutes() { return c.logisticsRoutes; }, mapApplicationErrorToHttp,
    get handleUserCreatedUseCase() { return c.handleUserCreatedUseCase; },
    get handleOrderConfirmedUseCase() { return c.handleOrderConfirmedUseCase; },
    async connectRabbitMQ(userCreatedHandler: (p: UserCreatedPayload) => Promise<void>, orderConfirmedHandler: (p: OrderConfirmedPayload) => Promise<void>): Promise<void> {
      if (activeConsumer) { await activeConsumer.close(); activeConsumer = null; }
      if (!config.eventPublisherOverride) {
        const conn = await amqp.connect(config.rabbitmqUrl, { timeout: 10_000 });
        publisherConnection = conn; eventPublisher = new RabbitMqEventPublisher(await conn.createChannel());
      }
      if (config.eventConsumerOverride) { await config.eventConsumerOverride.start(); activeConsumer = config.eventConsumerOverride; }
      else { c.eventConsumer.onUserCreated(userCreatedHandler); c.eventConsumer.onOrderConfirmed(orderConfirmedHandler); await c.eventConsumer.start(); activeConsumer = c.eventConsumer; }
    },
    async disconnect(): Promise<void> {
      if (activeConsumer) { await activeConsumer.close(); activeConsumer = null; }
      if (publisherConnection) { await (publisherConnection as any).close(); publisherConnection = null; }
      await c.prisma.$disconnect(); c.redis.disconnect();
    },
  };
}
