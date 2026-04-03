import { createContainer as createAwilixContainer, asValue, asClass, asFunction } from "awilix";
import { PrismaClient } from "../generated/prisma-client";
import Redis from "ioredis";
import type { UserCreatedPayload } from "@lframework/shared";
import type { ICacheService } from "@lframework/shared";
import { RedisCacheAdapter, createAuthMiddleware, JwtTokenVerifier } from "@lframework/shared";
import { PrismaVasilhameRepository } from "./adapters/driven/persistence/prisma-vasilhame.repository";
import { PrismaMovimentacaoRepository } from "./adapters/driven/persistence/prisma-movimentacao.repository";
import { PrismaComodatoRepository } from "./adapters/driven/persistence/prisma-comodato.repository";
import { PrismaReplicatedUserStore } from "./adapters/driven/persistence/prisma-replicated-user.store";
import { VasilhamesListCacheInvalidatorAdapter } from "./adapters/driven/cache/vasilhames-list-cache-invalidator.adapter";
import { RabbitMqUserEventsAdapter } from "./adapters/driving/messaging/rabbitmq-user-events.adapter";
import { CreateVasilhameUseCase } from "./application/use-cases/create-vasilhame.use-case";
import { ListVasilhamesUseCase } from "./application/use-cases/list-vasilhames.use-case";
import { CreateMovimentacaoUseCase } from "./application/use-cases/create-movimentacao.use-case";
import { ListMovimentacoesUseCase } from "./application/use-cases/list-movimentacoes.use-case";
import { CreateComodatoUseCase } from "./application/use-cases/create-comodato.use-case";
import { ListComodatosUseCase } from "./application/use-cases/list-comodatos.use-case";
import { GenerateRelatorioAnpUseCase } from "./application/use-cases/generate-relatorio-anp.use-case";
import { HandleUserCreatedUseCase } from "./application/use-cases/handle-user-created.use-case";
import { VasilhameController } from "./adapters/driving/http/vasilhame.controller";
import { MovimentacaoController } from "./adapters/driving/http/movimentacao.controller";
import { ComodatoController } from "./adapters/driving/http/comodato.controller";
import { RelatorioController } from "./adapters/driving/http/relatorio.controller";
import { createStockRoutes } from "./adapters/driving/http/routes";
import { mapApplicationErrorToHttp } from "./adapters/driving/http/error-to-http.mapper";

/** No-op event consumer for tests; when set, RabbitMQ is not used. */
export interface TestEventConsumer {
  start(): Promise<void>;
  close(): Promise<void>;
}

export interface StockContainerConfig {
  databaseUrl: string;
  redisUrl: string;
  rabbitmqUrl: string;
  jwtSecret: string;
  /** When set, used instead of Redis cache (e.g. no-op in integration tests). */
  cacheOverride?: ICacheService;
  /** When set, used instead of starting RabbitMQ consumer (e.g. no-op in integration tests). */
  eventConsumerOverride?: TestEventConsumer;
}

/** Tipo do cradle (dependências resolvidas) para type-safety. */
interface StockCradle {
  config: StockContainerConfig;
  prisma: PrismaClient;
  redis: Redis;
  cache: ICacheService;
  vasilhameRepository: PrismaVasilhameRepository;
  movimentacaoRepository: PrismaMovimentacaoRepository;
  comodatoRepository: PrismaComodatoRepository;
  replicatedUserStore: PrismaReplicatedUserStore;
  vasilhamesListCacheInvalidator: VasilhamesListCacheInvalidatorAdapter;
  createVasilhameUseCase: CreateVasilhameUseCase;
  listVasilhamesUseCase: ListVasilhamesUseCase;
  createMovimentacaoUseCase: CreateMovimentacaoUseCase;
  listMovimentacoesUseCase: ListMovimentacoesUseCase;
  createComodatoUseCase: CreateComodatoUseCase;
  listComodatosUseCase: ListComodatosUseCase;
  generateRelatorioAnpUseCase: GenerateRelatorioAnpUseCase;
  handleUserCreatedUseCase: HandleUserCreatedUseCase;
  vasilhameController: VasilhameController;
  movimentacaoController: MovimentacaoController;
  comodatoController: ComodatoController;
  relatorioController: RelatorioController;
  tokenVerifier: JwtTokenVerifier;
  authMiddleware: ReturnType<typeof createAuthMiddleware>;
  stockRoutes: ReturnType<typeof createStockRoutes>;
  eventConsumer: RabbitMqUserEventsAdapter;
}

/**
 * Container de DI com Awilix.
 * Dependências registradas por nome; resolução automática por parâmetros do construtor.
 */
export function createContainer(config: StockContainerConfig) {
  const awilix = createAwilixContainer<StockCradle>();

  awilix.register({
    config: asValue(config),

    prisma: asFunction(({ config }: { config: StockContainerConfig }) => {
      return new PrismaClient({
        datasources: { db: { url: config.databaseUrl } },
      });
    }).singleton(),

    redis: asFunction(({ config }: { config: StockContainerConfig }) => {
      return new Redis(config.redisUrl, {
        connectTimeout: 5000,
        commandTimeout: 5000,
      });
    }).singleton(),

    cache: asFunction(
      ({ config, redis }: { config: StockContainerConfig; redis: Redis }) =>
        config.cacheOverride ?? new RedisCacheAdapter(redis)
    ).singleton(),

    vasilhameRepository: asFunction(
      (cradle: StockCradle) => new PrismaVasilhameRepository(cradle.prisma)
    ).singleton(),
    movimentacaoRepository: asFunction(
      (cradle: StockCradle) => new PrismaMovimentacaoRepository(cradle.prisma)
    ).singleton(),
    comodatoRepository: asFunction(
      (cradle: StockCradle) => new PrismaComodatoRepository(cradle.prisma)
    ).singleton(),
    replicatedUserStore: asFunction(
      (cradle: StockCradle) => new PrismaReplicatedUserStore(cradle.prisma)
    ).singleton(),
    vasilhamesListCacheInvalidator: asFunction(
      (cradle: StockCradle) =>
        new VasilhamesListCacheInvalidatorAdapter(cradle.cache)
    ).singleton(),

    createVasilhameUseCase: asFunction(
      (cradle: StockCradle) =>
        new CreateVasilhameUseCase(cradle.vasilhameRepository, cradle.vasilhamesListCacheInvalidator)
    ).singleton(),
    listVasilhamesUseCase: asFunction(
      (cradle: StockCradle) =>
        new ListVasilhamesUseCase(cradle.vasilhameRepository, cradle.cache)
    ).singleton(),
    createMovimentacaoUseCase: asFunction(
      (cradle: StockCradle) =>
        new CreateMovimentacaoUseCase(cradle.movimentacaoRepository, cradle.vasilhameRepository)
    ).singleton(),
    listMovimentacoesUseCase: asFunction(
      (cradle: StockCradle) =>
        new ListMovimentacoesUseCase(cradle.movimentacaoRepository)
    ).singleton(),
    createComodatoUseCase: asFunction(
      (cradle: StockCradle) =>
        new CreateComodatoUseCase(cradle.comodatoRepository, cradle.vasilhameRepository)
    ).singleton(),
    listComodatosUseCase: asFunction(
      (cradle: StockCradle) =>
        new ListComodatosUseCase(cradle.comodatoRepository)
    ).singleton(),
    generateRelatorioAnpUseCase: asFunction(
      (cradle: StockCradle) => new GenerateRelatorioAnpUseCase(cradle.movimentacaoRepository)
    ).singleton(),
    handleUserCreatedUseCase: asFunction(
      (cradle: StockCradle) =>
        new HandleUserCreatedUseCase(cradle.replicatedUserStore, cradle.cache)
    ).singleton(),

    vasilhameController: asFunction(
      (cradle: StockCradle) =>
        new VasilhameController(cradle.createVasilhameUseCase, cradle.listVasilhamesUseCase)
    ).singleton(),
    movimentacaoController: asFunction(
      (cradle: StockCradle) =>
        new MovimentacaoController(cradle.createMovimentacaoUseCase, cradle.listMovimentacoesUseCase)
    ).singleton(),
    comodatoController: asFunction(
      (cradle: StockCradle) =>
        new ComodatoController(cradle.createComodatoUseCase, cradle.listComodatosUseCase)
    ).singleton(),
    relatorioController: asFunction(
      (cradle: StockCradle) => new RelatorioController(cradle.generateRelatorioAnpUseCase)
    ).singleton(),

    tokenVerifier: asFunction(({ config }: { config: StockContainerConfig }) => {
      return new JwtTokenVerifier(config.jwtSecret);
    }).singleton(),

    authMiddleware: asFunction(
      ({ tokenVerifier }: { tokenVerifier: JwtTokenVerifier }) =>
        createAuthMiddleware((token) => tokenVerifier.verify(token))
    ).singleton(),

    stockRoutes: asFunction(
      ({
        vasilhameController,
        movimentacaoController,
        comodatoController,
        relatorioController,
        authMiddleware,
      }: {
        vasilhameController: VasilhameController;
        movimentacaoController: MovimentacaoController;
        comodatoController: ComodatoController;
        relatorioController: RelatorioController;
        authMiddleware: ReturnType<typeof createAuthMiddleware>;
      }) => createStockRoutes(vasilhameController, movimentacaoController, comodatoController, relatorioController, authMiddleware)
    ).singleton(),

    eventConsumer: asFunction(
      ({ config }: { config: StockContainerConfig }) =>
        new RabbitMqUserEventsAdapter(config.rabbitmqUrl)
    ).singleton(),
  });

  const c = awilix.cradle;
  let activeConsumer: { close(): Promise<void> } | null = null;

  return {
    get prisma() {
      return c.prisma;
    },
    get redis() {
      return c.redis;
    },
    get stockRoutes() {
      return c.stockRoutes;
    },
    mapApplicationErrorToHttp,
    get handleUserCreatedUseCase() {
      return c.handleUserCreatedUseCase;
    },
    async connectRabbitMQ(userCreatedHandler: (payload: UserCreatedPayload) => Promise<void>): Promise<void> {
      if (activeConsumer) {
        await activeConsumer.close();
        activeConsumer = null;
      }
      const config = c.config;
      if (config.eventConsumerOverride) {
        await config.eventConsumerOverride.start();
        activeConsumer = config.eventConsumerOverride;
      } else {
        c.eventConsumer.onUserCreated(userCreatedHandler);
        await c.eventConsumer.start();
        activeConsumer = c.eventConsumer;
      }
    },
    async disconnect(): Promise<void> {
      if (activeConsumer) {
        await activeConsumer.close();
        activeConsumer = null;
      }
      await c.prisma.$disconnect();
      c.redis.disconnect();
    },
  };
}
