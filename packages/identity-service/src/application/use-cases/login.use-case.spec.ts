import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginUseCase } from "./login.use-case";
import { InvalidCredentialsError } from "../errors";
import { User } from "../../domain/entities/user.entity";
import type { IUserRepository } from "../ports/user-repository.port";
import type { IAuthCredentialRepository } from "../ports/auth-credential-repository.port";
import type { IPasswordHasher } from "../ports/password-hasher.port";
import type { ITokenService } from "../ports/token-service.port";
import type { IAuthSessionRepository } from "../ports/auth-session-repository.port";

describe("LoginUseCase", () => {
  let userRepository: IUserRepository;
  let authCredentialRepository: IAuthCredentialRepository;
  let passwordHasher: IPasswordHasher;
  let tokenService: ITokenService;
  let sessionRepository: IAuthSessionRepository;

  beforeEach(() => {
    userRepository = {
      save: vi.fn(),
      saveUserAndOutbox: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      listPermissionsByRole: vi.fn(),
    };
    authCredentialRepository = {
      getPasswordHashByUserId: vi.fn(),
    };
    passwordHasher = {
      hash: vi.fn(),
      verify: vi.fn().mockResolvedValue(true),
    };
    tokenService = {
      sign: vi.fn().mockReturnValue("fake-jwt-token"),
      verify: vi.fn(),
    };
    sessionRepository = {
      create: vi.fn().mockResolvedValue({
        id: "session-1",
        userId: "user-1",
        refreshTokenHash: "hash",
        userAgent: null,
        ipAddress: null,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000),
        revokedAt: null,
        lastUsedAt: null,
      }),
      findActiveByRefreshTokenHash: vi.fn(),
      findById: vi.fn(),
      listByUserId: vi.fn(),
      replaceRefreshToken: vi.fn(),
      revoke: vi.fn(),
      revokeAllForUser: vi.fn(),
      isActive: vi.fn(),
    };
  });

  it("deve retornar user e accessToken quando credenciais são válidas", async () => {
    const user = User.reconstitute(
      "user-1",
      "u@example.com",
      "Nome",
      new Date("2025-01-01T00:00:00.000Z"),
      "user"
    );
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
    vi.mocked(authCredentialRepository.getPasswordHashByUserId).mockResolvedValue("hashed");
    vi.mocked(passwordHasher.verify).mockResolvedValue(true);

    const useCase = new LoginUseCase(
      userRepository,
      authCredentialRepository,
      passwordHasher,
      tokenService,
      sessionRepository,
      2_592_000
    );
    const result = await useCase.execute({ email: "u@example.com", password: "senha123" });

    expect(result.user).toEqual({
      id: "user-1",
      email: "u@example.com",
      name: "Nome",
    });
    expect(result.accessToken).toBe("fake-jwt-token");
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(sessionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        refreshTokenHash: expect.any(String),
        expiresAt: expect.any(Date),
      })
    );
    expect(tokenService.sign).toHaveBeenCalledWith({
      sub: "user-1",
      email: "u@example.com",
      role: "user",
      sid: "session-1",
    });
  });

  it("deve lançar InvalidCredentialsError quando usuário não existe", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    const useCase = new LoginUseCase(
      userRepository,
      authCredentialRepository,
      passwordHasher,
      tokenService,
      sessionRepository,
      2_592_000
    );

    await expect(
      useCase.execute({ email: "naoexiste@example.com", password: "qualquer" })
    ).rejects.toThrow(InvalidCredentialsError);
    await expect(
      useCase.execute({ email: "naoexiste@example.com", password: "qualquer" })
    ).rejects.toThrow("Invalid email or password");
    expect(authCredentialRepository.getPasswordHashByUserId).not.toHaveBeenCalled();
  });

  it("deve lançar InvalidCredentialsError quando hash não existe para o usuário", async () => {
    const user = User.reconstitute("user-1", "u@example.com", "Nome", new Date(), "user");
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
    vi.mocked(authCredentialRepository.getPasswordHashByUserId).mockResolvedValue(null);

    const useCase = new LoginUseCase(
      userRepository,
      authCredentialRepository,
      passwordHasher,
      tokenService,
      sessionRepository,
      2_592_000
    );

    await expect(
      useCase.execute({ email: "u@example.com", password: "senha" })
    ).rejects.toThrow(InvalidCredentialsError);
    expect(passwordHasher.verify).not.toHaveBeenCalled();
  });

  it("deve lançar InvalidCredentialsError quando senha está incorreta", async () => {
    const user = User.reconstitute("user-1", "u@example.com", "Nome", new Date(), "user");
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
    vi.mocked(authCredentialRepository.getPasswordHashByUserId).mockResolvedValue("hashed");
    vi.mocked(passwordHasher.verify).mockResolvedValue(false);

    const useCase = new LoginUseCase(
      userRepository,
      authCredentialRepository,
      passwordHasher,
      tokenService,
      sessionRepository,
      2_592_000
    );

    await expect(
      useCase.execute({ email: "u@example.com", password: "senhaerrada" })
    ).rejects.toThrow(InvalidCredentialsError);
    expect(tokenService.sign).not.toHaveBeenCalled();
  });
});
