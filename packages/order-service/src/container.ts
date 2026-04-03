import { createContainer as createAwilixContainer, asValue, asFunction } from "awilix";
import { PrismaClient } from "../generated/prisma-client";
import Redis from "ioredis";
import amqp from "amqplib";
import type { UserCreatedPayload } from "@lframework/shared";
import type { ICacheService } from "@lframework/shared";
import { RedisCacheAdapter, createAuthMiddleware, JwtTokenVerifier } from "@lframework/shared";
import { PrismaClienteRepository } from "./adapters/driven/persistence/prisma-cliente.repository";
import { PrismaPedidoRepository } from "./adapters/driven/persistence/prisma-pedido.repository";
import { PrismaNotaFiscalRepository } from "./adapters/driven/persistence/prisma-nota-fiscal.repository";
import { PrismaReplicatedUserStore } from "./adapters/driven/persistence/prisma-replicated-user.store";
import { StubNfEmitterAdapter } from "./adapters/driven/integration/stub-nf-emitter.adapter";
import { RabbitMqEventPublisher } from "./adapters/driven/messaging/rabbitmq-event-publisher.adapter";
import { RabbitMqUserEventsAdapter } from "./adapters/driving/messaging/rabbitmq-user-events.adapter";
import { CreateClienteUseCase } from "./application/use-cases/create-cliente.use-case";
import { ListClientesUseCase } from "./application/use-cases/list-clientes.use-case";
import { CreatePedidoUseCase } from "./application/use-cases/create-pedido.use-case";
import { ConfirmPedidoUseCase } from "./application/use-cases/confirm-pedido.use-case";
import { ListPedidosUseCase } from "./application/use-cases/list-pedidos.use-case";
import { HandleUserCreatedUseCase } from "./application/use-cases/handle-user-created.use-case";
import { ClienteController } from "./adapters/driving/http/cliente.controller";
import { PedidoController } from "./adapters/driving/http/pedido.controller";
import { createOrderRoutes } from "./adapters/driving/http/routes";
import { mapApplicationErrorToHttp } from "./adapters/driving/http/error-to-http.mapper";
import type { IEventPublisher } from "./application/ports/event-publisher.port";

export interface TestEventConsumer {
  start(): Promise<void>;
  close(): Promise<void>;
}

export interface OrderContainerConfig {
  databaseUrl: string;
  redisUrl: string;
  rabbitmqUrl: string;
  jwtSecret: string;
  cacheOverride?: ICacheService;
  eventConsumerOverride?: TestEventConsumer;
  eventPublisherOverride?: IEventPublisher;
}

interface OrderCradle {
  config: OrderContainerConfig;
  prisma: PrismaClient;
  redis: Redis;
  cache: ICacheService;
  clienteRepository: PrismaClienteRepository;
  pedidoRepository: PrismaPedidoRepository;
  notaFiscalRepository: PrismaNotaFiscalRepository;
  nfEmitter: StubNfEmitterAdapter;
  replicatedUserStore: PrismaReplicatedUserStore;
  createClienteUseCase: CreateClienteUseCase;
  listClientesUseCase: ListClientesUseCase;
  createPedidoUseCase: CreatePedidoUseCase;
  confirmPedidoUseCase: ConfirmPedidoUseCase;
  listPedidosUseCase: ListPedidosUseCase;
  handleUserCreatedUseCase: HandleUserCreatedUseCase;
  clienteController: ClienteController;
  pedidoController: PedidoController;
  tokenVerifier: JwtTokenVerifier;
  authMiddleware: ReturnType<typeof createAuthMiddleware>;
  orderRoutes: ReturnType<typeof createOrderRoutes>;
  eventConsumer: RabbitMqUserEventsAdapter;
}

export function createContainer(config: OrderContainerConfig) {
  const awilix = createAwilixContainer<OrderCradle>();

  // Event publisher é criado lazily após conexão RabbitMQ
  let eventPublisher: IEventPublisher | null = config.eventPublisherOverride ?? null;

  // No-op publisher para registro inicial no container
  const getEventPublisher = (): IEventPublisher => {
    if (!eventPublisher) throw new Error("Event publisher not initialized. Call connectRabbitMQ first.");
    return eventPublisher;
  };

  awilix.register({
    config: asValue(config),

    prisma: asFunction(({ config }: { config: OrderContainerConfig }) =>
      new PrismaClient({ datasources: { db: { url: config.databaseUrl } } })
    ).singleton(),

    redis: asFunction(({ config }: { config: OrderContainerConfig }) =>
      new Redis(config.redisUrl, { connectTimeout: 5000, commandTimeout: 5000 })
    ).singleton(),

    cache: asFunction(({ config, redis }: { config: OrderContainerConfig; redis: Redis }) =>
      config.cacheOverride ?? new RedisCacheAdapter(redis)
    ).singleton(),

    clienteRepository: asFunction((cradle: OrderCradle) => new PrismaClienteRepository(cradle.prisma)).singleton(),
    pedidoRepository: asFunction((cradle: OrderCradle) => new PrismaPedidoRepository(cradle.prisma)).singleton(),
    notaFiscalRepository: asFunction((cradle: OrderCradle) => new PrismaNotaFiscalRepository(cradle.prisma)).singleton(),
    nfEmitter: asFunction(() => new StubNfEmitterAdapter()).singleton(),
    replicatedUserStore: asFunction((cradle: OrderCradle) => new PrismaReplicatedUserStore(cradle.prisma)).singleton(),

    createClienteUseCase: asFunction((cradle: OrderCradle) =>
      new CreateClienteUseCase(cradle.clienteRepository)
    ).singleton(),
    listClientesUseCase: asFunction((cradle: OrderCradle) =>
      new ListClientesUseCase(cradle.clienteRepository, cradle.cache)
    ).singleton(),
    createPedidoUseCase: asFunction((cradle: OrderCradle) =>
      new CreatePedidoUseCase(cradle.pedidoRepository, cradle.clienteRepository, getEventPublisher())
    ).singleton(),
    confirmPedidoUseCase: asFunction((cradle: OrderCradle) =>
      new ConfirmPedidoUseCase(cradle.pedidoRepository, getEventPublisher(), cradle.nfEmitter, cradle.notaFiscalRepository)
    ).singleton(),
    listPedidosUseCase: asFunction((cradle: OrderCradle) =>
      new ListPedidosUseCase(cradle.pedidoRepository)
    ).singleton(),
    handleUserCreatedUseCase: asFunction((cradle: OrderCradle) =>
      new HandleUserCreatedUseCase(cradle.replicatedUserStore, cradle.cache)
    ).singleton(),

    clienteController: asFunction((cradle: OrderCradle) =>
      new ClienteController(cradle.createClienteUseCase, cradle.listClientesUseCase)
    ).singleton(),
    pedidoController: asFunction((cradle: OrderCradle) =>
      new PedidoController(cradle.createPedidoUseCase, cradle.listPedidosUseCase, cradle.confirmPedidoUseCase, cradle.notaFiscalRepository)
    ).singleton(),

    tokenVerifier: asFunction(({ config }: { config: OrderContainerConfig }) =>
      new JwtTokenVerifier(config.jwtSecret)
    ).singleton(),

    authMiddleware: asFunction(({ tokenVerifier }: { tokenVerifier: JwtTokenVerifier }) =>
      createAuthMiddleware((token) => tokenVerifier.verify(token))
    ).singleton(),

    orderRoutes: asFunction(({
      clienteController, pedidoController, authMiddleware,
    }: {
      clienteController: ClienteController;
      pedidoController: PedidoController;
      authMiddleware: ReturnType<typeof createAuthMiddleware>;
    }) => createOrderRoutes(clienteController, pedidoController, authMiddleware)).singleton(),

    eventConsumer: asFunction(({ config }: { config: OrderContainerConfig }) =>
      new RabbitMqUserEventsAdapter(config.rabbitmqUrl)
    ).singleton(),
  });

  const c = awilix.cradle;
  let activeConsumer: { close(): Promise<void> } | null = null;
  let publisherConnection: Awaited<ReturnType<typeof amqp.connect>> | null = null;

  return {
    get prisma() { return c.prisma; },
    get redis() { return c.redis; },
    get orderRoutes() { return c.orderRoutes; },
    mapApplicationErrorToHttp,
    get handleUserCreatedUseCase() { return c.handleUserCreatedUseCase; },
    async connectRabbitMQ(userCreatedHandler: (payload: UserCreatedPayload) => Promise<void>): Promise<void> {
      if (activeConsumer) { await activeConsumer.close(); activeConsumer = null; }

      const cfg = c.config;

      // Criar publisher
      if (!cfg.eventPublisherOverride) {
        const conn = await amqp.connect(cfg.rabbitmqUrl, { timeout: 10_000 });
        publisherConnection = conn;
        const channel = await conn.createChannel();
        eventPublisher = new RabbitMqEventPublisher(channel);
      }

      // Iniciar consumer
      if (cfg.eventConsumerOverride) {
        await cfg.eventConsumerOverride.start();
        activeConsumer = cfg.eventConsumerOverride;
      } else {
        c.eventConsumer.onUserCreated(userCreatedHandler);
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
