import { createContainer as createAwilixContainer, asValue, asFunction } from "awilix";
import { PrismaClient } from "../generated/prisma-client";
import Redis from "ioredis";
import amqp from "amqplib";
import type { UserCreatedPayload } from "@lframework/shared";
import type { ICacheService } from "@lframework/shared";
import { RedisCacheAdapter, createAuthMiddleware, JwtTokenVerifier } from "@lframework/shared";
import { PrismaCaixaRepository } from "./adapters/driven/persistence/prisma-caixa.repository";
import { PrismaContaAReceberRepository } from "./adapters/driven/persistence/prisma-conta-a-receber.repository";
import { PrismaReplicatedUserStore } from "./adapters/driven/persistence/prisma-replicated-user.store";
import { RabbitMqEventPublisher } from "./adapters/driven/messaging/rabbitmq-event-publisher.adapter";
import { RabbitMqFinancialEventsAdapter } from "./adapters/driving/messaging/rabbitmq-financial-events.adapter";
import { OpenCaixaUseCase } from "./application/use-cases/open-caixa.use-case";
import { CloseCaixaUseCase } from "./application/use-cases/close-caixa.use-case";
import { ListCaixasUseCase } from "./application/use-cases/list-caixas.use-case";
import { CreateContaAReceberUseCase } from "./application/use-cases/create-conta-a-receber.use-case";
import { ListContasAReceberUseCase } from "./application/use-cases/list-contas-a-receber.use-case";
import { ReceivePaymentUseCase } from "./application/use-cases/receive-payment.use-case";
import { HandleOrderConfirmedUseCase } from "./application/use-cases/handle-order-confirmed.use-case";
import { HandleUserCreatedUseCase } from "./application/use-cases/handle-user-created.use-case";
import { CaixaController } from "./adapters/driving/http/caixa.controller";
import { ContaAReceberController } from "./adapters/driving/http/conta-a-receber.controller";
import { createFinancialRoutes } from "./adapters/driving/http/routes";
import { mapApplicationErrorToHttp } from "./adapters/driving/http/error-to-http.mapper";
import type { IEventPublisher } from "./application/ports/event-publisher.port";
import type { OrderConfirmedPayload } from "./application/ports/event-consumer.port";

export interface TestEventConsumer { start(): Promise<void>; close(): Promise<void>; }

export interface FinancialContainerConfig {
  databaseUrl: string; redisUrl: string; rabbitmqUrl: string; jwtSecret: string;
  cacheOverride?: ICacheService; eventConsumerOverride?: TestEventConsumer; eventPublisherOverride?: IEventPublisher;
}

interface FinancialCradle {
  config: FinancialContainerConfig; prisma: PrismaClient; redis: Redis; cache: ICacheService;
  caixaRepository: PrismaCaixaRepository; contaAReceberRepository: PrismaContaAReceberRepository;
  replicatedUserStore: PrismaReplicatedUserStore;
  openCaixaUseCase: OpenCaixaUseCase; closeCaixaUseCase: CloseCaixaUseCase; listCaixasUseCase: ListCaixasUseCase;
  createContaAReceberUseCase: CreateContaAReceberUseCase; listContasAReceberUseCase: ListContasAReceberUseCase;
  receivePaymentUseCase: ReceivePaymentUseCase; handleOrderConfirmedUseCase: HandleOrderConfirmedUseCase;
  handleUserCreatedUseCase: HandleUserCreatedUseCase;
  caixaController: CaixaController; contaAReceberController: ContaAReceberController;
  tokenVerifier: JwtTokenVerifier; authMiddleware: ReturnType<typeof createAuthMiddleware>;
  financialRoutes: ReturnType<typeof createFinancialRoutes>;
  eventConsumer: RabbitMqFinancialEventsAdapter;
}

export function createContainer(config: FinancialContainerConfig) {
  const awilix = createAwilixContainer<FinancialCradle>();
  let eventPublisher: IEventPublisher | null = config.eventPublisherOverride ?? null;
  const getEventPublisher = (): IEventPublisher => {
    if (!eventPublisher) throw new Error("Event publisher not initialized. Call connectRabbitMQ first.");
    return eventPublisher;
  };

  awilix.register({
    config: asValue(config),
    prisma: asFunction(({ config }: { config: FinancialContainerConfig }) => new PrismaClient({ datasources: { db: { url: config.databaseUrl } } })).singleton(),
    redis: asFunction(({ config }: { config: FinancialContainerConfig }) => new Redis(config.redisUrl, { connectTimeout: 5000, commandTimeout: 5000 })).singleton(),
    cache: asFunction(({ config, redis }: { config: FinancialContainerConfig; redis: Redis }) => config.cacheOverride ?? new RedisCacheAdapter(redis)).singleton(),

    caixaRepository: asFunction((c: FinancialCradle) => new PrismaCaixaRepository(c.prisma)).singleton(),
    contaAReceberRepository: asFunction((c: FinancialCradle) => new PrismaContaAReceberRepository(c.prisma)).singleton(),
    replicatedUserStore: asFunction((c: FinancialCradle) => new PrismaReplicatedUserStore(c.prisma)).singleton(),

    openCaixaUseCase: asFunction((c: FinancialCradle) => new OpenCaixaUseCase(c.caixaRepository)).singleton(),
    closeCaixaUseCase: asFunction((c: FinancialCradle) => new CloseCaixaUseCase(c.caixaRepository)).singleton(),
    listCaixasUseCase: asFunction((c: FinancialCradle) => new ListCaixasUseCase(c.caixaRepository)).singleton(),
    createContaAReceberUseCase: asFunction((c: FinancialCradle) => new CreateContaAReceberUseCase(c.contaAReceberRepository)).singleton(),
    listContasAReceberUseCase: asFunction((c: FinancialCradle) => new ListContasAReceberUseCase(c.contaAReceberRepository)).singleton(),
    receivePaymentUseCase: asFunction((c: FinancialCradle) => new ReceivePaymentUseCase(c.contaAReceberRepository, c.caixaRepository, getEventPublisher())).singleton(),
    handleOrderConfirmedUseCase: asFunction((c: FinancialCradle) => new HandleOrderConfirmedUseCase(c.contaAReceberRepository)).singleton(),
    handleUserCreatedUseCase: asFunction((c: FinancialCradle) => new HandleUserCreatedUseCase(c.replicatedUserStore, c.cache)).singleton(),

    caixaController: asFunction((c: FinancialCradle) => new CaixaController(c.openCaixaUseCase, c.closeCaixaUseCase, c.listCaixasUseCase)).singleton(),
    contaAReceberController: asFunction((c: FinancialCradle) => new ContaAReceberController(c.createContaAReceberUseCase, c.listContasAReceberUseCase, c.receivePaymentUseCase)).singleton(),

    tokenVerifier: asFunction(({ config }: { config: FinancialContainerConfig }) => new JwtTokenVerifier(config.jwtSecret)).singleton(),
    authMiddleware: asFunction(({ tokenVerifier }: { tokenVerifier: JwtTokenVerifier }) => createAuthMiddleware((token) => tokenVerifier.verify(token))).singleton(),
    financialRoutes: asFunction(({ caixaController, contaAReceberController, authMiddleware }: any) => createFinancialRoutes(caixaController, contaAReceberController, authMiddleware)).singleton(),
    eventConsumer: asFunction(({ config }: { config: FinancialContainerConfig }) => new RabbitMqFinancialEventsAdapter(config.rabbitmqUrl)).singleton(),
  });

  const c = awilix.cradle;
  let activeConsumer: { close(): Promise<void> } | null = null;
  let publisherConnection: Awaited<ReturnType<typeof amqp.connect>> | null = null;

  return {
    get prisma() { return c.prisma; },
    get redis() { return c.redis; },
    get financialRoutes() { return c.financialRoutes; },
    mapApplicationErrorToHttp,
    get handleUserCreatedUseCase() { return c.handleUserCreatedUseCase; },
    get handleOrderConfirmedUseCase() { return c.handleOrderConfirmedUseCase; },
    async connectRabbitMQ(
      userCreatedHandler: (payload: UserCreatedPayload) => Promise<void>,
      orderConfirmedHandler: (payload: OrderConfirmedPayload) => Promise<void>
    ): Promise<void> {
      if (activeConsumer) { await activeConsumer.close(); activeConsumer = null; }
      const cfg = c.config;
      if (!cfg.eventPublisherOverride) {
        const conn = await amqp.connect(cfg.rabbitmqUrl, { timeout: 10_000 });
        publisherConnection = conn;
        const channel = await conn.createChannel();
        eventPublisher = new RabbitMqEventPublisher(channel);
      }
      if (cfg.eventConsumerOverride) {
        await cfg.eventConsumerOverride.start();
        activeConsumer = cfg.eventConsumerOverride;
      } else {
        c.eventConsumer.onUserCreated(userCreatedHandler);
        c.eventConsumer.onOrderConfirmed(orderConfirmedHandler);
        await c.eventConsumer.start();
        activeConsumer = c.eventConsumer;
      }
    },
    async disconnect(): Promise<void> {
      if (activeConsumer) { await activeConsumer.close(); activeConsumer = null; }
      if (publisherConnection) { await (publisherConnection as any).close(); publisherConnection = null; }
      await c.prisma.$disconnect();
      c.redis.disconnect();
    },
  };
}
