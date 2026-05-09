import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IAuthCredentialRepository } from "../ports/auth-credential-repository.port";
import type { IPasswordHasher } from "../ports/password-hasher.port";
import type { IPasswordResetTokenRepository } from "../ports/password-reset-token-repository.port";
import { InvalidCredentialsError } from "../errors";
import { hashResetToken } from "./request-password-reset.use-case";
import { ResetPasswordUseCase } from "./reset-password.use-case";

describe("ResetPasswordUseCase", () => {
  let passwordResetTokenRepository: IPasswordResetTokenRepository;
  let authCredentialRepository: IAuthCredentialRepository;
  let passwordHasher: IPasswordHasher;

  beforeEach(() => {
    passwordResetTokenRepository = {
      save: vi.fn(),
      findByTokenHash: vi.fn(),
      markUsed: vi.fn(),
      deleteOpenTokensForUser: vi.fn(),
    };
    authCredentialRepository = {
      save: vi.fn(),
      getPasswordHashByUserId: vi.fn(),
    };
    passwordHasher = {
      hash: vi.fn().mockResolvedValue("new-hash"),
      verify: vi.fn(),
    };
  });

  it("atualiza senha e marca token como usado", async () => {
    vi.mocked(passwordResetTokenRepository.findByTokenHash).mockResolvedValue({
      id: "reset-1",
      userId: "user-1",
      tokenHash: hashResetToken("token-valid-token-valid-token-valid-123"),
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      createdAt: new Date(),
    });

    await new ResetPasswordUseCase(
      passwordResetTokenRepository,
      authCredentialRepository,
      passwordHasher
    ).execute({ token: "token-valid-token-valid-token-valid-123", password: "NewPass123" });

    expect(passwordHasher.hash).toHaveBeenCalledWith("NewPass123");
    expect(authCredentialRepository.save).toHaveBeenCalledWith("user-1", "new-hash");
    expect(passwordResetTokenRepository.markUsed).toHaveBeenCalledWith("reset-1", expect.any(Date));
  });

  it("rejeita token inválido", async () => {
    vi.mocked(passwordResetTokenRepository.findByTokenHash).mockResolvedValue(null);

    await expect(
      new ResetPasswordUseCase(
        passwordResetTokenRepository,
        authCredentialRepository,
        passwordHasher
      ).execute({ token: "token-invalid-token-invalid-token-123", password: "NewPass123" })
    ).rejects.toThrow(InvalidCredentialsError);
  });
});
