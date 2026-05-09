import { createContainer as createAwilixContainer, asValue, asClass, asFunction } from "awilix";
import { PrismaClient } from "../generated/prisma-client";
import Redis from "ioredis";
import { RedisCacheAdapter, type ICacheService } from "@lframework/shared";
import { PrismaUserRepository } from "./adapters/driven/persistence/prisma-user.repository";
import { PrismaAuthCredentialRepository } from "./adapters/driven/persistence/prisma-auth-credential.repository";
import { PrismaPasswordResetTokenRepository } from "./adapters/driven/persistence/prisma-password-reset-token.repository";
import { PrismaUserRegistrationPersistence } from "./adapters/driven/persistence/prisma-user-registration.repository";
import { PrismaUserOAuthRegistrationPersistence } from "./adapters/driven/persistence/prisma-user-oauth-registration.repository";
import { PrismaOAuthAccountRepository } from "./adapters/driven/persistence/prisma-oauth-account.repository";
import { PrismaUnidadeRepository } from "./adapters/driven/persistence/prisma-unidade.repository";
import { PrismaUsuarioUnidadeRepository } from "./adapters/driven/persistence/prisma-usuario-unidade.repository";
import { PrismaConfiguracaoUnidadeRepository } from "./adapters/driven/persistence/prisma-configuracao-unidade.repository";
import { RabbitMqEventPublisherAdapter } from "./adapters/driven/messaging/rabbitmq-event-publisher.adapter";
import { OutboxRelayAdapter } from "./adapters/driven/messaging/outbox-relay.adapter";
import type { IEventPublisher } from "./application/ports/event-publisher.port";
import { UserCreatedNotifierAdapter } from "./adapters/driven/notifiers/user-created-notifier.adapter";
import { JwtTokenService } from "./adapters/driven/auth/jwt-token.service";
import { Argon2PasswordHasher } from "./adapters/driven/auth/argon2-password-hasher";
import { GoogleOAuthProvider } from "./adapters/driven/auth/google-oauth.provider";
import { GitHubOAuthProvider } from "./adapters/driven/auth/github-oauth.provider";
import type { IOAuthProvider } from "./application/ports/oauth-provider.port";
import { CreateUserUseCase } from "./application/use-cases/create-user.use-case";
import { GetUserByIdUseCase } from "./application/use-cases/get-user-by-id.use-case";
import { UpdateUserUseCase } from "./application/use-cases/update-user.use-case";
import { DeactivateUserUseCase } from "./application/use-cases/deactivate-user.use-case";
import { ListRolePermissionsUseCase } from "./application/use-cases/list-role-permissions.use-case";
import { RegisterUseCase } from "./application/use-cases/register.use-case";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { GetCurrentUserUseCase } from "./application/use-cases/get-current-user.use-case";
import { OAuthCallbackUseCase } from "./application/use-cases/oauth-callback.use-case";
import { RequestPasswordResetUseCase } from "./application/use-cases/request-password-reset.use-case";
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.use-case";
import { LogoutUseCase } from "./application/use-cases/logout.use-case";
import { CreateUnidadeUseCase } from "./application/use-cases/create-unidade.use-case";
import { ListUnidadesUseCase } from "./application/use-cases/list-unidades.use-case";
import { GetUnidadeByIdUseCase } from "./application/use-cases/get-unidade-by-id.use-case";
import { LinkUserToUnidadeUseCase } from "./application/use-cases/link-user-to-unidade.use-case";
import { ListUserUnidadesUseCase } from "./application/use-cases/list-user-unidades.use-case";
import { UpsertConfiguracaoUseCase } from "./application/use-cases/upsert-configuracao.use-case";
import { ListConfiguracoesUseCase } from "./application/use-cases/list-configuracoes.use-case";
import { UserController } from "./adapters/driving/http/user.controller";
import { AuthController } from "./adapters/driving/http/auth.controller";
import { UnidadeController } from "./adapters/driving/http/unidade.controller";
import { createAuthMiddleware } from "@lframework/shared";
import { createUserRoutes } from "./adapters/driving/http/routes";
import { createAuthRoutes } from "./adapters/driving/http/auth.routes";
import { createUnidadeRoutes } from "./adapters/driving/http/unidade.routes";
import { mapApplicationErrorToHttp } from "./adapters/driving/http/error-to-http.mapper";

/** Optional event publisher for tests (no-op connect/disconnect). When set, RabbitMQ is not used. */
export type TestEventPublisher = IEventPublisher & {
  connect?: () => Promise<void>;
  disconnect?: () => Promise<void>;
};

export interface ContainerConfig {
  databaseUrl: string;
  redisUrl: string;
  rabbitmqUrl: string;
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  baseUrl: string;
  googleOAuth?: { clientId: string; clientSecret: string };
  githubOAuth?: { clientId: string; clientSecret: string };
  /** When set, used instead of RabbitMQ (e.g. no-op in integration tests). */
  eventPublisherOverride?: TestEventPublisher;
  /** When set, used instead of Redis cache (e.g. no-op in integration tests). */
  cacheOverride?: ICacheService;
}

/** Tipo do cradle (dependências resolvidas) para type-safety. */
interface IdentityCradle {
  config: ContainerConfig;
  prisma: PrismaClient;
  redis: Redis;
  cache: RedisCacheAdapter;
  userRepository: PrismaUserRepository;
  authCredentialRepository: PrismaAuthCredentialRepository;
  passwordResetTokenRepository: PrismaPasswordResetTokenRepository;
  registrationPersistence: PrismaUserRegistrationPersistence;
  userOAuthRegistrationPersistence: PrismaUserOAuthRegistrationPersistence;
  oauthAccountRepository: PrismaOAuthAccountRepository;
  unidadeRepository: PrismaUnidadeRepository;
  usuarioUnidadeRepository: PrismaUsuarioUnidadeRepository;
  configuracaoUnidadeRepository: PrismaConfiguracaoUnidadeRepository;
  eventPublisher: IEventPublisher & { connect?: () => Promise<void>; disconnect?: () => Promise<void> };
  tokenService: JwtTokenService;
  passwordHasher: Argon2PasswordHasher;
  googleProvider: IOAuthProvider | null;
  githubProvider: IOAuthProvider | null;
  baseUrl: string;
  jwtExpiresInSeconds: number;
  userCreatedNotifier: UserCreatedNotifierAdapter;
  createUserUseCase: CreateUserUseCase;
  getUserByIdUseCase: GetUserByIdUseCase;
  updateUserUseCase: UpdateUserUseCase;
  deactivateUserUseCase: DeactivateUserUseCase;
  listRolePermissionsUseCase: ListRolePermissionsUseCase;
  registerUseCase: RegisterUseCase;
  loginUseCase: LoginUseCase;
  getCurrentUserUseCase: GetCurrentUserUseCase;
  oauthCallbackUseCase: OAuthCallbackUseCase;
  requestPasswordResetUseCase: RequestPasswordResetUseCase;
  resetPasswordUseCase: ResetPasswordUseCase;
  logoutUseCase: LogoutUseCase;
  createUnidadeUseCase: CreateUnidadeUseCase;
  listUnidadesUseCase: ListUnidadesUseCase;
  getUnidadeByIdUseCase: GetUnidadeByIdUseCase;
  linkUserToUnidadeUseCase: LinkUserToUnidadeUseCase;
  listUserUnidadesUseCase: ListUserUnidadesUseCase;
  upsertConfiguracaoUseCase: UpsertConfiguracaoUseCase;
  listConfiguracoesUseCase: ListConfiguracoesUseCase;
  userController: UserController;
  authController: AuthController;
  unidadeController: UnidadeController;
  authMiddleware: ReturnType<typeof createAuthMiddleware>;
  userRoutes: ReturnType<typeof createUserRoutes>;
  authRoutes: ReturnType<typeof createAuthRoutes>;
  unidadeRoutes: ReturnType<typeof createUnidadeRoutes>;
  outboxRelay: OutboxRelayAdapter;
}

/**
 * Container de DI com Awilix.
 * Dependências registradas por nome; resolução automática por parâmetros do construtor.
 */
export function createContainer(config: ContainerConfig) {
  const awilix = createAwilixContainer<IdentityCradle>();

  awilix.register({
    config: asValue(config),

    prisma: asFunction(({ config }: { config: ContainerConfig }) => {
      return new PrismaClient({ datasources: { db: { url: config.databaseUrl } } });
    }).singleton(),

    redis: asFunction(({ config }: { config: ContainerConfig }) => {
      return new Redis(config.redisUrl, {
        connectTimeout: 5000,
        commandTimeout: 5000,
      });
    }).singleton(),

    cache: asFunction(
    ({ config, redis }: { config: ContainerConfig; redis: Redis }) =>
      config.cacheOverride ?? new RedisCacheAdapter(redis)
  ).singleton(),
    userRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaUserRepository(cradle.prisma)
    ).singleton(),
    authCredentialRepository: asFunction(
      (cradle: IdentityCradle) =>
        new PrismaAuthCredentialRepository(cradle.prisma)
    ).singleton(),
    passwordResetTokenRepository: asFunction(
      (cradle: IdentityCradle) =>
        new PrismaPasswordResetTokenRepository(cradle.prisma)
    ).singleton(),
    registrationPersistence: asFunction(
      (cradle: IdentityCradle) =>
        new PrismaUserRegistrationPersistence(cradle.prisma)
    ).singleton(),
    userOAuthRegistrationPersistence: asFunction(
      (cradle: IdentityCradle) =>
        new PrismaUserOAuthRegistrationPersistence(cradle.prisma)
    ).singleton(),
    oauthAccountRepository: asFunction(
      (cradle: IdentityCradle) =>
        new PrismaOAuthAccountRepository(cradle.prisma)
    ).singleton(),
    unidadeRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaUnidadeRepository(cradle.prisma)
    ).singleton(),
    usuarioUnidadeRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaUsuarioUnidadeRepository(cradle.prisma)
    ).singleton(),
    configuracaoUnidadeRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaConfiguracaoUnidadeRepository(cradle.prisma)
    ).singleton(),

    eventPublisher: asFunction(
      ({ config }: { config: ContainerConfig }) =>
        config.eventPublisherOverride ?? new RabbitMqEventPublisherAdapter(config.rabbitmqUrl)
    ).singleton(),

    outboxRelay: asFunction(
      (cradle: IdentityCradle) =>
        new OutboxRelayAdapter(cradle.prisma, cradle.eventPublisher)
    ).singleton(),

    tokenService: asFunction(({ config }: { config: ContainerConfig }) => {
      return new JwtTokenService({
        secret: config.jwtSecret,
        expiresInSeconds: config.jwtExpiresInSeconds,
      });
    }).singleton(),

    passwordHasher: asClass(Argon2PasswordHasher).singleton(),

    googleProvider: asFunction(
      ({ config }: { config: ContainerConfig }): IOAuthProvider | null =>
        config.googleOAuth ? new GoogleOAuthProvider(config.googleOAuth) : null
    ).singleton(),

    githubProvider: asFunction(
      ({ config }: { config: ContainerConfig }): IOAuthProvider | null =>
        config.githubOAuth ? new GitHubOAuthProvider(config.githubOAuth) : null
    ).singleton(),

    baseUrl: asFunction(({ config }: { config: ContainerConfig }) => config.baseUrl).singleton(),
    jwtExpiresInSeconds: asFunction(
      ({ config }: { config: ContainerConfig }) => config.jwtExpiresInSeconds
    ).singleton(),

    userCreatedNotifier: asFunction(
      (cradle: IdentityCradle) =>
        new UserCreatedNotifierAdapter(cradle.cache)
    ).singleton(),

    createUserUseCase: asFunction(
      (cradle: IdentityCradle) =>
        new CreateUserUseCase(cradle.userRepository, cradle.userCreatedNotifier)
    ).singleton(),

    getUserByIdUseCase: asFunction(
      (cradle: IdentityCradle) =>
        new GetUserByIdUseCase(cradle.userRepository, cradle.cache)
    ).singleton(),

    updateUserUseCase: asFunction(
      (cradle: IdentityCradle) =>
        new UpdateUserUseCase(cradle.userRepository, cradle.cache)
    ).singleton(),

    deactivateUserUseCase: asFunction(
      (cradle: IdentityCradle) =>
        new DeactivateUserUseCase(cradle.userRepository, cradle.cache)
    ).singleton(),

    listRolePermissionsUseCase: asFunction(
      (cradle: IdentityCradle) =>
        new ListRolePermissionsUseCase(cradle.userRepository)
    ).singleton(),

    registerUseCase: asFunction(
      (cradle: IdentityCradle) =>
        new RegisterUseCase(
          cradle.userRepository,
          cradle.registrationPersistence,
          cradle.passwordHasher,
          cradle.tokenService,
          cradle.userCreatedNotifier
        )
    ).singleton(),

    loginUseCase: asFunction(
      (cradle: IdentityCradle) =>
        new LoginUseCase(
          cradle.userRepository,
          cradle.authCredentialRepository,
          cradle.passwordHasher,
          cradle.tokenService
        )
    ).singleton(),

    getCurrentUserUseCase: asFunction(
      (cradle: IdentityCradle) =>
        new GetCurrentUserUseCase(cradle.userRepository)
    ).singleton(),

    oauthCallbackUseCase: asFunction(
      (cradle: IdentityCradle) =>
        new OAuthCallbackUseCase(
          cradle.userRepository,
          cradle.oauthAccountRepository,
          cradle.userOAuthRegistrationPersistence,
          cradle.tokenService,
          cradle.userCreatedNotifier
        )
    ).singleton(),

    requestPasswordResetUseCase: asFunction(
      (cradle: IdentityCradle) =>
        new RequestPasswordResetUseCase(
          cradle.userRepository,
          cradle.passwordResetTokenRepository
        )
    ).singleton(),

    resetPasswordUseCase: asFunction(
      (cradle: IdentityCradle) =>
        new ResetPasswordUseCase(
          cradle.passwordResetTokenRepository,
          cradle.authCredentialRepository,
          cradle.passwordHasher
        )
    ).singleton(),

    logoutUseCase: asFunction(
      (cradle: IdentityCradle) => new LogoutUseCase(cradle.cache)
    ).singleton(),

    createUnidadeUseCase: asFunction(
      (cradle: IdentityCradle) => new CreateUnidadeUseCase(cradle.unidadeRepository)
    ).singleton(),
    listUnidadesUseCase: asFunction(
      (cradle: IdentityCradle) => new ListUnidadesUseCase(cradle.unidadeRepository)
    ).singleton(),
    getUnidadeByIdUseCase: asFunction(
      (cradle: IdentityCradle) => new GetUnidadeByIdUseCase(cradle.unidadeRepository)
    ).singleton(),
    linkUserToUnidadeUseCase: asFunction(
      (cradle: IdentityCradle) =>
        new LinkUserToUnidadeUseCase(cradle.usuarioUnidadeRepository, cradle.unidadeRepository, cradle.userRepository)
    ).singleton(),
    listUserUnidadesUseCase: asFunction(
      (cradle: IdentityCradle) => new ListUserUnidadesUseCase(cradle.usuarioUnidadeRepository)
    ).singleton(),
    upsertConfiguracaoUseCase: asFunction(
      (cradle: IdentityCradle) =>
        new UpsertConfiguracaoUseCase(cradle.configuracaoUnidadeRepository, cradle.unidadeRepository)
    ).singleton(),
    listConfiguracoesUseCase: asFunction(
      (cradle: IdentityCradle) => new ListConfiguracoesUseCase(cradle.configuracaoUnidadeRepository)
    ).singleton(),

    userController: asFunction(
      (cradle: IdentityCradle) =>
        new UserController(
          cradle.createUserUseCase,
          cradle.getUserByIdUseCase,
          cradle.updateUserUseCase,
          cradle.deactivateUserUseCase
        )
    ).singleton(),

    authController: asFunction(
      (cradle: IdentityCradle) =>
        new AuthController(
          cradle.registerUseCase,
          cradle.loginUseCase,
          cradle.getCurrentUserUseCase,
          cradle.oauthCallbackUseCase,
          cradle.requestPasswordResetUseCase,
          cradle.resetPasswordUseCase,
          cradle.logoutUseCase,
          cradle.googleProvider,
          cradle.githubProvider,
          cradle.baseUrl,
          cradle.cache,
          cradle.jwtExpiresInSeconds
        )
    ).singleton(),

    unidadeController: asFunction(
      (cradle: IdentityCradle) =>
        new UnidadeController(
          cradle.createUnidadeUseCase,
          cradle.listUnidadesUseCase,
          cradle.getUnidadeByIdUseCase,
          cradle.linkUserToUnidadeUseCase,
          cradle.listUserUnidadesUseCase,
          cradle.upsertConfiguracaoUseCase,
          cradle.listConfiguracoesUseCase
        )
    ).singleton(),

    authMiddleware: asFunction(
      ({ tokenService, cache }: { tokenService: JwtTokenService; cache: ICacheService }) =>
        createAuthMiddleware((token) => tokenService.verify(token), {
          isRevoked: async (payload) => {
            if (!payload.jti) return false;
            return Boolean(await cache.get<boolean>(`jwt:blacklist:${payload.jti}`));
          },
        })
    ).singleton(),

    userRoutes: asFunction(
      ({
        userController,
        authMiddleware,
        listRolePermissionsUseCase,
      }: {
        userController: UserController;
        authMiddleware: ReturnType<typeof createAuthMiddleware>;
        listRolePermissionsUseCase: ListRolePermissionsUseCase;
      }) => createUserRoutes(userController, authMiddleware, listRolePermissionsUseCase)
    ).singleton(),

    authRoutes: asFunction(
      ({
        authController,
        authMiddleware,
      }: {
        authController: AuthController;
        authMiddleware: ReturnType<typeof createAuthMiddleware>;
      }) => createAuthRoutes(authController, authMiddleware)
    ).singleton(),

    unidadeRoutes: asFunction(
      ({
        unidadeController,
        authMiddleware,
      }: {
        unidadeController: UnidadeController;
        authMiddleware: ReturnType<typeof createAuthMiddleware>;
      }) => createUnidadeRoutes(unidadeController, authMiddleware)
    ).singleton(),
  });

  const c = awilix.cradle;

  return {
    get prisma() {
      return c.prisma;
    },
    get redis() {
      return c.redis;
    },
    get userRoutes() {
      return c.userRoutes;
    },
    get authRoutes() {
      return c.authRoutes;
    },
    get unidadeRoutes() {
      return c.unidadeRoutes;
    },
    mapApplicationErrorToHttp,
    async connectRabbitMQ(): Promise<void> {
      const ep = c.eventPublisher as { connect?: () => Promise<void> };
      if (ep.connect) await ep.connect();
    },
    startOutboxRelay(intervalMs: number = 2_000): void {
      c.outboxRelay.start(intervalMs);
    },
    async disconnect(): Promise<void> {
      c.outboxRelay.stop();
      const ep = c.eventPublisher as { disconnect?: () => Promise<void> };
      if (ep.disconnect) await ep.disconnect();
      await c.prisma.$disconnect();
      c.redis.disconnect();
    },
  };
}
