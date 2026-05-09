import type { IAuthCredentialRepository } from "../ports/auth-credential-repository.port";
import type { IPasswordHasher } from "../ports/password-hasher.port";
import type { IPasswordResetTokenRepository } from "../ports/password-reset-token-repository.port";
import type { ResetPasswordDto } from "../dtos/password-reset.dto";
import { InvalidCredentialsError } from "../errors";
import { hashResetToken } from "./request-password-reset.use-case";

export class ResetPasswordUseCase {
  constructor(
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly authCredentialRepository: IAuthCredentialRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = hashResetToken(dto.token);
    const resetToken = await this.passwordResetTokenRepository.findByTokenHash(tokenHash);
    const now = new Date();

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
      throw new InvalidCredentialsError("Invalid or expired password reset token");
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    await this.authCredentialRepository.save(resetToken.userId, passwordHash);
    await this.passwordResetTokenRepository.markUsed(resetToken.id, now);
  }
}
