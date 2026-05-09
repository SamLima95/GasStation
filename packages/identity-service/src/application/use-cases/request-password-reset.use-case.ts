import { createHash, randomBytes } from "crypto";
import type { IUserRepository } from "../ports/user-repository.port";
import type { IPasswordResetTokenRepository } from "../ports/password-reset-token-repository.port";
import type { ForgotPasswordDto } from "../dtos/password-reset.dto";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export interface RequestPasswordResetResultDto {
  message: string;
  resetToken?: string;
  expiresAt?: string;
}

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class RequestPasswordResetUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<RequestPasswordResetResultDto> {
    const message = "If the email exists, a password reset token was generated";
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || user.status !== "active") {
      return { message };
    }

    const resetToken = randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS);

    await this.passwordResetTokenRepository.deleteOpenTokensForUser(user.id);
    await this.passwordResetTokenRepository.save({
      userId: user.id,
      tokenHash: hashResetToken(resetToken),
      expiresAt,
      createdAt: now,
    });

    return {
      message,
      resetToken,
      expiresAt: expiresAt.toISOString(),
    };
  }
}

export { hashResetToken };
