import type { IAuthSessionRepository } from "../ports/auth-session-repository.port";
import type { IUserRepository } from "../ports/user-repository.port";
import type { ITokenService } from "../ports/token-service.port";
import type { AuthUserDto } from "../dtos/auth-response.dto";
import { InvalidCredentialsError } from "../errors";
import { createRefreshToken, expiresFromNow, hashRefreshToken } from "./session-token";

export interface RefreshSessionResultDto {
  user: AuthUserDto;
  accessToken: string;
  refreshToken: string;
}

export class RefreshSessionUseCase {
  constructor(
    private readonly sessionRepository: IAuthSessionRepository,
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly refreshTokenTtlSeconds: number
  ) {}

  async execute(refreshToken: string): Promise<RefreshSessionResultDto> {
    const now = new Date();
    const session = await this.sessionRepository.findActiveByRefreshTokenHash(
      hashRefreshToken(refreshToken),
      now
    );
    if (!session) {
      throw new InvalidCredentialsError("Invalid or expired refresh token");
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user || user.status !== "active") {
      await this.sessionRepository.revoke(session.id, now);
      throw new InvalidCredentialsError("Invalid or expired refresh token");
    }

    const newRefreshToken = createRefreshToken();
    await this.sessionRepository.replaceRefreshToken(
      session.id,
      hashRefreshToken(newRefreshToken),
      expiresFromNow(this.refreshTokenTtlSeconds, now),
      now
    );

    const accessToken = this.tokenService.sign({
      sub: user.id,
      email: user.email.value,
      role: user.role,
      sid: session.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email.value,
        name: user.name,
      },
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
