import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "../../domain/entities/user.entity";
import type { IUserRepository } from "../ports/user-repository.port";
import type { IPasswordResetTokenRepository } from "../ports/password-reset-token-repository.port";
import { RequestPasswordResetUseCase } from "./request-password-reset.use-case";

describe("RequestPasswordResetUseCase", () => {
  let userRepository: IUserRepository;
  let passwordResetTokenRepository: IPasswordResetTokenRepository;

  beforeEach(() => {
    userRepository = {
      save: vi.fn(),
      saveUserAndOutbox: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      listPermissionsByRole: vi.fn(),
    };
    passwordResetTokenRepository = {
      save: vi.fn(),
      findByTokenHash: vi.fn(),
      markUsed: vi.fn(),
      deleteOpenTokensForUser: vi.fn(),
    };
  });

  it("gera token para usuário ativo", async () => {
    const user = User.reconstitute("user-1", "u@example.com", "User", new Date(), "user");
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user);

    const result = await new RequestPasswordResetUseCase(
      userRepository,
      passwordResetTokenRepository
    ).execute({ email: "u@example.com" });

    expect(result.message).toContain("If the email exists");
    expect(result.resetToken).toEqual(expect.any(String));
    expect(result.expiresAt).toEqual(expect.any(String));
    expect(passwordResetTokenRepository.deleteOpenTokensForUser).toHaveBeenCalledWith("user-1");
    expect(passwordResetTokenRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", tokenHash: expect.any(String) })
    );
  });

  it("retorna resposta genérica quando usuário não existe", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    const result = await new RequestPasswordResetUseCase(
      userRepository,
      passwordResetTokenRepository
    ).execute({ email: "missing@example.com" });

    expect(result.resetToken).toBeUndefined();
    expect(passwordResetTokenRepository.save).not.toHaveBeenCalled();
  });
});
